import { createPortal } from 'react-dom';
import {
  BsArrowClockwise,
  BsCardChecklist,
  BsFileEarmarkText,
  BsFloppy,
} from 'react-icons/bs';

import {
  ConfirmAlertModal,
  FeedbackToast,
  WarningAlertModal,
} from '@/components/common/Feedback';
import { KrAddClientModal } from '@/pages/Create/components/kr/KrAddClientModal';
import { KrBasicInfoSection } from '@/pages/Create/components/kr/KrBasicInfoSection';
import { KrCalculatedQuotationSection } from '@/pages/Create/components/kr/KrCalculatedQuotationSection';
import { KrPartnerSection } from '@/pages/Create/components/kr/KrPartnerSection';
import { KrQuoteTableSection } from '@/pages/Create/components/kr/KrQuoteTableSection';
import { KrSopSection } from '@/pages/Create/components/kr/KrSopSection';
import { useKrCreateController } from '@/pages/Create/hooks/useKrCreateController';
import type { KrCreateFormProps } from '@/pages/Create/types';

import '../styles/KrCreate.css';

export function KrCreateForm(props: KrCreateFormProps): JSX.Element {
  const { lang } = props;
  const t = (ko: string, en: string): string => (lang === 'en' ? en : ko);
  const {
    addClientModalProps,
    basicInfoSectionProps,
    calculatedQuotationSectionProps,
    confirmAlertProps,
    feedbackToastProps,
    headerActionRoot,
    headerActions,
    partnerSectionProps,
    quoteTableSectionProps,
    resetKrSection,
    sopSectionProps,
    warningAlertProps,
  } = useKrCreateController(props);

  return (
    <div>
      <div className="grid lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8 lg:px-2">
          <section className="rounded-[10px] border border-black/7.5 bg-white shadow-sm">
            <div className="flex items-center border-b border-black/7.5 p-3">
              <div className="text-[1.2rem] font-medium text-[#3d3d43]">
                Quotation form
              </div>
              <button
                className="ml-auto inline-flex items-center justify-center rounded border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-50"
                onClick={resetKrSection}
                type="button"
              >
                <BsArrowClockwise className="text-[14px]" />
              </button>
            </div>

            <div className="p-4">
              <div className="space-y-3">
                <KrBasicInfoSection {...basicInfoSectionProps} />
                <KrPartnerSection {...partnerSectionProps} />
                <KrSopSection {...sopSectionProps} />
              </div>
            </div>
          </section>

          <KrCalculatedQuotationSection {...calculatedQuotationSectionProps} />
        </div>

        <KrQuoteTableSection {...quoteTableSectionProps} />
      </div>

      {headerActionRoot
        ? createPortal(
            <div
              className="relative inline-flex h-8 w-42.5 rounded-[50px]"
              ref={headerActions.saveMenuRef}
            >
              <div
                className={`kr-main-save-btn inline-flex overflow-hidden rounded-[50px] size-full ${
                  headerActions.isRequiredReady ? 'kr-flash-save-btn' : ''
                }`}
              >
                <button
                  className={`inline-flex h-full w-[80%] items-center justify-center gap-2 rounded-l-[50px] border-0 bg-transparent text-sm text-white transition-all duration-300 ${
                    headerActions.isSubmitting ? 'opacity-50' : ''
                  }`}
                  disabled={headerActions.isSubmitting}
                  onClick={headerActions.onPrimarySave}
                  type="button"
                >
                  {headerActions.isSubmitting ? (
                    <span className="animate-spin rounded-full border-2 border-white/70 border-t-white size-3.5" />
                  ) : (
                    <BsFloppy className="text-[13px]" />
                  )}
                  <span>{t('Save RFQ', 'Save RFQ')}</span>
                </button>
                <button
                  className="inline-flex h-full w-[20%] items-center justify-center rounded-r-[50px] border-0 border-l border-white/25 bg-transparent text-white"
                  onClick={headerActions.onToggleMenu}
                  type="button"
                >
                  ▾
                </button>
              </div>

              {headerActions.saveMenuOpen ? (
                <ul className="absolute right-0 top-[calc(100%+8px)] z-30 min-w-42.5 rounded-lg border border-slate-200 bg-white py-1 text-[13px] shadow-xl">
                  <li>
                    <button
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-[#6800cb26]"
                      onClick={headerActions.onSaveDraft}
                      type="button"
                    >
                      <BsFileEarmarkText className="text-[12px]" />
                      Save as draft
                    </button>
                  </li>
                  {headerActions.showUpdateAction ? (
                    <li>
                      <button
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-[#6800cb26]"
                        onClick={headerActions.onUpdate}
                        type="button"
                      >
                        <BsCardChecklist className="text-[12px]" />
                        Update
                      </button>
                    </li>
                  ) : null}
                </ul>
              ) : null}
            </div>,
            headerActionRoot,
          )
        : null}

      <WarningAlertModal {...warningAlertProps} />
      <ConfirmAlertModal {...confirmAlertProps} />
      <FeedbackToast {...feedbackToastProps} />

      {addClientModalProps ? <KrAddClientModal {...addClientModalProps} /> : null}
    </div>
  );
}
