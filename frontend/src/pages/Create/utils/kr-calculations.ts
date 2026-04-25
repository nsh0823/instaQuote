import type {
  DerivedValues,
  KrFormState,
  PartnerRow,
  QuoteTableState,
  SopRow,
} from '@/pages/Create/types';
import {
  addComma,
  parseIntegerOrZero,
  parseNumber,
} from '@/pages/Create/utils/number';

export function createEmptyPartnerRows(): PartnerRow[] {
  return Array.from({ length: 3 }, () => ({
    cpi: '',
    cost: '',
    fee: '',
    name: '',
    needed: '',
  }));
}

export function createEmptySopRow(): SopRow {
  return {
    cost: '',
    cpi: '',
    needed: '',
  };
}

export function createEmptyQuoteTableState(): QuoteTableState {
  return {
    operationCost: null,
    operationVisible: true,
    programmingCost: null,
    programmingVisible: true,
    subtotalExVat: null,
    totalIncVat: null,
    usageCost: null,
    usageCpi: null,
    usageQty: null,
  };
}

export function formatCellNumber(value: number | null): string {
  return value === null ? '' : addComma(value);
}

export function mapLoiBucketMain(loi: number): number {
  if (loi <= 5) return 0;
  if (loi <= 10) return 1;
  if (loi <= 15) return 2;
  if (loi <= 20) return 3;
  if (loi <= 25) return 4;
  if (loi <= 30) return 5;
  if (loi <= 35) return 6;
  if (loi <= 40) return 7;
  if (loi <= 45) return 8;
  if (loi <= 50) return 9;
  if (loi <= 55) return 10;
  return 11;
}

export function mapLoiBucketSop(loi: number): number {
  if (loi <= 5) return 0;
  if (loi <= 10) return 1;
  if (loi <= 15) return 2;
  if (loi <= 20) return 3;
  if (loi <= 25) return 4;
  if (loi <= 30) return 5;
  if (loi <= 35) return 6;
  if (loi <= 40) return 7;
  return 8;
}

export function mapIrBucket(ir: number): number {
  if (ir >= 80) return 0;
  if (ir >= 60) return 1;
  if (ir >= 40) return 2;
  if (ir >= 30) return 3;
  if (ir >= 20) return 4;
  if (ir >= 15) return 5;
  if (ir >= 10) return 6;
  if (ir >= 8) return 7;
  if (ir >= 6) return 8;
  if (ir >= 5) return 9;
  if (ir >= 4) return 10;
  if (ir >= 3) return 11;
  if (ir >= 2) return 12;
  return 13;
}

export function applyCpiAdjustment(
  baseCpi: number,
  specialOption: string,
  trapQuestion: string,
): number {
  const specialAdjusted =
    specialOption === 'Option 1' || specialOption === 'Option 2'
      ? baseCpi + 1000
      : baseCpi;

  if (trapQuestion === '1') {
    return Math.round((specialAdjusted + Number.EPSILON) * 1.1);
  }
  if (trapQuestion === '2') {
    return Math.round((specialAdjusted + Number.EPSILON) * 1.2);
  }

  return specialAdjusted;
}

export function cloneForm(form: KrFormState): KrFormState {
  return {
    ...form,
    selectedOtherFees: [...form.selectedOtherFees],
  };
}

export function clonePartnerRows(rows: PartnerRow[]): PartnerRow[] {
  return rows.map((row) => ({ ...row }));
}

export function cloneSopRows(rows: { sop1: SopRow; sop2: SopRow }): {
  sop1: SopRow;
  sop2: SopRow;
} {
  return {
    sop1: { ...rows.sop1 },
    sop2: { ...rows.sop2 },
  };
}

export function recalculatePartnerCosts(rows: PartnerRow[]): PartnerRow[] {
  return rows.map((row) => {
    const needed = parseNumber(row.needed);
    const cpi = parseNumber(row.cpi);
    const fee = parseNumber(row.fee);

    if (needed === null || cpi === null || fee === null) {
      return { ...row, cost: '' };
    }

    return {
      ...row,
      cost: addComma(needed * cpi + fee),
    };
  });
}

export function recalculateSopCost(row: SopRow): SopRow {
  const needed = parseNumber(row.needed);
  const cpi = parseNumber(row.cpi);

  if (needed === null || cpi === null) {
    return { ...row, cost: '' };
  }

  return {
    ...row,
    cost: addComma(needed * cpi),
  };
}

