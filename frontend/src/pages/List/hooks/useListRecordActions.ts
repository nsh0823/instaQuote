import {
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import {
  updateRfqNotes,
  updateRfqOutputUrl,
  updateRfqStatus,
} from "@/lib/api";
import type {
  GroupedRecord,
  ListMode,
  ListToastState,
} from "@/pages/List/types/list";
import {
  formatLegacyCurrentDate,
  replaceRecordValue,
} from "@/pages/List/utils/list";

export function useListRecordActions(params: {
  activeRecord: GroupedRecord | null;
  header: string[];
  lastUpdatedColumnKey: string | null;
  mode: ListMode;
  records: GroupedRecord[];
  setRecords: Dispatch<SetStateAction<GroupedRecord[]>>;
}): {
  closeToast: () => void;
  drawerNotes: string;
  drawerOutputUrl: string;
  drawerSaving: boolean;
  handleSaveDrawer: () => Promise<void>;
  handleStatusChange: (recordId: string, nextStatus: string) => Promise<void>;
  savingStatusId: string | null;
  setDrawerNotes: (value: string) => void;
  setDrawerOutputUrl: (value: string) => void;
  toast: ListToastState | null;
} {
  const {
    activeRecord,
    header,
    lastUpdatedColumnKey,
    mode,
    records,
    setRecords,
  } = params;
  const [savingStatusId, setSavingStatusId] = useState<string | null>(null);
  const [drawerNotes, setDrawerNotes] = useState("");
  const [drawerOutputUrl, setDrawerOutputUrl] = useState("");
  const [drawerSaving, setDrawerSaving] = useState(false);
  const [toast, setToast] = useState<ListToastState | null>(null);

  useEffect(() => {
    if (!activeRecord) {
      setDrawerNotes("");
      setDrawerOutputUrl("");
      return;
    }

    setDrawerNotes(activeRecord.notes);
    setDrawerOutputUrl(activeRecord.outputUrl);
  }, [activeRecord]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function handleStatusChange(
    recordId: string,
    nextStatus: string,
  ): Promise<void> {
    const previousRecords = records;
    const currentDate = formatLegacyCurrentDate();
    setSavingStatusId(recordId);
    setRecords((current) =>
      current.map((record) => {
        if (record.id !== recordId) {
          return record;
        }

        let nextRecord = replaceRecordValue(record, header, "Status", nextStatus);

        if (lastUpdatedColumnKey) {
          nextRecord = replaceRecordValue(
            nextRecord,
            header,
            lastUpdatedColumnKey,
            currentDate,
          );
        }

        return nextRecord;
      }),
    );

    try {
      await updateRfqStatus(mode, recordId, nextStatus);
      setToast({
        body: `Status for RFQ #${recordId} was updated successfully.`,
        title: "Updated!",
        type: "success",
      });
    } catch (error) {
      setRecords(previousRecords);
      setToast({
        body:
          error instanceof Error ? error.message : "Failed to update status.",
        title: "Failed..",
        type: "fail",
      });
    } finally {
      setSavingStatusId(null);
    }
  }

  async function handleSaveDrawer(): Promise<void> {
    if (!activeRecord) {
      return;
    }

    const normalizedOutputUrl = drawerOutputUrl.trim();
    if (
      mode === "OS" &&
      normalizedOutputUrl &&
      !/^https?:\/\//i.test(normalizedOutputUrl)
    ) {
      setToast({
        body: "Output URL must start with http:// or https://",
        title: "Failed..",
        type: "fail",
      });
      return;
    }

    if (mode === "OS" && normalizedOutputUrl !== drawerOutputUrl) {
      setDrawerOutputUrl(normalizedOutputUrl);
    }

    setDrawerSaving(true);
    const previousRecords = records;

    setRecords((current) =>
      current.map((record) => {
        if (record.id !== activeRecord.id) {
          return record;
        }

        let nextRecord = replaceRecordValue(record, header, "Notes", drawerNotes);

        if (mode === "OS") {
          nextRecord = replaceRecordValue(
            nextRecord,
            header,
            "Output URL",
            normalizedOutputUrl,
          );
        }

        return nextRecord;
      }),
    );

    try {
      await updateRfqNotes(mode, activeRecord.id, drawerNotes);

      if (mode === "OS") {
        await updateRfqOutputUrl(activeRecord.id, normalizedOutputUrl);
      }

      setToast({
        body:
          mode === "OS"
            ? `Details for RFQ #${activeRecord.id} were updated successfully.`
            : `Notes for RFQ #${activeRecord.id} were updated successfully.`,
        title: "Updated!",
        type: "success",
      });
    } catch (error) {
      setRecords(previousRecords);
      setToast({
        body:
          error instanceof Error ? error.message : "Failed to save details.",
        title: "Failed..",
        type: "fail",
      });
    } finally {
      setDrawerSaving(false);
    }
  }

  return {
    closeToast: () => setToast(null),
    drawerNotes,
    drawerOutputUrl,
    drawerSaving,
    handleSaveDrawer,
    handleStatusChange,
    savingStatusId,
    setDrawerNotes,
    setDrawerOutputUrl,
    toast,
  };
}
