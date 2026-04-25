import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnPinningState,
  type SortingState,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

import {
  buildPaginationItems,
  compareTableValues,
} from "@/components/table/tableUtils";
import type {
  GroupedRecord,
  ListMode,
  ListPaginationItem,
} from "@/pages/List/types/list";
import {
  formatListTableCellValue,
  getListShowingRange,
  LIST_ROWS_PER_PAGE,
  LIST_STATUS_OPTIONS,
  LIST_STICKY_ID_WIDTH,
  LIST_STICKY_STATUS_WIDTH,
} from "@/pages/List/utils/list";

export function useListTableState(params: {
  header: string[];
  idColumnLabel?: string;
  mode: ListMode;
  onOpenRecord: (recordId: string) => void;
  onStatusChange: (recordId: string, nextStatus: string) => Promise<void>;
  pageResetKey: string;
  pinnedLeftColumnCount?: number;
  pinnedLeftColumnLabels?: string[];
  records: GroupedRecord[];
  savingStatusId: string | null;
}): {
  page: number;
  paginationItems: ListPaginationItem[];
  setPage: (page: number) => void;
  showingFrom: number;
  showingTo: number;
  table: ReturnType<typeof useReactTable<GroupedRecord>>;
  totalPages: number;
  totalRows: number;
} {
  const {
    header,
    idColumnLabel = "RFQ ID",
    mode,
    onOpenRecord,
    onStatusChange,
    pageResetKey,
    pinnedLeftColumnCount = mode === "OS" ? 3 : 2,
    pinnedLeftColumnLabels,
    records,
    savingStatusId,
  } = params;
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    left: [],
    right: [],
  });

  const idColumnIndex = useMemo(
    () => header.indexOf(idColumnLabel),
    [header, idColumnLabel],
  );
  const idColumnId = idColumnIndex >= 0 ? `col-${idColumnIndex}` : null;
  const pinnedColumnIds = useMemo(() => {
    if (pinnedLeftColumnLabels?.length) {
      return pinnedLeftColumnLabels
        .map((label) => {
          const index = header.indexOf(label);
          return index >= 0 ? `col-${index}` : null;
        })
        .filter((value): value is string => Boolean(value));
    }

    return header
      .slice(0, pinnedLeftColumnCount)
      .map((_, index) => `col-${index}`);
  }, [header, pinnedLeftColumnCount, pinnedLeftColumnLabels]);

  useEffect(() => {
    setSorting(idColumnId ? [{ desc: true, id: idColumnId }] : []);
  }, [idColumnId]);

  useEffect(() => {
    setColumnPinning({
      left: pinnedColumnIds,
      right: [],
    });
  }, [pinnedColumnIds]);

  useEffect(() => {
    setPage(1);
  }, [pageResetKey]);

  const listColumns = useMemo<ColumnDef<GroupedRecord>[]>(
    () =>
      header.map((columnLabel, columnIndex) => ({
        accessorFn: (record) => record.displayRow[columnIndex] ?? "",
        cell: (info) => {
          const record = info.row.original;
          const value = info.getValue<string>() ?? "";

          if (columnLabel === idColumnLabel) {
            return (
              <button
                className="font-medium text-[#764cfc] underline-offset-2 hover:underline"
                onClick={() => onOpenRecord(record.id)}
                type="button"
              >
                {value}
              </button>
            );
          }

          if (columnLabel === "Status") {
            return (
              <div className="relative flex min-h-6 items-center justify-center">
                <select
                  className={`list-page-status-select ${
                    savingStatusId === record.id ? "invisible" : ""
                  }`}
                  data-status={record.status || undefined}
                  disabled={savingStatusId === record.id}
                  onChange={(event) =>
                    void onStatusChange(record.id, event.target.value)
                  }
                  value={record.status}
                >
                  <option value="">Choose</option>
                  {LIST_STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {savingStatusId === record.id ? (
                  <span
                    aria-hidden="true"
                    className="list-page-status-spinner absolute inline-block animate-spin rounded-full border-2 border-[#475562]/20 border-t-[#475562] size-4"
                  />
                ) : null}
              </div>
            );
          }

          if (columnLabel === "Output URL") {
            return record.outputUrl ? (
              <a
                className="text-[#764cfc] hover:underline"
                href={record.outputUrl}
                rel="noreferrer"
                target="_blank"
              >
                Link
              </a>
            ) : (
              ""
            );
          }

          return formatListTableCellValue(columnLabel, value);
        },
        header: columnLabel,
        id: `col-${columnIndex}`,
        maxSize:
          columnLabel === idColumnLabel
            ? LIST_STICKY_ID_WIDTH
            : columnLabel === "Status"
              ? LIST_STICKY_STATUS_WIDTH
              : undefined,
        minSize:
          columnLabel === idColumnLabel
            ? LIST_STICKY_ID_WIDTH
            : columnLabel === "Status"
              ? LIST_STICKY_STATUS_WIDTH
              : 60,
        size:
          columnLabel === idColumnLabel
            ? LIST_STICKY_ID_WIDTH
            : columnLabel === "Status"
              ? LIST_STICKY_STATUS_WIDTH
              : undefined,
        sortingFn: (rowA, rowB) =>
          compareTableValues(
            rowA.original.displayRow[columnIndex] ?? "",
            rowB.original.displayRow[columnIndex] ?? "",
          ),
      })),
    [header, idColumnLabel, onOpenRecord, onStatusChange, savingStatusId],
  );

  const table = useReactTable({
    autoResetPageIndex: false,
    columns: listColumns,
    data: records,
    defaultColumn: {
      minSize: 60,
      size: 150,
    },
    enableColumnPinning: true,
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.id,
    getSortedRowModel: getSortedRowModel(),
    onColumnPinningChange: setColumnPinning,
    onSortingChange: (updater) => {
      setPage(1);
      setSorting((current) =>
        typeof updater === "function" ? updater(current) : updater,
      );
    },
    state: {
      columnPinning,
      pagination: {
        pageIndex: page - 1,
        pageSize: LIST_ROWS_PER_PAGE,
      },
      sorting,
    },
  });

  const totalPages = Math.max(1, table.getPageCount());
  const totalRows = records.length;
  const paginationItems = useMemo<ListPaginationItem[]>(
    () => buildPaginationItems(page, totalPages),
    [page, totalPages],
  );
  const { from: showingFrom, to: showingTo } = getListShowingRange(
    page,
    totalRows,
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return {
    page,
    paginationItems,
    setPage,
    showingFrom,
    showingTo,
    table,
    totalPages,
    totalRows,
  };
}
