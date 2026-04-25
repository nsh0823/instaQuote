import { useEffect, useRef, useState } from 'react';

import type {
  CalcSnapshot,
  KrCreateFormProps,
  KrFormState,
} from '@/pages/Create/types';
import { useKrClientOptions } from '@/pages/Create/hooks/useKrClientOptions';
import { useKrPricingState } from '@/pages/Create/hooks/useKrPricingState';
import { useKrSubmit } from '@/pages/Create/hooks/useKrSubmit';
import { chooseClientFromHint as chooseClientFromEmail } from '@/pages/Create/utils/client';
import {
  cloneForm,
  clonePartnerRows,
  cloneSopRows,
} from '@/pages/Create/utils/kr-calculations';
import { addComma } from '@/pages/Create/utils/number';

export function useKrCreateController({
  activeRecordId,
  activeUser,
  clientGroups,
  compPtRows,
  countries,
  form,
  gmailEmails,
  lang,
  loadedKrRows,
  onResetForm,
  otherFeeGroups,
  rateGroups,
  setForm,
}: KrCreateFormProps) {
  const t = (ko: string, en: string): string => (lang === 'en' ? en : ko);

  const [calcSnapshots, setCalcSnapshots] = useState<CalcSnapshot[]>([]);
  const [selectedCalcSnapshotId, setSelectedCalcSnapshotId] = useState<number | null>(null);
  const [customClientsByGroup, setCustomClientsByGroup] = useState<Record<string, string[]>>({});
  const [customGroupByClient, setCustomGroupByClient] = useState<Record<string, string>>({});
  const [gmailList, setGmailList] = useState(gmailEmails);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [refreshingGmail, setRefreshingGmail] = useState(false);
  const [saveMenuOpen, setSaveMenuOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  const saveMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setGmailList(gmailEmails);
  }, [gmailEmails]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent): void {
      if (
        saveMenuRef.current &&
        !saveMenuRef.current.contains(event.target as Node)
      ) {
        setSaveMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, []);

  const {
    actualCpi,
    clearQuoteTable,
    derivedValues,
    flashField,
    generateQuoteTable,
    handleFeasibleNChange,
    handleNumericFormChange,
    handleOtherFeeEnabledChange,
    handleOtherFeeSelectionChange,
    handlePartnerUsageChange,
    handleRequestedNChange,
    handleSopCheckedChange,
    handleSopUsageChange,
    handleTextFormChange,
    isRequiredReady,
    partnerCount,
    partnerRows,
    quoteTableState,
    resetPricingState,
    restorePricingState,
    setPartnerCount,
    showIrInvalid,
    showLoiInvalid,
    sopChecked,
    sopRows,
    updatePartnerField,
    updatePartnerNeeded,
    updateSopCpi,
    updateSopNeeded,
  } = useKrPricingState({
    clientGroups,
    compPtRows,
    countries,
    form,
    loadedKrRows,
    otherFeeGroups,
    rateGroups,
    setForm,
    setWarningMessage,
    t,
  });

  const {
    clientGroupOptions,
    countryOptions,
    gmailData,
    groupedClientOptions,
    ownerOptions,
    partnerCountOptions,
    projectTypeOptions,
    selectStyles,
    selectedClientOption,
    selectedCountryOption,
    selectedOwnerOption,
    selectedProjectTypeOption,
    selectedSpecialOption,
    selectedTrapQuestionOption,
    specialOptionOptions,
    trapQuestionOptions,
  } = useKrClientOptions({
    activeUser,
    clientGroups,
    countries,
    customClientsByGroup,
    form,
    gmailList,
  });

  const {
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
  } = useKrSubmit({
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
  });

  function showWarning(message: string): void {
    setWarningMessage(message);
  }

  async function refreshGmailSubjects(): Promise<void> {
    setRefreshingGmail(true);
    await new Promise<void>((resolve) => {
      window.setTimeout(() => resolve(), 280);
    });
    setGmailList(gmailEmails);
    setRefreshingGmail(false);
    showWarning(
      t(
        '개인정보 보호를 위해 Gmail 동기화는 비활성화되어 있습니다.',
        'Gmail sync is disabled for privacy. Using local dummy titles.',
      ),
    );
  }

  function applyGmailSelection(subject: string): void {
    const selected = gmailData.bySubject.get(subject);
    if (!selected) {
      return;
    }

    const matchedClient = chooseClientFromEmail(selected.client, clientGroups);

    setForm((prev) => ({
      ...prev,
      client: matchedClient || prev.client,
      clientName: selected.sender || prev.clientName,
      projectName: selected.subject,
    }));
  }

  function handleProjectNameChange(value: string): void {
    handleTextFormChange('projectName', value);
    applyGmailSelection(value);
  }

  function handleAddClient(name: string, group: string): void {
    setCustomClientsByGroup((prev) => ({
      ...prev,
      [group]: [...(prev[group] ?? []), name],
    }));
    setCustomGroupByClient((prev) => ({
      ...prev,
      [name]: group,
    }));

    setForm((prev) => ({
      ...prev,
      client: name,
    }));
    setIsAddClientModalOpen(false);
  }

  function appendCalculatedSnapshot(): void {
    const requiredForCalc = [
      form.ir,
      form.loi,
      form.cpi,
      form.requestedN,
      form.feasibleN,
      form.completePoints,
    ];

    if (requiredForCalc.some((item) => !item.trim())) {
      showWarning(
        t(
          'IR, LOI, CPI, 요청 샘플수, 가능수, 완료 포인트 항목을 입력해주세요.',
          'Please enter IR, LOI, CPI, Requested N, Feasible N, and Complete points to calculate.',
        ),
      );
      return;
    }

    const nextId = calcSnapshots.length + 1;
    const snapshot: CalcSnapshot = {
      actualCpi,
      derived: derivedValues,
      form: cloneForm(form),
      id: nextId,
      partnerCount,
      partnerRows: clonePartnerRows(partnerRows),
      sopChecked: { ...sopChecked },
      sopRows: cloneSopRows(sopRows),
    };

    setCalcSnapshots((prev) => [...prev, snapshot]);
    setSelectedCalcSnapshotId(nextId);

    if (derivedValues.gmPercent < 60) {
      showWarning(
        t(
          'GM이 60% 미만입니다. TL과 상의 해주세요.',
          'GM is below 60%. Please consult with your TL.',
        ),
      );
    }
  }

  function restoreSnapshot(snapshot: CalcSnapshot): void {
    setForm(cloneForm(snapshot.form));
    restorePricingState({
      actualCpi: snapshot.actualCpi,
      partnerCount: snapshot.partnerCount,
      partnerRows: clonePartnerRows(snapshot.partnerRows),
      sopChecked: { ...snapshot.sopChecked },
      sopRows: cloneSopRows(snapshot.sopRows),
    });
    setSelectedCalcSnapshotId(snapshot.id);
  }

  async function copyQuoteTable(): Promise<void> {
    if (quoteTableState.subtotalExVat === null) {
      showWarning(
        t('먼저 Quote table을 생성해주세요.', 'Please generate the quote table first.'),
      );
      return;
    }

    const lines = [
      ['Description', 'Qty', 'Price', 'Total'],
      [
        'Usage fee',
        quoteTableState.usageQty === null ? '' : addComma(quoteTableState.usageQty),
        quoteTableState.usageCpi === null ? '' : addComma(quoteTableState.usageCpi),
        quoteTableState.usageCost === null ? '' : addComma(quoteTableState.usageCost),
      ],
      [
        'Operation fee',
        quoteTableState.operationVisible ? '1' : '',
        quoteTableState.operationVisible && quoteTableState.operationCost !== null
          ? addComma(quoteTableState.operationCost)
          : '',
        quoteTableState.operationVisible && quoteTableState.operationCost !== null
          ? addComma(quoteTableState.operationCost)
          : '',
      ],
      [
        'Programming fee',
        quoteTableState.programmingVisible ? '1' : '',
        quoteTableState.programmingVisible &&
        quoteTableState.programmingCost !== null
          ? addComma(quoteTableState.programmingCost)
          : '',
        quoteTableState.programmingVisible &&
        quoteTableState.programmingCost !== null
          ? addComma(quoteTableState.programmingCost)
          : '',
      ],
      [
        'Subtotal (excl VAT)',
        '',
        '',
        quoteTableState.subtotalExVat === null
          ? ''
          : addComma(quoteTableState.subtotalExVat),
      ],
      [
        'Total (incl VAT)',
        '',
        '',
        quoteTableState.totalIncVat === null ? '' : addComma(quoteTableState.totalIncVat),
      ],
    ];

    try {
      await navigator.clipboard.writeText(
        lines.map((line) => line.join('\t')).join('\n'),
      );
      showToast({
        body: t('견적표가 복사되었습니다.', 'Quote table copied to clipboard.'),
        title: t('Copied!', 'Copied!'),
        type: 'success',
      });
    } catch (_error) {
      showWarning(t('복사에 실패했습니다.', 'Failed to copy to clipboard.'));
    }
  }

  function resetKrSection(): void {
    onResetForm();
    resetPricingState();
    setCalcSnapshots([]);
    setSelectedCalcSnapshotId(null);
  }

  function openSaveConfirm(): void {
    openConfirm('save', () => {
      setSaveMenuOpen(false);
    });
  }

  function openSaveDraftConfirm(): void {
    openConfirm('save-draft', () => {
      setSaveMenuOpen(false);
    });
  }

  function openUpdateConfirm(): void {
    openConfirm('update', () => {
      setSaveMenuOpen(false);
    });
  }

  const headerActionRoot =
    typeof document !== 'undefined'
      ? document.getElementById('create-header-actions')
      : null;

  return {
    addClientModalProps: isAddClientModalOpen
      ? {
          clientGroupOptions,
          lang,
          onAddClient: handleAddClient,
          onClose: () => setIsAddClientModalOpen(false),
          onShowWarning: showWarning,
          selectStyles,
        }
      : null,
    basicInfoSectionProps: {
      actualCpi,
      countryOptions,
      flashField,
      form,
      gmailSuggestions: gmailData.suggestions,
      groupedClientOptions,
      lang,
      onCalculationMethodChange: (value: KrFormState['calculationMethod']) =>
        handleTextFormChange('calculationMethod', value),
      onClientChange: (value: string) => handleTextFormChange('client', value),
      onFieldChange: handleTextFormChange,
      onFeasibleNChange: handleFeasibleNChange,
      onNumericFieldChange: handleNumericFormChange,
      onOtherFeeEnabledChange: handleOtherFeeEnabledChange,
      onOtherFeeSelectionChange: handleOtherFeeSelectionChange,
      onProjectNameChange: handleProjectNameChange,
      onRefreshGmail: () => {
        void refreshGmailSubjects();
      },
      onRequestAddClient: () => setIsAddClientModalOpen(true),
      onRequestedNChange: handleRequestedNChange,
      otherFeeGroups,
      ownerOptions,
      projectTypeOptions,
      refreshingGmail,
      selectedClientOption,
      selectedCountryOption,
      selectedOwnerOption,
      selectedProjectTypeOption,
      selectedSpecialOption,
      selectedTrapQuestionOption,
      selectStyles,
      showIrInvalid,
      showLoiInvalid,
      specialOptionOptions,
      trapQuestionOptions,
    },
    calculatedQuotationSectionProps: {
      calcSnapshots,
      lang,
      onCalculate: appendCalculatedSnapshot,
      onClear: () => {
        setCalcSnapshots([]);
        setSelectedCalcSnapshotId(null);
      },
      onSelectSnapshot: restoreSnapshot,
      selectedCalcSnapshotId,
    },
    confirmAlertProps: {
      confirmLabel,
      isSubmitting,
      message: confirmMessage,
      onCancel: cancelConfirm,
      onConfirm: () => {
        void handleConfirmSubmit();
      },
      open: Boolean(confirmAction),
    },
    feedbackToastProps: {
      body: toastState.body,
      linkHref: toastState.linkHref,
      linkLabel: toastState.linkLabel,
      onClose: closeToast,
      open: toastState.open,
      showBackdrop: true,
      title: toastState.title,
      type: toastState.type,
    },
    headerActionRoot,
    headerActions: {
      isRequiredReady,
      isSubmitting,
      onPrimarySave: openSaveConfirm,
      onSaveDraft: openSaveDraftConfirm,
      onToggleMenu: () => setSaveMenuOpen((prev) => !prev),
      onUpdate: openUpdateConfirm,
      saveMenuOpen,
      saveMenuRef,
      showUpdateAction: Boolean(activeRecordId),
    },
    partnerSectionProps: {
      flashField,
      lang,
      onPartnerCountChange: setPartnerCount,
      onPartnerFieldChange: updatePartnerField,
      onPartnerNeededChange: updatePartnerNeeded,
      onPartnerUsageChange: handlePartnerUsageChange,
      partnerCount,
      partnerCountOptions,
      partnerRows,
      partnerUsage: form.partnerUsage,
      selectStyles,
    },
    quoteTableSectionProps: {
      onClear: clearQuoteTable,
      onCopy: copyQuoteTable,
      onGenerate: generateQuoteTable,
      quoteTableState,
    },
    resetKrSection,
    sopSectionProps: {
      flashField,
      lang,
      onSopCheckedChange: handleSopCheckedChange,
      onSopCpiChange: updateSopCpi,
      onSopNeededChange: updateSopNeeded,
      onSopUsageChange: handleSopUsageChange,
      sopChecked,
      sopRows,
      sopUsage: form.sopUsage,
    },
    warningAlertProps: {
      message: warningMessage,
      onClose: () => setWarningMessage(''),
      open: Boolean(warningMessage),
    },
  };
}
