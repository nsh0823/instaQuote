import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import type {
  CreateSelectOption,
  OsCalcRow,
  OsPanelState,
  VendorEntry,
} from "@/pages/Create/types";
import type { TableRows } from "@/types/backend";
import {
  addComma,
  normalizeDecimalInput,
  normalizeIntegerInput,
  normalizeMarkupValue,
  parseInteger,
} from "@/pages/Create/utils/number";
import {
  buildStoredCalcRow,
  buildCalcRow,
  calcSummaryFromProposal,
  cloneVendors,
  emptyVendorEntry,
  getVendorTotals,
} from "@/pages/Create/utils/os-pricing";
import { t } from "@/utils/lang";

type SetPanelValues = (
  panelId: string,
  updater: (panel: OsPanelState) => OsPanelState,
) => void;

type UseOsPricingParams = {
  activeRecordId: string;
  activePanel: OsPanelState | null;
  activePanelId: string;
  initialFinalProgramming: string;
  lang: string;
  osPanels: OsPanelState[];
  setPanelValues: SetPanelValues;
  setWarningMessage: Dispatch<SetStateAction<string>>;
  vendorRows: TableRows;
};

type UseOsPricingResult = {
  activeCalcId: number | null;
  activeRows: OsCalcRow[];
  applyCalcSelection: () => void;
  applySelectedVendors: (selectedIndices: number[]) => void;
  calcMenuOpen: boolean;
  calcMarkupDraft: string;
  cancelEditProposal: () => void;
  clearTotalSection: (panelId: string) => void;
  clearVendorsSection: (panelId: string) => void;
  closeVendorModal: () => void;
  duplicatePricingState: (sourcePanelId: string, clonePanelId: string) => void;
  finalGM: number;
  finalGMPer: string;
  finalProgramming: string;
  finalSales: number;
  hasAllPanelsCalculated: boolean;
  isInitialPricingReady: boolean;
  isProposalEditing: boolean;
  markupOptions: CreateSelectOption[];
  openVendorModalFor: (panelId: string) => void;
  proposalDraft: string;
  removePricingState: (panelId: string) => void;
  saveEditProposal: () => void;
  selectedMarkupOption: CreateSelectOption | null;
  selectCalcResult: (panelId: string, rowId: number) => void;
  setCalcMenuOpen: Dispatch<SetStateAction<boolean>>;
  setCalcMarkupDraft: Dispatch<SetStateAction<string>>;
  setFinalProgramming: Dispatch<SetStateAction<string>>;
  setProposalDraft: Dispatch<SetStateAction<string>>;
  setVendorUsageCount: (panelId: string, count: number) => void;
  startEditProposal: () => void;
  totalOther: number;
  totalOverlay: number;
  updateVendorInput: (
    panelId: string,
    vendorIndex: number,
    field: keyof VendorEntry,
    value: string,
  ) => void;
  vendorCpiKrwCol: number;
  vendorModalOpen: boolean;
  vendorModalPanel: OsPanelState | null;
};

