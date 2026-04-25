import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';

import {
  createRfq,
  saveDraft,
  updateRfq,
} from '@/lib/api';
import type {
  ClientGroup,
  ConfirmAction,
  DerivedValues,
  KrFormState,
  PartnerRow,
  SopRow,
} from '@/pages/Create/types';
import { getRequiredMissingFields } from '@/pages/Create/utils/kr-calculations';
import { buildKrSubmitFields } from '@/pages/Create/utils/kr-serialization';

type ToastState = {
  body: string;
  linkHref?: string;
  linkLabel?: string;
  open: boolean;
  title: string;
  type: 'success' | 'fail';
};

type ToastInput = Omit<ToastState, 'open'> & { open?: boolean };

type UseKrSubmitParams = {
  activeRecordId: string;
  actualCpi: string;
  clientGroups: ClientGroup[];
  customGroupByClient: Record<string, string>;
  derivedValues: DerivedValues;
  form: KrFormState;
  lang: 'ko' | 'en';
  partnerCount: number;
  partnerRows: PartnerRow[];
  setWarningMessage: Dispatch<SetStateAction<string>>;
  sopRows: { sop1: SopRow; sop2: SopRow };
};

type UseKrSubmitResult = {
  cancelConfirm: () => void;
  closeToast: () => void;
  confirmAction: ConfirmAction;
  confirmLabel: string;
  confirmMessage: string;
  handleConfirmSubmit: () => Promise<void>;
  isSubmitting: boolean;
  openConfirm: (
    action: Exclude<ConfirmAction, null>,
    onOpen?: () => void,
  ) => void;
  showToast: (toast: ToastInput) => void;
  toastState: ToastState;
};

const KR_LIST_URL =
  'https://script.google.com/macros/s/AKfycbzR4C6JvphST5AY-i8Gzpv1ECapoC0pwl4Xyv8qx4i2Mv8sIO8chVT4fKumq_VCIVr4/exec?mode=List-KR';

function translate(lang: 'ko' | 'en', ko: string, en: string): string {
  return lang === 'en' ? en : ko;
}

function getConfirmLabel(action: ConfirmAction): string {
  if (action === 'update') {
    return 'Update';
  }

  return 'Save';
}

function getConfirmMessage(
  action: ConfirmAction,
  lang: 'ko' | 'en',
): string {
  if (action === 'save-draft') {
    return translate(
      lang,
      '이 RFQ를 임시 저장 하시겠습니까?',
      'Are you sure you want to save this RFQ as draft?',
    );
  }

  if (action === 'update') {
    return translate(
      lang,
      '이 RFQ를 업데이트 하시겠습니까?',
      'Are you sure you want to update this RFQ?',
    );
  }

  return translate(
    lang,
    '이 RFQ를 저장 하시겠습니까?',
    'Are you sure you want to save this RFQ?',
  );
}

export function useKrSubmit({
  activeRecordId,
  actualCpi,
  clientGroups,
  customGroupByClient,
  derivedValues,
  form,
  lang,
  partnerCount,
  partnerRows,
  setWarningMessage,
  sopRows,
}: UseKrSubmitParams): UseKrSubmitResult {
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastState, setToastState] = useState<ToastState>({
    body: '',
    open: false,
    title: '',
    type: 'success',
  });

  const confirmLabel = useMemo(
    () => getConfirmLabel(confirmAction),
    [confirmAction],
  );
  const confirmMessage = useMemo(
    () => getConfirmMessage(confirmAction, lang),
    [confirmAction, lang],
  );

  function showToast(toast: ToastInput): void {
    setToastState({
      open: true,
      ...toast,
    });
  }

  function openConfirm(
    action: Exclude<ConfirmAction, null>,
    onOpen?: () => void,
  ): void {
    const missing = getRequiredMissingFields(form);

    if (missing.length > 0) {
      setWarningMessage(
        translate(
          lang,
          '필수항목을 모두 입력해주세요.',
          'Please fill out all required fields.',
        ),
      );
      return;
    }

    if (action === 'update' && !activeRecordId) {
      setWarningMessage(
        translate(
          lang,
          '업데이트할 RFQ ID가 없습니다.',
          'No RFQ ID is available for update.',
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
    if (!confirmAction) {
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = buildKrSubmitFields({
        action: confirmAction,
        activeRecordId,
        actualCpi,
        clientGroups,
        customGroupByClient,
        derivedValues,
        form,
        partnerCount,
        partnerRows,
        sopRows,
      });

      if (confirmAction === 'save') {
        await createRfq(payload);
      } else if (confirmAction === 'save-draft') {
        await saveDraft(payload);
      } else {
        await updateRfq(payload);
      }

      showToast({
        body:
          confirmAction === 'save-draft'
            ? translate(
                lang,
                'RFQ가 임시 저장되었습니다.',
                'Your RFQ has been saved as draft.',
              )
            : confirmAction === 'update'
              ? translate(
                  lang,
                  'RFQ가 업데이트되었습니다.',
                  'Your RFQ has been updated successfully.',
                )
              : translate(
                  lang,
                  'RFQ가 저장되었습니다.',
                  'Your RFQ has been saved successfully.',
                ),
        linkHref: KR_LIST_URL,
        linkLabel: translate(
          lang,
          'RFQ 리스트로 이동',
          'Go to RFQ List.',
        ),
        title:
          confirmAction === 'save-draft'
            ? translate(lang, 'Draft Saved!', 'Draft Saved!')
            : confirmAction === 'update'
              ? translate(lang, 'Updated!', 'Updated!')
              : translate(lang, 'Saved!', 'Saved!'),
        type: 'success',
      });
      setConfirmAction(null);
    } catch (error) {
      showToast({
        body:
          error instanceof Error ? error.message : 'Unknown error occurred.',
        title: translate(lang, 'Failed..', 'Failed..'),
        type: 'fail',
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
    showToast,
    toastState,
  };
}
