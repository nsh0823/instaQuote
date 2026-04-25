import { memo } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import type { KrSopCheckedState, SopRow } from '@/pages/Create/types';
import { areSopRowsEqual } from '@/pages/Create/utils/kr-calculations';

type KrSopSectionProps = {
  flashField: string | null;
  lang: 'ko' | 'en';
  onSopCheckedChange: (key: 'sop1' | 'sop2', checked: boolean) => void;
  onSopCpiChange: (key: 'sop1' | 'sop2', value: string) => void;
  onSopNeededChange: (key: 'sop1' | 'sop2', value: string) => void;
  onSopUsageChange: (checked: boolean) => void;
  sopChecked: KrSopCheckedState;
  sopRows: { sop1: SopRow; sop2: SopRow };
  sopUsage: boolean;
};

export const KrSopSection = memo(function KrSopSection({
  flashField,
  lang,
  onSopCheckedChange,
  onSopCpiChange,
  onSopNeededChange,
  onSopUsageChange,
  sopChecked,
  sopRows,
  sopUsage,
}: KrSopSectionProps): JSX.Element {
  const t = (ko: string, en: string): string => (lang === 'en' ? en : ko);

  return (
    <>
      <div>
        <label className="inline-flex items-center gap-2 text-[13px] font-medium text-[#5b5b5b]">
          <Switch checked={sopUsage} onCheckedChange={onSopUsageChange} />
          <span>{t('SOP 이용', 'SOP Usage')}</span>
        </label>
      </div>

      {sopUsage ? (
        <div className="space-y-2 rounded-[10px] border border-[#e6e6e6] p-4">
          <div className="mb-0 flex flex-wrap gap-4 text-[12px]">
            <label className="inline-flex items-center gap-1">
              <Checkbox
                checked={sopChecked.sop1}
                onCheckedChange={(checked) =>
                  onSopCheckedChange('sop1', Boolean(checked))
                }
              />
              SOP_1
            </label>
            <label className="inline-flex items-center gap-1">
              <Checkbox
                checked={sopChecked.sop2}
                onCheckedChange={(checked) =>
                  onSopCheckedChange('sop2', Boolean(checked))
                }
              />
              SOP_2
            </label>
          </div>

          <div className="grid grid-cols-12 gap-2.5">
            {sopChecked.sop1 ? (
              <div className="mt-2 col-span-12 lg:col-span-6">
                <fieldset className="mt-0 rounded-[10px] border border-[#e6e6e6] px-4 pb-2 pt-0">
                  <legend className="w-auto px-2.5 text-[13px] font-medium">
                    SOP_1
                  </legend>
                  <div className="grid grid-cols-12 gap-2.5">
                    <div className="col-span-4">
                      <label className="mb-1 block text-[12px] font-medium text-[#5b5b5b]">
                        {t('SOP_1 샘플수', 'SOP_1 Needed N')}
                      </label>
                      <input
                        className="h-7.75 w-full rounded-lg border border-[#e4e4e4] px-2.5 text-[13px] outline-none transition focus:border-[#764cfc]"
                        onChange={(event) =>
                          onSopNeededChange('sop1', event.target.value)
                        }
                        value={sopRows.sop1.needed}
                      />
                    </div>
                    <div className="col-span-4">
                      <label className="mb-1 block text-[12px] font-medium text-[#5b5b5b]">
                        SOP_1 CPI
                      </label>
                      <input
                        className={`h-7.75 w-full rounded-lg border border-[#e4e4e4] px-2.5 text-[13px] outline-none transition focus:border-[#764cfc] ${
                          flashField === 'sop1Cpi' ? 'ring-2 ring-[#ffcfcd]' : ''
                        }`}
                        onChange={(event) =>
                          onSopCpiChange('sop1', event.target.value)
                        }
                        value={sopRows.sop1.cpi}
                      />
                    </div>
                    <div className="col-span-4">
                      <label className="mb-1 block text-[12px] font-medium text-[#5b5b5b]">
                        {t('SOP_1 비용', 'SOP_1 Costs')}
                      </label>
                      <input
                        className={`h-7.75 w-full rounded-lg border border-[#e4e4e4] bg-slate-50 px-2.5 text-[13px] outline-none transition ${
                          flashField === 'sop1Cost' ? 'ring-2 ring-[#ffcfcd]' : ''
                        }`}
                        readOnly
                        value={sopRows.sop1.cost}
                      />
                    </div>
                  </div>
                </fieldset>
              </div>
            ) : null}

            {sopChecked.sop2 ? (
              <div className="mt-2 col-span-12 lg:col-span-6">
                <fieldset className="mt-0 rounded-[10px] border border-[#e6e6e6] px-4 pb-2 pt-0">
                  <legend className="w-auto px-2.5 text-[13px] font-medium">
                    SOP_2
                  </legend>
                  <div className="grid grid-cols-12 gap-2.5">
                    <div className="col-span-4">
                      <label className="mb-1 block text-[12px] font-medium text-[#5b5b5b]">
                        {t('SOP_2 샘플수', 'SOP_2 Needed N')}
                      </label>
                      <input
                        className="h-7.75 w-full rounded-lg border border-[#e4e4e4] px-2.5 text-[13px] outline-none transition focus:border-[#764cfc]"
                        onChange={(event) =>
                          onSopNeededChange('sop2', event.target.value)
                        }
                        value={sopRows.sop2.needed}
                      />
                    </div>
                    <div className="col-span-4">
                      <label className="mb-1 block text-[12px] font-medium text-[#5b5b5b]">
                        SOP_2 CPI
                      </label>
                      <input
                        className={`h-7.75 w-full rounded-lg border border-[#e4e4e4] px-2.5 text-[13px] outline-none transition focus:border-[#764cfc] ${
                          flashField === 'sop2Cpi' ? 'ring-2 ring-[#ffcfcd]' : ''
                        }`}
                        onChange={(event) =>
                          onSopCpiChange('sop2', event.target.value)
                        }
                        value={sopRows.sop2.cpi}
                      />
                    </div>
                    <div className="col-span-4">
                      <label className="mb-1 block text-[12px] font-medium text-[#5b5b5b]">
                        {t('SOP_2 비용', 'SOP_2 Costs')}
                      </label>
                      <input
                        className={`h-7.75 w-full rounded-lg border border-[#e4e4e4] bg-slate-50 px-2.5 text-[13px] outline-none transition ${
                          flashField === 'sop2Cost' ? 'ring-2 ring-[#ffcfcd]' : ''
                        }`}
                        readOnly
                        value={sopRows.sop2.cost}
                      />
                    </div>
                  </div>
                </fieldset>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}, function areKrSopSectionPropsEqual(
  prevProps: KrSopSectionProps,
  nextProps: KrSopSectionProps,
): boolean {
  return (
    prevProps.flashField === nextProps.flashField &&
    prevProps.lang === nextProps.lang &&
    prevProps.sopChecked.sop1 === nextProps.sopChecked.sop1 &&
    prevProps.sopChecked.sop2 === nextProps.sopChecked.sop2 &&
    prevProps.sopUsage === nextProps.sopUsage &&
    areSopRowsEqual(prevProps.sopRows, nextProps.sopRows)
  );
});

KrSopSection.displayName = 'KrSopSection';
