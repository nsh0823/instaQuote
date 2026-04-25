import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  getActiveUserName,
  getClient,
  getCompPt,
  getCountry,
  getDraft,
  getDraftOS,
  getOtherFee,
  getRate,
  getRFQ,
  getRFQOS,
  getVendors,
} from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import type {
  ClientGroup,
  CountryOption,
  KrFormState,
  OsPanelState,
  OsSetupState,
} from '@/pages/Create/types';
import type {
  ClientDataset,
  GmailEmail,
  OtherFeeDataset,
  RateDataset,
  TableRows,
} from '@/types/backend';
import {
  applyOsSetupFromPanels,
  buildRowMap,
  createEmptyKrForm,
  createEmptyOsSetup,
  createOsPanel,
  DUMMY_GMAIL_EMAILS,
  hydrateKrForm,
  hydrateOsPanels,
  parseClientGroups,
  parseCountries,
} from '@/pages/Create/utils/hydration';

type UseCreatePageDataParams = {
  activeRecordId: string;
  isDraft: boolean;
  mode: 'KR' | 'OS';
};

type UseCreatePageDataResult = {
  activeUser: string;
  clientGroups: ClientGroup[];
  compPtRows: string[][];
  countries: CountryOption[];
  createOsPanelsFromSelection: () => void;
  errorMessage: string | null;
  gmailEmails: GmailEmail[];
  initialFinalProgramming: string;
  isPageLoading: boolean;
  krForm: KrFormState;
  loadedKrRows: TableRows | null;
  osPanels: OsPanelState[];
  osSetup: OsSetupState;
  otherFeeGroups: OtherFeeDataset;
  rateGroups: RateDataset;
  resetKrForm: () => void;
  setKrForm: Dispatch<SetStateAction<KrFormState>>;
  setOsPanels: Dispatch<SetStateAction<OsPanelState[]>>;
  setOsSetup: Dispatch<SetStateAction<OsSetupState>>;
  vendorRows: TableRows;
};

function getQueryErrorMessage(errors: Array<unknown>): string | null {
  const error = errors.find(Boolean);

  if (!error) {
    return null;
  }

  return error instanceof Error ? error.message : 'Failed to load create page.';
}

