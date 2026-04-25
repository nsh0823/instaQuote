import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';

import type {
  ClientGroup,
  CountryOption,
  DerivedValues,
  KrFormState,
  KrSopCheckedState,
  KrTextField,
  PartnerRow,
  SopRow,
} from '@/pages/Create/types';
import type {
  OtherFeeDataset,
  RateDataset,
  TableRows,
} from '@/types/backend';
import { findClientGroupIndex } from '@/pages/Create/utils/client';
import { buildRowMap } from '@/pages/Create/utils/hydration';
import {
  applyCpiAdjustment,
  calculateDerivedValues,
  clonePartnerRows,
  createEmptyPartnerRows,
  createEmptyQuoteTableState,
  createEmptySopRow,
  getRequiredMissingFields,
  mapIrBucket,
  mapLoiBucketMain,
  mapLoiBucketSop,
  recalculatePartnerCosts,
  recalculateSopCost,
} from '@/pages/Create/utils/kr-calculations';
import {
  addComma,
  normalizeIntegerInput,
  parseIntegerOrZero,
  parseNumber,
} from '@/pages/Create/utils/number';

type SopKey = 'sop1' | 'sop2';

type RestorePricingStateParams = {
  actualCpi: string;
  partnerCount: number;
  partnerRows: PartnerRow[];
  sopChecked: KrSopCheckedState;
  sopRows: { sop1: SopRow; sop2: SopRow };
};

type UseKrPricingStateParams = {
  clientGroups: ClientGroup[];
  compPtRows: string[][];
  countries: CountryOption[];
  form: KrFormState;
  loadedKrRows: TableRows | null;
  otherFeeGroups: OtherFeeDataset;
  rateGroups: RateDataset;
  setForm: Dispatch<SetStateAction<KrFormState>>;
  setWarningMessage: Dispatch<SetStateAction<string>>;
  t: (ko: string, en: string) => string;
};

