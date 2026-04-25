import type { Column } from "@tanstack/react-table";
import type {
  CSSProperties,
  Dispatch,
  SetStateAction,
} from "react";

import type { DateRangeValue } from "@/pages/Home/types/home";
import {
  isInRange,
  parseLegacyDate,
} from "@/pages/Home/utils/date";
import type {
  CellMergeState,
  GroupedRecord,
  ListMode,
} from "@/pages/List/types/list";
import type { OSMergedTable, TableRows } from "@/types/backend";

export const LIST_ROWS_PER_PAGE = 25;
export const LIST_STICKY_ID_WIDTH = 68.7;
export const LIST_STICKY_STATUS_WIDTH = 102;
export const LIST_STATUS_OPTIONS = [
  "Ordered",
  "Failed",
  "Pending",
  "Pass",
  "Bidding",
  "Delete",
  "Terminate",
];

const LIST_SHEET_URLS: Record<ListMode, string> = {
  KR: "https://docs.google.com/spreadsheets/d/1pWFTXnpKhO6VOzHT7KsjrUPxmKFwfQdlatTKmWvTjUk/edit?gid=0#gid=0",
  OS: "https://docs.google.com/spreadsheets/d/1pWFTXnpKhO6VOzHT7KsjrUPxmKFwfQdlatTKmWvTjUk/edit?gid=36461421#gid=36461421",
};

export function groupKrRows(rows: TableRows): {
  header: string[];
  records: GroupedRecord[];
} {
  const [header = [], ...body] = rows;
  const idIndex = header.indexOf("RFQ ID");
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

export function groupOsRows(payload: OSMergedTable): {
  header: string[];
  records: GroupedRecord[];
} {
  const rows = payload.dataArray;
  const [header = [], ...body] = rows;
  const idIndex = header.indexOf("RFQ ID");
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

export function cellValue(header: string[], row: string[], key: string): string {
  const index = header.indexOf(key);
  return index >= 0 ? row[index] ?? "" : "";
}

export function replaceRecordValue(
  record: GroupedRecord,
  header: string[],
  key: string,
  value: string,
): GroupedRecord {
  const columnIndex = header.indexOf(key);
  if (columnIndex < 0) {
    return record;
  }

  const displayRow = [...record.displayRow];
  displayRow[columnIndex] = value;

  const rawRows = record.rawRows.map((row) => {
    const nextRow = [...row];
    nextRow[columnIndex] = value;
    return nextRow;
  });

  const rawRowMerges = record.rawRowMerges.map((rowMerges) => {
    const mergeState = rowMerges[columnIndex];
    if (!mergeState || mergeState.hidden) {
      return rowMerges;
    }

    return {
      ...rowMerges,
      [columnIndex]: {
        ...mergeState,
        mergedValue: value,
      },
    };
  });

  return {
    ...record,
    displayRow,
    notes: key === "Notes" ? value : record.notes,
    outputUrl: key === "Output URL" ? value : record.outputUrl,
    rawRowMerges,
    rawRows,
    status: key === "Status" ? value : record.status,
  };
}

export function toggleSetValue(
  setter: Dispatch<SetStateAction<Set<string>>>,
  value: string,
): void {
  setter((current) => {
    const next = new Set(current);

    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }

    return next;
  });
}

export function toDisplayValue(value: string): string {
  return value.trim() || "-";
}

export function formatNumberWithThousandsSeparators(value: string): string {
  const text = value.trim();

  if (!text) {
    return "";
  }

  const match = text.match(/^([₩$€£]\s*)?(-?[\d,]+(?:\.\d+)?)$/);

  if (!match) {
    return text;
  }

  const [, prefix = "", numberText] = match;
  const normalized = numberText.replace(/,/g, "");

  if (!/^-?\d+(?:\.\d+)?$/.test(normalized)) {
    return text;
  }

  const [integerPart, decimalPart] = normalized.split(".");
  const sign = integerPart.startsWith("-") ? "-" : "";
  const unsignedInteger = integerPart.replace("-", "");
  const formattedInteger = unsignedInteger.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ",",
  );

  return `${prefix}${sign}${formattedInteger}${
    decimalPart === undefined ? "" : `.${decimalPart}`
  }`;
}

export function formatCurrencyValue(value: string): string {
  const text = formatNumberWithThousandsSeparators(
    value.trim().replace(/^₩\s*/, ""),
  );
  return text ? `₩ ${text}` : "-";
}

export function formatPercentValue(value: string): string {
  const text = value.trim();
  if (!text) {
    return "-";
  }

  return text.endsWith("%") ? text : `${text}%`;
}

const LIST_PRICE_COLUMN_LABELS = new Set([
  "Expected sales (without tax)",
  "GM",
  "Total sales",
  "Total GM",
]);

