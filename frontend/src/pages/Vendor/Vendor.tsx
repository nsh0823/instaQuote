import { useHeaderFloating } from "@/pages/Home/hooks/useHeaderFloating";
import { VendorDataTable } from "@/pages/Vendor/components/VendorDataTable";
import { VendorPageHeader } from "@/pages/Vendor/components/VendorPageHeader";
import { TablePageStatus } from "@/components/common/TablePageStatus";
import { VendorTableToolbar } from "@/pages/Vendor/components/VendorTableToolbar";
import { useVendorPageData } from "@/pages/Vendor/hooks/useVendorPageData";
import { useVendorTableState } from "@/pages/Vendor/hooks/useVendorTableState";
import { VENDOR_SHEET_URL } from "@/pages/Vendor/utils/vendor";

import "@/styles/table-page.css";
import "@/styles/table-controls.css";

export default function Vendor(): JSX.Element {
  const isHeaderFloating = useHeaderFloating(10);
  const { errorMessage, loading, vendorRows } = useVendorPageData();
  const {
    clearFilters,
    countryFilters,
    headerLookup,
    irFilter,
    loiFilters,
    onIrChange,
    page,
    paginationItems,
    search,
    setPage,
    setSearch,
    showingFrom,
    showingTo,
    toggleCountryFilter,
    toggleLoiFilter,
    toggleTypeFilter,
    totalFilteredRows,
    totalPages,
    typeFilters,
    vendorCountryOptions,
    vendorLoiOptions,
    vendorTable,
    vendorTypeOptions,
  } = useVendorTableState(vendorRows);

  function renderContent(): JSX.Element {
    if (loading) {
      return <TablePageStatus loading />;
    }

    if (errorMessage) {
      return <TablePageStatus message={errorMessage} tone="error" />;
    }

    if (headerLookup.length === 0) {
      return <TablePageStatus message="No vendor data found." />;
    }

    return (
      <>
        <VendorTableToolbar
          clearFilters={clearFilters}
          countryFilters={countryFilters}
          countryOptions={vendorCountryOptions}
          irFilter={irFilter}
          loiFilters={loiFilters}
          loiOptions={vendorLoiOptions}
          onCountryToggle={toggleCountryFilter}
          onIrChange={onIrChange}
          onLoiToggle={toggleLoiFilter}
          onSearchChange={setSearch}
          onTypeToggle={toggleTypeFilter}
          search={search}
          sheetUrl={VENDOR_SHEET_URL}
          typeFilters={typeFilters}
          typeOptions={vendorTypeOptions}
        />

        <VendorDataTable
          onPageChange={setPage}
          page={page}
          paginationItems={paginationItems}
          showingFrom={showingFrom}
          showingTo={showingTo}
          table={vendorTable}
          totalPages={totalPages}
          totalRows={totalFilteredRows}
        />
      </>
    );
  }

  return (
    <div className="table-page">
      <div className="table-page-shell">
        <VendorPageHeader isFloating={isHeaderFloating} />

        <main className="table-page-main">
          <section className="table-page-card shadow-sm">{renderContent()}</section>
        </main>
      </div>
    </div>
  );
}
