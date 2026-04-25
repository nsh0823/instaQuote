import Select, {
  type FilterOptionOption,
  type GroupBase,
  type MultiValue,
  type SingleValue,
  type StylesConfig,
} from "react-select";
import { BsCloudArrowDown, BsEnvelopeArrowDown } from "react-icons/bs";

import { FormLabel } from "@/pages/Create/components/shared/FormLabel";
import { LegacyDateInput } from "@/pages/Create/components/shared/LegacyDateInput";
import type { CreateSelectOption, OsSetupState } from "@/pages/Create/types";
import { normalizeIntegerInput } from "@/pages/Create/utils/number";
import { t } from "@/utils/lang";

type OsSetupField = Exclude<keyof OsSetupState, "selectedCountries">;

type OsSetupModalProps = {
  filterSetupCountryOption: (
    candidate: FilterOptionOption<CreateSelectOption>,
    input: string,
  ) => boolean;
  formatCountryWithFlag: (option: CreateSelectOption) => JSX.Element;
  gmailSuggestions: string[];
  groupedClientOptions: Array<GroupBase<CreateSelectOption>>;
  isOpen: boolean;
  lang: string;
  onApplySetupGmailSuggestion: (value: string) => void;
  onCountriesChange: (values: string[]) => void;
  onCreate: () => void;
  onRefreshCountryList: () => void;
  onRefreshGmailList: () => void;
  onSetupFieldChange: (field: OsSetupField, value: string) => void;
  osSetup: OsSetupState;
  ownerOptions: CreateSelectOption[];
  projectTypeOptions: CreateSelectOption[];
  refreshingGmail: boolean;
  samplingTypeOptions: CreateSelectOption[];
  selectedSetupClientOption: CreateSelectOption | null;
  selectedSetupCountryOptions: CreateSelectOption[];
  selectedSetupOwnerOption: CreateSelectOption | null;
  selectedSetupProjectTypeOption: CreateSelectOption | null;
  selectedSetupSamplingTypeOption: CreateSelectOption | null;
  selectMenuPortalTarget?: HTMLElement;
  setupConnectedMultiSelectStyles: StylesConfig<CreateSelectOption, true>;
  setupCountryOptions: CreateSelectOption[];
  setupSelectStyles: StylesConfig<CreateSelectOption, false>;
  showCountryRefreshSpinner: boolean;
};

