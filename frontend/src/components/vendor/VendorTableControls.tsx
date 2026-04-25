import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  BsArrowClockwise,
  BsChevronDown,
  BsChevronUp,
  BsFilter,
} from "react-icons/bs";

import { Checkbox } from "@/components/ui/checkbox";
import { normalizeIntegerInput } from "@/pages/Create/utils/number";

type VendorFilterMenuKey = "country" | "type" | "loi" | "ir";

type VendorFilterSectionProps = {
  children: ReactNode;
  count: number;
  label: string;
  onToggleOpen: () => void;
  open: boolean;
};

export type VendorFilterControlsProps = {
  clearFilters: () => void;
  countryFilters: string[];
  countryOptions: string[];
  irFilter: string;
  loiFilters: string[];
  loiOptions: string[];
  onCountryToggle: (value: string, checked: boolean) => void;
  onIrChange: (value: string) => void;
  onLoiToggle: (value: string, checked: boolean) => void;
  onTypeToggle: (value: string, checked: boolean) => void;
  typeFilters: string[];
  typeOptions: string[];
};

export function normalizeVendorType(value: string): string {
  const lower = value.toLowerCase();
  if (lower.includes("random")) {
    return "random";
  }
  if (lower.includes("booster")) {
    return "booster";
  }
  return value.trim().toLowerCase();
}

function VendorFilterSection({
  children,
  count,
  label,
  onToggleOpen,
  open,
}: VendorFilterSectionProps): JSX.Element {
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

      {open ? (
        <div className="table-filter-section-body">{children}</div>
      ) : null}
    </div>
  );
}