export function formatListTableCellValue(
  columnLabel: string,
  value: string,
): string {
  return LIST_PRICE_COLUMN_LABELS.has(columnLabel)
    ? formatNumberWithThousandsSeparators(value)
    : value;
}

export async function writeTextToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.left = "-9999px";
  textarea.style.position = "fixed";

  document.body.appendChild(textarea);
  textarea.select();

  try {
    if (!document.execCommand("copy")) {
      throw new Error("Clipboard copy failed");
    }
  } finally {
    document.body.removeChild(textarea);
  }
}

export function formatLegacyCurrentDate(date = new Date()): string {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

export function findColumnName(
  header: string[],
  candidates: string[],
): string | null {
  const normalizedCandidates = new Set(
    candidates.map((value) => value.trim().toLowerCase()),
  );

  return (
    header.find((column) =>
      normalizedCandidates.has(column.trim().toLowerCase()),
    ) ?? null
  );
}

export function getPinnedStyles(
  column: Column<GroupedRecord, unknown>,
  isScrolled: boolean,
  isHeader = false,
): CSSProperties {
  const pinned = column.getIsPinned();
  const isLastLeftPinned = pinned === "left" && column.getIsLastColumn("left");
  const pinnedDivider =
    isScrolled && isLastLeftPinned
      ? "inset -1px 0 0 rgba(61, 61, 67, 0.12), 10px 0 14px -10px rgba(61, 61, 67, 0.32)"
      : undefined;

  if (!pinned) {
    return {
      width: column.getSize(),
    };
  }

  return {
    boxShadow: pinnedDivider,
    left: pinned === "left" ? `${column.getStart("left")}px` : undefined,
    position: "sticky",
    width: column.getSize(),
    zIndex: isHeader ? (pinned === "left" ? 12 : 11) : 6,
  };
}

export function getListDateColumnKey(mode: ListMode): string {
  return mode === "KR" ? "Date" : "RFQ Date";
}

export function getListSheetUrl(mode: ListMode): string {
  return LIST_SHEET_URLS[mode];
}

export function buildListStatusOptions(records: GroupedRecord[]): string[] {
  const presentStatuses = new Set(
    records.map((record) => record.status).filter(Boolean),
  );
  const orderedStatuses = LIST_STATUS_OPTIONS.filter((option) =>
    presentStatuses.has(option),
  );
  const customStatuses = Array.from(presentStatuses)
    .filter((option) => !LIST_STATUS_OPTIONS.includes(option))
    .sort();

  return [...orderedStatuses, ...customStatuses];
}

export function buildUniqueRecordOptions(
  records: GroupedRecord[],
  key: "client" | "owner",
): string[] {
  return Array.from(
    new Set(records.map((record) => record[key]).filter(Boolean)),
  ).sort();
}

export function filterListRecords(params: {
  dateColumnKey: string;
  header: string[];
  range: DateRangeValue;
  records: GroupedRecord[];
  search: string;
  selectedClients: Set<string>;
  selectedOwners: Set<string>;
  selectedStatuses: Set<string>;
}): GroupedRecord[] {
  const {
    dateColumnKey,
    header,
    range,
    records,
    search,
    selectedClients,
    selectedOwners,
    selectedStatuses,
  } = params;
  const keyword = search.trim().toLowerCase();

  return records.filter((record) => {
    const dateCandidates = record.rawRows
      .map((row) => cellValue(header, row, dateColumnKey))
      .map(parseLegacyDate)
      .filter((value): value is Date => Boolean(value));

    const dateMatch =
      dateCandidates.length === 0 ||
      dateCandidates.some((value) => isInRange(value, range));

    const statusMatch =
      selectedStatuses.size === 0 ||
      record.rawRows.some((row) =>
        selectedStatuses.has(cellValue(header, row, "Status")),
      );

    const ownerMatch =
      selectedOwners.size === 0 ||
      record.rawRows.some((row) =>
        selectedOwners.has(cellValue(header, row, "Owner")),
      );

    const clientMatch =
      selectedClients.size === 0 ||
      record.rawRows.some((row) =>
        selectedClients.has(cellValue(header, row, "Client")),
      );

    const searchMatch =
      !keyword ||
      record.rawRows.some((row) => row.join(" ").toLowerCase().includes(keyword));

    return (
      dateMatch &&
      statusMatch &&
      ownerMatch &&
      clientMatch &&
      searchMatch
    );
  });
}

export function getListShowingRange(
  page: number,
  totalRows: number,
): { from: number; to: number } {
  if (totalRows === 0) {
    return { from: 0, to: 0 };
  }

  return {
    from: (page - 1) * LIST_ROWS_PER_PAGE + 1,
    to: Math.min(page * LIST_ROWS_PER_PAGE, totalRows),
  };
}
