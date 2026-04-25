import Select, {
  type GroupBase,
  type MultiValue,
  type SingleValue,
  type StylesConfig,
} from "react-select";
import { BsArrowClockwise, BsEnvelopeArrowDown } from "react-icons/bs";

import { FormLabel } from "@/pages/Create/components/shared/FormLabel";
import { LegacyDateInput } from "@/pages/Create/components/shared/LegacyDateInput";
import { SectionCard } from "@/pages/Create/components/shared/SectionCard";
import type {
  CreateSelectOption,
  OsPanelState,
} from "@/pages/Create/types";
import { t } from "@/utils/lang";

type OsFormCardProps = {
  activePanel: OsPanelState;
  batchChangeDone: boolean;
  batchChangeOpen: boolean;
  batchTargetCount: number;
  batchTargetOptions: CreateSelectOption[];
  groupedClientOptions: Array<GroupBase<CreateSelectOption>>;
  inlineMultiSelectStyles: StylesConfig<CreateSelectOption, true>;
  lang: string;
  onApplyBatchChange: () => void;
  onApplyGmailSuggestion: (value: string) => void;
  onBatchTargetsChange: (values: string[]) => void;
  onClear: () => void;
  onPanelFieldChange: (field: keyof OsPanelState, value: string) => void;
  onRefreshGmailList: () => void;
  onToggleBatchChange: () => void;
  ownerOptions: CreateSelectOption[];
  projectTypeOptions: CreateSelectOption[];
  refreshingGmail: boolean;
  samplingTypeOptions: CreateSelectOption[];
  selectedBatchTargetOptions: CreateSelectOption[];
  selectedPanelClientOption: CreateSelectOption | null;
  selectedPanelOwnerOption: CreateSelectOption | null;
  selectedPanelProjectTypeOption: CreateSelectOption | null;
  selectedPanelSamplingTypeOption: CreateSelectOption | null;
  setupSelectStyles: StylesConfig<CreateSelectOption, false>;
};