export function useOsPricing({
  activeRecordId,
  activePanel,
  activePanelId,
  initialFinalProgramming,
  lang,
  osPanels,
  setPanelValues,
  setWarningMessage,
  vendorRows,
}: UseOsPricingParams): UseOsPricingResult {
  const [isProposalEditing, setIsProposalEditing] = useState(false);
  const [calcMenuOpen, setCalcMenuOpen] = useState(false);
  const [calcMarkupDraft, setCalcMarkupDraft] = useState("1.2");
  const [proposalDraft, setProposalDraft] = useState("");
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [vendorModalPanelId, setVendorModalPanelId] = useState("");
  const [finalProgramming, setFinalProgramming] = useState("");
  const [isInitialPricingReady, setIsInitialPricingReady] = useState(
    () => !activeRecordId,
  );
  const [calcRowsByPanel, setCalcRowsByPanel] = useState<
    Record<string, OsCalcRow[]>
  >({});
  const [activeCalcIdByPanel, setActiveCalcIdByPanel] = useState<
    Record<string, number | null>
  >({});
  const hydratedRecordIdRef = useRef<string | null>(null);

  useEffect(() => {
    hydratedRecordIdRef.current = null;
    setIsInitialPricingReady(!activeRecordId);

    if (!activeRecordId) {
      setCalcRowsByPanel({});
      setActiveCalcIdByPanel({});
      setFinalProgramming("");
    }
  }, [activeRecordId]);

  useEffect(() => {
    setProposalDraft(activePanel?.proposalCpi ?? "");
    setCalcMarkupDraft(activePanel?.markUp || "1.2");
    setIsProposalEditing(false);
    setCalcMenuOpen(false);
  }, [activePanelId, activePanel, osPanels]);

  useEffect(() => {
    if (
      initialFinalProgramming &&
      hydratedRecordIdRef.current !== activeRecordId &&
      !finalProgramming
    ) {
      setFinalProgramming(initialFinalProgramming);
    }
  }, [activeRecordId, finalProgramming, initialFinalProgramming]);

  useEffect(() => {
    if (!activeRecordId) {
      setIsInitialPricingReady(true);
      return;
    }

    if (hydratedRecordIdRef.current === activeRecordId) {
      setIsInitialPricingReady(true);
      return;
    }

    if (osPanels.length === 0) {
      return;
    }

    const nextCalcRowsByPanel = osPanels.reduce<Record<string, OsCalcRow[]>>(
      (acc, panel) => {
        const storedRow = buildStoredCalcRow(panel, 1);
        acc[panel.id] = storedRow ? [storedRow] : [];
        return acc;
      },
      {},
    );
    const nextActiveCalcIdByPanel = osPanels.reduce<
      Record<string, number | null>
    >((acc, panel) => {
      acc[panel.id] = nextCalcRowsByPanel[panel.id]?.[0]?.id ?? null;
      return acc;
    }, {});

    setCalcRowsByPanel(nextCalcRowsByPanel);
    setActiveCalcIdByPanel(nextActiveCalcIdByPanel);
    hydratedRecordIdRef.current = activeRecordId;
    setIsInitialPricingReady(true);
  }, [activeRecordId, osPanels]);

  const vendorModalPanel = useMemo(
    () => osPanels.find((panel) => panel.id === vendorModalPanelId) ?? null,
    [osPanels, vendorModalPanelId],
  );

  const activeRows = activePanel ? (calcRowsByPanel[activePanel.id] ?? []) : [];
  const activeCalcId = activePanel
    ? (activeCalcIdByPanel[activePanel.id] ?? null)
    : null;

  const markupOptions = useMemo<CreateSelectOption[]>(() => {
    const values = new Set(["1.2", "1.3", "1.4", "1.5", "1.6", "1.7"]);
    if (activePanel?.markUp) {
      values.add(activePanel.markUp);
    }
    activeRows.forEach((row) => {
      if (row.markup) {
        values.add(row.markup);
      }
    });

    return Array.from(values)
      .map((value) => normalizeMarkupValue(value))
      .filter(Boolean)
      .sort((a, b) => Number(a) - Number(b))
      .map((value) => ({
        label: value,
        value,
      }));
  }, [activePanel?.markUp, activeRows]);

  const selectedMarkupOption = useMemo(() => {
    const normalized = normalizeMarkupValue(calcMarkupDraft);
    if (!normalized) {
      return null;
    }

    return (
      markupOptions.find((option) => option.value === normalized) ?? {
        label: normalized,
        value: normalized,
      }
    );
  }, [calcMarkupDraft, markupOptions]);

  const headerLookup = useMemo(() => vendorRows[0] ?? [], [vendorRows]);
  const vendorDataRows = useMemo(
    () => (vendorRows.slice(1) ?? []).map((row, index) => ({ index, row })),
    [vendorRows],
  );

  const vendorVendorCol = useMemo(
    () => headerLookup.findIndex((item) => item === "Vendor"),
    [headerLookup],
  );
  const vendorCpiCol = useMemo(
    () => headerLookup.findIndex((item) => item === "CPI"),
    [headerLookup],
  );
  const vendorCpiKrwCol = useMemo(
    () => headerLookup.findIndex((item) => item === "원화 CPI"),
    [headerLookup],
  );
  const vendorFeasibilityCol = useMemo(
    () => headerLookup.findIndex((item) => item === "Feasibility"),
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
  const vendorCurrencyCol = useMemo(
    () => headerLookup.findIndex((item) => item === "Currency"),
    [headerLookup],
  );
  const vendorExchangeRateCol = useMemo(
    () => headerLookup.findIndex((item) => item === "Exchange rate"),
    [headerLookup],
  );

  const totalOverlay = useMemo(
    () =>
      osPanels.reduce((sum, panel) => sum + parseInteger(panel.overlayFee), 0),
    [osPanels],
  );

  const totalOther = useMemo(
    () =>
      osPanels.reduce((sum, panel) => sum + parseInteger(panel.otherFee), 0),
    [osPanels],
  );

  const totalCost = useMemo(
    () =>
      osPanels.reduce(
        (sum, panel) => sum + parseInteger(panel.totalVendorCosts),
        0,
      ),
    [osPanels],
  );

  const totalSalesWithoutExtras = useMemo(
    () =>
      osPanels.reduce(
        (sum, panel) => sum + parseInteger(panel.expectedSales),
        0,
      ),
    [osPanels],
  );

  const finalSales = useMemo(
    () =>
      totalSalesWithoutExtras +
      parseInteger(finalProgramming) +
      totalOverlay +
      totalOther,
    [finalProgramming, totalOther, totalOverlay, totalSalesWithoutExtras],
  );

  const finalGM = useMemo(
    () => finalSales - totalCost,
    [finalSales, totalCost],
  );
  const finalGMPer = useMemo(
    () => (finalSales > 0 ? ((finalGM / finalSales) * 100).toFixed(2) : ""),
    [finalGM, finalSales],
  );

  const hasAllPanelsCalculated = useMemo(() => {
    function vendorsMatch(left: VendorEntry[], right: VendorEntry[]): boolean {
      if (left.length !== right.length) {
        return false;
      }

      return left.every((vendor, index) => {
        const other = right[index];
        return (
          vendor.name === other?.name &&
          vendor.irFrom === other?.irFrom &&
          vendor.irTo === other?.irTo &&
          vendor.feasibility === other?.feasibility &&
          vendor.cpi === other?.cpi &&
          vendor.cpiKrw === other?.cpiKrw &&
          vendor.currency === other?.currency &&
          vendor.exchangeRate === other?.exchangeRate &&
          vendor.cost === other?.cost
        );
      });
    }

    function panelMatchesActiveCalc(panel: OsPanelState): boolean {
      const activeCalcId = activeCalcIdByPanel[panel.id];
      if (!activeCalcId) {
        return false;
      }

      const activeRow = (calcRowsByPanel[panel.id] ?? []).find(
        (row) => row.id === activeCalcId,
      );

      if (!activeRow) {
        return false;
      }

      return (
        panel.averageVendorCpi === activeRow.avgCpi &&
        panel.totalVendorFeasibility === activeRow.feasibility &&
        panel.totalVendorCosts === activeRow.cost &&
        panel.markUp === activeRow.markup &&
        panel.proposalCpi === activeRow.proposalCpi &&
        panel.expectedSales === activeRow.sales &&
        panel.totalGMPer === activeRow.gmPer &&
        panel.totalGM === activeRow.gm &&
        panel.vendorUsageCount === activeRow.vendorUsageCount &&
        vendorsMatch(panel.vendors, activeRow.vendorSnapshot)
      );
    }

    return osPanels.length > 0 && osPanels.every(panelMatchesActiveCalc);
  }, [activeCalcIdByPanel, calcRowsByPanel, osPanels]);

  function updateVendorInput(
    panelId: string,
    vendorIndex: number,
    field: keyof VendorEntry,
    value: string,
  ): void {
    setPanelValues(panelId, (panel) => {
      const nextVendors = cloneVendors(panel.vendors);
      const current = { ...nextVendors[vendorIndex] };

      let normalized = value;
      if (
        field === "feasibility" ||
        field === "irFrom" ||
        field === "irTo" ||
        field === "cpiKrw" ||
        field === "cost"
      ) {
        normalized = normalizeIntegerInput(value);
      }
      if (field === "cpi") {
        normalized = normalizeDecimalInput(value);
      }

      current[field] = normalized;

      if (field === "feasibility" || field === "cpiKrw") {
        const feasibility = parseInteger(
          field === "feasibility" ? normalized : current.feasibility,
        );
        const cpiKrw = parseInteger(
          field === "cpiKrw" ? normalized : current.cpiKrw,
        );
        current.cost =
          feasibility > 0 && cpiKrw > 0 ? addComma(feasibility * cpiKrw) : "";
      }

      nextVendors[vendorIndex] = current;

      return {
        ...panel,
        ...getVendorTotals(nextVendors),
        vendors: nextVendors,
      };
    });
  }

  function clearVendorsSection(panelId: string): void {
    setPanelValues(panelId, (panel) => ({
      ...panel,
      averageVendorCpi: "",
      totalVendorCosts: "",
      totalVendorFeasibility: "",
      vendorUsageCount: 1,
      vendors: Array.from({ length: 5 }, emptyVendorEntry),
    }));
  }

  function clearTotalSection(panelId: string): void {
    setPanelValues(panelId, (panel) => ({
      ...panel,
      expectedSales: "",
      markUp: "",
      proposalCpi: "",
      totalGM: "",
      totalGMPer: "",
    }));

    setCalcRowsByPanel((prev) => ({
      ...prev,
      [panelId]: [],
    }));
    setActiveCalcIdByPanel((prev) => ({
      ...prev,
      [panelId]: null,
    }));
    setCalcMenuOpen(false);
  }

  function appendCalcResult(panel: OsPanelState): boolean {
    if (
      !panel.totalVendorFeasibility ||
      !panel.totalVendorCosts ||
      !panel.averageVendorCpi
    ) {
      setWarningMessage(
        t(
          lang,
          "벤더 정보를 모두 입력해주세요.",
          "Please enter all vendor info.",
        ),
      );
      return false;
    }

    const nextRow = buildCalcRow(
      panel,
      (calcRowsByPanel[panel.id] ?? []).length + 1,
    );

    if (!nextRow) {
      setWarningMessage(
        t(
          lang,
          "유효한 Markup 값을 입력해주세요.",
          "Please enter a valid markup value.",
        ),
      );
      return false;
    }

    const nextRows = [...(calcRowsByPanel[panel.id] ?? []), nextRow];

    setCalcRowsByPanel((prev) => ({
      ...prev,
      [panel.id]: nextRows,
    }));
    setActiveCalcIdByPanel((prev) => ({
      ...prev,
      [panel.id]: nextRow.id,
    }));

    setPanelValues(panel.id, (current) => ({
      ...current,
      expectedSales: nextRow.sales,
      proposalCpi: nextRow.proposalCpi,
      totalGM: nextRow.gm,
      totalGMPer: nextRow.gmPer,
    }));

    if (Number(nextRow.gmPer) < 60) {
      setWarningMessage(
        t(
          lang,
          "GM이 60% 미만입니다. TL과 상의 해주세요.",
          "GM is below 60%. Please consult with your TL.",
        ),
      );
    }

    return true;
  }

  function selectCalcResult(panelId: string, rowId: number): void {
    const rows = calcRowsByPanel[panelId] ?? [];
    const selected = rows.find((row) => row.id === rowId);

    if (!selected) {
      return;
    }

    setActiveCalcIdByPanel((prev) => ({
      ...prev,
      [panelId]: rowId,
    }));

    setPanelValues(panelId, (panel) => ({
      ...panel,
      expectedSales: selected.sales,
      markUp: selected.markup,
      proposalCpi: selected.proposalCpi,
      totalGM: selected.gm,
      totalGMPer: selected.gmPer,
      vendorUsageCount: selected.vendorUsageCount,
      vendors: cloneVendors(selected.vendorSnapshot),
    }));
  }

  function startEditProposal(): void {
    if (!activePanel || !activePanel.proposalCpi) {
      return;
    }
    setProposalDraft(activePanel.proposalCpi);
    setIsProposalEditing(true);
  }

  function cancelEditProposal(): void {
    setIsProposalEditing(false);
    setProposalDraft(activePanel?.proposalCpi ?? "");
  }

  function saveEditProposal(): void {
    if (!activePanel) {
      return;
    }

    const normalized = normalizeIntegerInput(proposalDraft);
    if (!normalized) {
      setWarningMessage(
        t(lang, "Proposal CPI를 입력해주세요.", "Please enter Proposal CPI."),
      );
      return;
    }

    const avg = parseInteger(activePanel.averageVendorCpi);
    const proposal = parseInteger(normalized);
    const markup = avg > 0 ? (proposal / avg).toFixed(2) : activePanel.markUp;
    const summary = calcSummaryFromProposal(
      normalized,
      activePanel.totalVendorFeasibility,
      activePanel.totalVendorCosts,
    );

    setPanelValues(activePanel.id, (panel) => ({
      ...panel,
      ...summary,
      markUp: markup,
      proposalCpi: normalized,
    }));

    const activeCalcId = activeCalcIdByPanel[activePanel.id];
    if (activeCalcId) {
      setCalcRowsByPanel((prev) => ({
        ...prev,
        [activePanel.id]: (prev[activePanel.id] ?? []).map((row) => {
          if (row.id !== activeCalcId) {
            return row;
          }
          return {
            ...row,
            gm: summary.totalGM,
            gmPer: summary.totalGMPer,
            markup,
            proposalCpi: normalized,
            sales: summary.expectedSales,
          };
        }),
      }));
    }

    setIsProposalEditing(false);
  }

  function applyCalcSelection(): void {
    if (!activePanel) {
      return;
    }

    const nextMarkup = normalizeMarkupValue(
      calcMarkupDraft || activePanel.markUp || "1.2",
    );
    if (!nextMarkup) {
      setWarningMessage(
        t(
          lang,
          "유효한 Markup 값을 입력해주세요.",
          "Please enter a valid markup value.",
        ),
      );
      return;
    }

    const nextPanel = {
      ...activePanel,
      markUp: nextMarkup,
    };

    if (appendCalcResult(nextPanel)) {
      setPanelValues(activePanel.id, (panel) => ({
        ...panel,
        markUp: nextMarkup,
      }));
      setCalcMenuOpen(false);
    }
  }

  function openVendorModalFor(panelId: string): void {
    setVendorModalPanelId(panelId);
    setVendorModalOpen(true);
  }

  function closeVendorModal(): void {
    setVendorModalOpen(false);
    setVendorModalPanelId("");
  }

  function applySelectedVendors(selectedIndices: number[]): void {
    if (!vendorModalPanelId || selectedIndices.length === 0) {
      return;
    }

    const selected = selectedIndices
      .map((index) => vendorDataRows.find((entry) => entry.index === index))
      .filter(
        (
          entry,
        ): entry is {
          index: number;
          row: string[];
        } => Boolean(entry),
      );

    setPanelValues(vendorModalPanelId, (panel) => {
      const nextVendors = Array.from({ length: 5 }, emptyVendorEntry);

      selected.slice(0, 5).forEach((entry, index) => {
        const row = entry.row;
        const feasibility =
          vendorFeasibilityCol >= 0 ? (row[vendorFeasibilityCol] ?? "") : "";
        const cpiKrw = vendorCpiKrwCol >= 0 ? (row[vendorCpiKrwCol] ?? "") : "";
        const cost =
          parseInteger(feasibility) > 0 && parseInteger(cpiKrw) > 0
            ? addComma(parseInteger(feasibility) * parseInteger(cpiKrw))
            : "";

        nextVendors[index] = {
          name: vendorVendorCol >= 0 ? (row[vendorVendorCol] ?? "") : "",
          irFrom: vendorIrFromCol >= 0 ? (row[vendorIrFromCol] ?? "") : "",
          irTo: vendorIrToCol >= 0 ? (row[vendorIrToCol] ?? "") : "",
          feasibility: normalizeIntegerInput(feasibility),
          cpi:
            vendorCpiCol >= 0
              ? normalizeDecimalInput(row[vendorCpiCol] ?? "")
              : "",
          cpiKrw: normalizeIntegerInput(cpiKrw),
          currency:
            vendorCurrencyCol >= 0 ? (row[vendorCurrencyCol] ?? "") : "",
          exchangeRate:
            vendorExchangeRateCol >= 0
              ? (row[vendorExchangeRateCol] ?? "")
              : "",
          cost,
        };
      });

      return {
        ...panel,
        ...getVendorTotals(nextVendors),
        vendorUsageCount: Math.min(5, selected.length),
        vendors: nextVendors,
      };
    });

    closeVendorModal();
  }

  function removePricingState(panelId: string): void {
    setCalcRowsByPanel((prev) => {
      const next = { ...prev };
      delete next[panelId];
      return next;
    });

    setActiveCalcIdByPanel((prev) => {
      const next = { ...prev };
      delete next[panelId];
      return next;
    });

    if (vendorModalPanelId === panelId) {
      closeVendorModal();
    }
  }

  function duplicatePricingState(
    sourcePanelId: string,
    clonePanelId: string,
  ): void {
    setCalcRowsByPanel((prev) => {
      const cloned = prev[sourcePanelId]
        ? prev[sourcePanelId].map((row) => ({
            ...row,
            vendorSnapshot: cloneVendors(row.vendorSnapshot),
          }))
        : [];
      return {
        ...prev,
        [clonePanelId]: cloned,
      };
    });

    setActiveCalcIdByPanel((prev) => ({
      ...prev,
      [clonePanelId]: prev[sourcePanelId] ?? null,
    }));
  }

  function setVendorUsageCount(panelId: string, count: number): void {
    setPanelValues(panelId, (panel) => ({
      ...panel,
      vendorUsageCount: count,
    }));
  }

  return {
    activeCalcId,
    activeRows,
    applyCalcSelection,
    applySelectedVendors,
    calcMenuOpen,
    calcMarkupDraft,
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
    isInitialPricingReady,
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
  };
}
