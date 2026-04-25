import type { Dispatch, SetStateAction } from "react";

import type { ClientGroup, CountryOption } from "./shared";
import type { GmailEmail, TableRows } from "@/types/backend";

export type VendorEntry = {
  name: string;
  irFrom: string;
  irTo: string;
  feasibility: string;
  cpi: string;
  cpiKrw: string;
  currency: string;
  exchangeRate: string;
  cost: string;
};

export type OsCalcRow = {
  avgCpi: string;
  cost: string;
  feasibility: string;
  gm: string;
  gmPer: string;
  id: number;
  markup: string;
  proposalCpi: string;
  sales: string;
  vendorSnapshot: VendorEntry[];
  vendorUsageCount: number;
};

export type OsPanelState = {
  id: string;
  gid: string;
  country: string;
  countryKr: string;
  countryRename: string;
  owner: string;
  date: string;
  projectType: string;
  samplingType: string;
  projectName: string;
  client: string;
  clientName: string;
  targetCondition: string;
  loi: string;
  requestedN: string;
  otherFee: string;
  overlayFee: string;
  questionN: string;
  pageN: string;
  vendorUsageCount: number;
  averageVendorCpi: string;
  totalTargetSample: string;
  totalVendorFeasibility: string;
  totalVendorCosts: string;
  markUp: string;
  proposalCpi: string;
  expectedSales: string;
  totalGMPer: string;
  totalGM: string;
  vendors: VendorEntry[];
};

export type OsSetupState = {
  selectedCountries: string[];
  date: string;
  owner: string;
  projectType: string;
  samplingType: string;
  projectName: string;
  client: string;
  clientName: string;
  targetCondition: string;
  loi: string;
  requestedN: string;
  otherFee: string;
  overlayFee: string;
};

export type OsCreateFormProps = {
  activeRecordId: string;
  activeUser: string;
  clientGroups: ClientGroup[];
  countries: CountryOption[];
  gmailEmails: GmailEmail[];
  initialFinalProgramming: string;
  isCountriesLoading: boolean;
  lang: string;
  onCreatePanels: () => void;
  osPanels: OsPanelState[];
  osSetup: OsSetupState;
  setOsPanels: Dispatch<SetStateAction<OsPanelState[]>>;
  setOsSetup: Dispatch<SetStateAction<OsSetupState>>;
  vendorRows: TableRows;
};
