import { memo } from 'react';
import Select, { type SingleValue, type StylesConfig } from 'react-select';

import { Switch } from '@/components/ui/switch';
import type { KrSelectOption, PartnerRow } from '@/pages/Create/types';
import { arePartnerRowsEqual } from '@/pages/Create/utils/kr-calculations';

type KrPartnerSectionProps = {
  flashField: string | null;
  lang: 'ko' | 'en';
  onPartnerCountChange: (count: number) => void;
  onPartnerFieldChange: (
    index: number,
    field: 'cpi' | 'fee' | 'name',
    value: string,
  ) => void;
  onPartnerNeededChange: (index: number, value: string) => void;
  onPartnerUsageChange: (checked: boolean) => void;
  partnerCount: number;
  partnerCountOptions: KrSelectOption[];
  partnerRows: PartnerRow[];
  partnerUsage: boolean;
  selectStyles: StylesConfig<KrSelectOption, false>;
};

export const KrPartnerSection = memo(function KrPartnerSection({
  flashField,
  lang,
  onPartnerCountChange,
  onPartnerFieldChange,
  onPartnerNeededChange,
  onPartnerUsageChange,
  partnerCount,
  partnerCountOptions,
  partnerRows,
  partnerUsage,
  selectStyles,
}: KrPartnerSectionProps): JSX.Element {
  const t = (ko: string, en: string): string => (lang === 'en' ? en : ko);
  const selectedPartnerCountOption =
    partnerCountOptions.find((option) => option.value === String(partnerCount)) ??
    null;

  return (
    <>
      <div>
        <label className="inline-flex items-center gap-2 text-[13px] font-medium text-[#5b5b5b]">
          <Switch checked={partnerUsage} onCheckedChange={onPartnerUsageChange} />
          <span>{t('파트너이용', '3rd party Usage')}</span>
        </label>
      </div>

      {partnerUsage ? (
        <div className="space-y-2 rounded-[10px] border border-[#e6e6e6] p-4">
          <div className="flex justify-end">
            <div className="w-20">
              <Select<KrSelectOption, false>
                className="text-[13px]"
                isSearchable={false}
                onChange={(nextValue: SingleValue<KrSelectOption>) => {
                  const nextCount =
                    Number.parseInt(nextValue?.value ?? '1', 10) || 1;
                  onPartnerCountChange(nextCount);
                }}
                options={partnerCountOptions}
                styles={selectStyles}
                value={selectedPartnerCountOption}
              />
            </div>
          </div>

          {partnerRows.slice(0, partnerCount).map((partner, index) => (
            <fieldset
              className={`${index === 0 ? 'mt-0' : 'mt-2.5'} rounded-[10px] border border-[#e6e6e6] px-4 pb-2 pt-0`}
              key={index}
            >
              <legend className="w-auto px-2.5 text-[13px] font-medium">
                Partner {index + 1}
              </legend>
              <div className="grid grid-cols-10 gap-2.5">
                <div className="col-span-12 md:col-span-2">
                  <label className="mb-1 block text-[12px] font-medium text-[#5b5b5b]">
                    {t('파트너명', '3rd party name')}
                  </label>
                  <input
                    className="h-7.75 w-full rounded-lg border border-[#e4e4e4] px-2.5 text-[13px] outline-none transition focus:border-[#764cfc]"
                    onChange={(event) =>
                      onPartnerFieldChange(index, 'name', event.target.value)
                    }
                    value={partner.name}
                  />
                </div>

                <div className="col-span-12 md:col-span-2">
                  <label className="mb-1 block text-[12px] font-medium text-[#5b5b5b]">
                    {t('부족 샘플수', 'Needed N')}
                  </label>
                  <input
                    className="h-7.75 w-full rounded-lg border border-[#e4e4e4] px-2.5 text-[13px] outline-none transition focus:border-[#764cfc]"
                    onChange={(event) =>
                      onPartnerNeededChange(index, event.target.value)
                    }
                    value={partner.needed}
                  />
                </div>

                <div className="col-span-12 md:col-span-2">
                  <label className="mb-1 block text-[12px] font-medium text-[#5b5b5b]">
                    3rd party CPI
                  </label>
                  <input
                    className="h-7.75 w-full rounded-lg border border-[#e4e4e4] px-2.5 text-[13px] outline-none transition focus:border-[#764cfc]"
                    onChange={(event) =>
                      onPartnerFieldChange(index, 'cpi', event.target.value)
                    }
                    value={partner.cpi}
                  />
                </div>

                <div className="col-span-12 md:col-span-2">
                  <label className="mb-1 block text-[12px] font-medium text-[#5b5b5b]">
                    3rd party {t('운영비', 'fee')}
                  </label>
                  <input
                    className="h-7.75 w-full rounded-lg border border-[#e4e4e4] px-2.5 text-[13px] outline-none transition focus:border-[#764cfc]"
                    onChange={(event) =>
                      onPartnerFieldChange(index, 'fee', event.target.value)
                    }
                    value={partner.fee}
                  />
                </div>

                <div className="col-span-12 md:col-span-2">
                  <label className="mb-1 block text-[12px] font-medium text-[#5b5b5b]">
                    3rd party {t('비용', 'costs')}
                  </label>
                  <input
                    className={`h-7.75 w-full rounded-lg border border-[#e4e4e4] bg-slate-50 px-2.5 text-[13px] outline-none transition ${
                      flashField === `partnerCost${index + 1}`
                        ? 'ring-2 ring-[#ffcfcd]'
                        : ''
                    }`}
                    readOnly
                    value={partner.cost}
                  />
                </div>
              </div>
            </fieldset>
          ))}
        </div>
      ) : null}
    </>
  );
}, function areKrPartnerSectionPropsEqual(
  prevProps: KrPartnerSectionProps,
  nextProps: KrPartnerSectionProps,
): boolean {
  return (
    prevProps.flashField === nextProps.flashField &&
    prevProps.lang === nextProps.lang &&
    prevProps.partnerCount === nextProps.partnerCount &&
    prevProps.partnerCountOptions === nextProps.partnerCountOptions &&
    prevProps.partnerUsage === nextProps.partnerUsage &&
    prevProps.selectStyles === nextProps.selectStyles &&
    arePartnerRowsEqual(prevProps.partnerRows, nextProps.partnerRows)
  );
});

KrPartnerSection.displayName = 'KrPartnerSection';
