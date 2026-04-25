export type Scope = "Your" | "Total";
export type Region = "KR" | "OS";
export type StatusKey = "Bidding" | "Pending" | "Ordered" | "Pass" | "Failed";
export type ProgressWindow = 7 | 30 | 90;
export type DateRangePreset =
  | "Today"
  | "Yesterday"
  | "This Week"
  | "This Month"
  | "This Quarter"
  | "This Year"
  | "Last 7 Days"
  | "Last 30 Days"
  | "Last Month";

export type DateRangeValue = {
  start: Date;
  end: Date;
};

export type StatusEntry = {
  status: string;
  date: Date;
  owner: string;
};

export type GreetingKind = "morning" | "afternoon" | "evening";

export type ScopeOption = {
  value: Scope;
  label: Scope;
};

export type ProgressPoint = {
  dateKey: string;
  label: string;
  kr: number;
  os: number;
  total: number;
};

export type OwnerWorkloadItem = {
  closed: number;
  krTotal: number;
  lastActivity: Date | null;
  open: number;
  ordered: number;
  osTotal: number;
  owner: string;
  total: number;
  winRate: number;
};

export type QuickAccessIconKind =
  | "plus"
  | "table"
  | "dashboard"
  | "chart"
  | "chevron"
  | "sticky"
  | "file"
  | "people";

export type QuickAccessItem = {
  mode: string;
  title: string;
  description: string;
  icon: Exclude<QuickAccessIconKind, "chevron">;
};
