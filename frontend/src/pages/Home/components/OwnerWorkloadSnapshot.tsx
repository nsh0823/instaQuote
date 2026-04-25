import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import type { OwnerWorkloadItem } from "../types/home";
import { buildOwnerAvatar } from "../utils/avatar";

export function OwnerWorkloadSnapshot({
  hasLoadedData,
  items,
}: {
  hasLoadedData: boolean;
  items: OwnerWorkloadItem[];
}): JSX.Element {
  if (!hasLoadedData) {
    return (
      <div className="owner-snapshot is-visible">
        <LoadingSpinner
          className="owner-snapshot-loading"
          label="Loading workload snapshot..."
        />
      </div>
    );
  }

  return (
    <div className="owner-snapshot is-visible">
      {items.length === 0 ? (
        <div className="owner-empty">No owner data available for this scope.</div>
      ) : (
        <div className="owner-list">
          {items.map((item) => (
            <div className="owner-row" key={item.owner}>
              <div className="owner-main">
                <img
                  alt={`${item.owner} avatar`}
                  className="owner-avatar"
                  src={buildOwnerAvatar(item.owner)}
                />
                <div className="owner-meta">
                  <div className="owner-name">{item.owner}</div>
                  <div className="owner-submeta">
                    KR {item.krTotal} • OS {item.osTotal}
                  </div>
                </div>
              </div>

              <div className="owner-metrics">
                <div className="owner-metric">
                  <span>Open</span>
                  <strong>{item.open.toLocaleString()}</strong>
                </div>
                <div className="owner-metric">
                  <span>Ordered</span>
                  <strong>{item.ordered.toLocaleString()}</strong>
                </div>
                <div className="owner-metric">
                  <span>Win Rate</span>
                  <strong>{item.winRate.toFixed(1)}%</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
