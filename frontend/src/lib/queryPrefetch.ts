import type { QueryClient } from "@tanstack/react-query";

import {
  getClient,
  getCompPt,
  getCountry,
  getDraft,
  getDraftOS,
  getOtherFee,
  getRate,
  getRFQ,
  getRFQOS,
  getVendors,
} from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

export function prefetchHomeBackgroundData(client: QueryClient): () => void {
  const timers = [
    window.setTimeout(() => {
      void client.prefetchQuery({
        queryKey: queryKeys.country,
        queryFn: getCountry,
      });
      void client.prefetchQuery({
        queryKey: queryKeys.client,
        queryFn: getClient,
      });
    }, 600),
    window.setTimeout(() => {
      void client.prefetchQuery({
        queryKey: queryKeys.compPt,
        queryFn: getCompPt,
      });
      void client.prefetchQuery({
        queryKey: queryKeys.otherFee,
        queryFn: getOtherFee,
      });
      void client.prefetchQuery({
        queryKey: queryKeys.rate,
        queryFn: getRate,
      });
    }, 1200),
    window.setTimeout(() => {
      void client.prefetchQuery({
        queryKey: queryKeys.vendors,
        queryFn: getVendors,
      });
    }, 1800),
    window.setTimeout(() => {
      void client.prefetchQuery({
        queryKey: queryKeys.rfq(),
        queryFn: () => getRFQ(),
      });
      void client.prefetchQuery({
        queryKey: queryKeys.rfqOS(),
        queryFn: () => getRFQOS(),
      });
    }, 2400),
    window.setTimeout(() => {
      void client.prefetchQuery({
        queryKey: queryKeys.draft(),
        queryFn: () => getDraft(),
      });
      void client.prefetchQuery({
        queryKey: queryKeys.draftOS(),
        queryFn: () => getDraftOS(),
      });
    }, 3200),
  ];

  return () => {
    timers.forEach((timer) => window.clearTimeout(timer));
  };
}
