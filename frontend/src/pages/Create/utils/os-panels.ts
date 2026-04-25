import type { CountryOption, OsPanelState, OsSetupState } from "@/pages/Create/types";
import { emptyVendorEntry } from "@/pages/Create/utils/os-pricing";

export function splitGid(gid: string): { base: string; suffix: number } {
  const [first, second] = gid.split("-");
  if (!second) {
    return { base: first, suffix: 0 };
  }

  const parsed = Number.parseInt(second, 10);
  return Number.isFinite(parsed)
    ? { base: first, suffix: parsed }
    : { base: first, suffix: 0 };
}

export function buildPanelFromSetup(
  option: CountryOption,
  setup: OsSetupState,
): OsPanelState {
  return {
    averageVendorCpi: "",
    client: setup.client,
    clientName: setup.clientName,
    country: option.nameEn,
    countryKr: option.nameKr,
    countryRename: option.nameEn,
    date: setup.date,
    expectedSales: "",
    gid: option.code.toLowerCase(),
    id: `${option.code.toLowerCase()}-${option.nameEn.toLowerCase()}`,
    loi: setup.loi,
    markUp: "",
    otherFee: setup.otherFee,
    overlayFee: setup.overlayFee,
    owner: setup.owner,
    pageN: "",
    projectName: setup.projectName,
    projectType: setup.projectType,
    proposalCpi: "",
    questionN: "",
    requestedN: setup.requestedN,
    samplingType: setup.samplingType,
    targetCondition: setup.targetCondition,
    totalGM: "",
    totalGMPer: "",
    totalTargetSample: setup.requestedN,
    totalVendorCosts: "",
    totalVendorFeasibility: "",
    vendorUsageCount: 1,
    vendors: Array.from({ length: 5 }, emptyVendorEntry),
  };
}

export function missingRequiredForPanel(panel: OsPanelState): boolean {
  return [
    panel.date,
    panel.owner,
    panel.projectType,
    panel.samplingType,
    panel.projectName,
    panel.clientName,
    panel.client,
    panel.targetCondition,
    panel.loi,
    panel.requestedN,
  ].some((value) => !value.trim());
}
