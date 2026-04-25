import type { RfqStatusInfo } from "../../../types/backend";

import type { Region, StatusEntry } from "../types/home";
import { parseLegacyDate } from "./date";

export function parseStatusInfo(data: RfqStatusInfo): Record<Region, StatusEntry[]> {
  return {
    KR: data.KR.map(([status, dateStr, owner]) => ({
      status,
      date: parseLegacyDate(dateStr) ?? new Date("invalid"),
      owner,
    })).filter((entry) => !Number.isNaN(entry.date.getTime())),
    OS: data.OS.map(([status, dateStr, owner]) => ({
      status,
      date: parseLegacyDate(dateStr) ?? new Date("invalid"),
      owner,
    })).filter((entry) => !Number.isNaN(entry.date.getTime())),
  };
}
