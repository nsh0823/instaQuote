import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { AnimatedNumber } from "./AnimatedNumber";
import { PROGRESS_WINDOWS } from "../utils/constants";
import { dateFromKey, formatLongDate } from "../utils/date";
import type { ProgressPoint, ProgressWindow } from "../types/home";

export function ProgressAreaChart({
  data,
  hasLoadedData,
  onWindowChange,
  windowDays,
}: {
  data: ProgressPoint[];
  hasLoadedData: boolean;
  onWindowChange: (nextWindow: ProgressWindow) => void;
  windowDays: ProgressWindow;
}): JSX.Element {
  const totals = data.reduce(
    (accumulator, point) => ({
      kr: accumulator.kr + point.kr,
      os: accumulator.os + point.os,
      total: accumulator.total + point.total,
    }),
    { kr: 0, os: 0, total: 0 },
  );

  return (
    <div className="progress-chart-shell">
      <div className="progress-header">
        <div className="progress-kpis">
          <div className="progress-kpi">
            <span className="progress-kpi-label">
              <span className="progress-legend-dot progress-legend-dot-kr" />
              Korea Ordered
            </span>
            <AnimatedNumber className="progress-kpi-value" value={totals.kr} />
          </div>
          <div className="progress-kpi">
            <span className="progress-kpi-label">
              <span className="progress-legend-dot progress-legend-dot-os" />
              Overseas Ordered
            </span>
            <AnimatedNumber className="progress-kpi-value" value={totals.os} />
          </div>
          <div className="progress-kpi">
            <span className="progress-kpi-label">
              <span className="progress-legend-dot progress-legend-dot-total" />
              Total Ordered
            </span>
            <AnimatedNumber className="progress-kpi-value" value={totals.total} />
          </div>
        </div>

        <div className="progress-window-switch">
          {PROGRESS_WINDOWS.map((windowOption) => (
            <button
              className={`progress-window-btn ${windowDays === windowOption ? "is-active" : ""}`}
              key={windowOption}
              onClick={() => onWindowChange(windowOption)}
              type="button"
            >
              {windowOption}D
            </button>
          ))}
        </div>
      </div>

      <div className="progress-chart-stage">
        <div className={`progress-chart-canvas ${hasLoadedData ? "is-visible" : ""}`}>
          <ResponsiveContainer height={300} width="100%">
            <AreaChart data={data} margin={{ top: 12, right: 12, left: -14, bottom: 4 }}>
              <defs>
                <linearGradient id="progressKr" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#6e4df5" stopOpacity={0.34} />
                  <stop offset="95%" stopColor="#6e4df5" stopOpacity={0.03} />
                </linearGradient>
                <linearGradient id="progressOs" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#2e9bff" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#2e9bff" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#ececf5" strokeDasharray="3 3" vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="label"
                minTickGap={20}
                tick={{ fill: "#7b8490", fontSize: 12 }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                domain={[0, (maxValue: number) => Math.max(5, Math.ceil(maxValue * 1.15))]}
                tick={{ fill: "#7b8490", fontSize: 12 }}
                tickLine={false}
                width={34}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #ececf5",
                  borderRadius: "10px",
                  boxShadow: "0 0.5rem 1rem rgba(0, 0, 0, 0.15)",
                  fontSize: 12,
                }}
                cursor={{ stroke: "#cdd1df", strokeWidth: 1 }}
                formatter={(
                  value?: number | string | ReadonlyArray<string | number>,
                  name?: string | number,
                ) => {
                  const primaryValue = Array.isArray(value) ? value[0] : value;
                  const numericValue =
                    typeof primaryValue === "number"
                      ? primaryValue
                      : Number(primaryValue ?? 0);
                  const key = typeof name === "string" ? name : String(name ?? "");

                  return [
                    numericValue.toLocaleString(),
                    key === "kr" ? "Korea" : key === "os" ? "Overseas" : "Total",
                  ] as [string, string];
                }}
                labelFormatter={(_, payload) => {
                  const first = payload[0]?.payload as ProgressPoint | undefined;
                  if (!first?.dateKey) {
                    return "";
                  }
                  return formatLongDate(dateFromKey(first.dateKey));
                }}
              />
              <Area
                dataKey="kr"
                fill="url(#progressKr)"
                fillOpacity={1}
                isAnimationActive={hasLoadedData}
                name="kr"
                stroke="#6e4df5"
                strokeWidth={2}
                type="monotone"
              />
              <Area
                dataKey="os"
                fill="url(#progressOs)"
                fillOpacity={1}
                isAnimationActive={hasLoadedData}
                name="os"
                stroke="#2e9bff"
                strokeWidth={2}
                type="monotone"
              />
              <Area
                dataKey="total"
                fill="none"
                isAnimationActive={hasLoadedData}
                name="total"
                stroke="#a29bbd"
                strokeDasharray="5 4"
                strokeOpacity={0.85}
                strokeWidth={1.5}
                type="monotone"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {!hasLoadedData ? (
          <LoadingSpinner
            className="progress-chart-loading"
            label="Loading order progress..."
          />
        ) : null}
      </div>
    </div>
  );
}
