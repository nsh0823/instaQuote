import {
  BsCopy,
  BsFileEarmarkArrowUp,
} from "react-icons/bs";
import { Link } from "react-router-dom";
import {
  useState,
  type ReactNode,
} from "react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type {
  GroupedRecord,
  ListMode,
} from "@/pages/List/types/list";
import {
  cellValue,
  formatCurrencyValue,
  formatPercentValue,
  toDisplayValue,
  writeTextToClipboard,
} from "@/pages/List/utils/list";

function DraftDrawerFieldRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}): JSX.Element {
  const displayValue =
    typeof value === "string" ? toDisplayValue(value) : value;

  return (
    <div className="grid grid-cols-[132px_minmax(0,1fr)] gap-4 border-b border-black/6 px-6 py-3 text-[13px]">
      <div className="font-medium text-[#5b5b5b]">{label}</div>
      <div className="min-w-0 wrap-break-word text-[#3d3d43]">{displayValue}</div>
    </div>
  );
}

type DraftDetailDrawerProps = {
  activeRecord: GroupedRecord | null;
  createPath: (draftId: string) => string;
  header: string[];
  mode: ListMode;
  onClose: () => void;
  onLoadDraft: () => void;
};

type SummaryRow = {
  copyValue: string;
  key: string;
  label: string;
  value: ReactNode;
};

export function DraftDetailDrawer({
  activeRecord,
  createPath,
  header,
  mode,
  onClose,
  onLoadDraft,
}: DraftDetailDrawerProps): JSX.Element {
  const [summaryCopyState, setSummaryCopyState] = useState<
    "idle" | "copied" | "failed"
  >("idle");
  const countries = activeRecord
    ? Array.from(
        new Set(
          activeRecord.rawRows
            .map((row) => cellValue(header, row, "Country"))
            .filter(Boolean),
        ),
      ).join(", ")
    : "";
  const summaryRows: SummaryRow[] = [];

  if (activeRecord) {
    const salesValue = formatCurrencyValue(
      mode === "KR"
        ? cellValue(header, activeRecord.displayRow, "Expected sales (without tax)")
        : cellValue(header, activeRecord.displayRow, "Total sales"),
    );
    const gmValue = formatCurrencyValue(
      mode === "KR"
        ? cellValue(header, activeRecord.displayRow, "GM")
        : cellValue(header, activeRecord.displayRow, "Total GM"),
    );
    const gmPercentValue = formatPercentValue(
      mode === "KR"
        ? cellValue(header, activeRecord.displayRow, "GM (%)")
        : cellValue(header, activeRecord.displayRow, "Total GM (%)"),
    );

    summaryRows.push(
      {
        copyValue: toDisplayValue(activeRecord.date),
        key: "date",
        label: "Date",
        value: activeRecord.date,
      },
      {
        copyValue: toDisplayValue(activeRecord.owner),
        key: "owner",
        label: "Owner",
        value: activeRecord.owner,
      },
    );

    if (mode === "OS") {
      summaryRows.push({
        copyValue: toDisplayValue(countries),
        key: "countries",
        label: "Countries",
        value: countries,
      });
    }

    summaryRows.push(
      {
        copyValue: toDisplayValue(activeRecord.client),
        key: "client",
        label: "Client",
        value: activeRecord.client,
      },
      {
        copyValue: toDisplayValue(
          cellValue(header, activeRecord.displayRow, "Client name"),
        ),
        key: "client-name",
        label: "Client name",
        value: cellValue(header, activeRecord.displayRow, "Client name"),
      },
      {
        copyValue: toDisplayValue(
          cellValue(header, activeRecord.displayRow, "Project name (Mail title)"),
        ),
        key: "project-name",
        label: "Project name",
        value: cellValue(
          header,
          activeRecord.displayRow,
          "Project name (Mail title)",
        ),
      },
      {
        copyValue: toDisplayValue(
          cellValue(header, activeRecord.displayRow, "Targeting condition"),
        ),
        key: "targeting-condition",
        label: "Targeting condition",
        value: cellValue(header, activeRecord.displayRow, "Targeting condition"),
      },
      {
        copyValue: toDisplayValue(
          cellValue(header, activeRecord.displayRow, "Project type"),
        ),
        key: "project-type",
        label: "Project type",
        value: cellValue(header, activeRecord.displayRow, "Project type"),
      },
      {
        copyValue: salesValue,
        key: "total-sales",
        label: "Total sales",
        value: salesValue,
      },
      {
        copyValue: gmValue,
        key: "total-gm",
        label: "Total GM",
        value: gmValue,
      },
      {
        copyValue: gmPercentValue,
        key: "total-gm-percent",
        label: "Total GM (%)",
        value: gmPercentValue,
      },
    );
  }

  const copySummaryTitle =
    summaryCopyState === "copied"
      ? "Copied!"
      : summaryCopyState === "failed"
        ? "Copy failed"
        : "Copy summary";

  async function handleCopySummary(): Promise<void> {
    if (!activeRecord) {
      return;
    }

    try {
      await writeTextToClipboard(
        summaryRows.map((row) => `${row.label}\t${row.copyValue}`).join("\n"),
      );
      setSummaryCopyState("copied");
    } catch (_error) {
      setSummaryCopyState("failed");
    }

    window.setTimeout(() => setSummaryCopyState("idle"), 1500);
  }

  return (
    <Sheet
      modal={false}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      open={Boolean(activeRecord)}
    >
      <SheetContent
        className="list-page-sheet w-full gap-0 rounded-tl-[50px] p-0 sm:max-w-130"
        side="right"
        showCloseButton={false}
      >
        {activeRecord ? (
          <>
            <SheetHeader className="flex-row items-center justify-between gap-3 border-b border-black/6 px-6 py-5 text-left">
              <div className="min-w-0">
                <SheetTitle className="text-[22px] font-semibold text-[#3d3d43]">
                  Draft #{activeRecord.id}
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Draft detail offcanvas
                </SheetDescription>
              </div>
              <SheetClose className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-[#5b5b5b] transition-colors hover:bg-black/4 hover:text-[#3d3d43]">
                <span aria-hidden="true" className="text-[28px] leading-none">
                  ×
                </span>
                <span className="sr-only">Close</span>
              </SheetClose>
            </SheetHeader>

            <div className="min-h-0 flex-1 overflow-auto">
              <div className="px-6 py-5">
                <div className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-[#3d3d43]">
                  <span>Summary</span>
                  <button
                    aria-label={copySummaryTitle}
                    className="inline-flex size-7 items-center justify-center rounded border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-[#764cfc]"
                    onClick={() => {
                      void handleCopySummary();
                    }}
                    title={copySummaryTitle}
                    type="button"
                  >
                    <BsCopy className="text-[13px]" />
                  </button>
                </div>
                <div className="overflow-hidden rounded-[10px] border border-black/6 bg-white">
                  {summaryRows.map((row) => (
                    <DraftDrawerFieldRow
                      key={row.key}
                      label={row.label}
                      value={row.value}
                    />
                  ))}
                </div>
              </div>
            </div>

            <SheetFooter className="border-t border-black/6 bg-white px-6 py-4">
              <div className="flex w-full">
                <Link
                  className="list-page-primary-button w-full"
                  onClick={onLoadDraft}
                  target="_blank"
                  to={createPath(activeRecord.id)}
                >
                  <BsFileEarmarkArrowUp size={14} />
                  <span>Load Draft</span>
                </Link>
              </div>
            </SheetFooter>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
