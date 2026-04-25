import { useMemo } from "react";

import type { DateRangeValue, Region, Scope } from "../types/home";
import { isInRange } from "../utils/date";
import type { ParsedStatusInfo } from "./useParsedStatusInfo";

type OrderedCounts = Record<
  Region,
  {
    ordered: number;
    overall: number;
    rate: number;
  }
>;

const EMPTY_ORDERED_COUNTS: OrderedCounts = {
  KR: { ordered: 0, overall: 0, rate: 0 },
  OS: { ordered: 0, overall: 0, rate: 0 },
};

export function useOrderedCounts(params: {
  activeUser: string;
  orderedRange: DateRangeValue;
  orderedScope: Scope;
  parsedStatusInfo: ParsedStatusInfo | null;
}): OrderedCounts {
  const { activeUser, orderedRange, orderedScope, parsedStatusInfo } = params;

  return useMemo(() => {
    if (!parsedStatusInfo) {
      return EMPTY_ORDERED_COUNTS;
    }

    const next: OrderedCounts = {
      KR: { ordered: 0, overall: 0, rate: 0 },
      OS: { ordered: 0, overall: 0, rate: 0 },
    };

    (["KR", "OS"] as const).forEach((region) => {
      parsedStatusInfo[region].forEach((entry) => {
        if (!isInRange(entry.date, orderedRange)) {
          return;
        }

        if (orderedScope === "Your" && entry.owner !== activeUser) {
          return;
        }

        next[region].overall += 1;

        if (entry.status === "Ordered") {
          next[region].ordered += 1;
        }
      });

      next[region].rate =
        next[region].overall > 0
          ? Number(((next[region].ordered / next[region].overall) * 100).toFixed(1))
          : 0;
    });

    return next;
  }, [activeUser, orderedRange, orderedScope, parsedStatusInfo]);
}
