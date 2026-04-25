import {
  flexRender,
  type Table as ReactTableInstance,
} from "@tanstack/react-table";
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
  VendorDataRow,
  VendorPaginationItem,
} from "@/pages/Vendor/types/vendor";

type VendorDataTableProps = {
  onPageChange: (page: number) => void;
  page: number;
  paginationItems: VendorPaginationItem[];
  showingFrom: number;
  showingTo: number;
  table: ReactTableInstance<VendorDataRow>;
  totalPages: number;
  totalRows: number;
};

export function VendorDataTable({
  onPageChange,
  page,
  paginationItems,
  showingFrom,
  showingTo,
  table,
  totalPages,
  totalRows,
}: VendorDataTableProps): JSX.Element {
  const rows = table.getRowModel().rows;
  const columnCount = table.getAllLeafColumns().length;

  return (
    <>
      <div className="table-scroll-container min-h-0 flex-1 overflow-auto">
        <Table className="min-w-full text-[13px]">
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
                      className="sticky top-0 z-10 h-7.5 border-y border-[#dee2e6] bg-[#f2f1f9] px-2 py-1 text-[12px] font-semibold text-[#3d555d]"
                      key={header.id}
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
              <TableRow className="hover:bg-transparent">
                <TableCell
                  className="h-24 border-b border-[#dee2e6] text-center text-[13px] text-[#5b5b5b]"
                  colSpan={columnCount}
                >
                  No matching vendors found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, rowIndex) => (
                <TableRow
                  className={`border-b border-[#dee2e6] ${
                    rowIndex % 2 === 0
                      ? "bg-[rgba(0,0,0,0.025)] hover:bg-[rgba(0,0,0,0.055)]"
                      : "bg-white hover:bg-[rgba(0,0,0,0.04)]"
                  }`}
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      className="whitespace-nowrap px-2 py-1 align-middle text-[13px]"
                      key={cell.id}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
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
