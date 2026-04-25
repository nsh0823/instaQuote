import { Link } from "react-router-dom";

import { useAppContext } from "../../../context/AppContext";
import { buildInternalHref } from "../utils/navigation";
import type { QuickAccessIconKind, Region } from "../types/home";
import { CardIcon } from "./CardIcon";

export function QuickAccessCard({
  icon,
  mode,
  region,
  title,
  description,
}: {
  icon: Exclude<QuickAccessIconKind, "chevron">;
  mode: string;
  region: Region;
  title: string;
  description: string;
}): JSX.Element {
  const { setRfqMode } = useAppContext();

  return (
    <div>
      <div className="home-card home-quick-access-menu home-shadow-sm">
        <Link
          className="btn shortcut-btn"
          onClick={() => setRfqMode(region)}
          to={buildInternalHref(mode)}
        >
          <div className="card-body home-shortcut-body">
            <div className="icon-wrapper">
              <CardIcon className="quick-access-main-icon" kind={icon} size={13} />
            </div>
            <div className="shortcut-btn-name">
              {title}
              <CardIcon className="quick-access-chevron" kind="chevron" size={14} />
            </div>
            <div className="shortcut-btn-desc">{description}</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
