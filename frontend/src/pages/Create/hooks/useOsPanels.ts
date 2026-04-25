import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import type {
  ClientGroup,
  CountryOption,
  CreateSelectOption,
  OsPanelState,
  OsSetupState,
} from "@/pages/Create/types";
import { chooseClientFromHint } from "@/pages/Create/utils/client";
import { todayString } from "@/pages/Create/utils/date";
import { normalizeIntegerInput } from "@/pages/Create/utils/number";
import {
  buildPanelFromSetup,
  splitGid,
} from "@/pages/Create/utils/os-panels";
import { cloneVendors } from "@/pages/Create/utils/os-pricing";
import { t } from "@/utils/lang";

type CountryMenuPosition = {
  left: number;
  top: number;
};

type SetPanelValues = (
  panelId: string,
  updater: (panel: OsPanelState) => OsPanelState,
) => void;

type UseOsPanelsParams = {
  activeRecordId: string;
  activeUser: string;
  clientGroups: ClientGroup[];
  countries: CountryOption[];
  isCountriesLoading: boolean;
  lang: string;
  onCreatePanels: () => void;
  osPanels: OsPanelState[];
  osSetup: OsSetupState;
  setOsPanels: Dispatch<SetStateAction<OsPanelState[]>>;
  setOsSetup: Dispatch<SetStateAction<OsSetupState>>;
  setWarningMessage: Dispatch<SetStateAction<string>>;
};

type UseOsPanelsResult = {
  activePanel: OsPanelState | null;
  activePanelId: string;
  addCountries: () => void;
  addCountryOpen: boolean;
  addCountrySelection: string[];
  addCountryOptions: CreateSelectOption[];
  applyBatchChange: () => void;
  applyPanelGmailSuggestion: (panelId: string, value: string) => void;
  applySetupGmailSuggestion: (value: string) => void;
  applySetupToPanels: () => void;
  batchChangeDone: boolean;
  batchChangeOpen: boolean;
  batchTargetOptions: CreateSelectOption[];
  batchTargets: string[];
  cancelRename: () => void;
  clearFormSection: (panelId: string) => void;
  countryMenuOpenId: string | null;
  countryMenuPosition: CountryMenuPosition | null;
  duplicatePanel: (
    panelId: string,
    onDuplicated?: (sourcePanelId: string, clonePanelId: string) => void,
  ) => void;
  fixedInputModalOpen: boolean;
  refreshCountryList: () => void;
  refreshGmailList: () => void;
  refreshingGmail: boolean;
  removePanel: (panelId: string, onRemoved?: (panelId: string) => void) => void;
  renamingPanelId: string | null;
  renamingValue: string;
  saveRename: () => void;
  selectedAddCountryOptions: CreateSelectOption[];
  selectedBatchTargetOptions: CreateSelectOption[];
  setActivePanelId: Dispatch<SetStateAction<string>>;
  setAddCountrySelection: Dispatch<SetStateAction<string[]>>;
  setAddCountryOpen: Dispatch<SetStateAction<boolean>>;
  setBatchChangeOpen: Dispatch<SetStateAction<boolean>>;
  setCountryMenuOpenId: Dispatch<SetStateAction<string | null>>;
  setCountryMenuPosition: Dispatch<SetStateAction<CountryMenuPosition | null>>;
  setFixedInputModalOpen: Dispatch<SetStateAction<boolean>>;
  setRenamingValue: Dispatch<SetStateAction<string>>;
  setBatchTargets: Dispatch<SetStateAction<string[]>>;
  setCalcAwareInlineDropdownsClosed: () => void;
  showCountryRefreshSpinner: boolean;
  startRename: (panelId: string) => void;
  toggleAddCountry: (onToggleSideEffect?: () => void) => void;
  toggleCountryMenu: (panelId: string, rect: DOMRect) => void;
  updatePanelInput: (
    panelId: string,
    field: keyof OsPanelState,
    value: string,
  ) => void;
  updateSetupCountries: (values: string[]) => void;
  updateSetupField: (
    field: Exclude<keyof OsSetupState, "selectedCountries">,
    value: string,
  ) => void;
  setPanelValues: SetPanelValues;
};

