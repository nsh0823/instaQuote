import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { getActiveUserName, getRFQStatusInfo } from "../../../lib/api";
import { prefetchHomeBackgroundData } from "@/lib/queryPrefetch";
import { queryKeys } from "@/lib/queryKeys";
import type { RfqStatusInfo } from "../../../types/backend";

export function useHomeBootstrapData(): {
  activeUser: string;
  statusInfo: RfqStatusInfo | null;
} {
  const queryClient = useQueryClient();
  const statusInfoQuery = useQuery({
    queryKey: queryKeys.rfqStatusInfo,
    queryFn: getRFQStatusInfo,
  });
  const activeUserQuery = useQuery({
    queryKey: queryKeys.activeUserName,
    queryFn: getActiveUserName,
  });

  useEffect(() => {
    return prefetchHomeBackgroundData(queryClient);
  }, [queryClient]);

  useEffect(() => {
    if (statusInfoQuery.error) {
      console.error(
        statusInfoQuery.error instanceof Error
          ? statusInfoQuery.error.message
          : "Failed to load home dashboard.",
      );
    }
  }, [statusInfoQuery.error]);

  return {
    activeUser: activeUserQuery.data ?? "",
    statusInfo: statusInfoQuery.data ?? null,
  };
}
