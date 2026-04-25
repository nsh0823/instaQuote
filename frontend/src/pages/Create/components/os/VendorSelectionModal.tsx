import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  BsBoxArrowUpRight,
  BsChevronDown,
  BsChevronUp,
  BsXLg,
} from "react-icons/bs";

import { WarningAlertModal } from "@/components/common/Feedback";
import {
  buildPaginationItems,
  compareTableValues,
} from "@/components/table/tableUtils";
import {
  VendorFilterControls,
  normalizeVendorType,
} from "@/components/vendor/VendorTableControls";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { parseInteger } from "@/pages/Create/utils/number";
import type { TableRows } from "@/types/backend";
import { t } from "@/utils/lang";

type VendorDataRow = {
  index: number;
  row: string[];
};

export type VendorSelectionModalProps = {
  initialCountryFilters: string[];
  initialLoiFilters: string[];
  initialSortColumn: number;
  initialTypeFilters: string[];
  lang: string;
  onClose: () => void;
  onLoad: (selectedIndices: number[]) => void;
  vendorRows: TableRows;
};

type VendorTableMeta = {
  selectedIndexSet: ReadonlySet<number>;
  toggleVendorRow: (index: number) => void;
};

export function VendorSelectionModal({
  initialCountryFilters,
  initialLoiFilters,
  initialSortColumn,
  initialTypeFilters,
  lang,
  onClose,
  onLoad,
  vendorRows,
}: VendorSelectionModalProps): JSX.Element {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [sorting, setSorting] = useState<SortingState>(() =>
    initialSortColumn >= 0
      ? [{ desc: false, id: `col-${initialSortColumn}` }]
      : [],
  );
  const [typeFilters, setTypeFilters] = useState<string[]>(() => initialTypeFilters);
  const [countryFilters, setCountryFilters] = useState<string[]>(
    () => initialCountryFilters,
  );
  const [loiFilters, setLoiFilters] = useState<string[]>(() => initialLoiFilters);
  const [irFilter, setIrFilter] = useState("");
  const [warningMessage, setWarningMessage] = useState("");
  const selectedIndexSet = useMemo(
    () => new Set(selectedIndices),
    [selectedIndices],
  );

  const headerLookup = useMemo(() => vendorRows[0] ?? [], [vendorRows]);
  const vendorDataRows = useMemo<VendorDataRow[]>(
    () => (vendorRows.slice(1) ?? []).map((row, index) => ({ index, row })),
    [vendorRows],
  );

  const vendorCountryCol = useMemo(
    () => headerLookup.findIndex((item) => item === "Country"),
    [headerLookup],
  );
  const vendorTypeCol = useMemo(
    () => headerLookup.findIndex((item) => item === "Type"),
    [headerLookup],
  );
  const vendorLoiCol = useMemo(
    () => headerLookup.findIndex((item) => item === "LOI"),
    [headerLookup],
  );
  const vendorIrFromCol = useMemo(
    () => headerLookup.findIndex((item) => item === "IR_from"),
    [headerLookup],
  );
  const vendorIrToCol = useMemo(
    () => headerLookup.findIndex((item) => item === "IR_to"),
    [headerLookup],
  );

  const vendorCountryOptions = useMemo(() => {
    if (vendorCountryCol < 0) {
      return [];
    }

    return Array.from(
      new Set(
        vendorDataRows
          .map((item) => item.row[vendorCountryCol])
          .filter(Boolean),
      ),
    ).sort();
  }, [vendorCountryCol, vendorDataRows]);

  const vendorLoiOptions = useMemo(() => {
    if (vendorLoiCol < 0) {
      return [];
    }

    return Array.from(
      new Set(
        vendorDataRows.map((item) => item.row[vendorLoiCol]).filter(Boolean),
      ),
    ).sort((a, b) => Number(a) - Number(b));
  }, [vendorDataRows, vendorLoiCol]);

  const vendorTypeOptions = useMemo(() => {
    if (vendorTypeCol < 0) {
      return [];
    }

    return ["random", "booster"].filter((option) =>
      vendorDataRows.some(
        (item) => normalizeVendorType(item.row[vendorTypeCol] ?? "") === option,
      ),
    );
  }, [vendorDataRows, vendorTypeCol]);

  const filteredVendorRows = useMemo(() => {
    return vendorDataRows.filter((entry) => {
      const row = entry.row;
      const rowText = row.join(" ").toLowerCase();

      if (search.trim() && !rowText.includes(search.trim().toLowerCase())) {
        return false;
      }

      if (countryFilters.length > 0 && vendorCountryCol >= 0) {
        if (!countryFilters.includes(row[vendorCountryCol] ?? "")) {
          return false;
        }
      }

      if (typeFilters.length > 0 && vendorTypeCol >= 0) {
        const rowType = normalizeVendorType(row[vendorTypeCol] ?? "");
        if (!typeFilters.includes(rowType)) {
          return false;
        }
      }

      if (loiFilters.length > 0 && vendorLoiCol >= 0) {
        if (!loiFilters.includes(row[vendorLoiCol] ?? "")) {
          return false;
        }
      }

      if (irFilter.trim() && vendorIrFromCol >= 0 && vendorIrToCol >= 0) {
        const irValue = parseInteger(irFilter);
        const from = Number(row[vendorIrFromCol] ?? "0");
        const to = Number(row[vendorIrToCol] ?? "0");
        if (!(Number.isFinite(irValue) && irValue >= from && irValue <= to)) {
          return false;
        }
      }

      return true;
    });
  }, [
    countryFilters,
    irFilter,
    loiFilters,
    search,
    typeFilters,
    vendorCountryCol,
    vendorDataRows,
    vendorIrFromCol,
    vendorIrToCol,
    vendorLoiCol,
    vendorTypeCol,
  ]);

  const vendorColumns = useMemo<ColumnDef<VendorDataRow>[]>(
    () => [
      {
        cell: ({ row, table }) => {
          const meta = table.options.meta as VendorTableMeta | undefined;
          const checked = meta?.selectedIndexSet.has(row.original.index) ?? false;

          return (
            <div
              className="flex items-center justify-center"
              onClick={(event) => event.stopPropagation()}
            >
              <Checkbox
                aria-label={`Select vendor row ${row.original.index + 1}`}
                checked={checked}
                onCheckedChange={() => {
                  meta?.toggleVendorRow(row.original.index);
                }}
              />
            </div>
          );
        },
        enableSorting: false,
        header: () => null,
        id: "select",
        size: 44,
      },
      ...headerLookup.map<ColumnDef<VendorDataRow>>((header, index) => ({
        accessorFn: (entry: VendorDataRow) => entry.row[index] ?? "",
        cell: (info) => info.row.original.row[index] ?? "",
        header,
        id: `col-${index}`,
        sortingFn: (rowA, rowB) =>
          compareTableValues(
            rowA.original.row[index] ?? "",
            rowB.original.row[index] ?? "",
          ),
      })),
    ],
    [headerLookup],
  );

  const vendorTable = useReactTable({
    autoResetPageIndex: false,
    columns: vendorColumns,
    data: filteredVendorRows,
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => String(row.index),
    getSortedRowModel: getSortedRowModel(),
    meta: {
      selectedIndexSet,
      toggleVendorRow,
    },
    onSortingChange: (updater) => {
      setPage(1);
      setSorting((prev) =>
        typeof updater === "function" ? updater(prev) : updater,
      );
    },
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize: 25,
      },
      sorting,
    },
  });

  const totalPages = Math.max(1, vendorTable.getPageCount());
  const paginationItems = useMemo(
    () => buildPaginationItems(page, totalPages),
    [page, totalPages],
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  function toggleVendorRow(index: number): void {
    if (selectedIndices.includes(index)) {
      setSelectedIndices((prev) => prev.filter((item) => item !== index));
      return;
    }

    if (selectedIndices.length >= 5) {
      setWarningMessage(
        t(
          lang,
          "벤더는 최대 5개까지 선택할 수 있습니다.",
          "You can select up to 5 vendors.",
        ),
      );
      return;
    }

    setSelectedIndices((prev) => [...prev, index]);
  }

  function clearFilters(): void {
    setPage(1);
    setIrFilter("");
    setCountryFilters(initialCountryFilters);
    setTypeFilters(initialTypeFilters);
    setLoiFilters(initialLoiFilters);
  }

  function updateFilterValues(
    setter: Dispatch<SetStateAction<string[]>>,
    value: string,
    checked: boolean,
  ): void {
    setter((prev) => {
      if (checked) {
        return prev.includes(value) ? prev : [...prev, value];
      }

      return prev.filter((item) => item !== value);
    });
    setPage(1);
  }

  function handleLoadSelectedVendors(): void {
    if (selectedIndices.length === 0) {
      setWarningMessage(
        t(
          lang,
          "최소 1개의 벤더를 선택해주세요.",
          "Please select at least one vendor.",
        ),
      );
      return;
    }

    onLoad(selectedIndices);
  }

  return (
    <>
      <div className="fixed inset-0 z-9998 flex items-center justify-center bg-black/40 px-4">
        <div className="flex h-[calc(100vh-3.5rem)] max-h-[calc(100vh-3.5rem)] w-[calc(100vw-5rem)] max-w-350 flex-col overflow-hidden rounded-[10px] border border-black/5 bg-white shadow-2xl">
          <div className="flex items-start justify-between gap-4 border-b border-black/7.5 px-4 py-3">
            <div>
              <div className="text-[20px] font-medium text-[#3d3d43]">
                Select vendors
              </div>
              <div className="text-[13px] text-[#5b5b5b]">
                Select up to 5 vendors from the list below.
              </div>
            </div>

            <button
              aria-label="Close"
              className="h-full ml-auto text-lg text-slate-500 hover:text-slate-700"
              onClick={onClose}
              type="button"
            >
              <BsXLg className="text-[18px]" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden px-4 py-3">
            <div className="flex h-full min-h-0 flex-col rounded-[10px] border border-black/7.5">
              <div className="flex flex-wrap items-center gap-2 border-b border-black/7.5 px-3 py-2">
                <div className="text-[12px] text-[#5b5b5b]">
                  Selected{" "}
                  <span className="text-[#6535ff]">{selectedIndices.length}</span>{" "}
                  / 5
                </div>

                <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
                  <a
                    className="table-link-button"
                    href="https://docs.google.com/spreadsheets/d/1pWFTXnpKhO6VOzHT7KsjrUPxmKFwfQdlatTKmWvTjUk/edit?gid=1004620658#gid=1004620658"
                    rel="noreferrer"
                    target="_blank"
                    title="Open Vendor List"
                  >
                    <BsBoxArrowUpRight size={14} />
                  </a>

                  <VendorFilterControls
                    clearFilters={clearFilters}
                    countryFilters={countryFilters}
                    countryOptions={vendorCountryOptions}
                    irFilter={irFilter}
                    loiFilters={loiFilters}
                    loiOptions={vendorLoiOptions}
                    onCountryToggle={(value, checked) => {
                      updateFilterValues(setCountryFilters, value, checked);
                    }}
                    onIrChange={(value) => {
                      setIrFilter(value);
                      setPage(1);
                    }}
                    onLoiToggle={(value, checked) => {
                      updateFilterValues(setLoiFilters, value, checked);
                    }}
                    onTypeToggle={(value, checked) => {
                      updateFilterValues(setTypeFilters, value, checked);
                    }}
                    typeFilters={typeFilters}
                    typeOptions={vendorTypeOptions}
                  />

                  <input
                    className="h-7.5 w-45 rounded-lg border border-[#e4e4e4] px-2 text-[13px] sm:w-55"
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Search all"
                    value={search}
                  />
                </div>
              </div>

              <div className="table-scroll-container min-h-0 flex-1 overflow-auto">
                <Table className="min-w-full text-[13px]">
                  <TableHeader>
                    {vendorTable.getHeaderGroups().map((headerGroup) => (
                      <TableRow
                        className="border-b-0 hover:bg-transparent"
                        key={headerGroup.id}
                      >
                        {headerGroup.headers.map((header) => {
                          const sorted = header.column.getIsSorted();

                          return (
                            <TableHead
                              className={`sticky top-0 z-10 h-7.5 border-y border-[#dee2e6] bg-[#f2f1f9] px-2 py-1 text-[12px] font-semibold text-[#3d555d] ${
                                header.column.id === "select" ? "w-11" : ""
                              }`}
                              key={header.id}
                            >
                              {header.isPlaceholder ? null : header.column.id ===
                                "select" ? null : (
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
                                    <BsChevronUp
                                      className="text-[#764cfc]"
                                      size={12}
                                    />
                                  ) : sorted === "desc" ? (
                                    <BsChevronDown
                                      className="text-[#764cfc]"
                                      size={12}
                                    />
                                  ) : (
                                    <BsChevronDown
                                      className="opacity-35"
                                      size={12}
                                    />
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
                    {vendorTable.getRowModel().rows.length === 0 ? (
                      <TableRow className="hover:bg-transparent">
                        <TableCell
                          className="h-24 border-b border-[#dee2e6] text-center text-[13px] text-[#5b5b5b]"
                          colSpan={vendorColumns.length}
                        >
                          No matching vendors found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      vendorTable.getRowModel().rows.map((row, rowIndex) => {
                        const checked = selectedIndexSet.has(row.original.index);

                        return (
                          <TableRow
                            className={`cursor-pointer border-b border-[#dee2e6] ${
                              checked
                                ? "bg-[rgba(126,48,203,0.1)] hover:bg-[rgba(126,48,203,0.15)]"
                                : rowIndex % 2 === 0
                                  ? "bg-[rgba(0,0,0,0.025)] hover:bg-[rgba(0,0,0,0.055)]"
                                  : "bg-white hover:bg-[rgba(0,0,0,0.04)]"
                            }`}
                            key={row.id}
                            onClick={() => toggleVendorRow(row.original.index)}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell
                                className={`px-2 py-1 align-middle text-[13px] ${
                                  cell.column.id === "select"
                                    ? "w-11 text-center"
                                    : "whitespace-nowrap"
                                }`}
                                key={cell.id}
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext(),
                                )}
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
                  Showing {filteredVendorRows.length === 0 ? 0 : (page - 1) * 25 + 1}{" "}
                  - {Math.min(page * 25, filteredVendorRows.length)} of{" "}
                  {filteredVendorRows.length}
                </div>
                <div className="table-pagination">
                  <button
                    className="table-pagination-button"
                    disabled={page <= 1}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
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
                        onClick={() => setPage(item)}
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
                    onClick={() =>
                      setPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    type="button"
                  >
                    {">"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end border-t border-black/7.5 px-4 py-3">
            <button
              className="rounded-[20px] bg-[#764cfc] px-4 py-1.5 text-sm text-white hover:bg-[#6535ff]"
              onClick={handleLoadSelectedVendors}
              type="button"
            >
              Load
            </button>
          </div>
        </div>
      </div>

      <WarningAlertModal
        message={warningMessage}
        onClose={() => setWarningMessage("")}
        open={Boolean(warningMessage)}
      />
    </>
  );
}
