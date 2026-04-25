import { useMemo } from "react";

import type { OwnerWorkloadItem, Scope } from "../types/home";
import type { ParsedStatusInfo } from "./useParsedStatusInfo";

export function useOwnerWorkloadData(params: {
  activeUser: string;
  ownerScope: Scope;
  parsedStatusInfo: ParsedStatusInfo | null;
}): OwnerWorkloadItem[] {
  const { activeUser, ownerScope, parsedStatusInfo } = params;

  return useMemo(() => {
    if (!parsedStatusInfo) {
      return [];
    }

    const byOwner = new Map<
      string,
      {
        closed: number;
        krTotal: number;
        lastActivityTime: number;
        open: number;
        ordered: number;
        osTotal: number;
        total: number;
      }
    >();

    (["KR", "OS"] as const).forEach((region) => {
      parsedStatusInfo[region].forEach((entry) => {
        if (ownerScope === "Your" && entry.owner !== activeUser) {
          return;
        }

        const ownerName = entry.owner.trim() || "Unknown Owner";
        const current = byOwner.get(ownerName) ?? {
          closed: 0,
          krTotal: 0,
          lastActivityTime: 0,
          open: 0,
          ordered: 0,
          osTotal: 0,
          total: 0,
        };

        current.total += 1;
        current.lastActivityTime = Math.max(
          current.lastActivityTime,
          entry.date.getTime(),
        );

        if (region === "KR") {
          current.krTotal += 1;
        } else {
          current.osTotal += 1;
        }

        if (entry.status === "Bidding" || entry.status === "Pending") {
          current.open += 1;
        }

        if (
          entry.status === "Ordered" ||
          entry.status === "Pass" ||
          entry.status === "Failed"
        ) {
          current.closed += 1;
        }

        if (entry.status === "Ordered") {
          current.ordered += 1;
        }

        byOwner.set(ownerName, current);
      });
    });

    return Array.from(byOwner.entries())
      .map(([owner, summary]) => ({
        closed: summary.closed,
        krTotal: summary.krTotal,
        lastActivity:
          summary.lastActivityTime > 0 ? new Date(summary.lastActivityTime) : null,
        open: summary.open,
        ordered: summary.ordered,
        osTotal: summary.osTotal,
        owner,
        total: summary.total,
        winRate:
          summary.closed > 0
            ? Number(((summary.ordered / summary.closed) * 100).toFixed(1))
            : 0,
      }))
      .sort((left, right) => {
        if (right.open !== left.open) {
          return right.open - left.open;
        }

        if (right.total !== left.total) {
          return right.total - left.total;
        }

        return (right.lastActivity?.getTime() ?? 0) - (left.lastActivity?.getTime() ?? 0);
      })
      .slice(0, 6);
  }, [activeUser, ownerScope, parsedStatusInfo]);
}
