import CreatableSelect from "react-select/creatable";
import { BsArrowClockwise, BsCheckLg, BsPencil, BsXLg } from "react-icons/bs";
import type { SingleValue, StylesConfig } from "react-select";

import { FormLabel } from "@/pages/Create/components/shared/FormLabel";
import { SectionCard } from "@/pages/Create/components/shared/SectionCard";
import type {
  CreateSelectOption,
  OsCalcRow,
  OsPanelState,
} from "@/pages/Create/types";
import {
  formatPercentDisplay,
  normalizeMarkupValue,
} from "@/pages/Create/utils/number";

type OsTotalCardProps = {
  activeCalcId: number | null;
  activePanel: OsPanelState;
  activeRows: OsCalcRow[];
  calcMenuOpen: boolean;
  isProposalEditing: boolean;
  markupOptions: CreateSelectOption[];
  onApplyCalcSelection: () => void;
  onCalcMarkupDraftChange: (value: string) => void;
  onCancelProposalEdit: () => void;
  onClear: () => void;
  onProposalDraftChange: (value: string) => void;
  onSaveProposalEdit: () => void;
  onSelectCalcRow: (rowId: number) => void;
  onStartProposalEdit: () => void;
  onToggleCalcMenu: () => void;
  proposalDraft: string;
  selectedMarkupOption: CreateSelectOption | null;
  setupSelectStyles: StylesConfig<CreateSelectOption, false>;
};