export function calculateDerivedValues(
  form: KrFormState,
  partnerRows: PartnerRow[],
  sopRows: { sop1: SopRow; sop2: SopRow },
): DerivedValues {
  const requestedN = parseIntegerOrZero(form.requestedN);
  const feasibleN = parseIntegerOrZero(form.feasibleN);
  const ir = parseIntegerOrZero(form.ir);
  const completePoints = parseIntegerOrZero(form.completePoints);
  const cpi = parseIntegerOrZero(form.cpi);
  const programmingFee = parseIntegerOrZero(form.programmingFee);
  const otherFee = parseIntegerOrZero(form.otherFee);

  const totalPartnerCost = partnerRows.reduce(
    (sum, row) => sum + parseIntegerOrZero(row.cost),
    0,
  );

  const totalSopCost =
    parseIntegerOrZero(sopRows.sop1.cost) + parseIntegerOrZero(sopRows.sop2.cost);

  const scCount = ir > 0 ? Math.round((feasibleN * (100 - ir)) / ir) : 0;
  const qfCount = Math.round(scCount / 5);

  const pointFee = completePoints * feasibleN + scCount * 50 + qfCount * 50;
  const baseN = form.calculationMethod === 'Feasible N' ? feasibleN : requestedN;
  const quoteEstimate = baseN * cpi + programmingFee + otherFee;

  const gmPercent =
    quoteEstimate === 0
      ? 0
      : ((quoteEstimate - (totalPartnerCost + totalSopCost + pointFee)) /
          quoteEstimate) *
        100;

  const gm = quoteEstimate - (pointFee + totalPartnerCost + totalSopCost);

  return {
    gm,
    gmPercent,
    pointFee,
    qfCount,
    quoteEstimate,
    scCount,
    totalPartnerCost,
    totalSopCost,
  };
}

export function getRequiredMissingFields(form: KrFormState): string[] {
  const requiredMap: Record<keyof KrFormState, string> = {
    calculationMethod: 'Calculation method',
    client: 'Client',
    clientName: 'Client name',
    completePoints: 'Complete points',
    country: 'Country',
    cpi: 'CPI',
    date: 'Date',
    feasibleN: 'Feasible N',
    ir: 'IR',
    loi: 'LOI',
    otherFee: 'Other fee',
    otherFeeEnabled: 'Other fee options switch',
    owner: 'Owner',
    pageN: 'Page N',
    partnerUsage: '3rd party usage',
    programmingFee: 'Programming fee',
    projectName: 'Project name',
    projectType: 'Project type',
    questionN: 'Question N',
    requestedN: 'Requested N',
    selectedOtherFees: 'Other fee options',
    sopUsage: 'SOP usage',
    specialOption: 'Special option',
    targetCondition: 'Target condition',
    trapQuestion: 'Trap question',
  };

  const keys: Array<keyof KrFormState> = [
    'date',
    'owner',
    'country',
    'projectType',
    'projectName',
    'client',
    'ir',
    'loi',
    'completePoints',
    'cpi',
    'requestedN',
    'feasibleN',
  ];

  return keys
    .filter((key) => !String(form[key] ?? '').trim())
    .map((key) => requiredMap[key]);
}

export function areStringArraysEqual(left: string[], right: string[]): boolean {
  if (left === right) {
    return true;
  }

  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
}

export function arePartnerRowsEqual(left: PartnerRow[], right: PartnerRow[]): boolean {
  if (left === right) {
    return true;
  }

  if (left.length !== right.length) {
    return false;
  }

  return left.every((row, index) => {
    const next = right[index];
    return (
      row.cpi === next.cpi &&
      row.cost === next.cost &&
      row.fee === next.fee &&
      row.name === next.name &&
      row.needed === next.needed
    );
  });
}

export function areSopRowsEqual(
  left: { sop1: SopRow; sop2: SopRow },
  right: { sop1: SopRow; sop2: SopRow },
): boolean {
  return (
    left.sop1.cpi === right.sop1.cpi &&
    left.sop1.cost === right.sop1.cost &&
    left.sop1.needed === right.sop1.needed &&
    left.sop2.cpi === right.sop2.cpi &&
    left.sop2.cost === right.sop2.cost &&
    left.sop2.needed === right.sop2.needed
  );
}