export function OsSetupModal({
  filterSetupCountryOption,
  formatCountryWithFlag,
  gmailSuggestions,
  groupedClientOptions,
  isOpen,
  lang,
  onApplySetupGmailSuggestion,
  onCountriesChange,
  onCreate,
  onRefreshCountryList,
  onRefreshGmailList,
  onSetupFieldChange,
  osSetup,
  ownerOptions,
  projectTypeOptions,
  refreshingGmail,
  samplingTypeOptions,
  selectedSetupClientOption,
  selectedSetupCountryOptions,
  selectedSetupOwnerOption,
  selectedSetupProjectTypeOption,
  selectedSetupSamplingTypeOption,
  selectMenuPortalTarget,
  setupConnectedMultiSelectStyles,
  setupCountryOptions,
  setupSelectStyles,
  showCountryRefreshSpinner,
}: OsSetupModalProps): JSX.Element | null {
  if (!isOpen) {
    return null;
  }

  const suggestionsId = "os-gmail-suggestions";

  return (
    <>
      <div className="fixed inset-0 z-9996 flex items-center justify-center bg-black/40 px-4">
        <div className="w-full max-w-150 overflow-hidden rounded-[10px] border border-black/5 bg-white shadow-2xl">
          <div className="border-b border-black/7.5 px-4 py-3">
            <h2 className="text-[20px] font-medium text-[#3d3d43]">
              Form for all countries
            </h2>
            <p className="text-[13px] text-[#5b5b5b]">
              Below information will be applied to each form of chosen
              countries.
            </p>
          </div>
          <div className="max-h-[70vh] overflow-auto p-4">
            <section className="rounded-[10px] border border-black/7.5 bg-white p-3 shadow-sm">
              <div className="mb-2 flex items-center">
                <FormLabel required>{t(lang, "국가", "Country")}</FormLabel>
                {osSetup.selectedCountries.length > 0 ? (
                  <span className="ml-auto text-[12px] text-[#6535ff]">
                    {osSetup.selectedCountries.length} selected
                  </span>
                ) : null}
              </div>
              <div className="flex">
                <div className="w-full">
                  <Select<CreateSelectOption, true>
                    className="text-[13px]"
                    closeMenuOnSelect={false}
                    filterOption={filterSetupCountryOption}
                    formatOptionLabel={formatCountryWithFlag}
                    hideSelectedOptions={false}
                    isMulti
                    isSearchable
                    menuPortalTarget={selectMenuPortalTarget}
                    onChange={(nextValue: MultiValue<CreateSelectOption>) => {
                      onCountriesChange(nextValue.map((option) => option.value));
                    }}
                    options={setupCountryOptions}
                    placeholder="Choose"
                    styles={setupConnectedMultiSelectStyles}
                    value={selectedSetupCountryOptions}
                  />
                </div>
                <button
                  className="inline-flex h-7.75 items-center justify-center rounded-r-lg border border-[#e4e4e4] px-2 text-slate-500 hover:bg-slate-50"
                  onClick={onRefreshCountryList}
                  type="button"
                >
                  {showCountryRefreshSpinner ? (
                    <span className="animate-spin rounded-full border-2 border-slate-300 border-t-slate-600 size-3.5" />
                  ) : (
                    <BsCloudArrowDown className="text-[18px]" />
                  )}
                </button>
              </div>
            </section>

            <section className="mt-3 rounded-[10px] border border-black/7.5 bg-white p-3 shadow-sm">
              <div className="grid grid-cols-12 gap-2.5">
                <div className="col-span-12 md:col-span-6">
                  <FormLabel required>
                    {t(lang, "견적 날짜", "RFQ Date")}
                  </FormLabel>
                  <LegacyDateInput
                    onChange={(next) => onSetupFieldChange("date", next)}
                    value={osSetup.date}
                  />
                </div>
                <div className="col-span-12 md:col-span-6">
                  <FormLabel required>
                    {t(lang, "세일즈 담당", "Owner")}
                  </FormLabel>
                  <Select<CreateSelectOption, false>
                    className="text-[13px]"
                    isSearchable={false}
                    menuPortalTarget={selectMenuPortalTarget}
                    onChange={(nextValue: SingleValue<CreateSelectOption>) => {
                      onSetupFieldChange("owner", nextValue?.value ?? "");
                    }}
                    options={ownerOptions}
                    placeholder="Choose"
                    styles={setupSelectStyles}
                    value={selectedSetupOwnerOption}
                  />
                </div>

                <div className="col-span-12 md:col-span-6">
                  <FormLabel required>
                    {t(lang, "구분", "Project type")}
                  </FormLabel>
                  <Select<CreateSelectOption, false>
                    className="text-[13px]"
                    isSearchable={false}
                    menuPortalTarget={selectMenuPortalTarget}
                    onChange={(nextValue: SingleValue<CreateSelectOption>) => {
                      onSetupFieldChange("projectType", nextValue?.value ?? "");
                    }}
                    options={projectTypeOptions}
                    placeholder="Choose"
                    styles={setupSelectStyles}
                    value={selectedSetupProjectTypeOption}
                  />
                </div>

                <div className="col-span-12 md:col-span-6">
                  <FormLabel>
                    {t(lang, "샘플링 타입", "Sampling type")}
                  </FormLabel>
                  <Select<CreateSelectOption, false>
                    className="text-[13px]"
                    isSearchable={false}
                    menuPortalTarget={selectMenuPortalTarget}
                    onChange={(nextValue: SingleValue<CreateSelectOption>) => {
                      onSetupFieldChange("samplingType", nextValue?.value ?? "");
                    }}
                    options={samplingTypeOptions}
                    placeholder="Choose"
                    styles={setupSelectStyles}
                    value={selectedSetupSamplingTypeOption}
                  />
                </div>

                <div className="col-span-12">
                  <FormLabel required>
                    {t(
                      lang,
                      "프로젝트명 (메일 제목)",
                      "Project name (Mail title)",
                    )}
                  </FormLabel>
                  <div className="flex">
                    <button
                      className="inline-flex h-7.75 items-center justify-center rounded-l-lg border border-r-0 border-[#e6e6e6] px-2 text-[18px] text-slate-500 hover:bg-slate-50"
                      onClick={onRefreshGmailList}
                      type="button"
                    >
                      {refreshingGmail ? (
                        <span className="animate-spin rounded-full border-2 border-slate-300 border-t-slate-600 size-3.5" />
                      ) : (
                        <BsEnvelopeArrowDown className="text-[18px]" />
                      )}
                    </button>
                    <input
                      className="h-7.75 w-full rounded-r-lg border border-[#e4e4e4] px-2.5 text-[13px]"
                      list={suggestionsId}
                      onChange={(event) => {
                        const value = event.target.value;
                        onSetupFieldChange("projectName", value);
                        if (value.includes("|||")) {
                          onApplySetupGmailSuggestion(value);
                        }
                      }}
                      value={osSetup.projectName}
                    />
                  </div>
                </div>

                <div className="col-span-12 md:col-span-6">
                  <FormLabel required>
                    {t(lang, "고객명", "Client name")}
                  </FormLabel>
                  <input
                    className="h-7.75 w-full rounded-lg border border-[#e4e4e4] px-2.5 text-[13px]"
                    onChange={(event) =>
                      onSetupFieldChange("clientName", event.target.value)
                    }
                    value={osSetup.clientName}
                  />
                </div>

                <div className="col-span-12 md:col-span-6">
                  <FormLabel required>
                    {t(lang, "클라이언트", "Client")}
                  </FormLabel>
                  <Select<CreateSelectOption, false, GroupBase<CreateSelectOption>>
                    className="text-[13px]"
                    formatGroupLabel={(group) => <span>{group.label}</span>}
                    isSearchable
                    menuPortalTarget={selectMenuPortalTarget}
                    onChange={(nextValue: SingleValue<CreateSelectOption>) => {
                      onSetupFieldChange("client", nextValue?.value ?? "");
                    }}
                    options={groupedClientOptions}
                    placeholder="Choose"
                    styles={setupSelectStyles}
                    value={selectedSetupClientOption}
                  />
                </div>

                <div className="col-span-12">
                  <FormLabel required>
                    {t(lang, "대상자 조건", "Targeting condition")}
                  </FormLabel>
                  <input
                    className="h-7.75 w-full rounded-lg border border-[#e4e4e4] px-2.5 text-[13px]"
                    onChange={(event) =>
                      onSetupFieldChange("targetCondition", event.target.value)
                    }
                    value={osSetup.targetCondition}
                  />
                </div>

                <div className="col-span-12 md:col-span-6">
                  <FormLabel required>LOI (min)</FormLabel>
                  <input
                    className="h-7.75 w-full rounded-lg border border-[#e4e4e4] px-2.5 text-[13px]"
                    onChange={(event) =>
                      onSetupFieldChange(
                        "loi",
                        normalizeIntegerInput(event.target.value),
                      )
                    }
                    value={osSetup.loi}
                  />
                </div>

                <div className="col-span-12 md:col-span-6">
                  <FormLabel>
                    {t(lang, "요청 샘플수", "Requested N")}
                  </FormLabel>
                  <input
                    className="h-7.75 w-full rounded-lg border border-[#e4e4e4] px-2.5 text-[13px]"
                    onChange={(event) =>
                      onSetupFieldChange(
                        "requestedN",
                        normalizeIntegerInput(event.target.value),
                      )
                    }
                    value={osSetup.requestedN}
                  />
                </div>

                <div className="col-span-12 md:col-span-6">
                  <FormLabel>{t(lang, "운영비", "Other fee")}</FormLabel>
                  <input
                    className="h-7.75 w-full rounded-lg border border-[#e4e4e4] px-2.5 text-[13px]"
                    onChange={(event) =>
                      onSetupFieldChange(
                        "otherFee",
                        normalizeIntegerInput(event.target.value),
                      )
                    }
                    value={osSetup.otherFee}
                  />
                  <div className="mt-0.5 text-[11px] opacity-80">
                    <i>
                      {t(
                        lang,
                        "※ 6개국 이상은 10만원",
                        "※ 100,000 for 6 or more countries",
                      )}
                    </i>
                  </div>
                </div>

                <div className="col-span-12 md:col-span-6">
                  <FormLabel>
                    {t(lang, "오버레이 비용", "Overlay fee")}
                  </FormLabel>
                  <input
                    className="h-7.75 w-full rounded-lg border border-[#e4e4e4] px-2.5 text-[13px]"
                    onChange={(event) =>
                      onSetupFieldChange(
                        "overlayFee",
                        normalizeIntegerInput(event.target.value),
                      )
                    }
                    value={osSetup.overlayFee}
                  />
                </div>
              </div>
            </section>
          </div>
          <div className="flex justify-end gap-2 border-t border-black/7.5 px-4 py-3">
            <button
              className="rounded-[20px] bg-[#764cfc] px-4 py-1.5 text-sm text-white hover:bg-[#6535ff]"
              onClick={onCreate}
              type="button"
            >
              Create
            </button>
          </div>
        </div>
      </div>

      <datalist id={suggestionsId}>
        {gmailSuggestions.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>
    </>
  );
}
