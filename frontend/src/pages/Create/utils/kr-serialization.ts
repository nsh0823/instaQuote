import type {
  ClientGroup,
  ConfirmAction,
  DerivedValues,
  KrFormState,
  PartnerRow,
  SopRow,
} from '@/pages/Create/types';
import { findClientGroupLabel } from '@/pages/Create/utils/client';

type BuildKrSubmitFieldsParams = {
  action: Exclude<ConfirmAction, null>;
  activeRecordId: string;
  actualCpi: string;
  clientGroups: ClientGroup[];
  customGroupByClient: Record<string, string>;
  derivedValues: DerivedValues;
  form: KrFormState;
  partnerCount: number;
  partnerRows: PartnerRow[];
  sopRows: { sop1: SopRow; sop2: SopRow };
};

export function buildKrSubmitFields({
  action,
  activeRecordId,
  actualCpi,
  clientGroups,
  customGroupByClient,
  derivedValues,
  form,
  partnerCount,
  partnerRows,
  sopRows,
}: BuildKrSubmitFieldsParams): Record<string, string> {
  const selectedGroup = findClientGroupLabel(
    form.client,
    clientGroups,
    customGroupByClient,
  );

  return {
    '3rd party Usage': form.partnerUsage ? 'on' : '',
    '3rd party Usage count': String(partnerCount),
    '3rd party name_1': partnerRows[0]?.name ?? '',
    '3rd party name_2': partnerRows[1]?.name ?? '',
    '3rd party name_3': partnerRows[2]?.name ?? '',
    '3rd party CPI_1': partnerRows[0]?.cpi ?? '',
    '3rd party CPI_2': partnerRows[1]?.cpi ?? '',
    '3rd party CPI_3': partnerRows[2]?.cpi ?? '',
    '3rd party costs_1': partnerRows[0]?.cost ?? '',
    '3rd party costs_2': partnerRows[1]?.cost ?? '',
    '3rd party costs_3': partnerRows[2]?.cost ?? '',
    '3rd party fee_1': partnerRows[0]?.fee ?? '',
    '3rd party fee_2': partnerRows[1]?.fee ?? '',
    '3rd party fee_3': partnerRows[2]?.fee ?? '',
    'Actual CPI': actualCpi,
    'Calculation method': form.calculationMethod,
    'Client name': form.clientName,
    Client: form.client,
    Country: form.country,
    CPI: form.cpi,
    Date: form.date,
    'Estimate IR': form.ir,
    'Expected sales (without tax)': String(derivedValues.quoteEstimate),
    'Feasible N': form.feasibleN,
    GM: String(derivedValues.gm),
    'GM (%)': derivedValues.gmPercent.toFixed(2),
    Group: selectedGroup,
    LOI: form.loi,
    'Needed N_1': partnerRows[0]?.needed ?? '',
    'Needed N_2': partnerRows[1]?.needed ?? '',
    'Needed N_3': partnerRows[2]?.needed ?? '',
    Owner: form.owner,
    'Other fee': form.otherFee,
    'Other fee options': form.selectedOtherFees.join(','),
    'Page N': form.pageN,
    'Point fee (C+SC+QF)': String(derivedValues.pointFee),
    'Programming fee': form.programmingFee,
    'Project name (Mail title)': form.projectName,
    'Project type': form.projectType,
    'Question N': form.questionN,
    QF: String(derivedValues.qfCount),
    'Requested N': form.requestedN,
    'RFQ ID': action === 'update' ? activeRecordId : '',
    'RFQ type': 'KR',
    SC: String(derivedValues.scCount),
    'SOP Usage': form.sopUsage ? 'on' : '',
    'SOP_1 CPI': sopRows.sop1.cpi,
    'SOP_1 Costs': sopRows.sop1.cost,
    'SOP_1 Needed N': sopRows.sop1.needed,
    'SOP_2 CPI': sopRows.sop2.cpi,
    'SOP_2 Costs': sopRows.sop2.cost,
    'SOP_2 Needed N': sopRows.sop2.needed,
    'Special option': form.specialOption,
    'Targeting condition': form.targetCondition,
    'Total 3rd party costs': String(derivedValues.totalPartnerCost),
    'Total SOP costs': String(derivedValues.totalSopCost),
    'Trap question': form.trapQuestion,
    'Complete points': form.completePoints,
  };
}
