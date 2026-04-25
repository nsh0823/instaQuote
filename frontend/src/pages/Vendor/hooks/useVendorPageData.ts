import { useEffect, useState } from "react";

import { getVendors } from "@/lib/api";
import type { VendorPageDataState } from "@/pages/Vendor/types/vendor";

export function useVendorPageData(): VendorPageDataState {
  const [vendorRows, setVendorRows] = useState<VendorPageDataState["vendorRows"]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load(): Promise<void> {
      try {
        setLoading(true);
        setErrorMessage(null);

        const rows = await getVendors();
        if (!isMounted) {
          return;
        }

        setVendorRows(rows);
        setLoading(false);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load vendors.",
        );
        setLoading(false);
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    errorMessage,
    loading,
    vendorRows,
  };
}
