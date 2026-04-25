type TablePageStatusProps = {
  loading?: boolean;
  message?: string;
  tone?: "default" | "error";
};

export function TablePageStatus({
  loading = false,
  message,
  tone = "default",
}: TablePageStatusProps): JSX.Element {
  return (
    <div className={`table-page-status ${tone === "error" ? "is-error" : ""}`}>
      {loading ? <div className="table-page-spinner" /> : message}
    </div>
  );
}
