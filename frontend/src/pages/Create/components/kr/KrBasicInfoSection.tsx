import { BsEnvelopeArrowDown } from 'react-icons/bs';
import Select, {
  type GroupBase,
  type SingleValue,
  type StylesConfig,
} from 'react-select';

import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { LegacyDateInput } from '@/pages/Create/components/shared/LegacyDateInput';
import { FormLabel } from '@/pages/Create/components/shared/FormLabel';
import type {
  KrFormState,
  KrSelectOption,
  KrTextField,
} from '@/pages/Create/types';
import { parseNumber } from '@/pages/Create/utils/number';
import type { OtherFeeDataset } from '@/types/backend';

type KrBasicInfoSectionProps = {
  actualCpi: string;
  countryOptions: KrSelectOption[];
  flashField: string | null;
  form: KrFormState;
  gmailSuggestions: string[];
  groupedClientOptions: Array<GroupBase<KrSelectOption>>;
  lang: 'ko' | 'en';
  onCalculationMethodChange: (value: KrFormState['calculationMethod']) => void;
  onClientChange: (value: string) => void;
  onFieldChange: (field: KrTextField, value: string) => void;
  onFeasibleNChange: (value: string) => void;
  onNumericFieldChange: (field: KrTextField, value: string) => void;
  onOtherFeeEnabledChange: (enabled: boolean) => void;
  onOtherFeeSelectionChange: (
    label: string,
    cost: number,
    isChecked: boolean,
  ) => void;
  onProjectNameChange: (value: string) => void;
  onRefreshGmail: () => void;
  onRequestAddClient: () => void;
  onRequestedNChange: (value: string) => void;
  otherFeeGroups: OtherFeeDataset;
  ownerOptions: KrSelectOption[];
  projectTypeOptions: KrSelectOption[];
  refreshingGmail: boolean;
  selectedClientOption: KrSelectOption | null;
  selectedCountryOption: KrSelectOption | null;
  selectedOwnerOption: KrSelectOption | null;
  selectedProjectTypeOption: KrSelectOption | null;
  selectedSpecialOption: KrSelectOption | null;
  selectedTrapQuestionOption: KrSelectOption | null;
  selectStyles: StylesConfig<KrSelectOption, false>;
  showIrInvalid: boolean;
  showLoiInvalid: boolean;
  specialOptionOptions: KrSelectOption[];
  trapQuestionOptions: KrSelectOption[];
};

