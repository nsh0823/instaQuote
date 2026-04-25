import {
  BsArrowClockwise,
  BsExclamationTriangleFill,
  BsInfoCircleFill,
} from 'react-icons/bs';

import type { QuoteTableState } from '@/pages/Create/types';
import { formatCellNumber } from '@/pages/Create/utils/kr-calculations';

type KrQuoteTableSectionProps = {
  onClear: () => void;
  onCopy: () => void | Promise<void>;
  onGenerate: () => void;
  quoteTableState: QuoteTableState;
};

export function KrQuoteTableSection({
  onClear,
  onCopy,
  onGenerate,
  quoteTableState,
}: KrQuoteTableSectionProps): JSX.Element {
  const quoteGenerated = quoteTableState.subtotalExVat !== null;
  const showOperationRow = quoteGenerated
    ? quoteTableState.operationVisible
    : true;
  const showProgrammingRow = quoteGenerated
    ? quoteTableState.programmingVisible
    : true;

  return (
    <div className="space-y-4 lg:col-span-4 lg:px-2">
      <section className="overflow-hidden rounded-[10px] border border-black/7.5 bg-white shadow-sm">
        <div className="flex items-center border-b border-black/7.5 p-3">
          <div className="text-[1.2rem] font-medium text-[#3d3d43]">
            Quote table
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
              className="inline-flex h-full items-center justify-center rounded border border-slate-300 bg-white px-2 p-1.5 text-[65%] text-slate-700 hover:bg-slate-50"
              onClick={onGenerate}
              type="button"
            >
              Generate
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-2 flex justify-end">
            <button
              className="rounded border border-[#0d6efd] px-2 py-1 text-[10px] text-[#0d6efd] hover:bg-[#0d6efd]/10"
              onClick={() => {
                void onCopy();
              }}
              type="button"
            >
              Copy
            </button>
          </div>

          <table className="w-full border-collapse text-[9.5pt]">
            <colgroup>
              <col style={{ width: '43%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '19%' }} />
              <col style={{ width: '24%' }} />
            </colgroup>
            <thead>
              <tr>
                <th className="border border-black bg-[#f2f2f2] px-1 py-1.5 text-center font-bold">
                  Description
                </th>
                <th className="border border-black bg-[#f2f2f2] px-1 py-1.5 text-center font-bold">
                  Qty
                </th>
                <th className="border border-black bg-[#f2f2f2] px-1 py-1.5 text-center font-bold">
                  Price
                </th>
                <th className="border border-black bg-[#f2f2f2] px-1 py-1.5 text-center font-bold">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black px-1 py-1.5 text-left">
                  Usage fee
                </td>
                <td className="border border-black px-1 py-1.5 text-center">
                  {formatCellNumber(quoteTableState.usageQty)}
                </td>
                <td className="border border-black px-1 py-1.5 text-right">
                  {formatCellNumber(quoteTableState.usageCpi)}
                </td>
                <td className="border border-black px-1 py-1.5 text-right">
                  {formatCellNumber(quoteTableState.usageCost)}
                </td>
              </tr>
              {showOperationRow ? (
                <tr>
                  <td className="border border-black px-1 py-1.5 text-left">
                    Operation fee
                  </td>
                  <td className="border border-black px-1 py-1.5 text-center">
                    {quoteTableState.operationCost === null ? '' : '1'}
                  </td>
                  <td className="border border-black px-1 py-1.5 text-right">
                    {formatCellNumber(quoteTableState.operationCost)}
                  </td>
                  <td className="border border-black px-1 py-1.5 text-right">
                    {formatCellNumber(quoteTableState.operationCost)}
                  </td>
                </tr>
              ) : null}
              {showProgrammingRow ? (
                <tr>
                  <td className="border border-black px-1 py-1.5 text-left">
                    Programming fee
                  </td>
                  <td className="border border-black px-1 py-1.5 text-center">
                    {quoteTableState.programmingCost === null ? '' : '1'}
                  </td>
                  <td className="border border-black px-1 py-1.5 text-right">
                    {formatCellNumber(quoteTableState.programmingCost)}
                  </td>
                  <td className="border border-black px-1 py-1.5 text-right">
                    {formatCellNumber(quoteTableState.programmingCost)}
                  </td>
                </tr>
              ) : null}
              <tr>
                <td
                  className="border border-black bg-[#efefef] px-1 py-1.5 text-center font-bold"
                  colSpan={3}
                >
                  Subtotal (excl VAT)
                </td>
                <td className="border border-black bg-[#efefef] px-1 py-1.5 text-right font-bold">
                  {formatCellNumber(quoteTableState.subtotalExVat)}
                </td>
              </tr>
              <tr>
                <td
                  className="border border-black bg-[#cce4f4] px-1 py-1.5 text-center font-bold"
                  colSpan={3}
                >
                  Total (incl VAT)
                </td>
                <td className="border border-black bg-[#cce4f4] px-1 py-1.5 text-right font-bold">
                  {formatCellNumber(quoteTableState.totalIncVat)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-[10px] border border-[#5f17b8]/30 bg-white shadow-sm">
        <div className="flex items-center justify-center bg-[#5f17b8]/15 px-3 py-2">
          <BsInfoCircleFill className="text-[20px] text-[#8317b8]" />
        </div>
        <div className="p-4 text-center text-[13px] text-slate-500">
          Reference information goes here.
        </div>
      </section>

      <section className="overflow-hidden rounded-[10px] border border-[#fabc09]/30 bg-white shadow-sm">
        <div className="flex">
          <div className="flex w-15 items-center justify-center bg-[#fabc09]/10">
            <BsExclamationTriangleFill className="text-[20px] text-[#fabc09]" />
          </div>
          <div className="flex-1 p-2 text-[12px] text-slate-600 opacity-80">
            <div className="mb-1 text-center text-[13px] font-semibold">
              [Exceptions]
            </div>
            <ul className="ml-6 list-disc space-y-0.5 text-left">
              <li>Exception 1</li>
              <li>Exception 2</li>
              <li>Exception 3</li>
              <li>Exception 4</li>
              <li>Exception 5</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
