import { createPortal } from "react-dom";

import type { OsPanelState } from "@/pages/Create/types";
import { splitGid } from "@/pages/Create/utils/os-panels";

type OsCountryTitlePortalProps = {
  activePanel: OsPanelState | null;
  headerMiddleRoot: HTMLElement | null;
};

export function OsCountryTitlePortal({
  activePanel,
  headerMiddleRoot,
}: OsCountryTitlePortalProps): JSX.Element | null {
  if (!activePanel || !headerMiddleRoot) {
    return null;
  }

  return createPortal(
    <span className="os-page-title-country" key={activePanel.id}>
      <span className="os-page-title-country-flag-shell">
        <img
          alt={activePanel.country}
          className="size-8.25"
          src={`https://hatscripts.github.io/circle-flags/flags/${splitGid(activePanel.gid).base}.svg`}
        />
      </span>
      <span className="os-page-title-country-text">
        {activePanel.countryRename}
      </span>
    </span>,
    headerMiddleRoot,
  );
}
