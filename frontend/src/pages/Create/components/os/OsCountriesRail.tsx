import Select, {
  type FilterOptionOption,
  type MultiValue,
  type StylesConfig,
} from "react-select";
import { BsCheckLg, BsThreeDotsVertical, BsXLg } from "react-icons/bs";

import { useCountriesRailLayout } from "@/pages/Create/hooks/useCountriesRailLayout";
import { OsCountriesSubtotalCard } from "@/pages/Create/components/os/OsCountriesSubtotalCard";
import type { CreateSelectOption, OsPanelState } from "@/pages/Create/types";
import { formatPercentDisplay } from "@/pages/Create/utils/number";
import { splitGid } from "@/pages/Create/utils/os-panels";
import { t } from "@/utils/lang";

type OsCountriesRailProps = {
  activePanelId: string;
  addCountryOpen: boolean;
  addCountryOptions: CreateSelectOption[];
  addCountrySelectionCount: number;
  countryMenuOpenId: string | null;
  filterCountryOption: (
    candidate: FilterOptionOption<CreateSelectOption>,
    input: string,
  ) => boolean;
  finalGM: number;
  finalGMPer: string;
  finalProgramming: string;
  finalSales: number;
  formatCountryOption: (option: CreateSelectOption) => JSX.Element;
  inlineMultiSelectStyles: StylesConfig<CreateSelectOption, true>;
  lang: string;
  onAddCountries: () => void;
  onAddCountrySelectionChange: (values: string[]) => void;
  onFinalProgrammingChange: (value: string) => void;
  onPanelSelect: (panelId: string) => void;
  onRenamingValueChange: (value: string) => void;
  onRenameCancel: () => void;
  onRenameSave: () => void;
  onToggleAddCountry: () => void;
  onToggleCountryMenu: (panelId: string, rect: DOMRect) => void;
  osPanels: OsPanelState[];
  renamingPanelId: string | null;
  renamingValue: string;
  selectedAddCountryOptions: CreateSelectOption[];
  totalOther: number;
  totalOverlay: number;
};

