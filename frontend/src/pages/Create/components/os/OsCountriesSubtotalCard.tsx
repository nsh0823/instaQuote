import { useLayoutEffect, useRef, useState } from "react";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";

import {
  addComma,
  formatPercentDisplay,
  normalizeIntegerInput,
} from "@/pages/Create/utils/number";

type OsCountriesSubtotalCardProps = {
  finalGM: number;
  finalGMPer: string;
  finalProgramming: string;
  finalSales: number;
  onFinalProgrammingChange: (value: string) => void;
  totalOther: number;
  totalOverlay: number;
};

export function OsCountriesSubtotalCard({
  finalGM,
  finalGMPer,
  finalProgramming,
  finalSales,
  onFinalProgrammingChange,
  totalOther,
  totalOverlay,
}: OsCountriesSubtotalCardProps): JSX.Element {
  const [showSubtotal, setShowSubtotal] = useState(false);
  const [subtotalCardHeight, setSubtotalCardHeight] = useState<number | null>(
    null,
  );
  const [finalProgrammingInputWidth, setFinalProgrammingInputWidth] =
    useState(70);

  const subtotalCardContentRef = useRef<HTMLDivElement | null>(null);
  const finalProgrammingInputRef = useRef<HTMLInputElement | null>(null);
  const finalProgrammingMeasureRef = useRef<HTMLSpanElement | null>(null);

  useLayoutEffect(() => {
    if (!subtotalCardContentRef.current) {
      return;
    }

    setSubtotalCardHeight(subtotalCardContentRef.current.scrollHeight + 15);
  }, [showSubtotal]);

  useLayoutEffect(() => {
    const measure = finalProgrammingMeasureRef.current;
    if (!measure) {
      return;
    }

    const nextWidth = Math.ceil(measure.getBoundingClientRect().width);
    setFinalProgrammingInputWidth(nextWidth > 0 ? nextWidth + 4 : 70);
  }, [finalProgramming]);

  return (
    <div className="rounded-[10px] bg-white p-2">
      <div
        className="overflow-hidden rounded-[10px] bg-linear-to-br from-[#8587a1] to-[#3d3d43] px-2.5 py-1.25 text-white shadow-[0_0_0.75rem_rgba(0,0,0,0.25)] transition-[height] duration-500 ease-in-out will-change-[height]"
        style={
          subtotalCardHeight ? { height: `${subtotalCardHeight}px` } : undefined
        }
      >
        <div ref={subtotalCardContentRef}>
          <button
            className="flex h-4.25 w-full items-center justify-center text-[10px]"
            onClick={() => setShowSubtotal((prev) => !prev)}
            type="button"
          >
            {showSubtotal ? <BsChevronDown /> : <BsChevronUp />}
          </button>
          <table className="w-full text-[12px]">
            <tbody>
              {showSubtotal ? (
                <>
                  <tr
                    className="cursor-text"
                    onClick={() => {
                      finalProgrammingInputRef.current?.focus();
                      finalProgrammingInputRef.current?.select();
                    }}
                  >
                    <th className="w-1/2 text-left font-normal opacity-95">
                      Programming fee
                    </th>
                    <td className="text-right font-medium">
                      <div className="flex items-center justify-end text-white">
                        <span
                          className={`pr-0 text-[12px] ${
                            finalProgramming ? "opacity-100" : "opacity-0"
                          }`}
                        >
                          ₩
                        </span>
                        <span
                          aria-hidden="true"
                          className="pointer-events-none invisible absolute whitespace-pre text-right text-[12px] font-medium"
                          ref={finalProgrammingMeasureRef}
                        >
                          {finalProgramming}
                        </span>
                        <input
                          className="bg-transparent text-right text-[12px] font-medium text-white outline-none placeholder:font-light placeholder:italic placeholder:text-white/90"
                          inputMode="numeric"
                          onChange={(event) =>
                            onFinalProgrammingChange(
                              normalizeIntegerInput(event.target.value),
                            )
                          }
                          onClick={(event) => event.stopPropagation()}
                          placeholder="Click to edit"
                          ref={finalProgrammingInputRef}
                          style={{
                            width: `${finalProgrammingInputWidth}px`,
                          }}
                          value={finalProgramming}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th className="w-1/2 text-left font-normal opacity-95">
                      Overlay fee
                    </th>
                    <td className="text-right font-medium">
                      <div className="flex items-center justify-end text-white">
                        <span
                          className={`pr-1 text-[12px] ${
                            totalOverlay > 0 ? "opacity-100" : "opacity-0"
                          }`}
                        >
                          ₩
                        </span>
                        <span>{totalOverlay > 0 ? addComma(totalOverlay) : "-"}</span>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-white/30 pb-1">
                    <th className="w-1/2 pb-1 text-left font-normal opacity-95">
                      Other fee
                    </th>
                    <td className="pb-1 text-right font-medium">
                      <div className="flex items-center justify-end text-white">
                        <span
                          className={`pr-1 text-[12px] ${
                            totalOther > 0 ? "opacity-100" : "opacity-0"
                          }`}
                        >
                          ₩
                        </span>
                        <span>{totalOther > 0 ? addComma(totalOther) : "-"}</span>
                      </div>
                    </td>
                  </tr>
                </>
              ) : null}
              <tr>
                <th className="w-1/2 pt-1 text-left font-normal opacity-95">
                  Total sales (Excl. VAT)
                </th>
                <td className="pt-1 text-right text-[14px] font-medium">
                  <div className="flex items-center justify-end text-white">
                    <span
                      className={`pr-1 text-[12px] ${
                        finalSales > 0 ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      ₩
                    </span>
                    <span>{finalSales > 0 ? addComma(finalSales) : "-"}</span>
                  </div>
                </td>
              </tr>
              <tr>
                <th className="w-1/2 text-left font-normal opacity-95">
                  Total GM (%)
                </th>
                <td className="text-right text-[14px] font-medium">
                  {finalGMPer ? formatPercentDisplay(finalGMPer) : "-"}
                </td>
              </tr>
              <tr>
                <th className="w-1/2 text-left font-normal opacity-95">
                  Total GM
                </th>
                <td className="text-right text-[14px] font-medium">
                  <div className="flex items-center justify-end text-white">
                    <span
                      className={`pr-1 text-[12px] ${
                        finalGM ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      ₩
                    </span>
                    <span>{finalGM ? addComma(finalGM) : "-"}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
