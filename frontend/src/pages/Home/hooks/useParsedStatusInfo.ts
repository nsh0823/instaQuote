import { useMemo } from "react";

import type { RfqStatusInfo } from "../../../types/backend";
import type { Region, StatusEntry } from "../types/home";
import { parseStatusInfo } from "../utils/status";

export type ParsedStatusInfo = Record<Region, StatusEntry[]>;

export function useParsedStatusInfo(
  statusInfo: RfqStatusInfo | null,
): ParsedStatusInfo | null {
  return useMemo(() => {
    if (!statusInfo) {
      return null;
    }

    return parseStatusInfo(statusInfo);
  }, [statusInfo]);
}
