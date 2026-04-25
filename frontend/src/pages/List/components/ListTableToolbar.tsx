import { BsBoxArrowUpRight } from "react-icons/bs";

import { DateRangeControl } from "@/pages/Home/components/DateRangeControl";
import type { DateRangeValue } from "@/pages/Home/types/home";
import { formatRange } from "@/pages/Home/utils/date";
import { ListFilterControls } from "@/pages/List/components/ListFilterControls";
import type { ListMode } from "@/pages/List/types/list";

type ListTableToolbarProps = {
  clientOptions: string[];
  mode: ListMode;
  onClearFilters: () => void;
  onClientToggle: (value: string) => void;
  onOwnerToggle: (value: string) => void;
  onRangeChange: (range: DateRangeValue) => void;
  onSearchChange: (value: string) => void;
  onStatusToggle: (value: string) => void;
  ownerOptions: string[];
  range: DateRangeValue;
  search: string;
  selectedClients: Set<string>;
  selectedOwners: Set<string>;
  selectedStatuses: Set<string>;
  sheetTitle?: string;
  sheetUrl: string;
  showStatusFilter?: boolean;
  statusOptions: string[];
};

export function ListTableToolbar({
  clientOptions,
  mode,
  onClearFilters,
  onClientToggle,
  onOwnerToggle,
  onRangeChange,
  onSearchChange,
  onStatusToggle,
  ownerOptions,
  range,
  search,
  selectedClients,
  selectedOwners,
  selectedStatuses,
  sheetTitle,
  sheetUrl,
  showStatusFilter = true,
  statusOptions,
}: ListTableToolbarProps): JSX.Element {
  return (
    <div className="table-page-toolbar">
      <div className="table-page-toolbar-actions">
        <a
          className="table-link-button"
          href={sheetUrl}
          rel="noreferrer"
          target="_blank"
          title={sheetTitle ?? `Open ${mode} RFQ List`}
        >
          <BsBoxArrowUpRight size={14} />
        </a>

        <DateRangeControl
          id={`selectListDateRange-${mode}`}
          label={formatRange(range)}
          onApply={onRangeChange}
          range={range}
        />

        <ListFilterControls
          clientOptions={clientOptions}
          onClearFilters={onClearFilters}
          onClientToggle={onClientToggle}
          onOwnerToggle={onOwnerToggle}
          onStatusToggle={onStatusToggle}
          ownerOptions={ownerOptions}
          selectedClients={selectedClients}
          selectedOwners={selectedOwners}
          selectedStatuses={selectedStatuses}
          showStatusFilter={showStatusFilter}
          statusOptions={statusOptions}
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
