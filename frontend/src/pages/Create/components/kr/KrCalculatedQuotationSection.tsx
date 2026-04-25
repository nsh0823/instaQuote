import { BsArrowClockwise } from 'react-icons/bs';

import { HelpTooltip } from '@/components/common/HelpTooltip';
import type { CalcSnapshot } from '@/pages/Create/types';
import { addComma } from '@/pages/Create/utils/number';

type KrCalculatedQuotationSectionProps = {
  calcSnapshots: CalcSnapshot[];
  lang: 'ko' | 'en';
  onCalculate: () => void;
  onClear: () => void;
  onSelectSnapshot: (snapshot: CalcSnapshot) => void;
  selectedCalcSnapshotId: number | null;
};

export function KrCalculatedQuotationSection({
  calcSnapshots,
  lang,
  onCalculate,
  onClear,
  onSelectSnapshot,
  selectedCalcSnapshotId,
}: KrCalculatedQuotationSectionProps): JSX.Element {
  const t = (ko: string, en: string): string => (lang === 'en' ? en : ko);

  const headers: Array<{ key: string; label: string; tooltip: string }> = [
    {
      key: 'index',
      label: '#',
      tooltip: t('계산 결과 행 번호', 'Calculated row number'),
    },
    {
      key: 'cpi',
      label: 'CPI',
      tooltip: 'CPI',
    },
    {
      key: 'sc',
      label: 'SC',
      tooltip: t('가능수 * (1 - IR) / IR', 'Feasible N * (1 - IR) / IR'),
    },
    {
      key: 'qf',
      label: 'QF',
      tooltip: 'SC / 5',
    },
    {
      key: 'total-partner-costs',
      label: 'Total 3rd party costs',
      tooltip: t('총 파트너비용 합계', 'Total 3rd party costs'),
    },
    {
      key: 'total-sop-costs',
      label: 'Total SOP costs',
      tooltip: t('총 SOP비용 합계', 'Total SOP costs'),
    },
    {
      key: 'point-fee',
      label: 'Point fee (C+SC+QF)',
      tooltip: t(
        '(완료포인트 * 가능수) + (SC * 50) + (QF * 50)',
        '(Complete points * Feasible N) + (SC * 50) + (QF * 50)',
      ),
    },
    {
      key: 'expected-sales',
      label: 'Expected sales (without tax)',
      tooltip: t(
        '(요청 샘플수 * CPI) + 웹업비 + 운영비',
        '(Requested N * CPI) + Programming fee + Other Fee',
      ),
    },
    {
      key: 'gm-percent',
      label: 'GM (%)',
      tooltip: t(
        '(견적 - ((총 파트너비용 + 총 SOP비용) + (포인트비용 * 1))) / 견적',
        '(Expected sales - ((Total 3rd party costs + Total SOP costs) + (Point fee * 1))) / Expected sales',
      ),
    },
    {
      key: 'gm',
      label: 'GM',
      tooltip: t(
        '견적 - ((포인트비용 * 1) + (총 파트너비용 + 총 SOP비용))',
        'Expected sales - ((Point fee * 1) + (Total 3rd party costs + Total SOP costs))',
      ),
    },
  ];

  return (
    <section className="rounded-[10px] border border-black/7.5 bg-white shadow-sm">
      <div className="flex items-center border-b border-black/7.5 p-3">
        <div className="text-[1.2rem] font-medium text-[#3d3d43]">
          {t('Calculated quotation', 'Calculated quotation')}
        </div>
        <div className="ml-auto flex h-7 items-center gap-1">
          <button
            className="ml-auto inline-flex items-center justify-center rounded border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-50"
            onClick={onClear}
            type="button"
          >
            <BsArrowClockwise className="text-[14px]" />
          </button>
          <button
            className="inline-flex h-full items-center justify-center rounded border border-slate-300 bg-white px-2 p-1.5 text-[10px] text-slate-700 hover:bg-slate-50"
            onClick={onCalculate}
            type="button"
          >
            Calculate
          </button>
        </div>
      </div>

      <div className="overflow-x-auto p-4 text-[12px]">
        <table className="table table-sm table-hover mb-0 min-w-full">
          <thead>
            <tr className="border-b border-black/7.5 text-center">
              {headers.map((header) => (
                <th className="px-2 py-1 text-[13px] font-medium" key={header.key}>
                  <HelpTooltip
                    content={header.tooltip}
                    label={header.label}
                    showIcon={false}
                    tooltipClassName="max-w-[320px] text-left"
                    triggerClassName="justify-center text-[inherit] font-[inherit]"
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-[12px]">
            {calcSnapshots.map((snapshot) => (
              <tr
                className={`cursor-pointer text-center hover:bg-slate-50 ${
                  selectedCalcSnapshotId === snapshot.id
                    ? 'bg-[rgba(0,0,0,0.075)]'
                    : ''
                }`}
                key={snapshot.id}
                onClick={() => onSelectSnapshot(snapshot)}
              >
                <td className="px-2 py-1">{snapshot.id}</td>
                <td className="px-2 py-1">{snapshot.form.cpi}</td>
                <td className="px-2 py-1">{addComma(snapshot.derived.scCount)}</td>
                <td className="px-2 py-1">{addComma(snapshot.derived.qfCount)}</td>
                <td className="px-2 py-1">
                  {addComma(snapshot.derived.totalPartnerCost)}
                </td>
                <td className="px-2 py-1">
                  {addComma(snapshot.derived.totalSopCost)}
                </td>
                <td className="px-2 py-1">{addComma(snapshot.derived.pointFee)}</td>
                <td className="px-2 py-1">
                  {addComma(snapshot.derived.quoteEstimate)}
                </td>
                <td
                  className={`px-2 py-1 ${
                    snapshot.derived.gmPercent < 60 ? 'text-[#cc2b4f]' : ''
                  }`}
                >
                  {snapshot.derived.gmPercent.toFixed(2)}%
                </td>
                <td className="px-2 py-1">{addComma(snapshot.derived.gm)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
