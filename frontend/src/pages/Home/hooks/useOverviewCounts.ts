import { useMemo } from "react";

import type { DateRangeValue, Region, Scope, StatusKey } from "../types/home";
import { STATUS_KEYS } from "../utils/constants";
import { isInRange } from "../utils/date";
import type { ParsedStatusInfo } from "./useParsedStatusInfo";

type OverviewCounts = Record<Region, Record<StatusKey, number>>;

const EMPTY_OVERVIEW_COUNTS: OverviewCounts = {
  KR: { Bidding: 0, Pending: 0, Ordered: 0, Pass: 0, Failed: 0 },
  OS: { Bidding: 0, Pending: 0, Ordered: 0, Pass: 0, Failed: 0 },
};

export function useOverviewCounts(params: {
  activeUser: string;
  overviewRange: DateRangeValue;
  overviewScope: Scope;
  parsedStatusInfo: ParsedStatusInfo | null;
}): OverviewCounts {
  const { activeUser, overviewRange, overviewScope, parsedStatusInfo } = params;

  return useMemo(() => {
    if (!parsedStatusInfo) {
      return EMPTY_OVERVIEW_COUNTS;
    }

    const next: OverviewCounts = {
      KR: { Bidding: 0, Pending: 0, Ordered: 0, Pass: 0, Failed: 0 },
      OS: { Bidding: 0, Pending: 0, Ordered: 0, Pass: 0, Failed: 0 },
    };

    (["KR", "OS"] as const).forEach((region) => {
      parsedStatusInfo[region].forEach((entry) => {
        if (!isInRange(entry.date, overviewRange)) {
          return;
        }

        if (overviewScope === "Your" && entry.owner !== activeUser) {
          return;
        }

        if (STATUS_KEYS.includes(entry.status as StatusKey)) {
          next[region][entry.status as StatusKey] += 1;
        }
      });
    });

    return next;
  }, [activeUser, overviewRange, overviewScope, parsedStatusInfo]);
}
