import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  BsArrowClockwise,
  BsChevronDown,
  BsChevronUp,
  BsFilter,
} from "react-icons/bs";

import type { FilterMenuKey } from "@/pages/List/types/list";

function FilterSection({
  children,
  count,
  label,
  onToggleOpen,
  open,
}: {
  children: ReactNode;
  count: number;
  label: string;
  onToggleOpen: () => void;
  open: boolean;
}): JSX.Element {
  return (
    <div className="table-filter-section">
      <button
        aria-expanded={open}
        className="table-filter-section-trigger"
        data-open={open ? "true" : "false"}
        onClick={onToggleOpen}
        type="button"
      >
        <span className="inline-flex items-center gap-1.5">
          <span>{label}</span>
          <span className="table-filter-subtotal">{count}</span>
        </span>
        {open ? <BsChevronUp size={12} /> : <BsChevronDown size={12} />}
      </button>

      {open ? <div className="table-filter-section-body">{children}</div> : null}
    </div>
  );
}

function FilterOptionList({
  emptyLabel,
  onToggle,
  options,
  selected,
}: {
  emptyLabel: string;
  onToggle: (value: string) => void;
  options: string[];
  selected: Set<string>;
}): JSX.Element {
  if (options.length === 0) {
    return <div className="table-filter-empty">{emptyLabel}</div>;
  }

  return (
    <div className="table-filter-list">
      {options.map((option) => (
        <label className="table-filter-option" key={option}>
          <input
            checked={selected.has(option)}
            className="mt-px accent-[#764cfc] size-3.5"
            onChange={() => onToggle(option)}
            type="checkbox"
          />
          <span className="min-w-0 wrap-break-word">{option}</span>
        </label>
      ))}
    </div>
  );
}

type ListFilterControlsProps = {
  clientOptions: string[];
  onClearFilters: () => void;
  onClientToggle: (value: string) => void;
  onOwnerToggle: (value: string) => void;
  onStatusToggle: (value: string) => void;
  ownerOptions: string[];
  selectedClients: Set<string>;
  selectedOwners: Set<string>;
  selectedStatuses: Set<string>;
  showStatusFilter?: boolean;
  statusOptions: string[];
};

export function ListFilterControls({
  clientOptions,
  onClearFilters,
  onClientToggle,
  onOwnerToggle,
  onStatusToggle,
  ownerOptions,
  selectedClients,
  selectedOwners,
  selectedStatuses,
  showStatusFilter = true,
  statusOptions,
}: ListFilterControlsProps): JSX.Element {
  const [filterOpen, setFilterOpen] = useState(false);
  const [expandedFilter, setExpandedFilter] =
    useState<FilterMenuKey | null>(showStatusFilter ? "status" : "owner");
  const [statusSearch, setStatusSearch] = useState("");
  const [ownerSearch, setOwnerSearch] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const filterMenuRef = useRef<HTMLDivElement | null>(null);

  const visibleStatusOptions = useMemo(() => {
    const keyword = statusSearch.trim().toLowerCase();
    if (!keyword) {
      return statusOptions;
    }

    return statusOptions.filter((option) =>
      option.toLowerCase().includes(keyword),
    );
  }, [statusOptions, statusSearch]);

  const visibleOwnerOptions = useMemo(() => {
    const keyword = ownerSearch.trim().toLowerCase();
    if (!keyword) {
      return ownerOptions;
    }

    return ownerOptions.filter((option) =>
      option.toLowerCase().includes(keyword),
    );
  }, [ownerOptions, ownerSearch]);

  const visibleClientOptions = useMemo(() => {
    const keyword = clientSearch.trim().toLowerCase();
    if (!keyword) {
      return clientOptions;
    }

    return clientOptions.filter((option) =>
      option.toLowerCase().includes(keyword),
    );
  }, [clientOptions, clientSearch]);

  const totalFilterCount =
    selectedStatuses.size + selectedOwners.size + selectedClients.size;

  useEffect(() => {
    if (!filterOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent): void {
      const target = event.target as Node;
      if (filterMenuRef.current?.contains(target)) {
        return;
      }

      setFilterOpen(false);
    }

    function handleEscape(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        setFilterOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [filterOpen]);

  useEffect(() => {
    if (!showStatusFilter && expandedFilter === "status") {
      setExpandedFilter("owner");
    }
  }, [expandedFilter, showStatusFilter]);

  function handleToggleFilterDropdown(): void {
    setFilterOpen((current) => !current);
    setExpandedFilter((current) =>
      current ?? (showStatusFilter ? "status" : "owner"),
    );
  }

  function handleToggleFilterSection(section: FilterMenuKey): void {
    setExpandedFilter((current) => (current === section ? null : section));
  }

  function handleClearFilters(): void {
    onClearFilters();
    setStatusSearch("");
    setOwnerSearch("");
    setClientSearch("");
  }

  return (
    <div className="relative" ref={filterMenuRef}>
      <button
        aria-expanded={filterOpen}
        className="table-filter-trigger"
        data-open={filterOpen ? "true" : "false"}
        onClick={handleToggleFilterDropdown}
        type="button"
      >
        <BsFilter className="text-[13px]" />
        <span>Filters</span>
        <span className="table-filter-count">{totalFilterCount}</span>
      </button>

      {filterOpen ? (
        <div className="table-filter-panel list-page-filter-panel">
          <div className="table-filter-panel-header">
            <span className="text-[13px] font-medium text-[#3d3d43]">
              Filters
            </span>
            <button
              className="table-filter-clear-button"
              onClick={handleClearFilters}
              type="button"
            >
              <BsArrowClockwise size={12} />
            </button>
          </div>

          <div className="table-filter-panel-content">
            {showStatusFilter ? (
              <FilterSection
                count={selectedStatuses.size}
                label="Status"
                onToggleOpen={() => handleToggleFilterSection("status")}
                open={expandedFilter === "status"}
              >
                <input
                  className="table-filter-search"
                  onChange={(event) => setStatusSearch(event.target.value)}
                  placeholder="Search status"
                  value={statusSearch}
                />
                <FilterOptionList
                  emptyLabel="No statuses"
                  onToggle={onStatusToggle}
                  options={visibleStatusOptions}
                  selected={selectedStatuses}
                />
              </FilterSection>
            ) : null}

            <FilterSection
              count={selectedOwners.size}
              label="Owner"
              onToggleOpen={() => handleToggleFilterSection("owner")}
              open={expandedFilter === "owner"}
            >
              <input
                className="table-filter-search"
                onChange={(event) => setOwnerSearch(event.target.value)}
                placeholder="Search owner"
                value={ownerSearch}
              />
              <FilterOptionList
                emptyLabel="No owners"
                onToggle={onOwnerToggle}
                options={visibleOwnerOptions}
                selected={selectedOwners}
              />
            </FilterSection>

            <FilterSection
              count={selectedClients.size}
              label="Client"
              onToggleOpen={() => handleToggleFilterSection("client")}
              open={expandedFilter === "client"}
            >
              <input
                className="table-filter-search"
                onChange={(event) => setClientSearch(event.target.value)}
                placeholder="Search client"
                value={clientSearch}
              />
              <FilterOptionList
                emptyLabel="No clients"
                onToggle={onClientToggle}
                options={visibleClientOptions}
                selected={selectedClients}
              />
            </FilterSection>
          </div>
        </div>
      ) : null}
    </div>
  );
}
