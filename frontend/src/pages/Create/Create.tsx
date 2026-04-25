import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { useAppContext } from '@/context/AppContext';
import { KrCreateForm } from '@/pages/Create/components/KrCreateForm';
import { OsCreateForm } from '@/pages/Create/components/OsCreateForm';
import { useCreatePageData } from '@/pages/Create/hooks/useCreatePageData';
import { useHeaderFloating } from '@/pages/Home/hooks/useHeaderFloating';

import './styles/Create.css';
import '@/styles/table-controls.css';

export default function Create(): JSX.Element {
  const location = useLocation();
  const { lang, rfqMode: mode } = useAppContext();
  const isHeaderFloating = useHeaderFloating(10);
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const rfqId = searchParams.get('rfqid') ?? '';
  const draftId = searchParams.get('draftid') ?? '';
  const activeRecordId = rfqId || draftId;
  const isDraft = Boolean(draftId);
  const {
    activeUser,
    clientGroups,
    compPtRows,
    countries,
    createOsPanelsFromSelection,
    gmailEmails,
    initialFinalProgramming,
    isPageLoading,
    krForm,
    loadedKrRows,
    osPanels,
    osSetup,
    otherFeeGroups,
    rateGroups,
    resetKrForm,
    setKrForm,
    setOsPanels,
    setOsSetup,
    vendorRows,
  } = useCreatePageData({
    activeRecordId,
    isDraft,
    mode,
  });

  const headerTitle = activeRecordId
    ? `Edit ${isDraft ? 'Draft' : 'RFQ'} #${activeRecordId}`
    : 'Create RFQ';

  useEffect(() => {
    document.title = `${mode} ${headerTitle}`;
  }, [headerTitle, mode]);

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-[#3d3d43]" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="flex-1 pl-15">
        <header
          className={`fixed left-0 top-0 z-20 w-full bg-[#fcfcfd] pl-15 transition-shadow duration-200 ${
            isHeaderFloating ? 'rounded-xs shadow-[0px_1px_10px_#999]' : ''
          }`}
        >
          <div className="m-[15px_auto] flex max-w-291.25 flex-wrap items-center gap-4">
            <div className="inline-flex items-center gap-2 text-[22px] font-semibold text-[#3d3d43]">
              <span className="inline-flex h-8.25 w-8.5 items-center justify-center rounded-full bg-[#3d3d43] text-[75%] font-medium text-white">
                {mode}
              </span>
              <span>{headerTitle}</span>
            </div>
            {
              mode === 'OS' && (
                <div className="ml-auto flex items-center gap-2">
                  <div id="create-header-middle" className="flex" />
                </div>
              )
            }
            <div className="ml-auto flex items-center gap-2">
              <div id="create-header-actions" />
            </div>
          </div>
        </header>

        <main className="mx-auto mt-[72.5px] min-h-[calc(100vh-140px)] max-w-291.25 pb-5">
          {mode === 'KR' ? (
            <KrCreateForm
              activeRecordId={activeRecordId}
              activeUser={activeUser}
              clientGroups={clientGroups}
              compPtRows={compPtRows}
              countries={countries}
              form={krForm}
              gmailEmails={gmailEmails}
              lang={lang}
              loadedKrRows={loadedKrRows}
              onResetForm={resetKrForm}
              otherFeeGroups={otherFeeGroups}
              rateGroups={rateGroups}
              setForm={setKrForm}
            />
          ) : (
            <OsCreateForm
              activeRecordId={activeRecordId}
              activeUser={activeUser}
              clientGroups={clientGroups}
              countries={countries}
              gmailEmails={gmailEmails}
              initialFinalProgramming={initialFinalProgramming}
              isCountriesLoading={isPageLoading}
              lang={lang}
              onCreatePanels={createOsPanelsFromSelection}
              osPanels={osPanels}
              osSetup={osSetup}
              setOsPanels={setOsPanels}
              setOsSetup={setOsSetup}
              vendorRows={vendorRows}
            />
          )}
        </main>
      </div>
    </div>
  );
}
