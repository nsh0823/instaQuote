import type { ReactNode } from 'react';
import { BsCheckCircleFill, BsXCircleFill, BsXLg } from 'react-icons/bs';

type WarningAlertModalProps = {
  message: ReactNode;
  onClose: () => void;
  open: boolean;
  title?: string;
};

type ConfirmAlertModalProps = {
  cancelLabel?: string;
  confirmLabel?: string;
  isSubmitting?: boolean;
  message: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
  title?: string;
};

type FeedbackToastProps = {
  body: ReactNode;
  linkHref?: string;
  linkLabel?: string;
  onClose: () => void;
  open: boolean;
  showBackdrop?: boolean;
  title: ReactNode;
  type: 'success' | 'fail';
};

function ModalShell({
  children,
  closeDisabled = false,
  onClose,
  open,
}: {
  children: ReactNode;
  closeDisabled?: boolean;
  onClose: () => void;
  open: boolean;
}): JSX.Element | null {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-9998 flex items-start justify-center bg-black/40 px-4 pt-10">
      <div
        aria-modal="true"
        className="w-full max-w-112.5 overflow-hidden rounded-[10px] border border-black/5 bg-white shadow-2xl"
        role="dialog"
      >
        {children}
      </div>
      <button
        aria-label="Close"
        disabled={closeDisabled}
        className="sr-only"
        onClick={onClose}
        type="button"
      >
        Close
      </button>
    </div>
  );
}

export function WarningAlertModal({
  message,
  onClose,
  open,
  title = 'Please check',
}: WarningAlertModalProps): JSX.Element | null {
  return (
    <ModalShell onClose={onClose} open={open}>
      <div className="px-4 pb-1 pt-4 text-[18px] font-medium text-[#3d3d43]">{title}</div>
      <div className="px-4 py-2 text-sm text-[#4d4d4d]">{message}</div>
      <div className="flex justify-end px-4 pb-4 pt-3">
        <button
          className="rounded-[20px] bg-[#764cfc] px-4 py-1.5 text-sm text-white transition hover:bg-[#6535ff]"
          onClick={onClose}
          type="button"
        >
          OK
        </button>
      </div>
    </ModalShell>
  );
}

export function ConfirmAlertModal({
  cancelLabel = 'Cancel',
  confirmLabel = 'OK',
  isSubmitting = false,
  message,
  onCancel,
  onConfirm,
  open,
  title = 'Please confirm',
}: ConfirmAlertModalProps): JSX.Element | null {
  return (
    <ModalShell closeDisabled={isSubmitting} onClose={onCancel} open={open}>
      <div className="px-4 pb-1 pt-4 text-[18px] font-medium text-[#3d3d43]">{title}</div>
      <div className="px-4 py-2 text-sm text-[#4d4d4d]">{message}</div>
      <div className="flex justify-end gap-2 px-4 pb-4 pt-3">
        <button
          className={`rounded-[20px] px-4 py-1.5 text-sm text-[#4d4d4d] transition ${
            isSubmitting ? 'cursor-not-allowed opacity-50' : 'hover:bg-slate-100'
          }`}
          disabled={isSubmitting}
          onClick={onCancel}
          type="button"
        >
          {cancelLabel}
        </button>
        <button
          className={`inline-flex min-w-22 items-center justify-center gap-2 rounded-[20px] bg-[#764cfc] px-4 py-1.5 text-sm text-white transition ${
            isSubmitting ? 'cursor-wait opacity-80' : 'hover:bg-[#6535ff]'
          }`}
          disabled={isSubmitting}
          onClick={onConfirm}
          type="button"
        >
          {isSubmitting ? (
            <span className="animate-spin rounded-full border-2 border-white/70 border-t-white size-3.5" />
          ) : null}
          {confirmLabel}
        </button>
      </div>
    </ModalShell>
  );
}

export function FeedbackToast({
  body,
  linkHref,
  linkLabel,
  onClose,
  open,
  showBackdrop = false,
  title,
  type,
}: FeedbackToastProps): JSX.Element | null {
  if (!open) {
    return null;
  }

  const isSuccess = type === 'success';

  return (
    <>
      <style>{`@keyframes feedback-shake{0%{transform:translateX(0)}25%{transform:translateX(-10px)}50%{transform:translateX(10px)}75%{transform:translateX(-10px)}100%{transform:translateX(0)}}`}</style>
      {showBackdrop ? <div className="fixed inset-0 z-10000 bg-black/50" /> : null}
      <div className="fixed left-1/2 top-1.25 z-10001 w-87.5 -translate-x-1/2 p-3">
        <div
          className={`overflow-hidden rounded-[10px] border-l-[6px] bg-white shadow-lg ${
            isSuccess ? 'border-l-[#6535ff]' : 'border-l-[#cc2b4f]'
          }`}
          style={isSuccess ? undefined : { animation: 'feedback-shake 0.5s ease' }}
        >
          <div className="flex items-start gap-2 px-3 py-2">
            {isSuccess ? (
              <BsCheckCircleFill className="mt-0.5 text-[18px] text-[#6535ff]" />
            ) : (
              <BsXCircleFill className="mt-0.5 text-[18px] text-[#cc2b4f]" />
            )}
            <strong
              className={`mr-auto text-[115%] font-semibold ${
                isSuccess ? 'text-[#6535ff]' : 'text-[#cc2b4f]'
              }`}
            >
              {title}
            </strong>
            <button
              aria-label="Close"
              className="text-slate-500 hover:text-slate-700"
              onClick={onClose}
              type="button"
            >
              <BsXLg className="text-[14px]" />
            </button>
          </div>
          <div className="px-3 pb-3 text-[90%] text-gray-500">
            <div>{body}</div>
            {linkHref && linkLabel ? (
              <a
                className="mt-1 inline-block text-[#6535ff] underline"
                href={linkHref}
                rel="noreferrer"
                target="_blank"
              >
                {linkLabel}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