export function OsFormCard({
  activePanel,
  batchChangeDone,
  batchChangeOpen,
  batchTargetCount,
  batchTargetOptions,
  groupedClientOptions,
  inlineMultiSelectStyles,
  lang,
  onApplyBatchChange,
  onApplyGmailSuggestion,
  onBatchTargetsChange,
  onClear,
  onPanelFieldChange,
  onRefreshGmailList,
  onToggleBatchChange,
  ownerOptions,
  projectTypeOptions,
  refreshingGmail,
  samplingTypeOptions,
  selectedBatchTargetOptions,
  selectedPanelClientOption,
  selectedPanelOwnerOption,
  selectedPanelProjectTypeOption,
  selectedPanelSamplingTypeOption,
  setupSelectStyles,
}: OsFormCardProps): JSX.Element {
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
              className={`inline-flex h-full items-center gap-1 rounded border bg-white p-1.5 text-[10px] text-slate-700 hover:bg-slate-50 ${
                batchChangeDone
                  ? "border-[#764cfc] text-[#764cfc]"
                  : "border-slate-300"
              }`}
              onClick={onToggleBatchChange}
              type="button"
            >
              <span>
                {batchChangeDone ? t(lang, "완료!", "Done!") : "Batch Change"}
              </span>
            </button>
            {batchChangeOpen ? (
              <div className="absolute right-0 top-[calc(100%+6px)] z-40 w-70 rounded-lg border border-slate-200 bg-white p-2 shadow-xl">
                <div className="mb-2 text-[12px] text-[#5b5b5b]">
                  {t(
                    lang,
                    "변경할 국가를 선택하세요",
                    "Choose countries to change form",
                  )}
                </div>
                <Select<CreateSelectOption, true>
                  className="text-[13px]"
                  closeMenuOnSelect={false}
                  controlShouldRenderValue={false}
                  hideSelectedOptions={false}
                  isMulti
                  onChange={(nextValue: MultiValue<CreateSelectOption>) => {
                    onBatchTargetsChange(
                      nextValue.map((option) => option.value),
                    );
                  }}
                  options={batchTargetOptions}
                  placeholder={
                    batchTargetCount > 0
                      ? `${batchTargetCount} selected`
                      : t(lang, "선택", "Choose")
                  }
                  styles={inlineMultiSelectStyles}
                  value={selectedBatchTargetOptions}
                />
                <div className="mt-2 flex justify-end">
                  <button
                    className="rounded-[20px] bg-[#764cfc] px-3 py-1 text-[12px] text-white"
                    onClick={onApplyBatchChange}
                    type="button"
                  >
                    {t(lang, "변경", "Change")}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      }
      title="Form"
    >
      <div className="space-y-3">
        <div className="grid grid-cols-12 gap-2.5">
          <div className="col-span-12 md:col-span-3">
            <FormLabel required>{t(lang, "견적 날짜", "RFQ Date")}</FormLabel>
            <LegacyDateInput
              onChange={(next) => onPanelFieldChange("date", next)}
              value={activePanel.date}
            />
          </div>
          <div className="col-span-12 md:col-span-3">
            <FormLabel required>{t(lang, "세일즈 담당", "Owner")}</FormLabel>
            <Select<CreateSelectOption, false>
              className="text-[13px]"
              isSearchable={false}
              onChange={(nextValue: SingleValue<CreateSelectOption>) => {
                onPanelFieldChange("owner", nextValue?.value ?? "");
              }}
              options={ownerOptions}
              placeholder="Choose"
              styles={setupSelectStyles}
              value={selectedPanelOwnerOption}
            />
          </div>
          <div className="col-span-12 md:col-span-3">
            <FormLabel required>{t(lang, "구분", "Project type")}</FormLabel>
            <Select<CreateSelectOption, false>
              className="text-[13px]"
              isSearchable={false}
              onChange={(nextValue: SingleValue<CreateSelectOption>) => {
                onPanelFieldChange("projectType", nextValue?.value ?? "");
              }}
              options={projectTypeOptions}
              placeholder="Choose"
              styles={setupSelectStyles}
              value={selectedPanelProjectTypeOption}
            />
          </div>
          <div className="col-span-12 md:col-span-3">
            <FormLabel required>
              {t(lang, "샘플링 타입", "Sampling type")}
            </FormLabel>
            <Select<CreateSelectOption, false>
              className="text-[13px]"
              isSearchable={false}
              onChange={(nextValue: SingleValue<CreateSelectOption>) => {
                onPanelFieldChange("samplingType", nextValue?.value ?? "");
              }}
              options={samplingTypeOptions}
              placeholder="Choose"
              styles={setupSelectStyles}
              value={selectedPanelSamplingTypeOption}
            />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-2.5">
          <div className="col-span-12 md:col-span-6">
            <FormLabel required>
              {t(lang, "프로젝트명 (메일 제목)", "Project name (Mail title)")}
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
                  <BsEnvelopeArrowDown />
                )}
              </button>
              <input
                className="h-7.75 w-full rounded-r-lg border border-[#e4e4e4] px-2.5 text-[13px] outline-none transition focus:border-[#764cfc]"
                list="os-gmail-suggestions"
                onChange={(event) => {
                  const value = event.target.value;
                  onPanelFieldChange("projectName", value);
                  if (value.includes("|||")) {
                    onApplyGmailSuggestion(value);
                  }
                }}
                value={activePanel.projectName}
              />
            </div>
          </div>
          <div className="col-span-12 md:col-span-3">
            <FormLabel required>{t(lang, "고객명", "Client name")}</FormLabel>
            <input
              className="h-7.75 w-full rounded-lg border border-[#e4e4e4] px-2.5 text-[13px] outline-none transition focus:border-[#764cfc]"
              onChange={(event) =>
                onPanelFieldChange("clientName", event.target.value)
              }
              value={activePanel.clientName}
            />
          </div>
          <div className="col-span-12 md:col-span-3">
            <FormLabel required>{t(lang, "클라이언트", "Client")}</FormLabel>
            <Select<CreateSelectOption, false, GroupBase<CreateSelectOption>>
              className="text-[13px]"
              formatGroupLabel={(group) => <span>{group.label}</span>}
              isSearchable
              onChange={(nextValue: SingleValue<CreateSelectOption>) => {
                onPanelFieldChange("client", nextValue?.value ?? "");
              }}
              options={groupedClientOptions}
              placeholder="Choose"
              styles={setupSelectStyles}
              value={selectedPanelClientOption}
            />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-2.5">
          <div className="col-span-12 md:col-span-6">
            <FormLabel required>
              {t(lang, "대상자 조건", "Targeting condition")}
            </FormLabel>
            <input
              className="h-7.75 w-full rounded-lg border border-[#e4e4e4] px-2.5 text-[13px] outline-none transition focus:border-[#764cfc]"
              onChange={(event) =>
                onPanelFieldChange("targetCondition", event.target.value)
              }
              value={activePanel.targetCondition}
            />
          </div>
          <div className="col-span-12 md:col-span-3">
            <FormLabel required>LOI (min)</FormLabel>
            <input
              className="h-7.75 w-full rounded-lg border border-[#e4e4e4] px-2.5 text-[13px] outline-none transition focus:border-[#764cfc]"
              onChange={(event) => onPanelFieldChange("loi", event.target.value)}
              value={activePanel.loi}
            />
          </div>
          <div className="col-span-12 md:col-span-3">
            <FormLabel required>{t(lang, "요청 샘플수", "Requested N")}</FormLabel>
            <input
              className="h-7.75 w-full rounded-lg border border-[#e4e4e4] px-2.5 text-[13px] outline-none transition focus:border-[#764cfc]"
              onChange={(event) =>
                onPanelFieldChange("requestedN", event.target.value)
              }
              value={activePanel.requestedN}
            />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-2.5">
          <div className="col-span-12 md:col-span-3">
            <FormLabel>{t(lang, "운영비", "Other fee")}</FormLabel>
            <input
              className="h-7.75 w-full rounded-lg border border-[#e4e4e4] px-2.5 text-[13px] outline-none transition focus:border-[#764cfc]"
              onChange={(event) =>
                onPanelFieldChange("otherFee", event.target.value)
              }
              value={activePanel.otherFee}
            />
          </div>
          <div className="col-span-12 md:col-span-3">
            <FormLabel>{t(lang, "오버레이 비용", "Overlay fee")}</FormLabel>
            <input
              className="h-7.75 w-full rounded-lg border border-[#e4e4e4] px-2.5 text-[13px] outline-none transition focus:border-[#764cfc]"
              onChange={(event) =>
                onPanelFieldChange("overlayFee", event.target.value)
              }
              value={activePanel.overlayFee}
            />
          </div>
          <div className="col-span-12 md:col-span-3">
            <FormLabel>{t(lang, "문항 수", "Question N")}</FormLabel>
            <input
              className="h-7.75 w-full rounded-lg border border-[#e4e4e4] px-2.5 text-[13px] outline-none transition focus:border-[#764cfc]"
              onChange={(event) =>
                onPanelFieldChange("questionN", event.target.value)
              }
              value={activePanel.questionN}
            />
          </div>
          <div className="col-span-12 md:col-span-3">
            <FormLabel>{t(lang, "설문 페이지수", "Page N")}</FormLabel>
            <input
              className="h-7.75 w-full rounded-lg border border-[#e4e4e4] px-2.5 text-[13px] outline-none transition focus:border-[#764cfc]"
              onChange={(event) => onPanelFieldChange("pageN", event.target.value)}
              value={activePanel.pageN}
            />
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
