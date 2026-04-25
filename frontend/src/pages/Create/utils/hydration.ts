import type {
  ClientGroup,
  CountryOption,
  KrFormState,
  OsPanelState,
  OsSetupState,
  VendorEntry,
} from '@/pages/Create/types';
import type {
  ClientDataset,
  GmailEmail,
  OSMergedTable,
} from '@/types/backend';

import { todayString } from './date';

export const DUMMY_GMAIL_EMAILS: GmailEmail[] = [
  {
    subject: '[KR] Smartphone Users Survey (Ages 25-44)',
    sender: 'Alex Kim',
    client: 'Client A',
  },
  {
    subject: '[KR] Banking App UX Test - LOI 15',
    sender: 'Mina Park',
    client: 'Client B',
  },
  {
    subject: '[KR] IT Decision Maker B2B Study',
    sender: 'Daniel Lee',
    client: 'Client C',
  },
  {
    subject: '[KR] Healthcare Tracker Concept Test',
    sender: 'Jisu Choi',
    client: 'Client D',
  },
  {
    subject: '[KR] Q2 Brand Awareness Tracking',
    sender: 'Chris Jung',
    client: 'Client E',
  },
];

export function buildRowMap(
  headers: string[],
  row: string[],
): Record<string, string> {
  return headers.reduce<Record<string, string>>((acc, header, index) => {
    acc[header] = row[index] ?? '';
    return acc;
  }, {});
}

export function parseCountries(rows: string[][]): CountryOption[] {
  return rows.map((row) => ({
    code: row[0] ?? '',
    nameKr: row[1] ?? '',
    nameEn: row[2] ?? row[0] ?? '',
    keyword: row[3] ?? '',
    group: row[4] ?? '',
  }));
}

export function parseClientGroups(dataset: ClientDataset): ClientGroup[] {
  const [headers, ...groups] = dataset;

  return headers.map((label, index) => ({
    label,
    options: (groups[index] ?? []).map(([value, token]) => ({
      label: value,
      token,
    })),
  }));
}

export function createEmptyKrForm(owner: string): KrFormState {
  return {
    calculationMethod: 'Requested N',
    client: '',
    clientName: '',
    completePoints: '',
    country: 'KR',
    cpi: '',
    date: todayString(),
    feasibleN: '',
    ir: '',
    loi: '',
    otherFee: '',
    otherFeeEnabled: false,
    owner,
    pageN: '',
    partnerUsage: false,
    programmingFee: '',
    projectName: '',
    projectType: '',
    questionN: '',
    requestedN: '',
    selectedOtherFees: [],
    sopUsage: false,
    specialOption: '',
    targetCondition: '',
    trapQuestion: '',
  };
}

export function createEmptyOsSetup(owner: string): OsSetupState {
  return {
    client: '',
    clientName: '',
    date: todayString(),
    loi: '',
    otherFee: '150,000',
    overlayFee: '',
    owner,
    projectName: '',
    projectType: '',
    requestedN: '',
    samplingType: 'Random',
    selectedCountries: [],
    targetCondition: '',
  };
}

export function createVendorEntry(): VendorEntry {
  return {
    cost: '',
    cpi: '',
    cpiKrw: '',
    currency: '',
    exchangeRate: '',
    feasibility: '',
    irFrom: '',
    irTo: '',
    name: '',
  };
}

export function createOsPanel(
  option: CountryOption,
  setup: OsSetupState,
): OsPanelState {
  return {
    averageVendorCpi: '',
    client: setup.client,
    clientName: setup.clientName,
    country: option.nameEn,
    countryKr: option.nameKr,
    countryRename: option.nameEn,
    date: setup.date,
    expectedSales: '',
    gid: option.code.toLowerCase(),
    id: `${option.code.toLowerCase()}-${option.nameEn.toLowerCase()}`,
    loi: setup.loi,
    markUp: '',
    otherFee: setup.otherFee,
    overlayFee: setup.overlayFee,
    owner: setup.owner,
    pageN: '',
    projectName: setup.projectName,
    projectType: setup.projectType,
    proposalCpi: '',
    questionN: '',
    requestedN: setup.requestedN,
    samplingType: setup.samplingType,
    targetCondition: setup.targetCondition,
    totalGM: '',
    totalGMPer: '',
    totalTargetSample: setup.requestedN,
    totalVendorCosts: '',
    totalVendorFeasibility: '',
    vendorUsageCount: 1,
    vendors: Array.from({ length: 5 }, createVendorEntry),
  };
}

function isCheckedCell(value?: string): boolean {
  return value === 'TRUE' || value === 'true' || value === 'on';
}

