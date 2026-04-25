import type { ListMode } from "@/pages/List/types/list";

type ListPageHeaderProps = {
  isFloating: boolean;
  mode: ListMode;
  title?: string;
};

export function ListPageHeader({
  isFloating,
  mode,
  title = "RFQ List",
}: ListPageHeaderProps): JSX.Element {
  return (
    <header className={`table-page-header ${isFloating ? "is-floating" : ""}`}>
      <div className="table-page-header-body">
        <div className="table-page-title">
          <span className="table-page-mode-badge">{mode}</span>
          <span>{title}</span>
        </div>
      </div>
    </header>
  );
}
