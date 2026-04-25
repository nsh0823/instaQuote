import Select, { type SingleValue, type StylesConfig } from "react-select";
import { BsArrowClockwise } from "react-icons/bs";

import { FormLabel } from "@/pages/Create/components/shared/FormLabel";
import { SectionCard } from "@/pages/Create/components/shared/SectionCard";
import type {
  CreateSelectOption,
  OsPanelState,
  VendorEntry,
} from "@/pages/Create/types";
import { t } from "@/utils/lang";

type OsVendorsCardProps = {
  activePanel: OsPanelState;
  lang: string;
  onClear: () => void;
  onOpenVendorModal: () => void;
  onVendorFieldChange: (
    vendorIndex: number,
    field: keyof VendorEntry,
    value: string,
  ) => void;
  onVendorUsageCountChange: (count: number) => void;
  selectMenuPortalTarget?: HTMLElement;
  setupSelectStyles: StylesConfig<CreateSelectOption, false>;
};

const vendorUsageOptions: CreateSelectOption[] = [1, 2, 3, 4, 5].map(
  (count) => ({
    label: String(count),
    value: String(count),
  }),
);

export function OsVendorsCard({
  activePanel,
  lang,
  onClear,
  onOpenVendorModal,
  onVendorFieldChange,
  onVendorUsageCountChange,
  selectMenuPortalTarget,
  setupSelectStyles,
}: OsVendorsCardProps): JSX.Element {
  return (
    <SectionCard
      action={
        <div className="flex h-7 items-center gap-1">
          <button
            className="inline-flex h-full w-7 items-center justify-center rounded border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            onClick={onClear}
            type="button"
          >
            <BsArrowClockwise className="text-[14px]" />
          </button>
          <button
            className="inline-flex h-full items-center justify-center rounded border border-slate-300 bg-white px-2 text-[10px] text-slate-700 hover:bg-slate-50"
            onClick={onOpenVendorModal}
            type="button"
          >
            Select
          </button>
        </div>
      }
      title="Vendors"
    >
      <div>
        <div className="mb-3 grid grid-cols-10 gap-2.5">
          <div className="col-span-12 h-[62.5px] rounded-[10px] border border-[#e6e6e6] px-3 py-2 md:col-span-2">
            <FormLabel type="card">Average CPI</FormLabel>
            <div className="text-[15px] font-medium text-[#3d3d43]">
              {activePanel.averageVendorCpi}
            </div>
          </div>
          <div className="col-span-12 rounded-[10px] border border-[#e6e6e6] px-3 py-2 md:col-span-2">
            <FormLabel type="card">Target sample</FormLabel>
            <div className="text-[15px] font-medium text-[#3d3d43]">
              {activePanel.totalTargetSample}
            </div>
          </div>
          <div className="col-span-12 rounded-[10px] border border-[#e6e6e6] px-3 py-2 md:col-span-2">
            <FormLabel type="card">Feasibility</FormLabel>
            <div className="text-[15px] font-medium text-[#3d3d43]">
              {activePanel.totalVendorFeasibility}
            </div>
          </div>
          <div className="col-span-12 rounded-[10px] border border-[#e6e6e6] px-3 py-2 md:col-span-2">
            <FormLabel type="card">Cost</FormLabel>
            <div className="text-[15px] font-medium text-[#3d3d43]">
              {activePanel.totalVendorCosts}
            </div>
          </div>
          <div className="col-span-12 md:col-span-2 md:col-start-11">
            <Select<CreateSelectOption, false>
              className="text-[13px]"
              isSearchable={false}
              menuPortalTarget={selectMenuPortalTarget}
              onChange={(nextValue: SingleValue<CreateSelectOption>) => {
                const next =
                  Number.parseInt(nextValue?.value ?? "1", 10) || 1;
                onVendorUsageCountChange(next);
              }}
              options={vendorUsageOptions}
              styles={setupSelectStyles}
              value={{
                label: String(activePanel.vendorUsageCount),
                value: String(activePanel.vendorUsageCount),
              }}
            />
          </div>
        </div>

        <div className="space-y-2">
          {activePanel.vendors.map((vendor, index) => (
            <fieldset
              className={`${index >= activePanel.vendorUsageCount ? "hidden" : ""} rounded-[10px] border border-[#e6e6e6] px-3 pb-2 pt-0`}
              key={index}
            >
              <legend className="w-auto px-2.5 text-[13px] font-medium">
                Vendor {index + 1}
              </legend>
              <div className="grid grid-cols-12 gap-2.5">
                <div className="col-span-12 md:col-span-2">
                  <FormLabel>{t(lang, "업체명", "Vendor name")}</FormLabel>
                  <input
                    className="h-7.75 w-full rounded-lg border border-[#e4e4e4] px-2 text-[13px] outline-none transition focus:border-[#764cfc]"
                    onChange={(event) =>
                      onVendorFieldChange(index, "name", event.target.value)
                    }
                    value={vendor.name}
                  />
                </div>
                <div className="col-span-6 md:col-span-1">
                  <FormLabel>IR</FormLabel>
                  <input
                    className="h-7.75 w-full rounded-lg border border-[#e4e4e4] px-2 text-[13px] outline-none transition focus:border-[#764cfc]"
                    onChange={(event) =>
                      onVendorFieldChange(index, "irFrom", event.target.value)
                    }
                    value={vendor.irFrom}
                  />
                </div>
                <div className="relative col-span-6 after:absolute after:right-12.5 after:top-3/4 after:-translate-y-3/4 after:text-[13px] after:text-slate-500 after:content-['~'] md:col-span-1">
                  <span className="invisible">
                    <FormLabel>IR</FormLabel>
                  </span>
                  <input
                    className="h-7.75 w-full rounded-lg border border-[#e4e4e4] px-2 text-[13px] outline-none transition focus:border-[#764cfc]"
                    onChange={(event) =>
                      onVendorFieldChange(index, "irTo", event.target.value)
                    }
                    value={vendor.irTo}
                  />
                </div>
                <div className="col-span-12 md:col-span-2">
                  <FormLabel>{t(lang, "가능수", "Feasibility")}</FormLabel>
                  <input
                    className="h-7.75 w-full rounded-lg border border-[#e4e4e4] px-2 text-[13px] outline-none transition focus:border-[#764cfc]"
                    onChange={(event) =>
                      onVendorFieldChange(
                        index,
                        "feasibility",
                        event.target.value,
                      )
                    }
                    value={vendor.feasibility}
                  />
                </div>
                <div className="col-span-12 md:col-span-2">
                  <FormLabel>CPI ({vendor.currency || "-"})</FormLabel>
                  <input
                    className="h-7.75 w-full rounded-lg border border-[#e4e4e4] px-2 text-[13px] outline-none transition focus:border-[#764cfc]"
                    onChange={(event) =>
                      onVendorFieldChange(index, "cpi", event.target.value)
                    }
                    value={vendor.cpi}
                  />
                </div>
                <div className="col-span-12 md:col-span-2">
                  <FormLabel>CPI (KRW)</FormLabel>
                  <input
                    className="h-7.75 w-full rounded-lg border border-[#e4e4e4] px-2 text-[13px] outline-none transition focus:border-[#764cfc]"
                    onChange={(event) =>
                      onVendorFieldChange(index, "cpiKrw", event.target.value)
                    }
                    value={vendor.cpiKrw}
                  />
                </div>
                <div className="col-span-12 md:col-span-2">
                  <FormLabel>{t(lang, "비용", "Costs")}</FormLabel>
                  <input
                    className="h-7.75 w-full rounded-lg border border-[#e4e4e4] px-2 text-[13px] outline-none transition focus:border-[#764cfc]"
                    onChange={(event) =>
                      onVendorFieldChange(index, "cost", event.target.value)
                    }
                    value={vendor.cost}
                  />
                </div>
              </div>
            </fieldset>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
