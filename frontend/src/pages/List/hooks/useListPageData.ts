import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useQuery } from "@tanstack/react-query";

import { getRFQ, getRFQOS } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type {
  GroupedRecord,
  ListMode,
} from "@/pages/List/types/list";
import {
  findColumnName,
  getListDateColumnKey,
  getListSheetUrl,
  groupKrRows,
  groupOsRows,
} from "@/pages/List/utils/list";

export function useListPageData(mode: ListMode): {
  dateColumnKey: string;
  errorMessage: string | null;
  header: string[];
  lastUpdatedColumnKey: string | null;
  loading: boolean;
  records: GroupedRecord[];
  setRecords: Dispatch<SetStateAction<GroupedRecord[]>>;
  sheetUrl: string;
} {
  const [header, setHeader] = useState<string[]>([]);
  const [records, setRecords] = useState<GroupedRecord[]>([]);
  const krListQuery = useQuery({
    queryKey: queryKeys.rfq(),
    queryFn: () => getRFQ(),
    select: groupKrRows,
    enabled: mode === "KR",
  });
  const osListQuery = useQuery({
    queryKey: queryKeys.rfqOS(),
    queryFn: () => getRFQOS(),
    select: groupOsRows,
    enabled: mode === "OS",
  });
  const listData = mode === "KR" ? krListQuery.data : osListQuery.data;
  const listError = mode === "KR" ? krListQuery.error : osListQuery.error;
  const listLoading =
    mode === "KR" ? krListQuery.isLoading : osListQuery.isLoading;

  useEffect(() => {
    if (!listData) {
      return;
    }

    setHeader(listData.header);
    setRecords(listData.records);
  }, [listData]);

  const lastUpdatedColumnKey = useMemo(
    () => findColumnName(header, ["Last updated", "Last Updated"]),
    [header],
  );

  return {
    dateColumnKey: getListDateColumnKey(mode),
    errorMessage:
      listError instanceof Error
        ? listError.message
        : listError
          ? "Failed to load list."
          : null,
    header,
    lastUpdatedColumnKey,
    loading: listLoading,
    records,
    setRecords,
    sheetUrl: getListSheetUrl(mode),
  };
}
