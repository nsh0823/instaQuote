export type BackendOk<T> = {
  ok: true;
  data: T;
};

export type BackendErr = {
  ok: false;
  error: string;
};

export type BackendResponse<T> = BackendOk<T> | BackendErr;

export type TableRows = string[][];

export type GmailEmail = {
  subject: string;
  sender: string;
  client: string;
};

export type ClientGroupHeader = string[];
export type ClientGroupValues = string[][];
export type ClientDataset = [ClientGroupHeader, ...ClientGroupValues[]];

export type OtherFeeDataset = string[][][];
export type RateDataset = string[][][];

export type OSMergedTable = {
  dataArray: string[][];
  mergedInfo?: Array<{
    row: number;
    col: number;
    rowspan: number;
    colspan: number;
    mergedValue?: string;
  }>;
};

export type RfqOverviewScope = {
  Weekly: Record<string, number>;
  Monthly: Record<string, number>;
  Quarterly: Record<string, number>;
  Yearly: Record<string, number>;
};

export type RfqOverview = {
  KR: { Your: RfqOverviewScope; Total: RfqOverviewScope };
  OS: { Your: RfqOverviewScope; Total: RfqOverviewScope };
  Range: Record<string, string>;
};

export type RfqStatusInfo = {
  KR: string[][];
  OS: string[][];
};

export type ApiMutationResult = {
  action: string;
  id?: number | string;
  rowsWritten?: number;
  outputUrl?: string;
  fileId?: string;
};
