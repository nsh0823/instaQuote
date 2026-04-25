import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type Table as ReactTableInstance,
} from "@tanstack/react-table";
import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import {
  buildPaginationItems,
  compareTableValues,
} from "@/components/table/tableUtils";
import type {
  VendorDataRow,
  VendorPaginationItem,
} from "@/pages/Vendor/types/vendor";
import {
  VENDOR_PAGE_SIZE,
  buildVendorColumnIndices,
  buildVendorCountryOptions,
  buildVendorDataRows,
  buildVendorLoiOptions,
  buildVendorTypeOptions,
  createDefaultVendorSorting,
  filterVendorDataRows,
  getVendorShowingRange,
} from "@/pages/Vendor/utils/vendor";
import type { TableRows } from "@/types/backend";

type UseVendorTableStateResult = {
  clearFilters: () => void;
  countryFilters: string[];
  headerLookup: string[];
  irFilter: string;
  loiFilters: string[];
  page: number;
  paginationItems: VendorPaginationItem[];
  search: string;
  setPage: (page: number) => void;
  setSearch: (value: string) => void;
  showingFrom: number;
  showingTo: number;
  toggleCountryFilter: (value: string, checked: boolean) => void;
  toggleLoiFilter: (value: string, checked: boolean) => void;
  toggleTypeFilter: (value: string, checked: boolean) => void;
  totalFilteredRows: number;
  totalPages: number;
  typeFilters: string[];
  vendorCountryOptions: string[];
  vendorLoiOptions: string[];
  vendorTable: ReactTableInstance<VendorDataRow>;
  vendorTypeOptions: string[];
  onIrChange: (value: string) => void;
};

export function useVendorTableState(
  vendorRows: TableRows,
): UseVendorTableStateResult {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>(createDefaultVendorSorting);
  const [typeFilters, setTypeFilters] = useState<string[]>([]);
  const [countryFilters, setCountryFilters] = useState<string[]>([]);
  const [loiFilters, setLoiFilters] = useState<string[]>([]);
  const [irFilter, setIrFilter] = useState("");

  const headerLookup = useMemo(() => vendorRows[0] ?? [], [vendorRows]);
  const columnIndices = useMemo(
    () => buildVendorColumnIndices(headerLookup),
    [headerLookup],
  );

  const vendorDataRows = useMemo(
    () => buildVendorDataRows(vendorRows, columnIndices.type),
    [columnIndices.type, vendorRows],
  );

  const vendorCountryOptions = useMemo(
    () => buildVendorCountryOptions(vendorDataRows, columnIndices.country),
    [columnIndices.country, vendorDataRows],
  );
  const vendorLoiOptions = useMemo(
    () => buildVendorLoiOptions(vendorDataRows, columnIndices.loi),
    [columnIndices.loi, vendorDataRows],
  );
  const vendorTypeOptions = useMemo(
    () => buildVendorTypeOptions(vendorDataRows),
    [vendorDataRows],
  );

  const filteredVendorRows = useMemo(
    () =>
      filterVendorDataRows({
        columnIndices,
        filters: {
          countryFilters,
          irFilter,
          loiFilters,
          typeFilters,
        },
        rows: vendorDataRows,
        search,
      }),
    [
      columnIndices,
      countryFilters,
      irFilter,
      loiFilters,
      search,
      typeFilters,
      vendorDataRows,
    ],
  );

  const vendorColumns = useMemo<ColumnDef<VendorDataRow>[]>(
    () =>
      headerLookup.map<ColumnDef<VendorDataRow>>((header, index) => ({
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
    onSortingChange: (updater) => {
      setPage(1);
      setSorting((prev) =>
        typeof updater === "function" ? updater(prev) : updater,
      );
    },
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize: VENDOR_PAGE_SIZE,
      },
      sorting,
    },
  });

  const totalPages = Math.max(1, vendorTable.getPageCount());
  const paginationItems = useMemo(
    () => buildPaginationItems(page, totalPages),
    [page, totalPages],
  );
  const totalFilteredRows = filteredVendorRows.length;
  const { from: showingFrom, to: showingTo } = getVendorShowingRange(
    page,
    totalFilteredRows,
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

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

  function clearFilters(): void {
    setPage(1);
    setIrFilter("");
    setCountryFilters([]);
    setTypeFilters([]);
    setLoiFilters([]);
  }

  return {
    clearFilters,
    countryFilters,
    headerLookup,
    irFilter,
    loiFilters,
    onIrChange: (value: string) => {
      setIrFilter(value);
      setPage(1);
    },
    page,
    paginationItems,
    search,
    setPage,
    setSearch: (value: string) => {
      setSearch(value);
      setPage(1);
    },
    showingFrom,
    showingTo,
    toggleCountryFilter: (value: string, checked: boolean) => {
      updateFilterValues(setCountryFilters, value, checked);
    },
    toggleLoiFilter: (value: string, checked: boolean) => {
      updateFilterValues(setLoiFilters, value, checked);
    },
    toggleTypeFilter: (value: string, checked: boolean) => {
      updateFilterValues(setTypeFilters, value, checked);
    },
    totalFilteredRows,
    totalPages,
    typeFilters,
    vendorCountryOptions,
    vendorLoiOptions,
    vendorTable,
    vendorTypeOptions,
  };
}
