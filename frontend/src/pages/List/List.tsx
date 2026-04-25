import { useMemo, useState } from "react";

import { FeedbackToast } from "@/components/common/Feedback";
import { useAppContext } from "@/context/AppContext";
import { ListDataTable } from "@/pages/List/components/ListDataTable";
import { ListDetailDrawer } from "@/pages/List/components/ListDetailDrawer";
import { ListPageHeader } from "@/pages/List/components/ListPageHeader";
import { ListTableToolbar } from "@/pages/List/components/ListTableToolbar";
import { useListFilters } from "@/pages/List/hooks/useListFilters";
import { useListPageData } from "@/pages/List/hooks/useListPageData";
import { useListRecordActions } from "@/pages/List/hooks/useListRecordActions";
import { useListTableState } from "@/pages/List/hooks/useListTableState";
import { useHeaderFloating } from "@/pages/Home/hooks/useHeaderFloating";
import { TablePageStatus } from "@/components/common/TablePageStatus";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "@/styles/table-page.css";
import "@/styles/table-controls.css";
import "./styles/List.css";

export default function List(): JSX.Element {
  const { rfqMode: mode, setRfqMode } = useAppContext();
  const isHeaderFloating = useHeaderFloating(10);
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);

  const {
    dateColumnKey,
    errorMessage,
    header,
    lastUpdatedColumnKey,
    loading,
    records,
    setRecords,
    sheetUrl,
  } = useListPageData(mode);

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
    closeToast,
    drawerNotes,
    drawerOutputUrl,
    drawerSaving,
    handleSaveDrawer,
    handleStatusChange,
    savingStatusId,
    setDrawerNotes,
    setDrawerOutputUrl,
    toast,
  } = useListRecordActions({
    activeRecord,
    header,
    lastUpdatedColumnKey,
    mode,
    records,
    setRecords,
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
    mode,
    onOpenRecord: (recordId: string) => {
      setActiveRecordId(recordId);
    },
    onStatusChange: handleStatusChange,
    pageResetKey: `${mode}:${pageResetKey}`,
    records: filteredRecords,
    savingStatusId,
  });

  function handleLoadRfq(): void {
    setRfqMode(mode);
    setActiveRecordId(null);
  }

  function createPath(rfqId: string): string {
    return `/create?rfqid=${encodeURIComponent(rfqId)}`;
  }

  function renderContent(): JSX.Element {
    if (loading) {
      return <TablePageStatus loading />;
    }

    if (errorMessage) {
      return <TablePageStatus message={errorMessage} tone="error" />;
    }

    if (header.length === 0) {
      return <TablePageStatus message="No RFQ data found." />;
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
          sheetUrl={sheetUrl}
          statusOptions={statusOptions}
        />

        <ListDataTable
          activeRecordId={activeRecordId}
          mode={mode}
          onOpenRecord={(recordId: string) => {
            setActiveRecordId(recordId);
          }}
          onPageChange={setPage}
          onStatusChange={handleStatusChange}
          page={page}
          paginationItems={paginationItems}
          savingStatusId={savingStatusId}
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
        <ListPageHeader isFloating={isHeaderFloating} mode={mode} />

        <main className="table-page-main">
          <section className="table-page-card shadow-sm">{renderContent()}</section>
        </main>
      </div>

      <ListDetailDrawer
        activeRecord={activeRecord}
        createPath={createPath}
        dateColumnKey={dateColumnKey}
        drawerNotes={drawerNotes}
        drawerOutputUrl={drawerOutputUrl}
        drawerSaving={drawerSaving}
        header={header}
        mode={mode}
        onClose={() => setActiveRecordId(null)}
        onLoadRfq={handleLoadRfq}
        onNotesChange={setDrawerNotes}
        onOutputUrlChange={setDrawerOutputUrl}
        onSave={() => {
          void handleSaveDrawer();
        }}
      />

      <FeedbackToast
        body={toast?.body ?? ""}
        onClose={closeToast}
        open={Boolean(toast)}
        showBackdrop={false}
        title={toast?.title ?? ""}
        type={toast?.type ?? "success"}
      />
    </div>
  );
}
