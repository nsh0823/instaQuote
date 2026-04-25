import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import { getRFQ, getRFQOS } from "@/lib/api";
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
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load(): Promise<void> {
      try {
        setLoading(true);
        setErrorMessage(null);

        if (mode === "KR") {
          const rows = await getRFQ();
          if (!isMounted) {
            return;
          }

          const grouped = groupKrRows(rows);
          setHeader(grouped.header);
          setRecords(grouped.records);
        } else {
          const rows = await getRFQOS();
          if (!isMounted) {
            return;
          }

          const grouped = groupOsRows(rows);
          setHeader(grouped.header);
          setRecords(grouped.records);
        }

        setLoading(false);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load list.",
        );
        setLoading(false);
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, [mode]);

  const lastUpdatedColumnKey = useMemo(
    () => findColumnName(header, ["Last updated", "Last Updated"]),
    [header],
  );

  return {
    dateColumnKey: getListDateColumnKey(mode),
    errorMessage,
    header,
    lastUpdatedColumnKey,
    loading,
    records,
    setRecords,
    sheetUrl: getListSheetUrl(mode),
  };
}
