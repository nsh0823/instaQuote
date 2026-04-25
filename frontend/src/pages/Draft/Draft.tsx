import { useMemo, useState } from "react";

import { useAppContext } from "@/context/AppContext";
import { DraftDetailDrawer } from "@/pages/Draft/components/DraftDetailDrawer";
import { useDraftPageData } from "@/pages/Draft/hooks/useDraftPageData";
import { useHeaderFloating } from "@/pages/Home/hooks/useHeaderFloating";
import { ListDataTable } from "@/pages/List/components/ListDataTable";
import { ListPageHeader } from "@/pages/List/components/ListPageHeader";
import { ListTableToolbar } from "@/pages/List/components/ListTableToolbar";
import { useListFilters } from "@/pages/List/hooks/useListFilters";
import { useListTableState } from "@/pages/List/hooks/useListTableState";
import { TablePageStatus } from "@/components/common/TablePageStatus";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "@/styles/table-page.css";
import "@/styles/table-controls.css";
import "@/pages/List/styles/List.css";

export default function Draft(): JSX.Element {
  const { rfqMode: mode, setRfqMode } = useAppContext();
  const isHeaderFloating = useHeaderFloating(10);
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);

  const { dateColumnKey, errorMessage, header, loading, records, sheetUrl } =
    useDraftPageData(mode);

  const activeRecord = useMemo(
    () => records.find((record) => record.id === activeRecordId) ?? null,
    [activeRecordId, records],
  );

  const {
    clearFilters,
    clientOptions,
    filteredRecords,
    ownerOptions,
    pageResetKey,
    range,
    search,
    selectedClients,
    selectedOwners,
    selectedStatuses,
    setRange,
    setSearch,
    statusOptions,
    toggleClient,
    toggleOwner,
    toggleStatus,
  } = useListFilters({
    dateColumnKey,
    header,
    records,
  });

  const {
    page,
    paginationItems,
    setPage,
    showingFrom,
    showingTo,
    table,
    totalPages,
    totalRows,
  } = useListTableState({
    header,
    idColumnLabel: "Draft ID",
    mode,
    onOpenRecord: (recordId: string) => {
      setActiveRecordId(recordId);
    },
    onStatusChange: async () => {},
    pageResetKey: `draft:${mode}:${pageResetKey}`,
    pinnedLeftColumnCount: mode === "KR" ? 1 : 2,
    records: filteredRecords,
    savingStatusId: null,
  });

  function handleLoadDraft(): void {
    setRfqMode(mode);
    setActiveRecordId(null);
  }

  function createPath(draftId: string): string {
    return `/create?draftid=${encodeURIComponent(draftId)}`;
  }

  function renderContent(): JSX.Element {
    if (loading) {
      return <TablePageStatus loading />;
    }

    if (errorMessage) {
      return <TablePageStatus message={errorMessage} tone="error" />;
    }

    if (header.length === 0) {
      return <TablePageStatus message="No draft data found." />;
    }

    return (
      <>
        <ListTableToolbar
          clientOptions={clientOptions}
          mode={mode}
          onClearFilters={clearFilters}
          onClientToggle={toggleClient}
          onOwnerToggle={toggleOwner}
          onRangeChange={setRange}
          onSearchChange={setSearch}
          onStatusToggle={toggleStatus}
          ownerOptions={ownerOptions}
          range={range}
          search={search}
          selectedClients={selectedClients}
          selectedOwners={selectedOwners}
          selectedStatuses={selectedStatuses}
          sheetTitle={`Open ${mode} Draft List`}
          sheetUrl={sheetUrl}
          showStatusFilter={false}
          statusOptions={statusOptions}
        />

        <ListDataTable
          activeRecordId={activeRecordId}
          emptyStateLabel="No matching drafts found."
          idColumnLabel="Draft ID"
          mode={mode}
          onOpenRecord={(recordId: string) => {
            setActiveRecordId(recordId);
          }}
          onPageChange={setPage}
          onStatusChange={async () => {}}
          page={page}
          paginationItems={paginationItems}
          savingStatusId={null}
          showingFrom={showingFrom}
          showingTo={showingTo}
          table={table}
          totalPages={totalPages}
          totalRows={totalRows}
        />
      </>
    );
  }

  return (
    <div className="table-page">
      <div className="table-page-shell">
        <ListPageHeader isFloating={isHeaderFloating} mode={mode} title="Drafts" />

        <main className="table-page-main">
          <section className="table-page-card shadow-sm">{renderContent()}</section>
        </main>
      </div>

      <DraftDetailDrawer
        activeRecord={activeRecord}
        createPath={createPath}
        header={header}
        mode={mode}
        onClose={() => setActiveRecordId(null)}
        onLoadDraft={handleLoadDraft}
      />
    </div>
  );
}
