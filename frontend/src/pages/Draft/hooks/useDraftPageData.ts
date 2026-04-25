import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getDraft, getDraftOS } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type {
  CellMergeState,
  GroupedRecord,
  ListMode,
} from "@/pages/List/types/list";
import { getListDateColumnKey } from "@/pages/List/utils/list";
import type { OSMergedTable, TableRows } from "@/types/backend";

const DRAFT_SHEET_URLS: Record<ListMode, string> = {
  KR: "https://docs.google.com/spreadsheets/d/1pWFTXnpKhO6VOzHT7KsjrUPxmKFwfQdlatTKmWvTjUk/edit?gid=1518018520#gid=1518018520",
  OS: "https://docs.google.com/spreadsheets/d/1pWFTXnpKhO6VOzHT7KsjrUPxmKFwfQdlatTKmWvTjUk/edit?gid=26808930#gid=26808930",
};

const DRAFT_ID_LABEL = "Draft ID";
const DRAFT_SOURCE_ID_LABELS = ["Draft ID", "RFQ ID"];
const DRAFT_EXCLUDED_COLUMN_NAMES = new Set([
  "last updated",
  "notes",
  "output url",
  "status",
]);

function findColumnIndex(header: string[], candidates: string[]): number {
  return candidates.findIndex(Boolean) >= 0
    ? header.findIndex((column) => candidates.includes(column))
    : -1;
}

function groupDraftKrRows(rows: TableRows): {
  header: string[];
  records: GroupedRecord[];
} {
  const [header = [], ...body] = rows;
  const idIndex = findColumnIndex(header, DRAFT_SOURCE_ID_LABELS);
  const statusIndex = header.indexOf("Status");
  const ownerIndex = header.indexOf("Owner");
  const clientIndex = header.indexOf("Client");
  const dateIndex = header.indexOf("Date");
  const notesIndex = header.indexOf("Notes");

  const records = body
    .filter((row) => (row[idIndex] ?? "").trim())
    .map((row) => ({
      client: row[clientIndex] ?? "",
      date: row[dateIndex] ?? "",
      displayRow: row,
      id: row[idIndex] ?? "",
      notes: row[notesIndex] ?? "",
      outputUrl: "",
      owner: row[ownerIndex] ?? "",
      rawRowMerges: [{}],
      rawRows: [row],
      status: row[statusIndex] ?? "",
    }));

  return { header, records };
}

function groupDraftOsRows(payload: OSMergedTable): {
  header: string[];
  records: GroupedRecord[];
} {
  const rows = payload.dataArray;
  const [header = [], ...body] = rows;
  const idIndex = findColumnIndex(header, DRAFT_SOURCE_ID_LABELS);
  const statusIndex = header.indexOf("Status");
  const ownerIndex = header.indexOf("Owner");
  const clientIndex = header.indexOf("Client");
  const dateIndex = header.indexOf("RFQ Date");
  const notesIndex = header.indexOf("Notes");
  const outputIndex = header.indexOf("Output URL");

  const mergeStartByCell = new Map<
    string,
    NonNullable<OSMergedTable["mergedInfo"]>[number]
  >();
  const hiddenCells = new Set<string>();

  (payload.mergedInfo ?? []).forEach((merge) => {
    mergeStartByCell.set(`${merge.row}:${merge.col}`, merge);

    for (let rowOffset = 0; rowOffset < merge.rowspan; rowOffset += 1) {
      for (let colOffset = 0; colOffset < merge.colspan; colOffset += 1) {
        if (rowOffset === 0 && colOffset === 0) {
          continue;
        }

        hiddenCells.add(`${merge.row + rowOffset}:${merge.col + colOffset}`);
      }
    }
  });

  const grouped = new Map<
    string,
    { rawRowMerges: Array<Record<number, CellMergeState>>; rawRows: string[][] }
  >();

  body.forEach((row, rowIndex) => {
    const id = row[idIndex] ?? "";
    if (!id.trim()) {
      return;
    }

    if (!grouped.has(id)) {
      grouped.set(id, { rawRowMerges: [], rawRows: [] });
    }

    const sourceRowIndex = rowIndex + 1;
    const rawRowMerges: Record<number, CellMergeState> = {};

    header.forEach((_column, columnIndex) => {
      const mergeKey = `${sourceRowIndex}:${columnIndex}`;
      const mergeStart = mergeStartByCell.get(mergeKey);

      if (hiddenCells.has(mergeKey)) {
        rawRowMerges[columnIndex] = { hidden: true };
      }

      if (mergeStart) {
        rawRowMerges[columnIndex] = {
          ...rawRowMerges[columnIndex],
          colSpan: mergeStart.colspan,
          mergedValue: mergeStart.mergedValue,
          rowSpan: mergeStart.rowspan,
        };
      }
    });

    grouped.get(id)!.rawRows.push(row);
    grouped.get(id)!.rawRowMerges.push(rawRowMerges);
  });

  const records = Array.from(grouped.entries()).map(
    ([id, { rawRows, rawRowMerges }]) => {
      const displayRow = rawRows[0] ?? [];

      return {
        client: displayRow[clientIndex] ?? "",
        date: displayRow[dateIndex] ?? "",
        displayRow,
        id,
        notes: displayRow[notesIndex] ?? "",
        outputUrl: displayRow[outputIndex] ?? "",
        owner: displayRow[ownerIndex] ?? "",
        rawRowMerges,
        rawRows,
        status: displayRow[statusIndex] ?? "",
      };
    },
  );

  return { header, records };
}

