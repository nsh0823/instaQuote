import { BsBoxArrowUpRight } from "react-icons/bs";

import { VendorFilterControls } from "@/components/vendor/VendorTableControls";

type VendorTableToolbarProps = {
  clearFilters: () => void;
  countryFilters: string[];
  countryOptions: string[];
  irFilter: string;
  loiFilters: string[];
  loiOptions: string[];
  onCountryToggle: (value: string, checked: boolean) => void;
  onIrChange: (value: string) => void;
  onLoiToggle: (value: string, checked: boolean) => void;
  onSearchChange: (value: string) => void;
  onTypeToggle: (value: string, checked: boolean) => void;
  search: string;
  sheetUrl: string;
  typeFilters: string[];
  typeOptions: string[];
};

export function VendorTableToolbar({
  clearFilters,
  countryFilters,
  countryOptions,
  irFilter,
  loiFilters,
  loiOptions,
  onCountryToggle,
  onIrChange,
  onLoiToggle,
  onSearchChange,
  onTypeToggle,
  search,
  sheetUrl,
  typeFilters,
  typeOptions,
}: VendorTableToolbarProps): JSX.Element {
  return (
    <div className="table-page-toolbar">
      <div className="table-page-toolbar-actions">
        <a
          className="table-link-button"
          href={sheetUrl}
          rel="noreferrer"
          target="_blank"
          title="Open Vendor List"
        >
          <BsBoxArrowUpRight size={14} />
        </a>

        <VendorFilterControls
          clearFilters={clearFilters}
          countryFilters={countryFilters}
          countryOptions={countryOptions}
          irFilter={irFilter}
          loiFilters={loiFilters}
          loiOptions={loiOptions}
          onCountryToggle={onCountryToggle}
          onIrChange={onIrChange}
          onLoiToggle={onLoiToggle}
          onTypeToggle={onTypeToggle}
          typeFilters={typeFilters}
          typeOptions={typeOptions}
        />

        <input
          className="table-page-search"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search all"
          value={search}
        />
      </div>
    </div>
  );
}
