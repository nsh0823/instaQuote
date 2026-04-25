import { useMemo, useState, type Dispatch, type SetStateAction } from "react";

import {
  createRfq,
  exportRfq,
  saveDraft,
  saveExportRfq,
  updateRfq,
} from "@/lib/api";
import type { ApiMutationResult } from "@/types/backend";
import type { OsPanelState } from "@/pages/Create/types";
import { missingRequiredForPanel } from "@/pages/Create/utils/os-panels";
import { buildOsSubmitFields } from "@/pages/Create/utils/os-serialization";
import { t } from "@/utils/lang";

export type OsSubmitAction =
  | "save"
  | "export"
  | "save-export"
  | "save-draft"
  | "update";

type ToastState = {
  body: string;
  linkHref?: string;
  linkLabel?: string;
  open: boolean;
  title: string;
  type: "success" | "fail";
};

type UseOsSubmitParams = {
  activeRecordId: string;
  finalGM: number;
  finalGMPer: string;
  finalProgramming: string;
  finalSales: number;
  hasAllPanelsCalculated: boolean;
  lang: string;
  osPanels: OsPanelState[];
  setWarningMessage: Dispatch<SetStateAction<string>>;
  totalOther: number;
  totalOverlay: number;
};

type UseOsSubmitResult = {
  cancelConfirm: () => void;
  closeToast: () => void;
  confirmAction: OsSubmitAction | null;
  confirmLabel: string;
  confirmMessage: string;
  handleConfirmSubmit: () => Promise<void>;
  isSubmitting: boolean;
  openConfirm: (action: OsSubmitAction, onOpen?: () => void) => void;
  toastState: ToastState;
};

function isExportAction(action: OsSubmitAction): boolean {
  return action === "export" || action === "save-export";
}

function getConfirmMessage(
  action: OsSubmitAction | null,
  lang: string,
): string {
  if (action === "export") {
    return t(
      lang,
      "이 RFQ를 내보내시겠습니까?",
      "Are you sure you want to export this RFQ?",
    );
  }
  if (action === "save-export") {
    return t(
      lang,
      "이 RFQ를 저장 및 내보내시겠습니까?",
      "Are you sure you want to save and export this RFQ?",
    );
  }
  if (action === "update") {
    return t(
      lang,
      "이 RFQ를 업데이트 하시겠습니까?",
      "Are you sure you want to update this RFQ?",
    );
  }
  if (action === "save-draft") {
    return t(
      lang,
      "이 RFQ를 임시 저장 하시겠습니까?",
      "Are you sure you want to save this RFQ as draft?",
    );
  }
  return t(
    lang,
    "이 RFQ를 저장 하시겠습니까?",
    "Are you sure you want to save this RFQ?",
  );
}

function getConfirmLabel(action: OsSubmitAction | null): string {
  if (action === "export") {
    return "Export";
  }
  if (action === "save-export") {
    return "Save & Export";
  }
  if (action === "update") {
    return "Update";
  }
  return "Save";
}

