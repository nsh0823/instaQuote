import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  type FilterOptionOption,
  type GroupBase,
} from "react-select";
import {
  BsExclamationTriangleFill,
} from "react-icons/bs";

import {
  ConfirmAlertModal,
  FeedbackToast,
  WarningAlertModal,
} from "@/components/common/Feedback";
import type {
  CreateSelectOption as SelectOption,
  OsCreateFormProps,
} from "@/pages/Create/types";
import { OsCountriesRail } from "@/pages/Create/components/os/OsCountriesRail";
import { OsCountryActionsMenu } from "@/pages/Create/components/os/OsCountryActionsMenu";
import { OsCountryTitlePortal } from "@/pages/Create/components/os/OsCountryTitlePortal";
import { OsFormCard } from "@/pages/Create/components/os/OsFormCard";
import { OsHeaderSaveActions } from "@/pages/Create/components/os/OsHeaderSaveActions";
import { VendorSelectionModal } from "@/pages/Create/components/os/VendorSelectionModal";
import { OsSetupModal } from "@/pages/Create/components/os/OsSetupModal";
import { OsTotalCard } from "@/pages/Create/components/os/OsTotalCard";
import { OsVendorsCard } from "@/pages/Create/components/os/OsVendorsCard";
import { useOsPanels } from "@/pages/Create/hooks/useOsPanels";
import { useOsPricing } from "@/pages/Create/hooks/useOsPricing";
import { useOsSubmit } from "@/pages/Create/hooks/useOsSubmit";
import {
  inlineMultiSelectStyles,
  setupConnectedMultiSelectStyles,
  setupSelectStyles,
} from "@/pages/Create/styles/react-select/osCreateSelectStyles";
import { normalizeIntegerInput } from "@/pages/Create/utils/number";
import { missingRequiredForPanel } from "@/pages/Create/utils/os-panels";

import "@/pages/Create/styles/OsCreate.css";

