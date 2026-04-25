import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';

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
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadedKrRows, setLoadedKrRows] = useState<TableRows | null>(null);
  const [initialFinalProgramming, setInitialFinalProgramming] = useState('');
  const [krForm, setKrForm] = useState<KrFormState>(() => createEmptyKrForm(''));
  const [osSetup, setOsSetup] = useState<OsSetupState>(() => createEmptyOsSetup(''));
  const [osPanels, setOsPanels] = useState<OsPanelState[]>([]);

  const countryById = useMemo(
    () =>
      new Map(
        countries.map((country) => [`${country.code}-${country.nameEn}`, country]),
      ),
    [countries],
  );

  useEffect(() => {
    let isMounted = true;

    async function load(): Promise<void> {
      try {
        setErrorMessage(null);
        setIsPageLoading(true);

        const [
          user,
          countryRows,
          clientData,
          compPtData,
          otherFeeData,
          rateData,
          vendorsData,
        ] = await Promise.all([
          getActiveUserName(),
          getCountry(),
          getClient(),
          getCompPt(),
          getOtherFee(),
          getRate(),
          mode === 'OS' ? getVendors() : Promise.resolve([] as TableRows),
        ]);

        if (!isMounted) {
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
            const rows = isDraft
              ? await getDraft(activeRecordId)
              : await getRFQ(activeRecordId);

            if (!isMounted) {
              return;
            }

            setLoadedKrRows(rows);
            setInitialFinalProgramming('');
            setOsPanels([]);
            setOsSetup(createEmptyOsSetup(user));
            setKrForm(hydrateKrForm(buildRowMap(rows[0] ?? [], rows[1] ?? []), user));
          } else {
            const rows = isDraft
              ? await getDraftOS(activeRecordId)
              : await getRFQOS(activeRecordId);

            if (!isMounted) {
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
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          error instanceof Error ? error.message : 'Failed to load create page.',
        );
      } finally {
        if (isMounted) {
          setIsPageLoading(false);
        }
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, [activeRecordId, isDraft, mode]);

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
