import { useMemo } from "react";

import type { ProgressPoint, ProgressWindow, Scope } from "../types/home";
import {
  addDays,
  dateFromKey,
  isInRange,
  startOfDay,
  toDateKey,
} from "../utils/date";
import type { ParsedStatusInfo } from "./useParsedStatusInfo";

export function useProgressChartData(params: {
  activeUser: string;
  parsedStatusInfo: ParsedStatusInfo | null;
  progressScope: Scope;
  progressWindow: ProgressWindow;
}): ProgressPoint[] {
  const { activeUser, parsedStatusInfo, progressScope, progressWindow } = params;

  return useMemo(() => {
    const endDate = startOfDay(new Date());
    const startDate = startOfDay(addDays(endDate, -(progressWindow - 1)));
    const dailyCounts = new Map<string, { kr: number; os: number }>();
    const labelFormatter = new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
    });

    for (let dayOffset = 0; dayOffset < progressWindow; dayOffset += 1) {
      const date = addDays(startDate, dayOffset);
      dailyCounts.set(toDateKey(date), { kr: 0, os: 0 });
    }

    if (parsedStatusInfo) {
      (["KR", "OS"] as const).forEach((region) => {
        parsedStatusInfo[region].forEach((entry) => {
          if (entry.status !== "Ordered") {
            return;
          }

          if (!isInRange(entry.date, { start: startDate, end: endDate })) {
            return;
          }

          if (progressScope === "Your" && entry.owner !== activeUser) {
            return;
          }

          const key = toDateKey(entry.date);
          const bucket = dailyCounts.get(key);

          if (!bucket) {
            return;
          }

          if (region === "KR") {
            bucket.kr += 1;
            return;
          }

          bucket.os += 1;
        });
      });
    }

    return Array.from(dailyCounts.entries()).map(([dateKey, count]) => ({
      dateKey,
      kr: count.kr,
      label: labelFormatter.format(dateFromKey(dateKey)),
      os: count.os,
      total: count.kr + count.os,
    }));
  }, [activeUser, parsedStatusInfo, progressScope, progressWindow]);
}