export function useOsPanels({
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
}: UseOsPanelsParams): UseOsPanelsResult {
  const [activePanelId, setActivePanelId] = useState("");
  const [addCountryOpen, setAddCountryOpen] = useState(false);
  const [addCountrySelection, setAddCountrySelection] = useState<string[]>([]);
  const [batchChangeDone, setBatchChangeDone] = useState(false);
  const [batchChangeOpen, setBatchChangeOpen] = useState(false);
  const [batchTargets, setBatchTargets] = useState<string[]>([]);
  const [countryMenuOpenId, setCountryMenuOpenId] = useState<string | null>(
    null,
  );
  const [countryMenuPosition, setCountryMenuPosition] =
    useState<CountryMenuPosition | null>(null);
  const [fixedInputModalOpen, setFixedInputModalOpen] = useState(false);
  const [refreshingCountry, setRefreshingCountry] = useState(false);
  const [refreshingGmail, setRefreshingGmail] = useState(false);
  const [renamingPanelId, setRenamingPanelId] = useState<string | null>(null);
  const [renamingValue, setRenamingValue] = useState("");

  const hasAutoOpenedSetupRef = useRef(false);

  useEffect(() => {
    if (
      hasAutoOpenedSetupRef.current ||
      activeRecordId ||
      osPanels.length > 0
    ) {
      return;
    }
    setFixedInputModalOpen(true);
    hasAutoOpenedSetupRef.current = true;
  }, [activeRecordId, osPanels.length]);

  const activePanel = useMemo(
    () => osPanels.find((panel) => panel.id === activePanelId) ?? null,
    [activePanelId, osPanels],
  );

  useEffect(() => {
    if (osPanels.length === 0) {
      setActivePanelId("");
      return;
    }

    if (!osPanels.some((panel) => panel.id === activePanelId)) {
      setActivePanelId(osPanels[0].id);
    }
  }, [activePanelId, osPanels]);

  useEffect(() => {
    setBatchChangeOpen(false);
    setCountryMenuOpenId(null);
    setCountryMenuPosition(null);
  }, [activePanelId]);

  useEffect(() => {
    if (!countryMenuOpenId) {
      return;
    }

    function closeMenu(): void {
      setCountryMenuOpenId(null);
      setCountryMenuPosition(null);
    }

    function handleOutside(event: MouseEvent): void {
      const target = event.target as HTMLElement;
      if (target.closest("[data-country-menu]")) {
        return;
      }
      closeMenu();
    }

    function handleScroll(): void {
      closeMenu();
    }

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [countryMenuOpenId]);

  const addCountryOptions = useMemo<CreateSelectOption[]>(() => {
    const selectedBaseCodes = new Set(
      osPanels.map((panel) => splitGid(panel.gid).base.toUpperCase()),
    );

    return countries
      .filter(
        (country) => !selectedBaseCodes.has(country.code.toUpperCase()),
      )
      .map((country) => ({
        flagCode: country.code.toLowerCase(),
        keyword: `${country.keyword} ${country.code} ${country.nameKr}`,
        label: country.nameEn,
        value: `${country.code}-${country.nameEn}`,
      }));
  }, [countries, osPanels]);

  const selectedAddCountryOptions = useMemo(() => {
    const optionMap = new Map(
      addCountryOptions.map((option) => [option.value, option]),
    );
    return addCountrySelection
      .map((value) => optionMap.get(value))
      .filter((option): option is CreateSelectOption => Boolean(option));
  }, [addCountryOptions, addCountrySelection]);

  const batchTargetOptions = useMemo<CreateSelectOption[]>(
    () =>
      osPanels
        .filter((panel) => panel.id !== activePanel?.id)
        .map((panel) => ({
          label: panel.countryRename,
          value: panel.id,
        })),
    [activePanel?.id, osPanels],
  );

  const selectedBatchTargetOptions = useMemo(() => {
    const optionMap = new Map(
      batchTargetOptions.map((option) => [option.value, option]),
    );
    return batchTargets
      .map((value) => optionMap.get(value))
      .filter((option): option is CreateSelectOption => Boolean(option));
  }, [batchTargetOptions, batchTargets]);

  const showCountryRefreshSpinner = isCountriesLoading || refreshingCountry;

  function setPanelValues(
    panelId: string,
    updater: (panel: OsPanelState) => OsPanelState,
  ): void {
    setOsPanels((prev) =>
      prev.map((panel) => (panel.id === panelId ? updater(panel) : panel)),
    );
  }

  function updatePanelInput(
    panelId: string,
    field: keyof OsPanelState,
    value: string,
  ): void {
    setPanelValues(panelId, (panel) => {
      const normalized =
        field === "loi" ||
        field === "requestedN" ||
        field === "otherFee" ||
        field === "overlayFee" ||
        field === "questionN" ||
        field === "pageN"
          ? normalizeIntegerInput(value)
          : value;

      return {
        ...panel,
        [field]: normalized,
        totalTargetSample:
          field === "requestedN"
            ? normalizeIntegerInput(value)
            : panel.totalTargetSample,
      } as OsPanelState;
    });
  }

  function applySetupToPanels(): void {
    const requiredMissing = [
      osSetup.selectedCountries.length === 0,
      !osSetup.date,
      !osSetup.owner,
      !osSetup.projectType,
      !osSetup.projectName,
      !osSetup.clientName,
      !osSetup.client,
      !osSetup.targetCondition,
      !osSetup.loi,
    ].some(Boolean);

    if (requiredMissing) {
      setWarningMessage(
        t(
          lang,
          "필수항목을 모두 입력해주세요.",
          "Please fill out all required fields.",
        ),
      );
      return;
    }

    onCreatePanels();
    setFixedInputModalOpen(false);
  }

  function refreshCountryList(): void {
    if (isCountriesLoading) {
      return;
    }

    setRefreshingCountry(true);
    window.setTimeout(() => {
      setRefreshingCountry(false);
    }, 280);
  }

  function refreshGmailList(): void {
    setRefreshingGmail(true);
    window.setTimeout(() => {
      setRefreshingGmail(false);
    }, 280);
  }

  function updateSetupField(
    field: Exclude<keyof OsSetupState, "selectedCountries">,
    value: string,
  ): void {
    setOsSetup((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function applySetupGmailSuggestion(value: string): void {
    const [subject = value, sender = "", clientHint = ""] = value.split("|||");
    const client = chooseClientFromHint(clientHint, clientGroups);
    updateSetupField("projectName", subject);
    if (sender) {
      updateSetupField("clientName", sender);
    }
    if (client) {
      updateSetupField("client", client);
    }
  }

  function applyPanelGmailSuggestion(panelId: string, value: string): void {
    const [subject = value, sender = "", clientHint = ""] = value.split("|||");
    const client = chooseClientFromHint(clientHint, clientGroups);
    setPanelValues(panelId, (panel) => ({
      ...panel,
      client: client || panel.client,
      clientName: sender || panel.clientName,
      projectName: subject,
    }));
  }

  function removePanel(
    panelId: string,
    onRemoved?: (panelId: string) => void,
  ): void {
    if (osPanels.length <= 1) {
      setWarningMessage(
        t(
          lang,
          "마지막 국가를 삭제할 수 없습니다.",
          "You cannot delete the last country.",
        ),
      );
      return;
    }

    setOsPanels((prev) => prev.filter((panel) => panel.id !== panelId));
    onRemoved?.(panelId);
    setCountryMenuOpenId(null);
    setCountryMenuPosition(null);
  }

  function duplicatePanel(
    panelId: string,
    onDuplicated?: (sourcePanelId: string, clonePanelId: string) => void,
  ): void {
    const panel = osPanels.find((item) => item.id === panelId);
    if (!panel) {
      return;
    }

    const { base } = splitGid(panel.gid);
    const samePanels = osPanels.filter(
      (item) => splitGid(item.gid).base === base,
    );
    const maxSuffix = samePanels.reduce(
      (max, item) => Math.max(max, splitGid(item.gid).suffix),
      0,
    );
    const nextSuffix = maxSuffix + 1;
    const nextGid = `${base}-${nextSuffix}`;
    const nextRename = /\d$/.test(panel.countryRename)
      ? panel.countryRename.replace(/\d$/, String(nextSuffix))
      : `${panel.countryRename} ${nextSuffix}`;

    const clone: OsPanelState = {
      ...panel,
      countryRename: nextRename,
      gid: nextGid,
      id: `${panel.id}-dup-${nextSuffix}-${Date.now()}`,
      vendors: cloneVendors(panel.vendors),
    };

    setOsPanels((prev) => {
      const index = prev.findIndex((item) => item.id === panelId);
      const next = [...prev];
      next.splice(index + 1, 0, clone);
      return next;
    });

    onDuplicated?.(panelId, clone.id);
    setActivePanelId(clone.id);
    setCountryMenuOpenId(null);
    setCountryMenuPosition(null);
  }

  function startRename(panelId: string): void {
    const panel = osPanels.find((item) => item.id === panelId);
    if (!panel) {
      return;
    }

    setRenamingPanelId(panelId);
    setRenamingValue(panel.countryRename);
    setCountryMenuOpenId(null);
    setCountryMenuPosition(null);
  }

  function cancelRename(): void {
    setRenamingPanelId(null);
    setRenamingValue("");
  }

  function saveRename(): void {
    if (!renamingPanelId) {
      return;
    }

    const trimmed = renamingValue.trim();
    if (!trimmed) {
      setWarningMessage(
        t(
          lang,
          "변경할 이름을 입력해주세요.",
          "Please enter a name to rename.",
        ),
      );
      return;
    }

    const duplicate = osPanels.some(
      (panel) =>
        panel.id !== renamingPanelId &&
        panel.countryRename.trim().toLowerCase() === trimmed.toLowerCase(),
    );

    if (duplicate) {
      setWarningMessage(
        t(
          lang,
          "중복된 이름이 존재합니다. 다시 입력해주세요.",
          "Duplicate name already exists.",
        ),
      );
      return;
    }

    setPanelValues(renamingPanelId, (panel) => ({
      ...panel,
      countryRename: trimmed,
    }));

    setRenamingPanelId(null);
    setRenamingValue("");
  }

  function addCountries(): void {
    if (addCountrySelection.length === 0) {
      setWarningMessage(
        t(
          lang,
          "추가할 국가를 선택해주세요.",
          "Please select countries you want to add.",
        ),
      );
      return;
    }

    const nextPanels = addCountrySelection
      .map((value) =>
        countries.find(
          (country) => `${country.code}-${country.nameEn}` === value,
        ),
      )
      .filter((value): value is CountryOption => Boolean(value))
      .map((country) => buildPanelFromSetup(country, osSetup));

    setOsPanels((prev) => {
      const existingIds = new Set(prev.map((panel) => panel.id));
      const deduped = nextPanels.map((panel) => {
        if (!existingIds.has(panel.id)) {
          existingIds.add(panel.id);
          return panel;
        }

        const uid = `${panel.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        existingIds.add(uid);
        return {
          ...panel,
          id: uid,
        };
      });

      return [...prev, ...deduped];
    });

    if (nextPanels[0]) {
      setActivePanelId(nextPanels[0].id);
    }

    setAddCountrySelection([]);
    setAddCountryOpen(false);
  }

  function applyBatchChange(): void {
    if (!activePanel || batchTargets.length === 0) {
      setWarningMessage(
        t(
          lang,
          "폼 일괄 변경을 적용할 국가를 선택해주세요.",
          "Please select countries you want to batch change form.",
        ),
      );
      return;
    }

    setOsPanels((prev) =>
      prev.map((panel) => {
        if (!batchTargets.includes(panel.id)) {
          return panel;
        }

        return {
          ...panel,
          client: activePanel.client,
          clientName: activePanel.clientName,
          date: activePanel.date,
          loi: activePanel.loi,
          otherFee: activePanel.otherFee,
          overlayFee: activePanel.overlayFee,
          owner: activePanel.owner,
          pageN: activePanel.pageN,
          projectName: activePanel.projectName,
          projectType: activePanel.projectType,
          questionN: activePanel.questionN,
          requestedN: activePanel.requestedN,
          samplingType: activePanel.samplingType,
          targetCondition: activePanel.targetCondition,
          totalTargetSample: activePanel.requestedN,
        };
      }),
    );

    setBatchChangeDone(true);
    setBatchChangeOpen(false);
    setBatchTargets([]);

    window.setTimeout(() => {
      setBatchChangeDone(false);
    }, 2000);
  }

  function clearFormSection(panelId: string): void {
    setPanelValues(panelId, (panel) => ({
      ...panel,
      client: "",
      clientName: "",
      date: todayString(),
      loi: "",
      otherFee: "",
      overlayFee: "",
      owner: activeUser,
      pageN: "",
      projectName: "",
      projectType: "",
      questionN: "",
      requestedN: "",
      samplingType: "Random",
      targetCondition: "",
      totalTargetSample: "",
    }));
  }

  function updateSetupCountries(values: string[]): void {
    setOsSetup((prev) => ({
      ...prev,
      otherFee:
        values.length > 5
          ? "100,000"
          : prev.otherFee === "100,000" && values.length <= 5
            ? "150,000"
            : prev.otherFee,
      selectedCountries: values,
    }));
  }

  function toggleCountryMenu(panelId: string, rect: DOMRect): void {
    if (countryMenuOpenId === panelId) {
      setCountryMenuOpenId(null);
      setCountryMenuPosition(null);
      return;
    }

    setCountryMenuOpenId(panelId);
    setCountryMenuPosition({
      left: Math.max(8, rect.right - 140),
      top: rect.bottom + 4,
    });
  }

  function toggleAddCountry(onToggleSideEffect?: () => void): void {
    setAddCountryOpen((prev) => !prev);
    onToggleSideEffect?.();
  }

  function setCalcAwareInlineDropdownsClosed(): void {
    setAddCountryOpen(false);
    setBatchChangeOpen(false);
  }

  return {
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
    setAddCountryOpen,
    setBatchChangeOpen,
    setCountryMenuOpenId,
    setCountryMenuPosition,
    setFixedInputModalOpen,
    setRenamingValue,
    setBatchTargets,
    setCalcAwareInlineDropdownsClosed,
    showCountryRefreshSpinner,
    startRename,
    toggleAddCountry,
    toggleCountryMenu,
    updatePanelInput,
    updateSetupCountries,
    updateSetupField,
    setPanelValues,
  };
}