export function useOsSubmit({
  activeRecordId,
  finalGM,
  finalGMPer,
  finalProgramming,
  finalSales,
  hasAllPanelsCalculated,
  lang,
  osPanels,
  setWarningMessage,
  totalOther,
  totalOverlay,
}: UseOsSubmitParams): UseOsSubmitResult {
  const [confirmAction, setConfirmAction] = useState<OsSubmitAction | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastState, setToastState] = useState<ToastState>({
    body: "",
    open: false,
    title: "",
    type: "success",
  });

  const confirmLabel = useMemo(
    () => getConfirmLabel(confirmAction),
    [confirmAction],
  );
  const confirmMessage = useMemo(
    () => getConfirmMessage(confirmAction, lang),
    [confirmAction, lang],
  );

  function openConfirm(action: OsSubmitAction, onOpen?: () => void): void {
    const requiresCompletedCalculation =
      action === "save" || action === "export" || action === "save-export";

    if (osPanels.length === 0) {
      setWarningMessage(
        t(
          lang,
          "국가 폼을 먼저 생성해주세요.",
          "Please create country forms first.",
        ),
      );
      return;
    }

    const hasMissing = osPanels.some((panel) => missingRequiredForPanel(panel));
    if (hasMissing && action !== "save-draft") {
      setWarningMessage(
        t(
          lang,
          "필수항목을 모두 입력해주세요.",
          "Please fill out all required fields.",
        ),
      );
      return;
    }

    if (requiresCompletedCalculation && !hasAllPanelsCalculated) {
      setWarningMessage(
        t(
          lang,
          "필수항목을 모두 입력해주세요.",
          "Please fill out all required fields.",
        ),
      );
      return;
    }

    if (action === "update" && !activeRecordId) {
      setWarningMessage(
        t(
          lang,
          "업데이트할 RFQ ID가 없습니다.",
          "No RFQ ID is available for update.",
        ),
      );
      return;
    }

    onOpen?.();
    setConfirmAction(action);
  }

  function cancelConfirm(): void {
    setConfirmAction(null);
  }

  async function handleConfirmSubmit(): Promise<void> {
    if (!confirmAction || isSubmitting) {
      return;
    }

    const action = confirmAction;

    try {
      setIsSubmitting(true);
      const fields = buildOsSubmitFields({
        action,
        activeRecordId,
        finalGM,
        finalGMPer,
        finalProgramming,
        finalSales,
        osPanels,
        totalOther,
        totalOverlay,
      });

      let result: ApiMutationResult;

      if (action === "save") {
        result = await createRfq(fields);
      } else if (action === "save-draft") {
        result = await saveDraft(fields);
      } else if (action === "update") {
        result = await updateRfq(fields);
      } else if (action === "export") {
        result = await exportRfq(fields);
      } else {
        result = await saveExportRfq(fields);
      }

      const outputUrl = result.outputUrl?.trim();
      const shouldOpenExport = isExportAction(action);

      if (shouldOpenExport && outputUrl && typeof window !== "undefined") {
        window.open(outputUrl, "_blank", "noopener,noreferrer");
      }

      setToastState({
        body:
          action === "save-draft"
            ? t(
                lang,
                "RFQ가 임시 저장되었습니다.",
                "Your RFQ has been saved as draft.",
              )
            : action === "update"
              ? t(
                  lang,
                  "RFQ가 업데이트되었습니다.",
                  "Your RFQ has been updated successfully.",
                )
              : action === "export"
                ? t(
                    lang,
                    outputUrl
                      ? "RFQ가 내보내기 되었으며 새 탭에서 열립니다."
                      : "RFQ가 내보내기 되었습니다.",
                    outputUrl
                      ? "Your RFQ has been exported successfully and will open in a new tab."
                      : "Your RFQ has been exported successfully.",
                  )
                : action === "save-export"
                  ? t(
                      lang,
                      outputUrl
                        ? "RFQ가 저장 및 내보내기 되었으며 새 탭에서 열립니다."
                        : "RFQ가 저장 및 내보내기 되었습니다.",
                      outputUrl
                        ? "Your RFQ has been saved, exported, and will open in a new tab."
                        : "Your RFQ has been saved and exported.",
                    )
                  : t(
                      lang,
                      "RFQ가 저장되었습니다.",
                      "Your RFQ has been saved successfully.",
                    ),
        linkHref: shouldOpenExport ? outputUrl : undefined,
        linkLabel:
          shouldOpenExport && outputUrl
            ? t(lang, "내보낸 RFQ 열기", "Open exported RFQ")
            : undefined,
        open: true,
        title:
          action === "save-draft"
            ? "Draft Saved!"
            : action === "update"
              ? "Updated!"
              : action === "export"
                ? "Exported!"
                : action === "save-export"
                  ? "Saved & Exported!"
                  : "Saved!",
        type: "success",
      });
      setConfirmAction(null);
    } catch (error) {
      setToastState({
        body:
          error instanceof Error ? error.message : "Unknown error occurred.",
        open: true,
        title: "Failed..",
        type: "fail",
      });
      setConfirmAction(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  function closeToast(): void {
    setToastState((prev) => ({ ...prev, open: false }));
  }

  return {
    cancelConfirm,
    closeToast,
    confirmAction,
    confirmLabel,
    confirmMessage,
    handleConfirmSubmit,
    isSubmitting,
    openConfirm,
    toastState,
  };
}
