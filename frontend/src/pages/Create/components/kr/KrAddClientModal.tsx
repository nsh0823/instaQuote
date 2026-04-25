import { useState } from 'react';
import { BsXLg } from 'react-icons/bs';
import Select, { type SingleValue, type StylesConfig } from 'react-select';

import type { KrSelectOption } from '@/pages/Create/types';

type KrAddClientModalProps = {
  clientGroupOptions: string[];
  lang: 'ko' | 'en';
  onAddClient: (name: string, group: string) => void;
  onClose: () => void;
  onShowWarning: (message: string) => void;
  selectStyles: StylesConfig<KrSelectOption, false>;
};

export function KrAddClientModal({
  clientGroupOptions,
  lang,
  onAddClient,
  onClose,
  onShowWarning,
  selectStyles,
}: KrAddClientModalProps): JSX.Element {
  const t = (ko: string, en: string): string => (lang === 'en' ? en : ko);
  const [newClientName, setNewClientName] = useState('');
  const [newClientGroup, setNewClientGroup] = useState('');

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md overflow-hidden rounded-[10px] bg-white shadow-2xl">
        <div className="flex items-center px-4 pb-2 pt-4">
          <h3 className="text-base font-medium text-[#3d3d43]">Other client</h3>
          <button
            className="ml-auto text-lg text-slate-500 hover:text-slate-700"
            onClick={onClose}
            type="button"
          >
            <BsXLg className="text-[14px]" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2.5 px-4 py-2">
          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#5b5b5b]">
              {t('클라이언트', 'Client')}
            </label>
            <input
              className="h-7.75 w-full rounded-lg border border-[#e4e4e4] px-2.5 text-[13px] outline-none transition focus:border-[#764cfc]"
              onChange={(event) => setNewClientName(event.target.value)}
              value={newClientName}
            />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#5b5b5b]">
              {t('그룹', 'Group')}
            </label>
            <Select<KrSelectOption, false>
              className="text-[13px]"
              isSearchable={false}
              menuPortalTarget={
                typeof document !== 'undefined' ? document.body : null
              }
              menuPosition="fixed"
              onChange={(nextValue: SingleValue<KrSelectOption>) =>
                setNewClientGroup(nextValue?.value ?? '')
              }
              options={clientGroupOptions.map((groupName) => ({
                label: groupName,
                value: groupName,
              }))}
              placeholder="Choose"
              styles={{
                ...selectStyles,
                menuPortal: (base) => ({
                  ...base,
                  zIndex: 10050,
                }),
              }}
              value={
                newClientGroup
                  ? { label: newClientGroup, value: newClientGroup }
                  : null
              }
            />
          </div>
        </div>
        <div className="flex justify-end px-4 pb-4 pt-2">
          <button
            className="rounded-[20px] bg-[#764cfc] px-4 py-1.5 text-sm text-white transition hover:bg-[#6535ff]"
            onClick={() => {
              if (!newClientName.trim() || !newClientGroup.trim()) {
                onShowWarning(
                  t(
                    '클라이언트 정보를 입력해주세요.',
                    'Please enter client info.',
                  ),
                );
                return;
              }

              onAddClient(newClientName.trim(), newClientGroup.trim());
            }}
            type="button"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