export function useCreatePageData({
  activeRecordId,
  isDraft,
  mode,
}: UseCreatePageDataParams): UseCreatePageDataResult {
  const [activeUser, setActiveUser] = useState('');
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [clientGroups, setClientGroups] = useState<ClientGroup[]>([]);
  const [gmailEmails, setGmailEmails] = useState<GmailEmail[]>(
    DUMMY_GMAIL_EMAILS,
  );
  const [compPtRows, setCompPtRows] = useState<string[][]>([]);
  const [otherFeeGroups, setOtherFeeGroups] = useState<OtherFeeDataset>([]);
  const [rateGroups, setRateGroups] = useState<RateDataset>([]);
  const [vendorRows, setVendorRows] = useState<TableRows>([]);
  const [loadedKrRows, setLoadedKrRows] = useState<TableRows | null>(null);
  const [initialFinalProgramming, setInitialFinalProgramming] = useState('');
  const [krForm, setKrForm] = useState<KrFormState>(() => createEmptyKrForm(''));
  const [osSetup, setOsSetup] = useState<OsSetupState>(() => createEmptyOsSetup(''));
  const [osPanels, setOsPanels] = useState<OsPanelState[]>([]);
  const activeUserQuery = useQuery({
    queryKey: queryKeys.activeUserName,
    queryFn: getActiveUserName,
  });
  const countryQuery = useQuery({
    queryKey: queryKeys.country,
    queryFn: getCountry,
  });
  const clientQuery = useQuery({
    queryKey: queryKeys.client,
    queryFn: getClient,
  });
  const compPtQuery = useQuery({
    queryKey: queryKeys.compPt,
    queryFn: getCompPt,
  });
  const otherFeeQuery = useQuery({
    queryKey: queryKeys.otherFee,
    queryFn: getOtherFee,
  });
  const rateQuery = useQuery({
    queryKey: queryKeys.rate,
    queryFn: getRate,
  });
  const vendorsQuery = useQuery({
    queryKey: queryKeys.vendors,
    queryFn: getVendors,
    enabled: mode === 'OS',
  });
  const activeKrRecordQuery = useQuery({
    queryKey: isDraft
      ? queryKeys.draft(activeRecordId)
      : queryKeys.rfq(activeRecordId),
    queryFn: () => (isDraft ? getDraft(activeRecordId) : getRFQ(activeRecordId)),
    enabled: Boolean(activeRecordId) && mode === 'KR',
  });
  const activeOsRecordQuery = useQuery({
    queryKey: isDraft
      ? queryKeys.draftOS(activeRecordId)
      : queryKeys.rfqOS(activeRecordId),
    queryFn: () =>
      isDraft ? getDraftOS(activeRecordId) : getRFQOS(activeRecordId),
    enabled: Boolean(activeRecordId) && mode === 'OS',
  });

  const countryById = useMemo(
    () =>
      new Map(
        countries.map((country) => [`${country.code}-${country.nameEn}`, country]),
      ),
    [countries],
  );

  useEffect(() => {
    const user = activeUserQuery.data;
    const countryRows = countryQuery.data;
    const clientData = clientQuery.data;
    const compPtData = compPtQuery.data;
    const otherFeeData = otherFeeQuery.data;
    const rateData = rateQuery.data;
    const vendorsData = mode === 'OS' ? vendorsQuery.data : [];

    if (
      user === undefined ||
      countryRows === undefined ||
      clientData === undefined ||
      compPtData === undefined ||
      otherFeeData === undefined ||
      rateData === undefined ||
      vendorsData === undefined
    ) {
      return;
    }

    setActiveUser(user);
    setCountries(parseCountries(countryRows));
    setClientGroups(parseClientGroups(clientData as ClientDataset));
    setGmailEmails(DUMMY_GMAIL_EMAILS);
    setCompPtRows(compPtData);
    setOtherFeeGroups(otherFeeData);
    setRateGroups(rateData);
    setVendorRows(vendorsData);

    if (activeRecordId) {
      if (mode === 'KR') {
        const rows = activeKrRecordQuery.data;

        if (!rows) {
          return;
        }

        setLoadedKrRows(rows);
        setInitialFinalProgramming('');
        setOsPanels([]);
        setOsSetup(createEmptyOsSetup(user));
        setKrForm(hydrateKrForm(buildRowMap(rows[0] ?? [], rows[1] ?? []), user));
      } else {
        const rows = activeOsRecordQuery.data;

        if (!rows) {
          return;
        }

        const panels = hydrateOsPanels(rows, user);
        const firstRowMap = buildRowMap(
          rows.dataArray[0] ?? [],
          rows.dataArray[1] ?? [],
        );

        setLoadedKrRows(null);
        setInitialFinalProgramming(firstRowMap['Total programming fee'] || '');
        setKrForm(createEmptyKrForm(user));
        setOsPanels(panels);
        setOsSetup(applyOsSetupFromPanels(panels, user));
      }
    } else {
      setLoadedKrRows(null);
      setInitialFinalProgramming('');
      setKrForm(createEmptyKrForm(user));
      setOsPanels([]);
      setOsSetup(createEmptyOsSetup(user));
    }
  }, [
    activeKrRecordQuery.data,
    activeOsRecordQuery.data,
    activeRecordId,
    activeUserQuery.data,
    clientQuery.data,
    compPtQuery.data,
    countryQuery.data,
    mode,
    otherFeeQuery.data,
    rateQuery.data,
    vendorsQuery.data,
  ]);

  function createOsPanelsFromSelection(): void {
    const nextPanels = osSetup.selectedCountries
      .map((id) => countryById.get(id))
      .filter((value): value is CountryOption => Boolean(value))
      .map((country) => createOsPanel(country, osSetup));

    setOsPanels(nextPanels);
  }

  function resetKrForm(): void {
    setKrForm(createEmptyKrForm(activeUser));
  }

  const errorMessage = getQueryErrorMessage([
    activeUserQuery.error,
    countryQuery.error,
    clientQuery.error,
    compPtQuery.error,
    otherFeeQuery.error,
    rateQuery.error,
    vendorsQuery.error,
    activeKrRecordQuery.error,
    activeOsRecordQuery.error,
  ]);
  const isPageLoading =
    activeUserQuery.isLoading ||
    countryQuery.isLoading ||
    clientQuery.isLoading ||
    compPtQuery.isLoading ||
    otherFeeQuery.isLoading ||
    rateQuery.isLoading ||
    (mode === 'OS' && vendorsQuery.isLoading) ||
    (Boolean(activeRecordId) &&
      (mode === 'KR'
        ? activeKrRecordQuery.isLoading
        : activeOsRecordQuery.isLoading));

  return {
    activeUser,
    clientGroups,
    compPtRows,
    countries,
    createOsPanelsFromSelection,
    errorMessage,
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
  };
}
