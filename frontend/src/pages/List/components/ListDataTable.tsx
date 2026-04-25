import {
  flexRender,
  type Table as ReactTableInstance,
} from "@tanstack/react-table";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  GroupedRecord,
  ListMode,
  ListPaginationItem,
} from "@/pages/List/types/list";
import {
  formatListTableCellValue,
  getPinnedStyles,
  LIST_STATUS_OPTIONS,
} from "@/pages/List/utils/list";

type ListDataTableProps = {
  activeRecordId: string | null;
  emptyStateLabel?: string;
  idColumnLabel?: string;
  mode: ListMode;
  onOpenRecord: (recordId: string) => void;
  onPageChange: (page: number) => void;
  onStatusChange: (recordId: string, nextStatus: string) => Promise<void>;
  page: number;
  paginationItems: ListPaginationItem[];
  savingStatusId: string | null;
  showingFrom: number;
  showingTo: number;
  table: ReactTableInstance<GroupedRecord>;
  totalPages: number;
  totalRows: number;
};

export function ListDataTable({
  activeRecordId,
  emptyStateLabel = "No matching RFQs found.",
  idColumnLabel = "RFQ ID",
  mode,
  onOpenRecord,
  onPageChange,
  onStatusChange,
  page,
  paginationItems,
  savingStatusId,
  showingFrom,
  showingTo,
  table,
  totalPages,
  totalRows,
}: ListDataTableProps): JSX.Element {
  const rows = table.getRowModel().rows;
  const columnCount = table.getAllLeafColumns().length;
  const leafColumns = table.getVisibleLeafColumns();
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const scrollContainer = shellRef.current?.querySelector<HTMLElement>(
      '[data-slot="table-container"]',
    );

    if (!scrollContainer) {
      return;
    }

    const handleScroll = (): void => {
      setIsScrolled(scrollContainer.scrollLeft > 0);
    };

    handleScroll();
    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, [table]);

  function renderOsCellContent(
    columnLabel: string,
    record: GroupedRecord,
    value: string,
  ): ReactNode {
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
      return value ? (
        <a
          className="text-[#764cfc] hover:underline"
          href={value}
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
  }

  return (
    <>
      <div className="table-scroll-container min-h-0 flex-1 overflow-auto" ref={shellRef}>
        <Table className="min-w-full text-[13px] list-page-data-table">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                className="border-b-0 hover:bg-transparent"
                key={headerGroup.id}
              >
                {headerGroup.headers.map((header) => {
                  const sorted = header.column.getIsSorted();

                  return (
                    <TableHead
                      className={`sticky top-0 h-7.5 border-y border-[#dee2e6] bg-[#f2f1f9] px-2 py-1 text-[12px] font-semibold text-[#3d555d] ${
                        header.column.getIsPinned() ? "list-page-pinned-column" : "z-10"
                      }`}
                      key={header.id}
                      style={getPinnedStyles(header.column, isScrolled, true)}
                    >
                      {header.isPlaceholder ? null : (
                        <button
                          className="table-sort-trigger"
                          onClick={header.column.getToggleSortingHandler()}
                          type="button"
                        >
                          <span>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                          </span>
                          {sorted === "asc" ? (
                            <BsChevronUp className="text-[#764cfc]" size={12} />
                          ) : sorted === "desc" ? (
                            <BsChevronDown className="text-[#764cfc]" size={12} />
                          ) : (
                            <BsChevronDown className="opacity-35" size={12} />
                          )}
                        </button>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow className="hover:bg-white">
                <TableCell
                  className="h-24 border-b border-[#dee2e6] text-center text-[13px] text-[#5b5b5b]"
                  colSpan={columnCount}
                >
                  {emptyStateLabel}
                </TableCell>
              </TableRow>
            ) : mode === "OS" ? (
              rows.map((row) => {
                const record = row.original;
                const isActive = activeRecordId === record.id;

                return record.rawRows.map((rawRow, rawRowIndex) => (
                  <TableRow
                    className={`group border-b border-[#dee2e6] ${
                      isActive ? "bg-[#faf7ff]" : "bg-white"
                    } hover:bg-white`}
                    key={`${row.id}-${rawRowIndex}`}
                  >
                    {leafColumns.map((column) => {
                      const columnIndex = Number(column.id.replace(/^col-/, ""));
                      const mergeState =
                        record.rawRowMerges[rawRowIndex]?.[columnIndex];

                      if (mergeState?.hidden) {
                        return null;
                      }

                      const columnLabel =
                        typeof column.columnDef.header === "string"
                          ? column.columnDef.header
                          : "";
                      const value =
                        mergeState?.mergedValue ?? rawRow[columnIndex] ?? "";
                      const cellBackground = isActive ? "bg-[#faf7ff]" : "bg-white";

                      return (
                        <TableCell
                          className={`whitespace-nowrap border-b border-[#dee2e6] px-2 py-1 align-middle text-[13px] ${
                            column.getIsPinned()
                              ? `list-page-pinned-column ${cellBackground}`
                              : ""
                          }`}
                          colSpan={
                            mergeState?.colSpan && mergeState.colSpan > 1
                              ? mergeState.colSpan
                              : undefined
                          }
                          key={`${row.id}-${rawRowIndex}-${column.id}`}
                          rowSpan={
                            mergeState?.rowSpan && mergeState.rowSpan > 1
                              ? mergeState.rowSpan
                              : undefined
                          }
                          style={getPinnedStyles(column, isScrolled)}
                        >
                          {renderOsCellContent(columnLabel, record, value)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ));
              })
            ) : (
              rows.map((row) => {
                const isActive = activeRecordId === row.original.id;

                return (
                  <TableRow
                    className={`group border-b border-[#dee2e6] ${
                      isActive ? "bg-[#faf7ff]" : "bg-white"
                    } hover:bg-white`}
                    key={row.id}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        className={`whitespace-nowrap border-b border-[#dee2e6] px-2 py-1 align-middle text-[13px] ${
                          cell.column.getIsPinned()
                            ? `list-page-pinned-column ${
                                isActive ? "bg-[#faf7ff]" : "bg-white"
                              }`
                            : ""
                        }`}
                        key={cell.id}
                        style={getPinnedStyles(cell.column, isScrolled)}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between border-t border-black/7.5 px-3 py-2 text-[12px] text-[#5b5b5b]">
        <div>
          Showing {showingFrom} - {showingTo} of {totalRows}
        </div>
        <div className="table-pagination">
          <button
            className="table-pagination-button"
            disabled={page <= 1}
            onClick={() => onPageChange(Math.max(1, page - 1))}
            type="button"
          >
            {"<"}
          </button>
          {paginationItems.map((item) =>
            typeof item === "number" ? (
              <button
                className={`table-pagination-button ${
                  item === page ? "is-active" : ""
                }`}
                key={item}
                onClick={() => onPageChange(item)}
                type="button"
              >
                {item}
              </button>
            ) : (
              <span className="px-0.5 text-[13px] text-[#5b5b5b]" key={item}>
                …
              </span>
            ),
          )}
          <button
            className="table-pagination-button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            type="button"
          >
            {">"}
          </button>
        </div>
      </div>
    </>
  );
}
