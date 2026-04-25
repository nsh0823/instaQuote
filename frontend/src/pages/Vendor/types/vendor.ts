import type { TableRows } from "@/types/backend";

export type VendorDataRow = {
  index: number;
  normalizedType: string;
  row: string[];
  searchText: string;
};

export type VendorColumnIndices = {
  country: number;
  irFrom: number;
  irTo: number;
  loi: number;
  type: number;
};

export type VendorFilterState = {
  countryFilters: string[];
  irFilter: string;
  loiFilters: string[];
  typeFilters: string[];
};

export type VendorPageDataState = {
  errorMessage: string | null;
  loading: boolean;
  vendorRows: TableRows;
};

export type VendorPaginationItem = number | "ellipsis-start" | "ellipsis-end";