export function VendorFilterControls({
  clearFilters,
  countryFilters,
  countryOptions,
  irFilter,
  loiFilters,
  loiOptions,
  onCountryToggle,
  onIrChange,
  onLoiToggle,
  onTypeToggle,
  typeFilters,
  typeOptions,
}: VendorFilterControlsProps): JSX.Element {
  const [filterOpen, setFilterOpen] = useState(false);
  const [expandedFilter, setExpandedFilter] =
    useState<VendorFilterMenuKey | null>(null);
  const [countrySearch, setCountrySearch] = useState("");
  const [typeSearch, setTypeSearch] = useState("");
  const [loiSearch, setLoiSearch] = useState("");
  const filterMenuRef = useRef<HTMLDivElement | null>(null);

  const visibleCountryOptions = useMemo(() => {
    const keyword = countrySearch.trim().toLowerCase();
    if (!keyword) {
      return countryOptions;
    }

    return countryOptions.filter((option) =>
      option.toLowerCase().includes(keyword),
    );
  }, [countryOptions, countrySearch]);

  const visibleTypeOptions = useMemo(() => {
    const keyword = typeSearch.trim().toLowerCase();
    if (!keyword) {
      return typeOptions;
    }

    return typeOptions.filter((option) =>
      option.toLowerCase().includes(keyword),
    );
  }, [typeOptions, typeSearch]);

  const visibleLoiOptions = useMemo(() => {
    const keyword = loiSearch.trim().toLowerCase();
    if (!keyword) {
      return loiOptions;
    }

    return loiOptions.filter((option) =>
      option.toLowerCase().includes(keyword),
    );
  }, [loiOptions, loiSearch]);

  const filterCount =
    countryFilters.length +
    typeFilters.length +
    loiFilters.length +
    (irFilter.trim() ? 1 : 0);

  useEffect(() => {
    if (!filterOpen) {
      return;
    }

    function handleOutside(event: MouseEvent): void {
      const target = event.target as HTMLElement;
      if (filterMenuRef.current && filterMenuRef.current.contains(target)) {
        return;
      }

      setFilterOpen(false);
      setExpandedFilter(null);
    }

    document.addEventListener("mousedown", handleOutside);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
    };
  }, [filterOpen]);

  function toggleFilterDropdown(): void {
    setFilterOpen((prev) => {
      const next = !prev;
      if (!next) {
        setExpandedFilter(null);
      }
      return next;
    });
  }

  function toggleFilterMenu(menu: VendorFilterMenuKey): void {
    setExpandedFilter((prev) => (prev === menu ? null : menu));
  }

  function handleClearFilters(): void {
    clearFilters();
    setCountrySearch("");
    setTypeSearch("");
    setLoiSearch("");
  }

  return (
    <div className="relative" ref={filterMenuRef}>
      <button
        aria-expanded={filterOpen}
        className="table-filter-trigger"
        data-open={filterOpen ? "true" : "false"}
        onClick={toggleFilterDropdown}
        type="button"
      >
        <BsFilter className="text-[13px]" />
        <span>Filters</span>
        <span className="table-filter-count">{filterCount}</span>
      </button>

      {filterOpen ? (
        <div className="table-filter-panel">
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
            <VendorFilterSection
              count={countryFilters.length}
              label="Country"
              onToggleOpen={() => toggleFilterMenu("country")}
              open={expandedFilter === "country"}
            >
              <input
                className="table-filter-search"
                onChange={(event) => setCountrySearch(event.target.value)}
                placeholder="Search country"
                value={countrySearch}
              />
              <div className="table-filter-list">
                {visibleCountryOptions.length === 0 ? (
                  <div className="table-filter-empty">No countries</div>
                ) : (
                  visibleCountryOptions.map((option) => {
                    const checked = countryFilters.includes(option);

                    return (
                      <label className="table-filter-option" key={option}>
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(nextChecked) => {
                            onCountryToggle(option, Boolean(nextChecked));
                          }}
                        />
                        <span className="min-w-0 wrap-break-word">{option}</span>
                      </label>
                    );
                  })
                )}
              </div>
            </VendorFilterSection>

            <VendorFilterSection
              count={typeFilters.length}
              label="Type"
              onToggleOpen={() => toggleFilterMenu("type")}
              open={expandedFilter === "type"}
            >
              <input
                className="table-filter-search"
                onChange={(event) => setTypeSearch(event.target.value)}
                placeholder="Search type"
                value={typeSearch}
              />
              <div className="table-filter-list">
                {visibleTypeOptions.length === 0 ? (
                  <div className="table-filter-empty">No types</div>
                ) : (
                  visibleTypeOptions.map((option) => {
                    const checked = typeFilters.includes(option);

                    return (
                      <label className="table-filter-option" key={option}>
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(nextChecked) => {
                            onTypeToggle(option, Boolean(nextChecked));
                          }}
                        />
                        <span className="min-w-0 wrap-break-word">{option}</span>
                      </label>
                    );
                  })
                )}
              </div>
            </VendorFilterSection>

            <VendorFilterSection
              count={loiFilters.length}
              label="LOI"
              onToggleOpen={() => toggleFilterMenu("loi")}
              open={expandedFilter === "loi"}
            >
              <input
                className="table-filter-search"
                onChange={(event) => setLoiSearch(event.target.value)}
                placeholder="Search loi"
                value={loiSearch}
              />
              <div className="table-filter-list">
                {visibleLoiOptions.length === 0 ? (
                  <div className="table-filter-empty">No LOI values</div>
                ) : (
                  visibleLoiOptions.map((option) => {
                    const checked = loiFilters.includes(option);

                    return (
                      <label className="table-filter-option" key={option}>
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(nextChecked) => {
                            onLoiToggle(option, Boolean(nextChecked));
                          }}
                        />
                        <span className="min-w-0 wrap-break-word">{option}</span>
                      </label>
                    );
                  })
                )}
              </div>
            </VendorFilterSection>

            <VendorFilterSection
              count={irFilter.trim() ? 1 : 0}
              label="IR"
              onToggleOpen={() => toggleFilterMenu("ir")}
              open={expandedFilter === "ir"}
            >
              <input
                className="table-filter-search"
                inputMode="numeric"
                maxLength={3}
                onChange={(event) =>
                  onIrChange(normalizeIntegerInput(event.target.value))
                }
                placeholder="Search IR"
                value={irFilter}
              />
            </VendorFilterSection>
          </div>
        </div>
      ) : null}
    </div>
  );
}
