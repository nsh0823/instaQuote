import { useMemo, useState } from "react";

import type { DateRangeValue } from "@/pages/Home/types/home";
import { getPresetRange } from "@/pages/Home/utils/date";
import type { GroupedRecord } from "@/pages/List/types/list";
import {
  buildListStatusOptions,
  buildUniqueRecordOptions,
  filterListRecords,
  toggleSetValue,
} from "@/pages/List/utils/list";

export function useListFilters(params: {
  dateColumnKey: string;
  header: string[];
  records: GroupedRecord[];
}): {
  clearFilters: () => void;
  clientOptions: string[];
  filteredRecords: GroupedRecord[];
  ownerOptions: string[];
  pageResetKey: string;
  range: DateRangeValue;
  search: string;
  selectedClients: Set<string>;
  selectedOwners: Set<string>;
  selectedStatuses: Set<string>;
  setRange: (range: DateRangeValue) => void;
  setSearch: (value: string) => void;
  statusOptions: string[];
  toggleClient: (value: string) => void;
  toggleOwner: (value: string) => void;
  toggleStatus: (value: string) => void;
} {
  const { dateColumnKey, header, records } = params;
  const [search, setSearch] = useState("");
  const [range, setRange] = useState<DateRangeValue>(() =>
    getPresetRange("Last 30 Days"),
  );
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(
    new Set(),
  );
  const [selectedOwners, setSelectedOwners] = useState<Set<string>>(new Set());
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());

  const statusOptions = useMemo(
    () => buildListStatusOptions(records),
    [records],
  );
  const ownerOptions = useMemo(
    () => buildUniqueRecordOptions(records, "owner"),
    [records],
  );
  const clientOptions = useMemo(
    () => buildUniqueRecordOptions(records, "client"),
    [records],
  );

  const filteredRecords = useMemo(
    () =>
      filterListRecords({
        dateColumnKey,
        header,
        range,
        records,
        search,
        selectedClients,
        selectedOwners,
        selectedStatuses,
      }),
    [
      dateColumnKey,
      header,
      range,
      records,
      search,
      selectedClients,
      selectedOwners,
      selectedStatuses,
    ],
  );

  const pageResetKey = useMemo(
    () =>
      JSON.stringify({
        clients: Array.from(selectedClients).sort(),
        end: range.end.getTime(),
        owners: Array.from(selectedOwners).sort(),
        search,
        start: range.start.getTime(),
        statuses: Array.from(selectedStatuses).sort(),
      }),
    [range.end, range.start, search, selectedClients, selectedOwners, selectedStatuses],
  );

  function clearFilters(): void {
    setSelectedStatuses(new Set());
    setSelectedOwners(new Set());
    setSelectedClients(new Set());
  }

  return {
    clearFilters,
    clientOptions,
    filteredRecords,
    ownerOptions,
    pageResetKey,
    range,
    search,
    selectedClients,
    selectedOwners,
    selectedStatuses,
    setRange,
    setSearch,
    statusOptions,
    toggleClient: (value: string) => {
      toggleSetValue(setSelectedClients, value);
    },
    toggleOwner: (value: string) => {
      toggleSetValue(setSelectedOwners, value);
    },
    toggleStatus: (value: string) => {
      toggleSetValue(setSelectedStatuses, value);
    },
  };
}
