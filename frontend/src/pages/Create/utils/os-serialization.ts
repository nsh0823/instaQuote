import type { OsPanelState } from "@/pages/Create/types";
import { addComma, parseInteger } from "@/pages/Create/utils/number";

type OsSubmitAction =
  | "save"
  | "export"
  | "save-export"
  | "save-draft"
  | "update";

type BuildOsSubmitFieldsParams = {
  action: OsSubmitAction;
  activeRecordId: string;
  finalGM: number;
  finalGMPer: string;
  finalProgramming: string;
  finalSales: number;
  osPanels: OsPanelState[];
  totalOther: number;
  totalOverlay: number;
};

export function buildOsSubmitFields({
  action,
  activeRecordId,
  finalGM,
  finalGMPer,
  finalProgramming,
  finalSales,
  osPanels,
  totalOther,
  totalOverlay,
}: BuildOsSubmitFieldsParams): Record<string, string> {
  const fields: Record<string, string> = {};
  const countryCodeList: string[] = [];
  const countryList: string[] = [];

  const firstPanel = osPanels[0] ?? null;

  osPanels.forEach((panel) => {
    const key = panel.gid;
    countryCodeList.push(panel.gid);
    countryList.push(panel.country);

    const setField = (name: string, value: string): void => {
      fields[`${name}-${key}`] = value;
    };

    setField("RFQ Date", panel.date);
    setField("Owner", panel.owner);
    setField("Project type", panel.projectType);
    setField("Sampling type", panel.samplingType);
    setField("Project name (Mail title)", panel.projectName);
    setField("Client name", panel.clientName);
    setField("Client", panel.client);
    setField("Targeting condition", panel.targetCondition);
    setField("LOI", panel.loi);
    setField("Requested N", panel.requestedN);
    setField("Other fee", panel.otherFee);
    setField("Overlay fee", panel.overlayFee);
    setField("Question N", panel.questionN);
    setField("Page N", panel.pageN);
    setField("Country", panel.country);
    setField("Country (kr)", panel.countryKr);
    setField("Country (rename)", panel.countryRename);
    setField("Average CPI", panel.averageVendorCpi);
    setField("Target sample", panel.totalTargetSample);
    setField("Feasibility", panel.totalVendorFeasibility);
    setField("Cost", panel.totalVendorCosts);
    setField("Vendor Usage count", String(panel.vendorUsageCount));
    setField("Proposal CPI", panel.proposalCpi);
    setField("Markup", panel.markUp);
    setField("Sales", panel.expectedSales);
    setField("GM (%)", panel.totalGMPer);
    setField("GM", panel.totalGM);

    panel.vendors.forEach((vendor, index) => {
      const vendorNum = index + 1;
      setField(`Vendor name_${vendorNum}`, vendor.name);
      setField(`Vendor IR_from_${vendorNum}`, vendor.irFrom);
      setField(`Vendor IR_to_${vendorNum}`, vendor.irTo);
      setField(`Vendor feasibility_${vendorNum}`, vendor.feasibility);
      setField(`Vendor CPI_${vendorNum}`, vendor.cpi);
      setField(`Vendor CPI (KRW)_${vendorNum}`, vendor.cpiKrw);
      setField(`Vendor currency_${vendorNum}`, vendor.currency);
      setField(`Vendor exchange rate_${vendorNum}`, vendor.exchangeRate);
      setField(`Vendor cost_${vendorNum}`, vendor.cost);
    });
  });

  const totalFeasibility = osPanels.reduce(
    (sum, panel) => sum + parseInteger(panel.totalVendorFeasibility),
    0,
  );
  const overlayCnt = osPanels.filter((panel) => panel.overlayFee.trim()).length;
  const otherCnt = osPanels.filter((panel) => panel.otherFee.trim()).length;

  const exportList = firstPanel
    ? [
        firstPanel.client,
        firstPanel.clientName,
        firstPanel.owner,
        totalFeasibility > 0 ? addComma(totalFeasibility) : "",
        firstPanel.loi,
        finalProgramming,
        overlayCnt > 0 ? String(overlayCnt) : "",
        totalOverlay > 0 ? addComma(totalOverlay) : "",
        otherCnt > 0 ? String(otherCnt) : "",
        totalOther > 0 ? addComma(totalOther) : "",
        firstPanel.projectName,
        firstPanel.targetCondition,
      ]
    : [];

  fields["Total feasibility"] =
    totalFeasibility > 0 ? addComma(totalFeasibility) : "";
  fields["Total programming fee"] = finalProgramming;
  fields["Total overlay fee"] = totalOverlay > 0 ? addComma(totalOverlay) : "";
  fields["Total other fee"] = totalOther > 0 ? addComma(totalOther) : "";
  fields["Total sales"] = finalSales > 0 ? addComma(finalSales) : "";
  fields["Total GM"] = finalGM ? addComma(finalGM) : "";
  fields["Total GM (%)"] = finalGMPer;
  fields["Country code list[]"] = countryCodeList.join(",");
  fields["Country list[]"] = countryList.join(",");
  fields["Export form list"] = exportList.join("||");
  fields["RFQ type"] = "OS";
  fields["RFQ ID"] = action === "update" ? activeRecordId : "";

  return fields;
}
