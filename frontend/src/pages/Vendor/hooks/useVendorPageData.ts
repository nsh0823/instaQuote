import { useQuery } from "@tanstack/react-query";

import { getVendors } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { VendorPageDataState } from "@/pages/Vendor/types/vendor";

export function useVendorPageData(): VendorPageDataState {
  const vendorsQuery = useQuery({
    queryKey: queryKeys.vendors,
    queryFn: getVendors,
  });

  return {
    errorMessage:
      vendorsQuery.error instanceof Error
        ? vendorsQuery.error.message
        : vendorsQuery.error
          ? "Failed to load vendors."
          : null,
    loading: vendorsQuery.isLoading,
    vendorRows: vendorsQuery.data ?? [],
  };
}
