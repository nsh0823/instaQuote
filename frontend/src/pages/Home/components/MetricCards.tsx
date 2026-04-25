import { AnimatedNumber } from "./AnimatedNumber";
import { StatusDot } from "./StatusDot";
import { STATUS_KEYS } from "../utils/constants";
import type { StatusKey } from "../types/home";

export function StatusMetricCard({
  blink,
  isVisible,
  status,
  value,
}: {
  blink: boolean;
  isVisible: boolean;
  status: StatusKey;
  value: number;
}): JSX.Element {
  return (
    <div className="home-card">
      <div className="status-card-body">
        <div className="status-container">
          <StatusDot blink={blink} status={status} />
          <span>{status}</span>
        </div>
        <AnimatedNumber
          className={`status-cnt ${isVisible ? "is-visible" : ""}`}
          value={value}
        />
      </div>
    </div>
  );
}

export function RegionOverviewSection({
  blink,
  counts,
  isVisible,
  title,
}: {
  blink: boolean;
  counts: Record<StatusKey, number>;
  isVisible: boolean;
  title: string;
}): JSX.Element {
  return (
    <section className="space-y-3">
      <h6 className="home-h6">{title}</h6>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {STATUS_KEYS.map((status) => (
          <StatusMetricCard
            blink={blink}
            isVisible={isVisible}
            key={status}
            status={status}
            value={counts[status]}
          />
        ))}
      </div>
    </section>
  );
}

export function OrderedMetricCard({
  blink,
  isVisible,
  ordered,
  overall,
  rate,
}: {
  blink: boolean;
  isVisible: boolean;
  ordered: number;
  overall: number;
  rate: number;
}): JSX.Element {
  return (
    <div className="home-card">
      <div className="status-card-body">
        <div className="status-container">
          <StatusDot blink={blink} status="Ordered" />
          <span>Ordered (Win Rate)</span>
        </div>
        <div className="mb-[-1.79px] flex items-baseline text-[#3d3d43]">
          <AnimatedNumber
            className={`status-cnt ${isVisible ? "is-visible" : ""}`}
            value={ordered}
          />
          <span className="ordered-cnt-divider">/</span>
          <AnimatedNumber
            className={`status-cnt overall-cnt ${isVisible ? "is-visible" : ""}`}
            value={overall}
          />
          <AnimatedNumber
            className={`status-cnt win-rate ${isVisible ? "is-visible" : ""}`}
            decimals={1}
            value={rate}
          />
          <span className="text-[16px]">%</span>
        </div>
      </div>
    </div>
  );
}
