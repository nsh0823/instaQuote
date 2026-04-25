type VendorPageHeaderProps = {
  isFloating: boolean;
};

export function VendorPageHeader({
  isFloating,
}: VendorPageHeaderProps): JSX.Element {
  return (
    <header
      className={`table-page-header ${isFloating ? "is-floating" : ""}`}
    >
      <div className="table-page-header-body">
        <div className="table-page-title">
          <span className="table-page-mode-badge">OS</span>
          <span>Vendor List</span>
        </div>
      </div>
    </header>
  );
}
