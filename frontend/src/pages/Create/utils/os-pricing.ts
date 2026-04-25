import type { OsCalcRow, OsPanelState, VendorEntry } from "@/pages/Create/types";
import { addComma, parseInteger } from "@/pages/Create/utils/number";

export function emptyVendorEntry(): VendorEntry {
  return {
    name: "",
    irFrom: "",
    irTo: "",
    feasibility: "",
    cpi: "",
    cpiKrw: "",
    currency: "",
    exchangeRate: "",
    cost: "",
  };
}

export function cloneVendors(vendors: VendorEntry[]): VendorEntry[] {
  return vendors.map((vendor) => ({ ...vendor }));
}

export function getVendorTotals(vendors: VendorEntry[]): {
  averageVendorCpi: string;
  totalVendorCosts: string;
  totalVendorFeasibility: string;
} {
  const totalVendorFeasibility = vendors.reduce(
    (sum, vendor) => sum + parseInteger(vendor.feasibility),
    0,
  );
  const totalVendorCosts = vendors.reduce(
    (sum, vendor) => sum + parseInteger(vendor.cost),
    0,
  );

  return {
    averageVendorCpi:
      totalVendorFeasibility > 0 && totalVendorCosts > 0
        ? addComma(Math.round(totalVendorCosts / totalVendorFeasibility))
        : "",
    totalVendorCosts: totalVendorCosts > 0 ? addComma(totalVendorCosts) : "",
    totalVendorFeasibility:
      totalVendorFeasibility > 0 ? addComma(totalVendorFeasibility) : "",
  };
}

export function calcSummaryFromProposal(
  proposalCpi: string,
  totalVendorFeasibility: string,
  totalVendorCosts: string,
): { expectedSales: string; totalGM: string; totalGMPer: string } {
  const proposal = parseInteger(proposalCpi);
  const feasibility = parseInteger(totalVendorFeasibility);
  const cost = parseInteger(totalVendorCosts);

  if (proposal <= 0 || feasibility <= 0) {
    return { expectedSales: "", totalGM: "", totalGMPer: "" };
  }

  const sales = proposal * feasibility;
  const gm = sales - cost;
  const gmPer = sales > 0 ? (gm / sales) * 100 : 0;

  return {
    expectedSales: addComma(Math.round(sales)),
    totalGM: addComma(Math.round(gm)),
    totalGMPer: gmPer.toFixed(2),
  };
}

export function buildCalcRow(
  panel: OsPanelState,
  nextId: number,
): OsCalcRow | null {
  const avgCpi = parseInteger(panel.averageVendorCpi);
  const markup = Number(panel.markUp || "1.2");
  const feasibility = parseInteger(panel.totalVendorFeasibility);
  const cost = parseInteger(panel.totalVendorCosts);

  if (!Number.isFinite(markup) || markup <= 0) {
    return null;
  }

  const proposal = Math.round(avgCpi * markup);
  const sales = proposal * feasibility;
  const gm = sales - cost;
  const gmPer = sales > 0 ? (gm / sales) * 100 : 0;

  return {
    avgCpi: addComma(avgCpi),
    cost: addComma(cost),
    feasibility: addComma(feasibility),
    gm: addComma(Math.round(gm)),
    gmPer: gmPer.toFixed(2),
    id: nextId,
    markup: markup.toString(),
    proposalCpi: addComma(proposal),
    sales: addComma(Math.round(sales)),
    vendorSnapshot: cloneVendors(panel.vendors),
    vendorUsageCount: panel.vendorUsageCount,
  };
}

export function buildStoredCalcRow(
  panel: OsPanelState,
  nextId: number,
): OsCalcRow | null {
  const hasStoredSummary = [
    panel.averageVendorCpi,
    panel.totalVendorFeasibility,
    panel.totalVendorCosts,
    panel.markUp,
    panel.proposalCpi,
    panel.expectedSales,
    panel.totalGMPer,
    panel.totalGM,
  ].some((value) => value.trim());

  if (!hasStoredSummary) {
    return null;
  }

  return {
    avgCpi: panel.averageVendorCpi,
    cost: panel.totalVendorCosts,
    feasibility: panel.totalVendorFeasibility,
    gm: panel.totalGM,
    gmPer: panel.totalGMPer,
    id: nextId,
    markup: panel.markUp,
    proposalCpi: panel.proposalCpi,
    sales: panel.expectedSales,
    vendorSnapshot: cloneVendors(panel.vendors),
    vendorUsageCount: panel.vendorUsageCount,
  };
}