function isExcludedDraftColumn(column: string): boolean {
  return DRAFT_EXCLUDED_COLUMN_NAMES.has(column.trim().toLowerCase());
}

function buildDraftColumns(header: string[]): {
  sourceIndexes: number[];
  visibleHeader: string[];
} {
  const sourceIndexes: number[] = [];
  const visibleHeader: string[] = [];

  header.forEach((column, index) => {
    if (isExcludedDraftColumn(column)) {
      return;
    }

    sourceIndexes.push(index);
    visibleHeader.push(
      DRAFT_SOURCE_ID_LABELS.includes(column) ? DRAFT_ID_LABEL : column,
    );
  });

  return { sourceIndexes, visibleHeader };
}

function remapMergeState(
  mergeState: CellMergeState,
  sourceIndexes: number[],
  sourceIndex: number,
): CellMergeState {
  if (!mergeState.colSpan || mergeState.colSpan <= 1) {
    return mergeState;
  }

  const nextColSpan = sourceIndexes.filter(
    (index) => index >= sourceIndex && index < sourceIndex + mergeState.colSpan!,
  ).length;

  if (nextColSpan <= 1) {
    const { colSpan: _colSpan, ...rest } = mergeState;
    return rest;
  }

  return {
    ...mergeState,
    colSpan: nextColSpan,
  };
}

function transformDraftRecords(
  records: GroupedRecord[],
  sourceIndexes: number[],
): GroupedRecord[] {
  return records.map((record) => ({
    ...record,
    displayRow: sourceIndexes.map((index) => record.displayRow[index] ?? ""),
    rawRowMerges: record.rawRowMerges.map((rowMerges) => {
      const nextRowMerges: Record<number, CellMergeState> = {};

      sourceIndexes.forEach((sourceIndex, visibleIndex) => {
        const mergeState = rowMerges[sourceIndex];
        if (!mergeState) {
          return;
        }

        nextRowMerges[visibleIndex] = remapMergeState(
          mergeState,
          sourceIndexes,
          sourceIndex,
        );
      });

      return nextRowMerges;
    }),
    rawRows: record.rawRows.map((row) =>
      sourceIndexes.map((index) => row[index] ?? ""),
    ),
  }));
}

function buildDraftData(header: string[], records: GroupedRecord[]): {
  header: string[];
  records: GroupedRecord[];
} {
  const { sourceIndexes, visibleHeader } = buildDraftColumns(header);

  return {
    header: visibleHeader,
    records: transformDraftRecords(records, sourceIndexes),
  };
}

export function useDraftPageData(mode: ListMode): {
  dateColumnKey: string;
  errorMessage: string | null;
  header: string[];
  loading: boolean;
  records: GroupedRecord[];
  sheetUrl: string;
} {
  const [header, setHeader] = useState<string[]>([]);
  const [records, setRecords] = useState<GroupedRecord[]>([]);
  const krDraftQuery = useQuery({
    queryKey: queryKeys.draft(),
    queryFn: () => getDraft(),
    select: (rows) => {
      const grouped = groupDraftKrRows(rows);
      return buildDraftData(grouped.header, grouped.records);
    },
    enabled: mode === "KR",
  });
  const osDraftQuery = useQuery({
    queryKey: queryKeys.draftOS(),
    queryFn: () => getDraftOS(),
    select: (payload) => {
      const grouped = groupDraftOsRows(payload);
      return buildDraftData(grouped.header, grouped.records);
    },
    enabled: mode === "OS",
  });
  const draftData = mode === "KR" ? krDraftQuery.data : osDraftQuery.data;
  const draftError = mode === "KR" ? krDraftQuery.error : osDraftQuery.error;
  const draftLoading =
    mode === "KR" ? krDraftQuery.isLoading : osDraftQuery.isLoading;

  useEffect(() => {
    if (!draftData) {
      return;
    }

    setHeader(draftData.header);
    setRecords(draftData.records);
  }, [draftData]);

  const dateColumnKey = useMemo(() => getListDateColumnKey(mode), [mode]);

  return {
    dateColumnKey,
    errorMessage:
      draftError instanceof Error
        ? draftError.message
        : draftError
          ? "Failed to load drafts."
          : null,
    header,
    loading: draftLoading,
    records,
    sheetUrl: DRAFT_SHEET_URLS[mode],
  };
}
