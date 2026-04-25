import { useMemo } from 'react';
import type { GroupBase, StylesConfig } from 'react-select';

import type {
  ClientGroup,
  CountryOption,
  KrFormState,
  KrSelectOption,
} from '@/pages/Create/types';
import type { GmailEmail } from '@/types/backend';

const PROJECT_TYPE_OPTIONS: KrSelectOption[] = [
  'Type 1',
  'Type 2',
  'Type 3',
  'Type 4',
  'Others',
].map((value) => ({ label: value, value }));

const TRAP_QUESTION_OPTIONS: KrSelectOption[] = ['1', '2'].map((value) => ({
  label: value,
  value,
}));

const SPECIAL_OPTION_OPTIONS: KrSelectOption[] = ['Option 1', 'Option 2'].map(
  (value) => ({
    label: value,
    value,
  }),
);

const PARTNER_COUNT_OPTIONS: KrSelectOption[] = ['1', '2', '3'].map(
  (value) => ({
    label: value,
    value,
  }),
);

const KR_SELECT_STYLES: StylesConfig<KrSelectOption, false> = {
  control: (base, state) => ({
    ...base,
    backgroundColor: 'white',
    borderColor: state.isFocused ? '#764cfc' : '#e4e4e4',
    borderRadius: '0.5rem',
    boxShadow: 'none',
    height: 31,
    minHeight: 31,
    '&:hover': {
      borderColor: state.isFocused ? '#764cfc' : '#e4e4e4',
    },
  }),
  clearIndicator: (base) => ({
    ...base,
    padding: 4,
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: '#6b7280',
    padding: 4,
  }),
  groupHeading: (base) => ({
    ...base,
    color: '#3d3d43',
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'none',
  }),
  indicatorSeparator: (base) => ({ ...base, display: 'none' }),
  indicatorsContainer: (base) => ({
    ...base,
    height: 29,
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    paddingBottom: 0,
    paddingTop: 0,
  }),
  menu: (base) => ({
    ...base,
    border: '1px solid #e4e4e4',
    borderRadius: '0.5rem',
    boxShadow: '0 0.5rem 1rem rgba(0,0,0,0.15)',
    zIndex: 50,
  }),
  menuList: (base) => ({
    ...base,
    overflowX: 'hidden',
    padding: '0.4rem',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#6800cb26' : 'white',
    borderRadius: '0.5rem',
    color: '#212529',
    cursor: 'pointer',
    fontSize: 13,
    padding: '0.35rem 0.8rem',
    ':hover': {
      backgroundColor: '#f5f3ff',
    },
  }),
  placeholder: (base) => ({ ...base, color: '#9ca3af', fontSize: 13 }),
  singleValue: (base) => ({
    ...base,
    color: '#111827',
    fontSize: 13,
    margin: 0,
  }),
  valueContainer: (base) => ({
    ...base,
    height: 29,
    minHeight: 29,
    padding: '0 8px',
  }),
};

type UseKrClientOptionsParams = {
  activeUser: string;
  clientGroups: ClientGroup[];
  countries: CountryOption[];
  customClientsByGroup: Record<string, string[]>;
  form: KrFormState;
  gmailList: GmailEmail[];
};

export function useKrClientOptions({
  activeUser,
  clientGroups,
  countries,
  customClientsByGroup,
  form,
  gmailList,
}: UseKrClientOptionsParams) {
  const groupedClientOptions = useMemo<Array<GroupBase<KrSelectOption>>>(() => {
    const baseGroups: Array<GroupBase<KrSelectOption>> = clientGroups.map(
      (group) => ({
        label: group.label,
        options: [
          ...group.options.map((option) => ({
            group: group.label,
            label: option.label,
            token: option.token,
            value: option.label,
          })),
          ...(customClientsByGroup[group.label] ?? []).map((label) => ({
            group: group.label,
            label,
            value: label,
          })),
        ],
      }),
    );

    baseGroups.push({
      label: 'Other',
      options: [{ group: 'Other', label: 'Other', value: 'Other' }],
    });

    return baseGroups;
  }, [clientGroups, customClientsByGroup]);

  const allClientOptions = useMemo(
    () => groupedClientOptions.flatMap((group) => group.options),
    [groupedClientOptions],
  );

  const selectedClientOption = useMemo(
    () =>
      allClientOptions.find((option) => option.value === form.client) ??
      (form.client
        ? {
            label: form.client,
            value: form.client,
          }
        : null),
    [allClientOptions, form.client],
  );

  const countryOptions = useMemo(() => {
    const filtered =
      form.client === 'Opensurvey'
        ? countries.filter(
            (country) => !Number.isNaN(Number.parseInt(country.group, 10)),
          )
        : countries;

    return filtered.map<KrSelectOption>((country) => ({
      group: country.group,
      label: country.nameEn,
      token: country.keyword,
      value: country.code,
    }));
  }, [countries, form.client]);

  const selectedCountryOption = useMemo(
    () => countryOptions.find((option) => option.value === form.country) ?? null,
    [countryOptions, form.country],
  );

  const gmailData = useMemo(() => {
    const bySubject = new Map<string, GmailEmail>();
    const suggestions: string[] = [];

    for (const entry of gmailList) {
      const subject = entry.subject.trim();
      if (!subject || bySubject.has(subject)) {
        continue;
      }

      bySubject.set(subject, entry);
      suggestions.push(subject);
    }

    return { bySubject, suggestions };
  }, [gmailList]);

  const clientGroupOptions = useMemo(
    () => clientGroups.map((group) => group.label),
    [clientGroups],
  );

  const ownerOptions = useMemo<KrSelectOption[]>(() => {
    const unique = Array.from(
      new Set(
        ['User 1', 'User 2', 'User 3', 'User 4', 'User 5', activeUser].filter(
          Boolean,
        ),
      ),
    );

    return unique.map((owner) => ({ label: owner, value: owner }));
  }, [activeUser]);

  const selectedOwnerOption = useMemo(
    () => ownerOptions.find((option) => option.value === form.owner) ?? null,
    [form.owner, ownerOptions],
  );

  const selectedProjectTypeOption = useMemo(
    () =>
      PROJECT_TYPE_OPTIONS.find((option) => option.value === form.projectType) ??
      null,
    [form.projectType],
  );

  const selectedTrapQuestionOption = useMemo(
    () =>
      TRAP_QUESTION_OPTIONS.find(
        (option) => option.value === form.trapQuestion,
      ) ?? null,
    [form.trapQuestion],
  );

  const selectedSpecialOption = useMemo(
    () =>
      SPECIAL_OPTION_OPTIONS.find(
        (option) => option.value === form.specialOption,
      ) ?? null,
    [form.specialOption],
  );

  return {
    clientGroupOptions,
    countryOptions,
    gmailData,
    groupedClientOptions,
    ownerOptions,
    partnerCountOptions: PARTNER_COUNT_OPTIONS,
    projectTypeOptions: PROJECT_TYPE_OPTIONS,
    selectStyles: KR_SELECT_STYLES,
    selectedClientOption,
    selectedCountryOption,
    selectedOwnerOption,
    selectedProjectTypeOption,
    selectedSpecialOption,
    selectedTrapQuestionOption,
    specialOptionOptions: SPECIAL_OPTION_OPTIONS,
    trapQuestionOptions: TRAP_QUESTION_OPTIONS,
  };
}
