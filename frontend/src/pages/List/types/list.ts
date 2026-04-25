import type { ReactNode } from "react";

export type ListMode = "KR" | "OS";

export type CellMergeState = {
  colSpan?: number;
  hidden?: boolean;
  mergedValue?: string;
  rowSpan?: number;
};

export type GroupedRecord = {
  client: string;
  date: string;
  displayRow: string[];
  id: string;
  notes: string;
  outputUrl: string;
  owner: string;
  rawRowMerges: Array<Record<number, CellMergeState>>;
  rawRows: string[][];
  status: string;
};

export type FilterMenuKey = "status" | "owner" | "client";

export type ListPaginationItem = number | "ellipsis-start" | "ellipsis-end";

export type ListToastState = {
  body: ReactNode;
  title: ReactNode;
  type: "success" | "fail";
};

export type ListPageDataState = {
  errorMessage: string | null;
  header: string[];
  loading: boolean;
  records: GroupedRecord[];
};