function KrOtherFeeSection({
  flashField,
  lang,
  onOtherFeeEnabledChange,
  onOtherFeeSelectionChange,
  otherFeeEnabled,
  otherFeeGroups,
  selectedOtherFees,
}: {
  flashField: string | null;
  lang: 'ko' | 'en';
  onOtherFeeEnabledChange: (enabled: boolean) => void;
  onOtherFeeSelectionChange: (
    label: string,
    cost: number,
    isChecked: boolean,
  ) => void;
  otherFeeEnabled: boolean;
  otherFeeGroups: OtherFeeDataset;
  selectedOtherFees: string[];
}): JSX.Element {
  const t = (ko: string, en: string): string => (lang === 'en' ? en : ko);

  return (
    <>
      <div className="mt-5">
        <label className="inline-flex items-center gap-2 text-[13px] font-medium text-[#5b5b5b]">
          <Switch
            checked={otherFeeEnabled}
            onCheckedChange={onOtherFeeEnabledChange}
          />
          <span>{t('운영비 항목', 'Other fee options')}</span>
        </label>
      </div>

      {otherFeeEnabled ? (
        <div className="rounded-[10px] border border-[#e6e6e6] p-4">
          <table className="w-full border-collapse text-[12px]">
            <tbody>
              {otherFeeGroups.map((group, groupIndex) => (
                <tr key={groupIndex}>
                  <td className="w-27.5 border border-[#dee2e6] bg-[#f3f3f3] px-2 py-1 text-center text-[13px] font-semibold text-[#5b5b5b]">
                    {['Group A', 'Group B', 'Group C', 'Others', 'ETC'][
                      groupIndex
                    ] ?? `Group ${groupIndex + 1}`}
                  </td>
                  <td className="border border-[#dee2e6] px-2 py-1">
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {group.map((row) => {
                        const label = row[0] ?? '';
                        const cost = parseNumber(row[2] ?? '0') ?? 0;
                        const checked = selectedOtherFees.includes(label);

                        return (
                          <label
                            className="inline-flex items-center gap-1 text-[12px]"
                            key={label}
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(isChecked) => {
                                onOtherFeeSelectionChange(
                                  label,
                                  cost,
                                  Boolean(isChecked),
                                );
                              }}
                            />
                            <span
                              className={`${checked ? 'font-semibold' : ''} ${
                                flashField === 'otherFee' ? 'text-[#3d3d43]' : ''
                              }`}
                            >
                              {label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </>
  );
}

export function KrBasicInfoSection({
  actualCpi,
  countryOptions,
  flashField,
  form,
  gmailSuggestions,
  groupedClientOptions,
  lang,
  onCalculationMethodChange,
  onClientChange,
  onFieldChange,
  onFeasibleNChange,
  onNumericFieldChange,
  onOtherFeeEnabledChange,
  onOtherFeeSelectionChange,
  onProjectNameChange,
  onRefreshGmail,
  onRequestAddClient,
  onRequestedNChange,
  otherFeeGroups,
  ownerOptions,
  projectTypeOptions,
  refreshingGmail,
  selectedClientOption,
  selectedCountryOption,
  selectedOwnerOption,
  selectedProjectTypeOption,
  selectedSpecialOption,
  selectedTrapQuestionOption,
  selectStyles,
  showIrInvalid,
  showLoiInvalid,
  specialOptionOptions,
  trapQuestionOptions,
}: KrBasicInfoSectionProps): JSX.Element {
  const t = (ko: string, en: string): string => (lang === 'en' ? en : ko);
  const projectNameSuggestionsId = 'kr-project-name-suggestions';

  return (
    <>
      <div className="grid grid-cols-12 gap-2.5">
        <div className="col-span-12 md:col-span-2">
          <FormLabel required>{t('견적 날짜', 'RFQ Date')}</FormLabel>
          <LegacyDateInput
            onChange={(next) => onFieldChange('date', next)}
            value={form.date}
          />
        </div>

        <div className="col-span-12 md:col-span-2">
          <FormLabel required>{t('세일즈 담당', 'Owner')}</FormLabel>
          <Select<KrSelectOption, false>
            className="text-[13px]"
            isSearchable={false}
            onChange={(nextValue: SingleValue<KrSelectOption>) => {
              onFieldChange('owner', nextValue?.value ?? '');
            }}
            options={ownerOptions}
            placeholder="Choose"
            styles={selectStyles}
            value={selectedOwnerOption}
          />
        </div>

        <div className="col-span-12 md:col-span-2">
          <FormLabel required>{t('국가', 'Country')}</FormLabel>
          <Select<KrSelectOption, false>
            className="text-[13px]"
            isSearchable
            onChange={(nextValue: SingleValue<KrSelectOption>) => {
              onFieldChange('country', nextValue?.value ?? '');
            }}
            options={countryOptions}
            placeholder="Choose"
            styles={selectStyles}
            value={selectedCountryOption}
          />
        </div>

        <div className="col-span-12 md:col-span-2">
          <FormLabel required>{t('구분', 'Project type')}</FormLabel>
          <Select<KrSelectOption, false>
            className="text-[13px]"
            isSearchable={false}
            onChange={(nextValue: SingleValue<KrSelectOption>) => {
              onFieldChange('projectType', nextValue?.value ?? '');
            }}
            options={projectTypeOptions}
            placeholder="Choose"
            styles={selectStyles}
            value={selectedProjectTypeOption}
          />
        </div>

        <div className="col-span-12 md:col-span-2">
          <FormLabel>{t('검증문항', 'Trap question')}</FormLabel>
          <Select<KrSelectOption, false>
            className="text-[13px]"
            isClearable
            isSearchable={false}
            onChange={(nextValue: SingleValue<KrSelectOption>) => {
              onFieldChange('trapQuestion', nextValue?.value ?? '');
            }}
            options={trapQuestionOptions}
            placeholder="Choose"
            styles={selectStyles}
            value={selectedTrapQuestionOption}
          />
        </div>

        <div className="col-span-12 md:col-span-2">
          <FormLabel>{t('특수옵션', 'Special option')}</FormLabel>
          <Select<KrSelectOption, false>
            className="text-[13px]"
            isClearable
            isSearchable={false}
            onChange={(nextValue: SingleValue<KrSelectOption>) => {
              onFieldChange('specialOption', nextValue?.value ?? '');
            }}
            options={specialOptionOptions}
            placeholder="Choose"
            styles={selectStyles}
            value={selectedSpecialOption}
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-2.5">
        <div className="col-span-12 md:col-span-8">
          <FormLabel required>
            {t('프로젝트명 (메일 제목)', 'Project name (Mail title)')}
          </FormLabel>
          <div className="flex">
            <button
              className="inline-flex h-7.75 items-center justify-center rounded-l-lg border border-r-0 border-[#e6e6e6] px-2 text-[18px] text-slate-500 hover:bg-slate-50"
              onClick={onRefreshGmail}
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
              list={projectNameSuggestionsId}
              onChange={(event) => onProjectNameChange(event.target.value)}
              value={form.projectName}
            />
          </div>
          <datalist id={projectNameSuggestionsId}>
            {gmailSuggestions.map((subject, index) => (
              <option key={`${subject}-${index}`} value={subject} />
            ))}
          </datalist>
        </div>

        <div className="col-span-12 md:col-span-4">
          <FormLabel required>{t('클라이언트', 'Client')}</FormLabel>
          <Select<KrSelectOption, false, GroupBase<KrSelectOption>>
            className="text-[13px]"
            formatGroupLabel={(group) => <span>{group.label}</span>}
            isSearchable
            onChange={(nextValue: SingleValue<KrSelectOption>) => {
              if (nextValue?.value === 'Other') {
                onRequestAddClient();
                return;
              }
              onClientChange(nextValue?.value ?? '');
            }}
            options={groupedClientOptions}
            placeholder="Choose"
            styles={selectStyles}
            value={selectedClientOption}
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-2.5">
        <div className="col-span-12 md:col-span-4">
          <FormLabel>{t('고객명', 'Client name')}</FormLabel>
          <input
            className="h-7.75 w-full rounded-lg border border-[#e4e4e4] px-2.5 text-[13px] outline-none transition focus:border-[#764cfc]"
            onChange={(event) => onFieldChange('clientName', event.target.value)}
            value={form.clientName}
          />
        </div>

        <div className="col-span-12 md:col-span-8">
          <FormLabel>{t('대상자 조건', 'Targeting condition')}</FormLabel>
          <input
            className="h-7.75 w-full rounded-lg border border-[#e4e4e4] px-2.5 text-[13px] outline-none transition focus:border-[#764cfc]"
            onChange={(event) =>
              onFieldChange('targetCondition', event.target.value)
            }
            value={form.targetCondition}
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-2.5">
        <div className="relative col-span-12 md:col-span-3">
          <FormLabel required>IR (%)</FormLabel>
          <input
            className={`h-7.75 w-full rounded-lg border border-[#e4e4e4] px-2.5 text-[13px] outline-none transition focus:border-[#764cfc] ${
              flashField === 'ir' ? 'ring-2 ring-[#ffcfcd]' : ''
            }`}
            onChange={(event) => onNumericFieldChange('ir', event.target.value)}
            value={form.ir}
          />
          {showIrInvalid ? (
            <div className="absolute right-0 top-[calc(100%+2px)] z-10 rounded bg-[#cc2b4f] px-2 py-1 text-[11px] text-white">
              Please enter number 0~100.
            </div>
          ) : null}
        </div>

        <div className="relative col-span-12 md:col-span-3">
          <FormLabel required>LOI (min)</FormLabel>
          <input
            className={`h-7.75 w-full rounded-lg border border-[#e4e4e4] px-2.5 text-[13px] outline-none transition focus:border-[#764cfc] ${
              flashField === 'loi' ? 'ring-2 ring-[#ffcfcd]' : ''
            }`}
            onChange={(event) => onNumericFieldChange('loi', event.target.value)}
            value={form.loi}
          />
          {showLoiInvalid ? (
            <div className="absolute right-0 top-[calc(100%+2px)] z-10 rounded bg-[#cc2b4f] px-2 py-1 text-[11px] text-white">
              Please enter number 0~60.
            </div>
          ) : null}
        </div>

        <div className="col-span-12 md:col-span-3">
          <FormLabel required>{t('완료 포인트', 'Complete points')}</FormLabel>
          <input
            className={`h-7.75 w-full rounded-lg border border-[#e4e4e4] px-2.5 text-[13px] outline-none transition focus:border-[#764cfc] ${
              flashField === 'completePoints' ? 'ring-2 ring-[#ffcfcd]' : ''
            }`}
            onChange={(event) =>
              onNumericFieldChange('completePoints', event.target.value)
            }
            value={form.completePoints}
          />
        </div>

        <div className="col-span-12 md:col-span-3">
          <FormLabel required>
            <>
              CPI{' '}
              <span className="text-[85%] text-gray-500">
                <i>(Actual CPI = {actualCpi || '-'})</i>
              </span>
            </>
          </FormLabel>
          <input
            className={`h-7.75 w-full rounded-lg border border-[#e4e4e4] px-2.5 text-[13px] outline-none transition focus:border-[#764cfc] ${
              flashField === 'cpi' ? 'ring-2 ring-[#ffcfcd]' : ''
            }`}
            onChange={(event) => onNumericFieldChange('cpi', event.target.value)}
            value={form.cpi}
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-2.5">
        <RadioGroup
          className="contents"
          onValueChange={(value) =>
            onCalculationMethodChange(value as KrFormState['calculationMethod'])
          }
          value={form.calculationMethod}
        >
          <div className="col-span-12 md:col-span-2">
            <FormLabel required>{t('요청 샘플수', 'Requested N')}</FormLabel>
            <div className="flex">
              <label
                className="inline-flex h-7.75 items-center justify-center rounded-l-lg border border-r-0 border-[#e6e6e6] px-2 text-slate-500"
                title={t('요청 샘플수', 'Requested N')}
              >
                <RadioGroupItem value="Requested N" />
              </label>
              <input
                className="h-7.75 w-full rounded-r-lg border border-[#e4e4e4] px-2.5 text-[13px] outline-none transition focus:border-[#764cfc]"
                onChange={(event) => onRequestedNChange(event.target.value)}
                value={form.requestedN}
              />
            </div>
          </div>

          <div className="col-span-12 md:col-span-2">
            <FormLabel required>{t('가능수', 'Feasible N')}</FormLabel>
            <div className="flex">
              <label
                className="inline-flex h-7.75 items-center justify-center rounded-l-lg border border-r-0 border-[#e6e6e6] px-2 text-slate-500"
                title={t('가능수', 'Feasible N')}
              >
                <RadioGroupItem value="Feasible N" />
              </label>
              <input
                className="h-7.75 w-full rounded-r-lg border border-[#e4e4e4] px-2.5 text-[13px] outline-none transition focus:border-[#764cfc]"
                onChange={(event) => onFeasibleNChange(event.target.value)}
                value={form.feasibleN}
              />
            </div>
          </div>
        </RadioGroup>

        <div className="col-span-12 md:col-span-2">
          <FormLabel>{t('문항 수', 'Question N')}</FormLabel>
          <input
            className="h-7.75 w-full rounded-lg border border-[#e4e4e4] px-2.5 text-[13px] outline-none transition focus:border-[#764cfc]"
            onChange={(event) => onNumericFieldChange('questionN', event.target.value)}
            value={form.questionN}
          />
        </div>

        <div className="col-span-12 md:col-span-2">
          <FormLabel>{t('설문 페이지수', 'Page N')}</FormLabel>
          <input
            className="h-7.75 w-full rounded-lg border border-[#e4e4e4] px-2.5 text-[13px] outline-none transition focus:border-[#764cfc]"
            onChange={(event) => onNumericFieldChange('pageN', event.target.value)}
            value={form.pageN}
          />
        </div>

        <div className="col-span-12 md:col-span-2">
          <FormLabel>{t('웹업비', 'Prog. fee')}</FormLabel>
          <input
            className="h-7.75 w-full rounded-lg border border-[#e4e4e4] px-2.5 text-[13px] outline-none transition focus:border-[#764cfc]"
            onChange={(event) =>
              onNumericFieldChange('programmingFee', event.target.value)
            }
            value={form.programmingFee}
          />
        </div>

        <div className="col-span-12 md:col-span-2">
          <FormLabel>{t('운영비', 'Other fee')}</FormLabel>
          <input
            className={`h-7.75 w-full rounded-lg border border-[#e4e4e4] px-2.5 text-[13px] outline-none transition focus:border-[#764cfc] ${
              flashField === 'otherFee' ? 'ring-2 ring-[#ffcfcd]' : ''
            }`}
            onChange={(event) => onNumericFieldChange('otherFee', event.target.value)}
            value={form.otherFee}
          />
        </div>
      </div>

      <KrOtherFeeSection
        flashField={flashField}
        lang={lang}
        onOtherFeeEnabledChange={onOtherFeeEnabledChange}
        onOtherFeeSelectionChange={onOtherFeeSelectionChange}
        otherFeeEnabled={form.otherFeeEnabled}
        otherFeeGroups={otherFeeGroups}
        selectedOtherFees={form.selectedOtherFees}
      />
    </>
  );
}