export function OsTotalCard({
  activeCalcId,
  activePanel,
  activeRows,
  calcMenuOpen,
  isProposalEditing,
  markupOptions,
  onApplyCalcSelection,
  onCalcMarkupDraftChange,
  onCancelProposalEdit,
  onClear,
  onProposalDraftChange,
  onSaveProposalEdit,
  onSelectCalcRow,
  onStartProposalEdit,
  onToggleCalcMenu,
  proposalDraft,
  selectedMarkupOption,
  setupSelectStyles,
}: OsTotalCardProps): JSX.Element {
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
          <div className="relative h-full" data-inline-dropdown>
            <button
              className="inline-flex h-full items-center justify-center rounded border border-slate-300 bg-white p-1.5 text-[10px] text-slate-700 hover:bg-slate-50"
              onClick={onToggleCalcMenu}
              type="button"
            >
              Calculate
            </button>
            {calcMenuOpen ? (
              <div className="absolute right-0 top-[calc(100%+6px)] z-40 w-55 rounded-lg border border-slate-200 bg-white p-2 shadow-xl">
                <div className="mb-2">
                  <label className="mb-1 block text-[12px] text-[#5b5b5b]">
                    Markup
                  </label>
                  <CreatableSelect<CreateSelectOption, false>
                    className="text-[13px]"
                    formatCreateLabel={(inputValue) =>
                      `Use "${normalizeMarkupValue(inputValue) || inputValue}"`
                    }
                    isClearable={false}
                    isSearchable
                    onChange={(nextValue: SingleValue<CreateSelectOption>) => {
                      onCalcMarkupDraftChange(nextValue?.value ?? "");
                    }}
                    onCreateOption={(inputValue) => {
                      onCalcMarkupDraftChange(normalizeMarkupValue(inputValue));
                    }}
                    options={markupOptions}
                    placeholder="Choose"
                    styles={setupSelectStyles}
                    value={selectedMarkupOption}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    className="rounded-[20px] bg-[#764cfc] px-3 py-1 text-[12px] text-white"
                    onClick={onApplyCalcSelection}
                    type="button"
                  >
                    Apply
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      }
      title="Total"
    >
      <div>
        <div className="mb-3 grid grid-cols-10 gap-2.5">
          <div className="relative col-span-12 h-[62.5px] rounded-[10px] border border-[#e6e6e6] px-3 py-2 md:col-span-2">
            <FormLabel type="card">Proposal CPI</FormLabel>
            {!isProposalEditing ? (
              <button
                className="absolute right-3 top-2.5 mb-1 text-[11px] text-slate-500 hover:text-[#764cfc]"
                onClick={onStartProposalEdit}
                type="button"
              >
                <BsPencil />
              </button>
            ) : null}
            {isProposalEditing ? (
              <div className="flex items-center gap-1">
                <input
                  className="h-6.5 w-full rounded border border-[#e4e4e4] px-1.5 text-[12px] outline-none transition focus:border-[#764cfc]"
                  onChange={(event) =>
                    onProposalDraftChange(event.target.value)
                  }
                  value={proposalDraft}
                />
                <button
                  className="text-[11px] text-slate-500 hover:text-[#764cfc]"
                  onClick={onSaveProposalEdit}
                  type="button"
                >
                  <BsCheckLg className="text-[11px]" />
                </button>
                <button
                  className="text-[11px] text-slate-500 hover:text-[#764cfc]"
                  onClick={onCancelProposalEdit}
                  type="button"
                >
                  <BsXLg className="text-[10px]" />
                </button>
              </div>
            ) : (
              <div className="text-[15px] font-medium text-[#3d3d43]">
                {activePanel.proposalCpi}
              </div>
            )}
          </div>
          <div className="col-span-12 rounded-[10px] border border-[#e6e6e6] px-3 py-2 md:col-span-2">
            <FormLabel type="card">Markup</FormLabel>
            <div className="text-[15px] font-medium text-[#3d3d43]">
              {activePanel.markUp}
            </div>
          </div>
          <div className="col-span-12 rounded-[10px] border border-[#e6e6e6] px-3 py-2 md:col-span-2">
            <FormLabel type="card">Sales</FormLabel>
            <div className="text-[15px] font-medium text-[#3d3d43]">
              {activePanel.expectedSales}
            </div>
          </div>
          <div className="col-span-12 rounded-[10px] border border-[#e6e6e6] px-3 py-2 md:col-span-2">
            <FormLabel type="card">GM (%)</FormLabel>
            <div className="text-[15px] font-medium text-[#3d3d43]">
              {formatPercentDisplay(activePanel.totalGMPer)}
            </div>
          </div>
          <div className="col-span-12 rounded-[10px] border border-[#e6e6e6] px-3 py-2 md:col-span-2">
            <FormLabel type="card">GM</FormLabel>
            <div className="text-[15px] font-medium text-[#3d3d43]">
              {activePanel.totalGM}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto text-[12px]">
          <table className="table table-sm table-hover mb-0 min-w-full">
            <thead>
              <tr className="border-b border-black/7.5 text-center">
                <th className="px-2 py-1 text-[13px] font-medium">#</th>
                <th className="px-2 py-1 text-[13px] font-medium">
                  Average CPI
                </th>
                <th className="px-2 py-1 text-[13px] font-medium">Markup</th>
                <th className="px-2 py-1 text-[13px] font-medium">
                  Proposal CPI
                </th>
                <th className="px-2 py-1 text-[13px] font-medium">
                  Feasibility
                </th>
                <th className="px-2 py-1 text-[13px] font-medium">Cost</th>
                <th className="px-2 py-1 text-[13px] font-medium">Sales</th>
                <th className="px-2 py-1 text-[13px] font-medium">GM (%)</th>
                <th className="px-2 py-1 text-[13px] font-medium">GM</th>
              </tr>
            </thead>
            <tbody className="text-[12px]">
              {activeRows.map((row) => (
                <tr
                  className={`cursor-pointer text-center hover:bg-slate-50 ${
                    activeCalcId === row.id ? "bg-[rgba(0,0,0,0.075)]" : ""
                  }`}
                  key={row.id}
                  onClick={() => onSelectCalcRow(row.id)}
                >
                  <td className="px-2 py-1">{row.id}</td>
                  <td className="px-2 py-1">{row.avgCpi}</td>
                  <td className="px-2 py-1">{row.markup}</td>
                  <td className="px-2 py-1">{row.proposalCpi}</td>
                  <td className="px-2 py-1">{row.feasibility}</td>
                  <td className="px-2 py-1">{row.cost}</td>
                  <td className="px-2 py-1">{row.sales}</td>
                  <td className="px-2 py-1">
                    {formatPercentDisplay(row.gmPer)}
                  </td>
                  <td className="px-2 py-1">{row.gm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SectionCard>
  );
}
