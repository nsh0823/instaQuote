import type { Dispatch, SetStateAction } from 'react';

import type { ClientGroup, CountryOption } from './shared';
import type {
  GmailEmail,
  OtherFeeDataset,
  RateDataset,
  TableRows,
} from '@/types/backend';

export type KrFormState = {
  date: string;
  owner: string;
  country: string;
  projectType: string;
  trapQuestion: string;
  specialOption: string;
  projectName: string;
  client: string;
  clientName: string;
  targetCondition: string;
  ir: string;
  loi: string;
  completePoints: string;
  cpi: string;
  requestedN: string;
  feasibleN: string;
  calculationMethod: 'Requested N' | 'Feasible N';
  questionN: string;
  pageN: string;
  programmingFee: string;
  otherFee: string;
  otherFeeEnabled: boolean;
  selectedOtherFees: string[];
  partnerUsage: boolean;
  sopUsage: boolean;
};

export type KrTextField = {
  [K in keyof KrFormState]: KrFormState[K] extends string ? K : never;
}[keyof KrFormState];

export type KrSelectOption = {
  group?: string;
  label: string;
  token?: string;
  value: string;
};

export type PartnerRow = {
  cpi: string;
  cost: string;
  fee: string;
  name: string;
  needed: string;
};

export type SopRow = {
  cost: string;
  cpi: string;
  needed: string;
};

export type KrSopCheckedState = {
  sop1: boolean;
  sop2: boolean;
};

export type DerivedValues = {
  gm: number;
  gmPercent: number;
  pointFee: number;
  qfCount: number;
  quoteEstimate: number;
  scCount: number;
  totalPartnerCost: number;
  totalSopCost: number;
};

export type CalcSnapshot = {
  actualCpi: string;
  derived: DerivedValues;
  form: KrFormState;
  id: number;
  partnerCount: number;
  partnerRows: PartnerRow[];
  sopChecked: KrSopCheckedState;
  sopRows: { sop1: SopRow; sop2: SopRow };
};

export type QuoteTableState = {
  operationCost: number | null;
  operationVisible: boolean;
  programmingCost: number | null;
  programmingVisible: boolean;
  subtotalExVat: number | null;
  totalIncVat: number | null;
  usageCost: number | null;
  usageCpi: number | null;
  usageQty: number | null;
};

export type ConfirmAction = 'save' | 'save-draft' | 'update' | null;

export type KrCreateFormProps = {
  activeRecordId: string;
  activeUser: string;
  clientGroups: ClientGroup[];
  compPtRows: string[][];
  countries: CountryOption[];
  form: KrFormState;
  gmailEmails: GmailEmail[];
  lang: 'ko' | 'en';
  loadedKrRows: TableRows | null;
  onResetForm: () => void;
  otherFeeGroups: OtherFeeDataset;
  rateGroups: RateDataset;
  setForm: Dispatch<SetStateAction<KrFormState>>;
};
