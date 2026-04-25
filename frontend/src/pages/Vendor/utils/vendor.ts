import type { SortingState } from "@tanstack/react-table";

import { normalizeVendorType } from "@/components/vendor/VendorTableControls";
import { parseInteger } from "@/pages/Create/utils/number";
import type {
  VendorColumnIndices,
  VendorDataRow,
  VendorFilterState,
} from "@/pages/Vendor/types/vendor";
import type { TableRows } from "@/types/backend";

export const VENDOR_PAGE_SIZE = 25;
export const VENDOR_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1pWFTXnpKhO6VOzHT7KsjrUPxmKFwfQdlatTKmWvTjUk/edit?gid=1004620658#gid=1004620658";

export function createDefaultVendorSorting(): SortingState {
  return [{ desc: true, id: "col-0" }];
}

export function parseVendorRowNumber(value: string): number {
  return Number(value.replace(/,/g, "").trim());
}

export function buildVendorColumnIndices(
  headerLookup: string[],
): VendorColumnIndices {
  return {
    country: headerLookup.findIndex((item) => item === "Country"),
    irFrom: headerLookup.findIndex((item) => item === "IR_from"),
    irTo: headerLookup.findIndex((item) => item === "IR_to"),
    loi: headerLookup.findIndex((item) => item === "LOI"),
    type: headerLookup.findIndex((item) => item === "Type"),
  };
}

export function buildVendorDataRows(
  vendorRows: TableRows,
  typeColumnIndex: number,
): VendorDataRow[] {
  return vendorRows.slice(1).map((row, index) => ({
    index,
    normalizedType:
      typeColumnIndex >= 0 ? normalizeVendorType(row[typeColumnIndex] ?? "") : "",
    row,
    searchText: row.join(" ").toLowerCase(),
  }));
}

function buildUniqueColumnOptions(
  vendorDataRows: VendorDataRow[],
  columnIndex: number,
): string[] {
  if (columnIndex < 0) {
    return [];
  }

  return Array.from(
    new Set(vendorDataRows.map((item) => item.row[columnIndex]).filter(Boolean)),
  ).sort();
}

export function buildVendorCountryOptions(
  vendorDataRows: VendorDataRow[],
  columnIndex: number,
): string[] {
  return buildUniqueColumnOptions(vendorDataRows, columnIndex);
}

export function buildVendorLoiOptions(
  vendorDataRows: VendorDataRow[],
  columnIndex: number,
): string[] {
  return buildUniqueColumnOptions(vendorDataRows, columnIndex).sort(
    (left, right) => Number(left) - Number(right),
  );
}

export function buildVendorTypeOptions(
  vendorDataRows: VendorDataRow[],
): string[] {
  return ["random", "booster"].filter((option) =>
    vendorDataRows.some((item) => item.normalizedType === option),
  );
}

export function filterVendorDataRows(params: {
  columnIndices: VendorColumnIndices;
  filters: VendorFilterState;
  rows: VendorDataRow[];
  search: string;
}): VendorDataRow[] {
  const { columnIndices, filters, rows, search } = params;
  const searchText = search.trim().toLowerCase();

  return rows.filter((entry) => {
    if (searchText && !entry.searchText.includes(searchText)) {
      return false;
    }

    if (filters.countryFilters.length > 0 && columnIndices.country >= 0) {
      if (!filters.countryFilters.includes(entry.row[columnIndices.country] ?? "")) {
        return false;
      }
    }

    if (filters.typeFilters.length > 0) {
      if (!filters.typeFilters.includes(entry.normalizedType)) {
        return false;
      }
    }

    if (filters.loiFilters.length > 0 && columnIndices.loi >= 0) {
      if (!filters.loiFilters.includes(entry.row[columnIndices.loi] ?? "")) {
        return false;
      }
    }

    if (filters.irFilter.trim() && columnIndices.irFrom >= 0 && columnIndices.irTo >= 0) {
      const irValue = parseInteger(filters.irFilter);
      const from = parseVendorRowNumber(entry.row[columnIndices.irFrom] ?? "");
      const to = parseVendorRowNumber(entry.row[columnIndices.irTo] ?? "");

      if (!(Number.isFinite(irValue) && irValue >= from && irValue <= to)) {
        return false;
      }
    }

    return true;
  });
}

export function getVendorShowingRange(
  page: number,
  totalRows: number,
): { from: number; to: number } {
  if (totalRows === 0) {
    return { from: 0, to: 0 };
  }

  return {
    from: (page - 1) * VENDOR_PAGE_SIZE + 1,
    to: Math.min(page * VENDOR_PAGE_SIZE, totalRows),
  };
}
