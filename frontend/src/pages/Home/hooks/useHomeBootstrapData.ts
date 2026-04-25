import { useEffect, useState } from "react";

import { getActiveUserName, getRFQStatusInfo } from "../../../lib/api";
import type { RfqStatusInfo } from "../../../types/backend";

export function useHomeBootstrapData(): {
  activeUser: string;
  statusInfo: RfqStatusInfo | null;
} {
  const [statusInfo, setStatusInfo] = useState<RfqStatusInfo | null>(null);
  const [activeUser, setActiveUser] = useState("");

  useEffect(() => {
    let isMounted = true;

    Promise.all([getRFQStatusInfo(), getActiveUserName()])
      .then(([statusData, userName]) => {
        if (!isMounted) {
          return;
        }

        setStatusInfo(statusData);
        setActiveUser(userName);
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Failed to load home dashboard.";
        console.error(message);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    activeUser,
    statusInfo,
  };
}