export function OsCountriesRail({
  activePanelId,
  addCountryOpen,
  addCountryOptions,
  addCountrySelectionCount,
  countryMenuOpenId,
  filterCountryOption,
  finalGM,
  finalGMPer,
  finalProgramming,
  finalSales,
  formatCountryOption,
  inlineMultiSelectStyles,
  lang,
  onAddCountries,
  onAddCountrySelectionChange,
  onFinalProgrammingChange,
  onPanelSelect,
  onRenamingValueChange,
  onRenameCancel,
  onRenameSave,
  onToggleAddCountry,
  onToggleCountryMenu,
  osPanels,
  renamingPanelId,
  renamingValue,
  selectedAddCountryOptions,
  totalOther,
  totalOverlay,
}: OsCountriesRailProps): JSX.Element {
  const { countriesRailStyle, countriesRailWrapperRef } =
    useCountriesRailLayout(activePanelId, osPanels.length);

  return (
    <div
      className="col-span-12 lg:col-span-4 lg:min-h-[calc(100vh-92.5px)]"
      ref={countriesRailWrapperRef}
      style={{ paddingLeft: 8, paddingRight: 8 }}
    >
      <section
        className="flex min-h-105 flex-col rounded-[10px] border border-black/7.5 bg-white shadow-sm transition-[height,top,left,width] duration-500 ease-in-out will-change-[height] lg:min-h-0 lg:h-[calc(100vh-92.5px)]"
        style={
          countriesRailStyle
            ? {
                height: countriesRailStyle.height,
                left: countriesRailStyle.left,
                position: "fixed",
                top: countriesRailStyle.top,
                width: countriesRailStyle.width,
              }
            : undefined
        }
      >
        <div className="flex items-center border-b border-black/7.5 p-3">
          <div className="text-[1.2rem] font-medium text-[#3d3d43]">
            Countries
          </div>
          <div className="relative ml-auto" data-inline-dropdown>
            <button
              className="inline-flex h-7 items-center justify-center rounded border border-slate-300 bg-white px-2 text-[10px] text-slate-700 hover:bg-slate-50"
              onClick={onToggleAddCountry}
              type="button"
            >
              Add
            </button>
            {addCountryOpen ? (
              <div className="absolute right-0 top-[calc(100%+6px)] z-40 w-70 rounded-lg border border-slate-200 bg-white p-2 shadow-xl">
                <div className="mb-2 text-[12px] text-[#5b5b5b]">
                  {t(
                    lang,
                    "추가할 국가를 선택하세요",
                    "Choose countries to add",
                  )}
                </div>
                <Select<CreateSelectOption, true>
                  className="text-[13px]"
                  closeMenuOnSelect={false}
                  controlShouldRenderValue={false}
                  filterOption={filterCountryOption}
                  formatOptionLabel={formatCountryOption}
                  hideSelectedOptions={false}
                  isMulti
                  onChange={(nextValue: MultiValue<CreateSelectOption>) => {
                    onAddCountrySelectionChange(
                      nextValue.map((option) => option.value),
                    );
                  }}
                  options={addCountryOptions}
                  placeholder={
                    addCountrySelectionCount > 0
                      ? `${addCountrySelectionCount} selected`
                      : t(lang, "선택", "Choose")
                  }
                  styles={inlineMultiSelectStyles}
                  value={selectedAddCountryOptions}
                />
                <div className="mt-2 flex justify-end">
                  <button
                    className="rounded-[20px] bg-[#764cfc] px-3 py-1 text-[12px] text-white"
                    onClick={onAddCountries}
                    type="button"
                  >
                    Add
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {osPanels.map((panel) => {
            const isActive = panel.id === activePanelId;
            const isMenuOpen = countryMenuOpenId === panel.id;
            const baseFlagCode = splitGid(panel.gid).base;

            return (
              <div className="os-country-card px-[0.8rem] py-0.5" key={panel.id}>
                <div className="group relative">
                  <button
                    className={`grid min-h-17.5 w-full grid-cols-[35px_minmax(0,1fr)] grid-rows-[22.5px_28.5px] items-center rounded-[10px] px-3 py-[0.6rem] text-left transition ${
                      isActive
                        ? "border-l-4 border-[#6535ff]/80 bg-[rgba(126,48,203,0.07)] pl-2.25"
                        : "border-l-4 border-transparent bg-white hover:bg-[#f8f9fa]"
                    }`}
                    onClick={() => onPanelSelect(panel.id)}
                    type="button"
                  >
                    <img
                      alt={panel.country}
                      className="row-span-2 self-center size-7.5"
                      src={`https://hatscripts.github.io/circle-flags/flags/${baseFlagCode}.svg`}
                    />
                    {renamingPanelId === panel.id ? (
                      <div className="col-start-2 row-start-1 mb-1 flex items-center gap-1 pl-1 pr-7">
                        <input
                          className="h-6.5 w-full rounded border border-[#e4e4e4] px-1.5 text-[12px] outline-none transition focus:border-[#764cfc]"
                          onChange={(event) =>
                            onRenamingValueChange(event.target.value)
                          }
                          onClick={(event) => event.stopPropagation()}
                          value={renamingValue}
                        />
                        <button
                          className="text-[11px] text-slate-500 hover:text-[#764cfc]"
                          onClick={(event) => {
                            event.stopPropagation();
                            onRenameSave();
                          }}
                          type="button"
                        >
                          <BsCheckLg className="text-[11px]" />
                        </button>
                        <button
                          className="text-[11px] text-slate-500 hover:text-[#764cfc]"
                          onClick={(event) => {
                            event.stopPropagation();
                            onRenameCancel();
                          }}
                          type="button"
                        >
                          <BsXLg className="text-[10px]" />
                        </button>
                      </div>
                    ) : (
                      <div
                        className={`col-start-2 row-start-1 mb-1 truncate pl-1 pr-7 text-[13px] ${
                          isActive
                            ? "font-medium text-[#6535ff]"
                            : "text-[#3d3d43]"
                        }`}
                      >
                        {panel.countryRename}
                      </div>
                    )}
                    <div className="col-start-2 row-start-2 overflow-hidden pl-1 pr-7">
                      <table
                        className={`w-full table-fixed text-[10px] ${
                          isActive ? "text-[#6535ff]" : ""
                        }`}
                      >
                        <thead>
                          <tr
                            className={
                              isActive
                                ? "text-[#6535ff]"
                                : "text-[#5b5b5b] opacity-70"
                            }
                          >
                            <th className="px-0 text-left font-normal">CPI</th>
                            <th className="px-0 text-left font-normal">MU</th>
                            <th className="px-0 text-left font-normal">Sales</th>
                            <th className="px-0 text-left font-normal">
                              GM (%)
                            </th>
                            <th className="px-0 text-left font-normal">GM</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            className={`text-[10px] font-medium ${
                              isActive ? "text-[#6535ff]" : "text-[#3d3d43]"
                            }`}
                          >
                            <td className="truncate px-0">{panel.proposalCpi}</td>
                            <td className="truncate px-0">{panel.markUp}</td>
                            <td className="truncate px-0">{panel.expectedSales}</td>
                            <td className="truncate px-0">
                              {formatPercentDisplay(panel.totalGMPer)}
                            </td>
                            <td className="truncate px-0">{panel.totalGM}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </button>

                  <button
                    className={`absolute right-3.25 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-500 transition hover:bg-slate-100 ${
                      isMenuOpen || isActive
                        ? "opacity-100"
                        : "pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100"
                    }`}
                    data-country-menu
                    onClick={(event) => {
                      onToggleCountryMenu(
                        panel.id,
                        event.currentTarget.getBoundingClientRect(),
                      );
                    }}
                    type="button"
                  >
                    <BsThreeDotsVertical className="text-[14px]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <OsCountriesSubtotalCard
          finalGM={finalGM}
          finalGMPer={finalGMPer}
          finalProgramming={finalProgramming}
          finalSales={finalSales}
          onFinalProgrammingChange={onFinalProgrammingChange}
          totalOther={totalOther}
          totalOverlay={totalOverlay}
        />
      </section>
    </div>
  );
}