export function useKrPricingState({
  clientGroups,
  compPtRows,
  countries,
  form,
  loadedKrRows,
  otherFeeGroups,
  rateGroups,
  setForm,
  setWarningMessage,
  t,
}: UseKrPricingStateParams) {
  const [actualCpi, setActualCpi] = useState('');
  const [flashField, setFlashField] = useState<string | null>(null);
  const [partnerCount, setPartnerCount] = useState(1);
  const [partnerRows, setPartnerRows] = useState(createEmptyPartnerRows());
  const [quoteTableState, setQuoteTableState] = useState(createEmptyQuoteTableState());
  const [showIrInvalid, setShowIrInvalid] = useState(false);
  const [showLoiInvalid, setShowLoiInvalid] = useState(false);
  const [sopChecked, setSopChecked] = useState({ sop1: false, sop2: false });
  const [sopRows, setSopRows] = useState({
    sop1: createEmptySopRow(),
    sop2: createEmptySopRow(),
  });

  useEffect(() => {
    if (!loadedKrRows?.[1]) {
      setActualCpi('');
      setPartnerCount(1);
      setPartnerRows(createEmptyPartnerRows());
      setSopChecked({ sop1: false, sop2: false });
      setSopRows({ sop1: createEmptySopRow(), sop2: createEmptySopRow() });
      return;
    }

    const rowMap = buildRowMap(loadedKrRows[0] ?? [], loadedKrRows[1] ?? []);

    setActualCpi(rowMap['Actual CPI'] ?? '');
    setPartnerCount(
      Math.max(
        1,
        Number.parseInt(rowMap['3rd party Usage count'] ?? '1', 10) || 1,
      ),
    );
    setPartnerRows(
      recalculatePartnerCosts(
        Array.from({ length: 3 }, (_, index) => ({
          cpi: rowMap[`3rd party CPI_${index + 1}`] ?? '',
          cost: rowMap[`3rd party costs_${index + 1}`] ?? '',
          fee: rowMap[`3rd party fee_${index + 1}`] ?? '',
          name: rowMap[`3rd party name_${index + 1}`] ?? '',
          needed: rowMap[`Needed N_${index + 1}`] ?? '',
        })),
      ),
    );

    const nextSopRows = {
      sop1: recalculateSopCost({
        cpi: rowMap['SOP_1 CPI'] ?? '',
        cost: rowMap['SOP_1 Costs'] ?? '',
        needed: rowMap['SOP_1 Needed N'] ?? '',
      }),
      sop2: recalculateSopCost({
        cpi: rowMap['SOP_2 CPI'] ?? '',
        cost: rowMap['SOP_2 Costs'] ?? '',
        needed: rowMap['SOP_2 Needed N'] ?? '',
      }),
    };

    setSopRows(nextSopRows);
    setSopChecked({
      sop1: Boolean(nextSopRows.sop1.cost),
      sop2: Boolean(nextSopRows.sop2.cost),
    });
  }, [loadedKrRows]);

  useEffect(() => {
    const loi = parseNumber(form.loi);

    if (loi === null || compPtRows.length === 0) {
      return;
    }

    const index = Math.min(
      Math.max(Math.round(loi), 0),
      Math.max(compPtRows.length - 1, 0),
    );
    const next = compPtRows[index]?.[1] ?? '';

    if (next && next !== form.completePoints) {
      setForm((prev) => ({
        ...prev,
        completePoints: next,
      }));
      setFlashField('completePoints');
    }
  }, [compPtRows, form.completePoints, form.loi, setForm]);

  useEffect(() => {
    if (!flashField) {
      return;
    }

    const timer = window.setTimeout(() => {
      setFlashField((current) => (current === flashField ? null : current));
    }, 900);

    return () => {
      window.clearTimeout(timer);
    };
  }, [flashField]);

  useEffect(() => {
    const ir = parseNumber(form.ir);
    const loi = parseNumber(form.loi);

    if (ir === null || loi === null || !form.client || !form.country) {
      return;
    }

    if (ir < 0 || ir > 100) {
      setShowIrInvalid(true);
      setForm((prev) => ({ ...prev, ir: '', cpi: '' }));
      setActualCpi('');
      return;
    }

    setShowIrInvalid(false);
    setShowLoiInvalid(loi < 0 || loi > 60);

    if (loi < 0 || loi > 60) {
      setForm((prev) => ({ ...prev, cpi: '' }));
      setActualCpi('');
      return;
    }

    const clientGroupIndex = findClientGroupIndex(form.client, clientGroups);
    if (clientGroupIndex < 0 || clientGroupIndex >= rateGroups.length) {
      return;
    }

    const loiIndex = mapLoiBucketMain(loi);
    const irIndex = mapIrBucket(ir);
    const baseCpiRaw = rateGroups[clientGroupIndex]?.[loiIndex]?.[irIndex] ?? '';
    const baseCpi = parseNumber(baseCpiRaw);

    if (baseCpi === null) {
      return;
    }

    const adjusted = applyCpiAdjustment(
      baseCpi,
      form.specialOption,
      form.trapQuestion,
    );
    const nextActual = addComma(baseCpi);
    const nextCpi = addComma(adjusted);

    if (actualCpi !== nextActual) {
      setActualCpi(nextActual);
    }

    if (form.cpi !== nextCpi) {
      setForm((prev) => ({
        ...prev,
        cpi: nextCpi,
      }));
      setFlashField('cpi');
    }
  }, [
    actualCpi,
    clientGroups,
    form.client,
    form.country,
    form.cpi,
    form.ir,
    form.loi,
    form.specialOption,
    form.trapQuestion,
    rateGroups,
    setForm,
  ]);

  useEffect(() => {
    if (!form.partnerUsage) {
      setPartnerCount(1);
      setPartnerRows(createEmptyPartnerRows());
    }
  }, [form.partnerUsage]);

  useEffect(() => {
    const ir = parseNumber(form.ir);
    const loi = parseNumber(form.loi);

    if (ir === null || loi === null || ir < 0 || ir > 100 || loi < 0) {
      return;
    }

    const irIndex = mapIrBucket(ir);
    const loiIndex = mapLoiBucketSop(loi);

    if (sopChecked.sop1 && rateGroups[3]?.[loiIndex]?.[irIndex]) {
      const nextCpi = addComma(rateGroups[3][loiIndex][irIndex]);
      setSopRows((prev) => ({
        ...prev,
        sop1: recalculateSopCost({ ...prev.sop1, cpi: nextCpi }),
      }));
      setFlashField('sop1Cpi');
    }

    if (sopChecked.sop2 && rateGroups[4]?.[loiIndex]?.[irIndex]) {
      const nextCpi = addComma(rateGroups[4][loiIndex][irIndex]);
      setSopRows((prev) => ({
        ...prev,
        sop2: recalculateSopCost({ ...prev.sop2, cpi: nextCpi }),
      }));
      setFlashField('sop2Cpi');
    }
  }, [form.ir, form.loi, rateGroups, sopChecked.sop1, sopChecked.sop2]);

  useEffect(() => {
    if (form.client !== 'Opensurvey') {
      return;
    }

    const selected = countries.find((country) => country.code === form.country);
    if (!selected) {
      return;
    }

    if (Number.isNaN(Number.parseInt(selected.group, 10))) {
      setForm((prev) => ({ ...prev, country: '', cpi: '' }));
      setActualCpi('');
      setWarningMessage(
        t(
          '오픈서베이용 국가를 다시 선택해주세요.',
          'Please reselect country for Opensurvey.',
        ),
      );
    }
  }, [countries, form.client, form.country, setForm, setWarningMessage, t]);

  const derivedValues = useMemo<DerivedValues>(
    () => calculateDerivedValues(form, partnerRows, sopRows),
    [form, partnerRows, sopRows],
  );

  const isRequiredReady = useMemo(
    () => getRequiredMissingFields(form).length === 0,
    [form],
  );

  function handleTextFormChange<Field extends KrTextField>(
    field: Field,
    value: KrFormState[Field],
  ): void {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleNumericFormChange(
    field: KrTextField,
    value: string,
    options?: { allowOutOfRange?: boolean },
  ): string {
    const normalized = normalizeIntegerInput(value);

    if (field === 'ir' && normalized) {
      const irValue = parseNumber(normalized) ?? 0;
      if ((irValue < 0 || irValue > 100) && !options?.allowOutOfRange) {
        setShowIrInvalid(true);
        setForm((prev) => ({ ...prev, ir: '', cpi: '' }));
        setActualCpi('');
        return '';
      }
      setShowIrInvalid(false);
    }

    if (field === 'loi' && normalized) {
      const loiValue = parseNumber(normalized) ?? 0;
      setShowLoiInvalid(loiValue < 0 || loiValue > 60);
    }

    setForm((prev) => ({ ...prev, [field]: normalized }));
    return normalized;
  }

  function handleOtherFeeEnabledChange(enabled: boolean): void {
    if (!enabled) {
      const subtract = form.selectedOtherFees.reduce((sum, item) => {
        for (const group of otherFeeGroups) {
          for (const row of group) {
            if (row[0] === item) {
              return sum + (parseNumber(row[2] ?? '0') ?? 0);
            }
          }
        }

        return sum;
      }, 0);

      const current = parseIntegerOrZero(form.otherFee);
      const nextFee = current - subtract;

      setForm((prev) => ({
        ...prev,
        otherFee: nextFee === 0 ? '' : addComma(nextFee),
        otherFeeEnabled: false,
        selectedOtherFees: [],
      }));
      setFlashField('otherFee');
      return;
    }

    setForm((prev) => ({ ...prev, otherFeeEnabled: true }));
  }

  function handleOtherFeeSelectionChange(
    label: string,
    cost: number,
    isChecked: boolean,
  ): void {
    const current = parseIntegerOrZero(form.otherFee);
    const next = isChecked ? current + cost : current - cost;

    setForm((prev) => ({
      ...prev,
      otherFee: next === 0 ? '' : addComma(next),
      selectedOtherFees: isChecked
        ? [...prev.selectedOtherFees, label]
        : prev.selectedOtherFees.filter((item) => item !== label),
    }));
    setFlashField('otherFee');
  }

  function syncPartnerRowsFromGap(
    requestedValue: string,
    feasibleValue: string,
    force = false,
  ): void {
    if (!force && !form.partnerUsage) {
      return;
    }

    const requested = parseNumber(requestedValue);
    const feasible = parseNumber(feasibleValue);

    if (requested === null || feasible === null) {
      setPartnerRows((prev) =>
        recalculatePartnerCosts(
          prev.map((row) => ({
            ...row,
            cost: '',
            needed: '',
          })),
        ),
      );
      return;
    }

    const gap = requested - feasible;
    setPartnerRows((prev) => {
      const next = clonePartnerRows(prev);
      next[0].needed = gap === 0 ? '' : addComma(gap);
      next[1].needed = '';
      next[2].needed = '';
      return recalculatePartnerCosts(next);
    });
  }

  function updatePartnerNeeded(index: number, raw: string): void {
    const normalized = normalizeIntegerInput(raw);

    setPartnerRows((prev) => {
      const next = clonePartnerRows(prev);
      const requested = parseNumber(form.requestedN);
      const feasible = parseNumber(form.feasibleN);
      const gap = requested !== null && feasible !== null ? requested - feasible : null;

      next[index].needed = normalized;

      if (index === 0) {
        if (!normalized) {
          next[1].needed = '';
          next[2].needed = '';
        } else if (gap !== null) {
          const n1 = parseNumber(next[0].needed) ?? 0;
          const n2 = gap - n1;
          next[1].needed = n2 === 0 ? '' : addComma(n2);
          const parsedN2 = parseNumber(next[1].needed) ?? 0;
          const n3 = gap - n1 - parsedN2;
          next[2].needed = n3 === 0 ? '' : addComma(n3);
        }
      }

      if (index === 1) {
        if (!normalized) {
          next[2].needed = '';
        } else if (gap !== null) {
          const n1 = parseNumber(next[0].needed) ?? 0;
          const n2 = parseNumber(next[1].needed) ?? 0;
          const n3 = gap - n1 - n2;
          next[2].needed = n3 === 0 ? '' : addComma(n3);
        }
      }

      return recalculatePartnerCosts(next);
    });

    setFlashField(`partnerCost${index + 1}`);
  }

  function updatePartnerField(
    index: number,
    field: 'cpi' | 'fee' | 'name',
    value: string,
  ): void {
    setPartnerRows((prev) => {
      const next = clonePartnerRows(prev);
      next[index][field] = field === 'name' ? value : normalizeIntegerInput(value);
      return recalculatePartnerCosts(next);
    });

    if (field !== 'name') {
      setFlashField(`partnerCost${index + 1}`);
    }
  }

  function updateSopNeeded(key: SopKey, value: string): void {
    setSopRows((prev) => ({
      ...prev,
      [key]: recalculateSopCost({
        ...prev[key],
        needed: normalizeIntegerInput(value),
      }),
    }));
    setFlashField(key === 'sop1' ? 'sop1Cost' : 'sop2Cost');
  }

  function updateSopCpi(key: SopKey, value: string): void {
    setSopRows((prev) => ({
      ...prev,
      [key]: recalculateSopCost({
        ...prev[key],
        cpi: normalizeIntegerInput(value),
      }),
    }));
    setFlashField(key === 'sop1' ? 'sop1Cost' : 'sop2Cost');
  }

  function handlePartnerUsageChange(checked: boolean): void {
    setForm((prev) => ({ ...prev, partnerUsage: checked }));
    if (!checked) {
      setPartnerCount(1);
      setPartnerRows(createEmptyPartnerRows());
      return;
    }

    syncPartnerRowsFromGap(form.requestedN, form.feasibleN, true);
  }

  function handleSopUsageChange(checked: boolean): void {
    setForm((prev) => ({ ...prev, sopUsage: checked }));
    if (!checked) {
      setSopChecked({ sop1: false, sop2: false });
      setSopRows({ sop1: createEmptySopRow(), sop2: createEmptySopRow() });
    }
  }

  function handleSopCheckedChange(key: SopKey, checked: boolean): void {
    setSopChecked((prev) => ({ ...prev, [key]: checked }));
    if (!checked) {
      setSopRows((prev) => ({ ...prev, [key]: createEmptySopRow() }));
    }
  }

  function handleRequestedNChange(value: string): void {
    const normalized = handleNumericFormChange('requestedN', value);
    syncPartnerRowsFromGap(normalized, form.feasibleN);
  }

  function handleFeasibleNChange(value: string): void {
    const normalized = handleNumericFormChange('feasibleN', value);
    syncPartnerRowsFromGap(form.requestedN, normalized);
  }

  function clearQuoteTable(): void {
    setQuoteTableState(createEmptyQuoteTableState());
  }

  function generateQuoteTable(): void {
    if (!form.cpi.trim() || !form.requestedN.trim()) {
      setWarningMessage(
        t(
          'CPI, 요청 샘플수 항목을 입력해주세요.',
          'Please enter CPI and Requested N to generate.',
        ),
      );
      return;
    }

    const requestedN = parseIntegerOrZero(form.requestedN);
    const feasibleN = parseIntegerOrZero(form.feasibleN);
    const cpi = parseIntegerOrZero(form.cpi);
    const programmingCost = parseIntegerOrZero(form.programmingFee);
    const operationCost = parseIntegerOrZero(form.otherFee);
    const usageQty =
      form.calculationMethod === 'Feasible N' ? feasibleN : requestedN;
    const usageCost = usageQty * cpi;
    const subtotal = derivedValues.quoteEstimate;
    const total = Math.round((subtotal + Number.EPSILON) * 1.1);

    setQuoteTableState({
      operationCost: operationCost === 0 ? null : operationCost,
      operationVisible: operationCost !== 0,
      programmingCost: programmingCost === 0 ? null : programmingCost,
      programmingVisible: programmingCost !== 0,
      subtotalExVat: subtotal,
      totalIncVat: total,
      usageCost,
      usageCpi: cpi,
      usageQty,
    });
  }

  function resetPricingState(): void {
    setActualCpi('');
    setFlashField(null);
    setPartnerCount(1);
    setPartnerRows(createEmptyPartnerRows());
    setQuoteTableState(createEmptyQuoteTableState());
    setShowIrInvalid(false);
    setShowLoiInvalid(false);
    setSopChecked({ sop1: false, sop2: false });
    setSopRows({ sop1: createEmptySopRow(), sop2: createEmptySopRow() });
  }

  function restorePricingState({
    actualCpi: nextActualCpi,
    partnerCount: nextPartnerCount,
    partnerRows: nextPartnerRows,
    sopChecked: nextSopChecked,
    sopRows: nextSopRows,
  }: RestorePricingStateParams): void {
    setActualCpi(nextActualCpi);
    setPartnerCount(nextPartnerCount);
    setPartnerRows(nextPartnerRows);
    setSopChecked({ ...nextSopChecked });
    setSopRows(nextSopRows);
  }

  return {
    actualCpi,
    clearQuoteTable,
    derivedValues,
    flashField,
    generateQuoteTable,
    handleFeasibleNChange,
    handleNumericFormChange,
    handleOtherFeeEnabledChange,
    handleOtherFeeSelectionChange,
    handlePartnerUsageChange,
    handleRequestedNChange,
    handleSopCheckedChange,
    handleSopUsageChange,
    handleTextFormChange,
    isRequiredReady,
    partnerCount,
    partnerRows,
    quoteTableState,
    resetPricingState,
    restorePricingState,
    setPartnerCount,
    showIrInvalid,
    showLoiInvalid,
    sopChecked,
    sopRows,
    updatePartnerField,
    updatePartnerNeeded,
    updateSopCpi,
    updateSopNeeded,
  };
}