export function hydrateKrForm(
  rowMap: Record<string, string>,
  owner: string,
): KrFormState {
  return {
    ...createEmptyKrForm(owner),
    calculationMethod:
      rowMap['Calculation method'] === 'Feasible N'
        ? 'Feasible N'
        : 'Requested N',
    client: rowMap.Client || '',
    clientName: rowMap['Client name'] || '',
    completePoints: rowMap['Complete points'] || '',
    country: rowMap.Country || 'KR',
    cpi: rowMap.CPI || '',
    date: rowMap.Date || todayString(),
    feasibleN: rowMap['Feasible N'] || '',
    ir: rowMap['Estimate IR'] || '',
    loi: rowMap.LOI || '',
    otherFee: rowMap['Other fee'] || '',
    otherFeeEnabled: Boolean(rowMap['Other fee options']),
    owner: rowMap.Owner || owner,
    pageN: rowMap['Page N'] || '',
    partnerUsage: isCheckedCell(rowMap['3rd party Usage']),
    programmingFee: rowMap['Programming fee'] || '',
    projectName: rowMap['Project name (Mail title)'] || '',
    projectType: rowMap['Project type'] || '',
    questionN: rowMap['Question N'] || '',
    requestedN: rowMap['Requested N'] || '',
    selectedOtherFees: rowMap['Other fee options']
      ? rowMap['Other fee options']
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      : [],
    sopUsage: isCheckedCell(rowMap['SOP Usage']),
    specialOption: rowMap['Special option'] || '',
    targetCondition: rowMap['Targeting condition'] || '',
    trapQuestion: rowMap['Trap question'] || '',
  };
}

export function hydrateOsPanels(
  data: OSMergedTable,
  owner: string,
): OsPanelState[] {
  const headers = data.dataArray[0] ?? [];

  return data.dataArray.slice(1).map((row, rowIndex) => {
    const map = buildRowMap(headers, row);
    const gid = (map.GID || `row-${rowIndex + 1}`).toLowerCase();
    const vendors = Array.from({ length: 5 }, (_, index) => ({
      cost: map[`Vendor cost_${index + 1}`] || '',
      cpi: map[`Vendor CPI_${index + 1}`] || '',
      cpiKrw: map[`Vendor CPI (KRW)_${index + 1}`] || '',
      currency: map[`Vendor currency_${index + 1}`] || '',
      exchangeRate: map[`Vendor exchange rate_${index + 1}`] || '',
      feasibility: map[`Vendor feasibility_${index + 1}`] || '',
      irFrom: map[`Vendor IR_from_${index + 1}`] || '',
      irTo: map[`Vendor IR_to_${index + 1}`] || '',
      name: map[`Vendor name_${index + 1}`] || '',
    }));

    return {
      averageVendorCpi: map['Average CPI'] || '',
      client: map.Client || '',
      clientName: map['Client name'] || '',
      country: map.Country || '',
      countryKr: map['Country (kr)'] || '',
      countryRename: map['Country (rename)'] || map.Country || '',
      date: map['RFQ Date'] || map.Date || todayString(),
      expectedSales: map.Sales || '',
      gid,
      id: `${gid}-${rowIndex}`,
      loi: map.LOI || '',
      markUp: map.Markup || '',
      otherFee: map['Other fee'] || '',
      overlayFee: map['Overlay fee'] || '',
      owner: map.Owner || owner,
      pageN: map['Page N'] || '',
      projectName: map['Project name (Mail title)'] || '',
      projectType: map['Project type'] || '',
      proposalCpi: map['Proposal CPI'] || '',
      questionN: map['Question N'] || '',
      requestedN: map['Requested N'] || '',
      samplingType: map['Sampling type'] || 'Random',
      targetCondition: map['Targeting condition'] || '',
      totalGM: map.GM || '',
      totalGMPer: map['GM (%)'] || '',
      totalTargetSample: map['Target sample'] || map['Requested N'] || '',
      totalVendorCosts: map.Cost || '',
      totalVendorFeasibility: map.Feasibility || '',
      vendorUsageCount:
        Number.parseInt(map['Vendor Usage count'] || '1', 10) || 1,
      vendors,
    };
  });
}

export function applyOsSetupFromPanels(
  panels: OsPanelState[],
  owner: string,
): OsSetupState {
  const first = panels[0];

  if (!first) {
    return createEmptyOsSetup(owner);
  }

  return {
    client: first.client,
    clientName: first.clientName,
    date: first.date || todayString(),
    loi: first.loi,
    otherFee: first.otherFee,
    overlayFee: first.overlayFee,
    owner: first.owner || owner,
    projectName: first.projectName,
    projectType: first.projectType,
    requestedN: first.requestedN,
    samplingType: first.samplingType,
    selectedCountries: panels.map(
      (panel) => `${panel.gid.toUpperCase()}-${panel.country}`,
    ),
    targetCondition: first.targetCondition,
  };
}