export function OsCreateForm({
  activeRecordId,
  activeUser,
  clientGroups,
  countries,
  gmailEmails,
  initialFinalProgramming,
  isCountriesLoading,
  lang,
  onCreatePanels,
  osPanels,
  osSetup,
  setOsPanels,
  setOsSetup,
  vendorRows,
}: OsCreateFormProps): JSX.Element {
  const [warningMessage, setWarningMessage] = useState("");

  const {
    activePanel,
    activePanelId,
    addCountries,
    addCountryOpen,
    addCountrySelection,
    addCountryOptions,
    applyBatchChange,
    applyPanelGmailSuggestion,
    applySetupGmailSuggestion,
    applySetupToPanels,
    batchChangeDone,
    batchChangeOpen,
    batchTargetOptions,
    batchTargets,
    cancelRename,
    clearFormSection,
    countryMenuOpenId,
    countryMenuPosition,
    duplicatePanel,
    fixedInputModalOpen,
    refreshCountryList,
    refreshGmailList,
    refreshingGmail,
    removePanel,
    renamingPanelId,
    renamingValue,
    saveRename,
    selectedAddCountryOptions,
    selectedBatchTargetOptions,
    setActivePanelId,
    setAddCountrySelection,
    setBatchChangeOpen,
    setBatchTargets,
    setCalcAwareInlineDropdownsClosed,
    setCountryMenuOpenId,
    setCountryMenuPosition,
    setFixedInputModalOpen,
    setPanelValues,
    setRenamingValue,
    showCountryRefreshSpinner,
    startRename,
    toggleAddCountry,
    toggleCountryMenu,
    updatePanelInput,
    updateSetupCountries,
    updateSetupField,
  } = useOsPanels({
    activeRecordId,
    activeUser,
    clientGroups,
    countries,
    isCountriesLoading,
    lang,
    onCreatePanels,
    osPanels,
    osSetup,
    setOsPanels,
    setOsSetup,
    setWarningMessage,
  });

  const {
    isInitialPricingReady,
    activeCalcId,
    activeRows,
    applyCalcSelection,
    applySelectedVendors,
    calcMenuOpen,
    cancelEditProposal,
    clearTotalSection,
    clearVendorsSection,
    closeVendorModal,
    duplicatePricingState,
    finalGM,
    finalGMPer,
    finalProgramming,
    finalSales,
    hasAllPanelsCalculated,
    isProposalEditing,
    markupOptions,
    openVendorModalFor,
    proposalDraft,
    removePricingState,
    saveEditProposal,
    selectedMarkupOption,
    selectCalcResult,
    setCalcMenuOpen,
    setCalcMarkupDraft,
    setFinalProgramming,
    setProposalDraft,
    setVendorUsageCount,
    startEditProposal,
    totalOther,
    totalOverlay,
    updateVendorInput,
    vendorCpiKrwCol,
    vendorModalOpen,
    vendorModalPanel,
  } = useOsPricing({
    activeRecordId,
    activePanel,
    activePanelId,
    initialFinalProgramming,
    lang,
    osPanels,
    setPanelValues,
    setWarningMessage,
    vendorRows,
  });

  const {
    cancelConfirm,
    closeToast,
    confirmAction,
    confirmLabel,
    confirmMessage,
    handleConfirmSubmit,
    isSubmitting,
    openConfirm,
    toastState,
  } = useOsSubmit({
    activeRecordId,
    finalGM,
    finalGMPer,
    finalProgramming,
    finalSales,
    hasAllPanelsCalculated,
    lang,
    osPanels,
    setWarningMessage,
    totalOther,
    totalOverlay,
  });

  useEffect(() => {
    if (!addCountryOpen && !batchChangeOpen && !calcMenuOpen) {
      return;
    }

    function handleOutside(event: MouseEvent): void {
      const target = event.target as HTMLElement;
      if (target.closest("[data-inline-dropdown]")) {
        return;
      }
      setCalcAwareInlineDropdownsClosed();
      setCalcMenuOpen(false);
    }

    document.addEventListener("mousedown", handleOutside);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
    };
  }, [
    addCountryOpen,
    batchChangeOpen,
    calcMenuOpen,
    setCalcAwareInlineDropdownsClosed,
    setCalcMenuOpen,
  ]);

  const selectMenuPortalTarget =
    typeof document !== "undefined" ? document.body : undefined;

  const ownerOptions = useMemo<SelectOption[]>(() => {
    const owners = Array.from(
      new Set(["User 1", "User 2", "User 3", "User 4", "User 5", activeUser]),
    );
    return owners
      .filter(Boolean)
      .map((owner) => ({ label: owner, value: owner }));
  }, [activeUser]);

  const projectTypeOptions = useMemo<SelectOption[]>(
    () =>
      ["Type 1", "Type 2", "Type 3", "Type 4", "Others"].map((value) => ({
        label: value,
        value,
      })),
    [],
  );

  const samplingTypeOptions = useMemo<SelectOption[]>(
    () =>
      ["Random", "Booster"].map((value) => ({
        label: value,
        value,
      })),
    [],
  );

  const groupedClientOptions = useMemo<Array<GroupBase<SelectOption>>>(() => {
    const groups: Array<GroupBase<SelectOption>> = clientGroups.map(
      (group) => ({
        label: group.label,
        options: group.options.map((option) => ({
          group: group.label,
          label: option.label,
          token: option.token,
          value: option.label,
        })),
      }),
    );

    groups.push({
      label: "Other",
      options: [{ group: "Other", label: "Other", value: "Other" }],
    });

    return groups;
  }, [clientGroups]);

  const allClientOptions = useMemo(
    () => groupedClientOptions.flatMap((group) => group.options),
    [groupedClientOptions],
  );

  const setupCountryOptions = useMemo<SelectOption[]>(
    () =>
      countries.map((country) => ({
        flagCode: country.code.toLowerCase(),
        keyword: `${country.keyword} ${country.code} ${country.nameKr}`,
        label: country.nameEn,
        value: `${country.code}-${country.nameEn}`,
      })),
    [countries],
  );

  const selectedSetupCountryOptions = useMemo(() => {
    const optionMap = new Map(
      setupCountryOptions.map((option) => [option.value, option]),
    );
    return osSetup.selectedCountries
      .map((value) => optionMap.get(value))
      .filter((option): option is SelectOption => Boolean(option));
  }, [osSetup.selectedCountries, setupCountryOptions]);

  const selectedSetupOwnerOption = useMemo(
    () => ownerOptions.find((option) => option.value === osSetup.owner) ?? null,
    [osSetup.owner, ownerOptions],
  );

  const selectedSetupProjectTypeOption = useMemo(
    () =>
      projectTypeOptions.find(
        (option) => option.value === osSetup.projectType,
      ) ?? null,
    [osSetup.projectType, projectTypeOptions],
  );

  const selectedSetupSamplingTypeOption = useMemo(
    () =>
      samplingTypeOptions.find(
        (option) => option.value === osSetup.samplingType,
      ) ?? null,
    [osSetup.samplingType, samplingTypeOptions],
  );

  const selectedSetupClientOption = useMemo(() => {
    return (
      allClientOptions.find((option) => option.value === osSetup.client) ??
      (osSetup.client
        ? {
            label: osSetup.client,
            value: osSetup.client,
          }
        : null)
    );
  }, [allClientOptions, osSetup.client]);

  const selectedPanelOwnerOption = useMemo(
    () =>
      ownerOptions.find((option) => option.value === activePanel?.owner) ??
      null,
    [activePanel?.owner, ownerOptions],
  );

  const selectedPanelProjectTypeOption = useMemo(
    () =>
      projectTypeOptions.find(
        (option) => option.value === activePanel?.projectType,
      ) ?? null,
    [activePanel?.projectType, projectTypeOptions],
  );

  const selectedPanelSamplingTypeOption = useMemo(
    () =>
      samplingTypeOptions.find(
        (option) => option.value === activePanel?.samplingType,
      ) ?? null,
    [activePanel?.samplingType, samplingTypeOptions],
  );

  const selectedPanelClientOption = useMemo(() => {
    if (!activePanel?.client) {
      return null;
    }

    return (
      allClientOptions.find(
        (option) => option.value === activePanel.client,
      ) ?? {
        label: activePanel.client,
        value: activePanel.client,
      }
    );
  }, [activePanel?.client, allClientOptions]);

  const filterSetupCountryOption = (
    candidate: FilterOptionOption<SelectOption>,
    input: string,
  ): boolean => {
    const query = input.trim().toLowerCase();
    if (!query) {
      return true;
    }

    const lookup =
      `${candidate.label} ${candidate.value} ${candidate.data.keyword ?? ""}`.toLowerCase();
    return lookup.includes(query);
  };

  function formatCountryWithFlag(option: SelectOption): JSX.Element {
    const flagCode =
      option.flagCode ?? option.value.split("-")[0].toLowerCase();
    return (
      <div className="flex items-center gap-2">
        <img
          alt=""
          className="rounded-full size-4"
          src={`https://hatscripts.github.io/circle-flags/flags/${flagCode}.svg`}
        />
        <span>{option.label}</span>
      </div>
    );
  }

  const isRequiredReady = useMemo(
    () =>
      osPanels.length > 0 &&
      osPanels.every((panel) => !missingRequiredForPanel(panel)),
    [osPanels],
  );

  const requiredMissingCount = useMemo(() => {
    return osPanels.reduce(
      (count, panel) => count + (missingRequiredForPanel(panel) ? 1 : 0),
      0,
    );
  }, [osPanels]);

  const setupGmailSuggestions = useMemo(
    () =>
      gmailEmails.map(
        (entry) => `${entry.subject}|||${entry.sender}|||${entry.client}`,
      ),
    [gmailEmails],
  );

  const headerActionRoot =
    typeof document !== "undefined"
      ? document.getElementById("create-header-actions")
      : null;
  const headerMiddleRoot =
    typeof document !== "undefined"
      ? document.getElementById("create-header-middle")
      : null;
  const shouldRenderBackground = !fixedInputModalOpen;
  const showEditLoadingSpinner =
    Boolean(activeRecordId) &&
    (isCountriesLoading || !isInitialPricingReady || osPanels.length === 0 || !activePanel);

  if (showEditLoadingSpinner) {
    return (
      <div className="flex min-h-[calc(100vh-180px)] items-center justify-center px-2">
        <div className="flex flex-col items-center gap-3 text-center text-[13px] text-[#5b5b5b]">
          <div
            aria-hidden="true"
            className="animate-spin rounded-full border-[3px] border-[#d7dbe1] border-t-[#475562] size-8"
          />
          <div>Loading RFQ...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {shouldRenderBackground ? (
        <>
          <div className="grid grid-cols-12 gap-4">
            <div
              className="col-span-12 lg:col-span-8"
              style={{ paddingLeft: 8, paddingRight: 8 }}
            >
              {activePanel ? (
                <div className="space-y-4">
                  <OsFormCard
                    activePanel={activePanel}
                    batchChangeDone={batchChangeDone}
                    batchChangeOpen={batchChangeOpen}
                    batchTargetCount={batchTargets.length}
                    batchTargetOptions={batchTargetOptions}
                    groupedClientOptions={groupedClientOptions}
                    inlineMultiSelectStyles={inlineMultiSelectStyles}
                    lang={lang}
                    onApplyBatchChange={applyBatchChange}
                    onApplyGmailSuggestion={(value) =>
                      applyPanelGmailSuggestion(activePanel.id, value)
                    }
                    onBatchTargetsChange={setBatchTargets}
                    onClear={() => clearFormSection(activePanel.id)}
                    onPanelFieldChange={(field, value) =>
                      updatePanelInput(activePanel.id, field, value)
                    }
                    onRefreshGmailList={refreshGmailList}
                    onToggleBatchChange={() => {
                      setBatchChangeOpen((prev) => !prev);
                      setCalcMenuOpen(false);
                    }}
                    ownerOptions={ownerOptions}
                    projectTypeOptions={projectTypeOptions}
                    refreshingGmail={refreshingGmail}
                    samplingTypeOptions={samplingTypeOptions}
                    selectedBatchTargetOptions={selectedBatchTargetOptions}
                    selectedPanelClientOption={selectedPanelClientOption}
                    selectedPanelOwnerOption={selectedPanelOwnerOption}
                    selectedPanelProjectTypeOption={
                      selectedPanelProjectTypeOption
                    }
                    selectedPanelSamplingTypeOption={
                      selectedPanelSamplingTypeOption
                    }
                    setupSelectStyles={setupSelectStyles}
                  />

                  <OsVendorsCard
                    activePanel={activePanel}
                    lang={lang}
                    onClear={() => clearVendorsSection(activePanel.id)}
                    onOpenVendorModal={() => openVendorModalFor(activePanel.id)}
                    onVendorFieldChange={(vendorIndex, field, value) =>
                      updateVendorInput(activePanel.id, vendorIndex, field, value)
                    }
                    onVendorUsageCountChange={(count) =>
                      setVendorUsageCount(activePanel.id, count)
                    }
                    selectMenuPortalTarget={selectMenuPortalTarget}
                    setupSelectStyles={setupSelectStyles}
                  />

                  <OsTotalCard
                    activeCalcId={activeCalcId}
                    activePanel={activePanel}
                    activeRows={activeRows}
                    calcMenuOpen={calcMenuOpen}
                    isProposalEditing={isProposalEditing}
                    markupOptions={markupOptions}
                    onApplyCalcSelection={applyCalcSelection}
                    onCalcMarkupDraftChange={setCalcMarkupDraft}
                    onCancelProposalEdit={cancelEditProposal}
                    onClear={() => clearTotalSection(activePanel.id)}
                    onProposalDraftChange={(value) =>
                      setProposalDraft(normalizeIntegerInput(value))
                    }
                    onSaveProposalEdit={saveEditProposal}
                    onSelectCalcRow={(rowId) =>
                      selectCalcResult(activePanel.id, rowId)
                    }
                    onStartProposalEdit={startEditProposal}
                    onToggleCalcMenu={() => {
                      setCalcMarkupDraft(activePanel.markUp || "1.2");
                      setCalcMenuOpen((prev) => !prev);
                      setBatchChangeOpen(false);
                    }}
                    proposalDraft={proposalDraft}
                    selectedMarkupOption={selectedMarkupOption}
                    setupSelectStyles={setupSelectStyles}
                  />
                </div>
              ) : null}
            </div>

            <OsCountriesRail
              activePanelId={activePanelId}
              addCountryOpen={addCountryOpen}
              addCountryOptions={addCountryOptions}
              addCountrySelectionCount={addCountrySelection.length}
              countryMenuOpenId={countryMenuOpenId}
              filterCountryOption={filterSetupCountryOption}
              finalGM={finalGM}
              finalGMPer={finalGMPer}
              finalProgramming={finalProgramming}
              finalSales={finalSales}
              formatCountryOption={formatCountryWithFlag}
              inlineMultiSelectStyles={inlineMultiSelectStyles}
              lang={lang}
              onAddCountries={addCountries}
              onAddCountrySelectionChange={setAddCountrySelection}
              onFinalProgrammingChange={setFinalProgramming}
              onPanelSelect={(panelId) => {
                setActivePanelId(panelId);
                setCountryMenuOpenId(null);
                setCountryMenuPosition(null);
              }}
              onRenamingValueChange={setRenamingValue}
              onRenameCancel={cancelRename}
              onRenameSave={saveRename}
              onToggleAddCountry={() =>
                toggleAddCountry(() => setCalcMenuOpen(false))
              }
              onToggleCountryMenu={toggleCountryMenu}
              osPanels={osPanels}
              renamingPanelId={renamingPanelId}
              renamingValue={renamingValue}
              selectedAddCountryOptions={selectedAddCountryOptions}
              totalOther={totalOther}
              totalOverlay={totalOverlay}
            />
          </div>
        </>
      ) : null}

      <OsCountryTitlePortal
        activePanel={shouldRenderBackground ? activePanel : null}
        headerMiddleRoot={shouldRenderBackground ? headerMiddleRoot : null}
      />

      {shouldRenderBackground ? (
        <OsCountryActionsMenu
          onDuplicate={(panelId) => duplicatePanel(panelId, duplicatePricingState)}
          onRemove={(panelId) => removePanel(panelId, removePricingState)}
          onStartRename={startRename}
          panelId={countryMenuOpenId}
          position={countryMenuPosition}
        />
      ) : null}

      <OsHeaderSaveActions
        activeRecordId={activeRecordId}
        headerActionRoot={shouldRenderBackground ? headerActionRoot : null}
        isRequiredReady={isRequiredReady}
        isSubmitting={isSubmitting}
        onOpenConfirm={openConfirm}
      />

      <OsSetupModal
        filterSetupCountryOption={filterSetupCountryOption}
        formatCountryWithFlag={formatCountryWithFlag}
        gmailSuggestions={setupGmailSuggestions}
        groupedClientOptions={groupedClientOptions}
        isOpen={fixedInputModalOpen}
        lang={lang}
        onApplySetupGmailSuggestion={applySetupGmailSuggestion}
        onCountriesChange={updateSetupCountries}
        onCreate={applySetupToPanels}
        onRefreshCountryList={refreshCountryList}
        onRefreshGmailList={refreshGmailList}
        onSetupFieldChange={updateSetupField}
        osSetup={osSetup}
        ownerOptions={ownerOptions}
        projectTypeOptions={projectTypeOptions}
        refreshingGmail={refreshingGmail}
        samplingTypeOptions={samplingTypeOptions}
        selectedSetupClientOption={selectedSetupClientOption}
        selectedSetupCountryOptions={selectedSetupCountryOptions}
        selectedSetupOwnerOption={selectedSetupOwnerOption}
        selectedSetupProjectTypeOption={selectedSetupProjectTypeOption}
        selectedSetupSamplingTypeOption={selectedSetupSamplingTypeOption}
        selectMenuPortalTarget={selectMenuPortalTarget}
        setupConnectedMultiSelectStyles={setupConnectedMultiSelectStyles}
        setupCountryOptions={setupCountryOptions}
        setupSelectStyles={setupSelectStyles}
        showCountryRefreshSpinner={showCountryRefreshSpinner}
      />

      {vendorModalOpen && vendorModalPanel ? (
        <VendorSelectionModal
          initialCountryFilters={[vendorModalPanel.gid.split("-")[0].toUpperCase()]}
          initialLoiFilters={vendorModalPanel.loi ? [vendorModalPanel.loi] : []}
          initialSortColumn={vendorCpiKrwCol}
          initialTypeFilters={
            vendorModalPanel.samplingType
              ? [vendorModalPanel.samplingType.toLowerCase()]
              : []
          }
          key={vendorModalPanel.id}
          lang={lang}
          onClose={closeVendorModal}
          onLoad={applySelectedVendors}
          vendorRows={vendorRows}
        />
      ) : null}

      <WarningAlertModal
        message={warningMessage}
        onClose={() => setWarningMessage("")}
        open={Boolean(warningMessage)}
      />

      <ConfirmAlertModal
        confirmLabel={confirmLabel}
        isSubmitting={isSubmitting}
        message={confirmMessage}
        onCancel={cancelConfirm}
        onConfirm={() => {
          void handleConfirmSubmit();
        }}
        open={Boolean(confirmAction)}
      />

      <FeedbackToast
        body={toastState.body}
        linkHref={toastState.linkHref}
        linkLabel={toastState.linkLabel}
        onClose={closeToast}
        open={toastState.open}
        title={toastState.title}
        type={toastState.type}
      />

      <div className="sr-only">
        {requiredMissingCount > 0 ? <span>{requiredMissingCount}</span> : null}
      </div>

      <div className="sr-only">
        <button onClick={() => setFixedInputModalOpen(true)} type="button">
          open-fixed-input
        </button>
      </div>

      <div className="sr-only">
        <BsExclamationTriangleFill />
      </div>
    </div>
  );
}
