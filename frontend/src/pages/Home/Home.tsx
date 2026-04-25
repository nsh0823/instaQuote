import { useMemo, useState } from "react";

import { HelpTooltip } from "@/components/common/HelpTooltip";
import { DateRangeControl } from "@/pages/Home/components/DateRangeControl";
import { GreetingAnimation } from "@/pages/Home/components/GreetingAnimation";
import {
  OrderedMetricCard,
  RegionOverviewSection,
} from "@/pages/Home/components/MetricCards";
import { OwnerWorkloadSnapshot } from "@/pages/Home/components/OwnerWorkloadSnapshot";
import { ProgressAreaChart } from "@/pages/Home/components/ProgressAreaChart";
import { QuickAccessCard } from "@/pages/Home/components/QuickAccessCard";
import { ScopeSelect } from "@/pages/Home/components/ScopeSelect";
import { useHeaderFloating } from "@/pages/Home/hooks/useHeaderFloating";
import { useHomeBootstrapData } from "@/pages/Home/hooks/useHomeBootstrapData";
import { useOrderedCounts } from "@/pages/Home/hooks/useOrderedCounts";
import { useOverviewCounts } from "@/pages/Home/hooks/useOverviewCounts";
import { useOwnerWorkloadData } from "@/pages/Home/hooks/useOwnerWorkloadData";
import { useParsedStatusInfo } from "@/pages/Home/hooks/useParsedStatusInfo";
import { useProgressChartData } from "@/pages/Home/hooks/useProgressChartData";
import type {
  DateRangeValue,
  ProgressWindow,
  Scope,
} from "@/pages/Home/types/home";
import { DAILY_QUOTES, QUICK_ACCESS } from "@/pages/Home/utils/constants";
import {
  formatLongDate,
  formatRange,
  getGreeting,
  getPresetRange,
} from "@/pages/Home/utils/date";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "@/pages/Home/styles/Home.css";

export default function Home(): JSX.Element {
  const { activeUser, statusInfo } = useHomeBootstrapData();
  const isHeaderFloating = useHeaderFloating(10);
  const [overviewScope, setOverviewScope] = useState<Scope>("Total");
  const [orderedScope, setOrderedScope] = useState<Scope>("Total");
  const [progressScope, setProgressScope] = useState<Scope>("Total");
  const [ownerScope, setOwnerScope] = useState<Scope>("Total");
  const [progressWindow, setProgressWindow] = useState<ProgressWindow>(30);
  const [overviewRange, setOverviewRange] = useState<DateRangeValue>(() =>
    getPresetRange("Last 30 Days"),
  );
  const [orderedRange, setOrderedRange] = useState<DateRangeValue>(() =>
    getPresetRange("This Year"),
  );

  const greeting = useMemo(() => getGreeting(new Date()), []);
  const todayLabel = useMemo(() => formatLongDate(new Date()), []);
  const dailyQuote = useMemo(
    () => DAILY_QUOTES[Math.floor(Math.random() * DAILY_QUOTES.length)],
    [],
  );
  const parsedStatusInfo = useParsedStatusInfo(statusInfo);
  const overviewCounts = useOverviewCounts({
    activeUser,
    overviewRange,
    overviewScope,
    parsedStatusInfo,
  });
  const orderedCounts = useOrderedCounts({
    activeUser,
    orderedRange,
    orderedScope,
    parsedStatusInfo,
  });
  const progressChartData = useProgressChartData({
    activeUser,
    parsedStatusInfo,
    progressScope,
    progressWindow,
  });
  const ownerWorkloadData = useOwnerWorkloadData({
    activeUser,
    ownerScope,
    parsedStatusInfo,
  });

  const hasLoadedData = statusInfo !== null;
  const showBlink = !hasLoadedData;

  return (
    <div className="home-page flex min-h-screen">
      <div className="flex-1 pl-15">
        <header
          className={`home-header fixed pl-15 top-0 z-100 inset-x-0 ${isHeaderFloating ? "floating-nav" : ""}`}
        >
          <div className="home-nav-body">
            <div className="page-title">
              <span>Good {greeting.label}</span>
              <GreetingAnimation kind={greeting.kind} />
            </div>
            <div className="flex-break" />
            <div className="page-subtitle">
              <i>{dailyQuote}</i>
              <span className="mx-2">•</span>
              <span>{todayLabel}</span>
            </div>
          </div>
        </header>

        <main className="home-main-body">
          <div className="space-y-6">
            <div className="flex flex-col gap-5 xl:flex-row">
              <section className="home-card home-shadow-sm w-full px-6.25 py-5 xl:w-[calc(75%-10px)]">
                <h5 className="home-h5">
                  <ScopeSelect
                    inputId="selectOverviewScope"
                    minimumWidth={46.42}
                    onChange={setOverviewScope}
                    value={overviewScope}
                  />
                  <span>Overview</span>
                  <span className="ml-auto inline-flex items-center">
                    <DateRangeControl
                      id="selectOverviewDateRange"
                      onApply={setOverviewRange}
                      range={overviewRange}
                    />
                  </span>
                </h5>

                <div className="space-y-6">
                  <RegionOverviewSection
                    blink={showBlink}
                    counts={overviewCounts.KR}
                    isVisible={hasLoadedData}
                    title="Korea"
                  />
                  <RegionOverviewSection
                    blink={showBlink}
                    counts={overviewCounts.OS}
                    isVisible={hasLoadedData}
                    title="Overseas"
                  />
                </div>

                <div className="text-right">
                  <span
                    className={`overview-date-range ${hasLoadedData ? "is-visible" : ""}`}
                  >
                    {formatRange(overviewRange)}
                  </span>
                </div>
              </section>

              <section className="home-card home-shadow-sm ordered-card relative w-full px-6.25 py-5 xl:w-[calc(25%-10px)]">
                <img
                  alt=""
                  className="panda-qq"
                  src="https://i.postimg.cc/062k9Cmy/final-panda.png"
                />

                <div className="relative">
                  <h5 className="home-h5">
                    <ScopeSelect
                      inputId="selectOrderedScope"
                      minimumWidth={50.27}
                      onChange={setOrderedScope}
                      value={orderedScope}
                    />
                    <span>Ordered</span>
                    <span className="ml-auto inline-flex items-center">
                      <DateRangeControl
                        id="selectOrderedDateRange"
                        onApply={setOrderedRange}
                        range={orderedRange}
                      />
                    </span>
                  </h5>

                  <div className="space-y-6">
                    <section className="space-y-3">
                      <h6 className="home-h6">Korea</h6>
                      <OrderedMetricCard
                        blink={showBlink}
                        isVisible={hasLoadedData}
                        ordered={orderedCounts.KR.ordered}
                        overall={orderedCounts.KR.overall}
                        rate={orderedCounts.KR.rate}
                      />
                    </section>
                    <section className="space-y-3">
                      <h6 className="home-h6">Overseas</h6>
                      <OrderedMetricCard
                        blink={showBlink}
                        isVisible={hasLoadedData}
                        ordered={orderedCounts.OS.ordered}
                        overall={orderedCounts.OS.overall}
                        rate={orderedCounts.OS.rate}
                      />
                    </section>
                  </div>

                  <div className="text-right">
                    <span
                      className={`ordered-date-range ${hasLoadedData ? "is-visible" : ""}`}
                    >
                      {formatRange(orderedRange)}
                    </span>
                  </div>
                </div>
              </section>
            </div>
            <div>
              <section className="home-card home-shadow-sm px-6.25 py-5 w-full">
                <h5 className="home-h5">
                  <ScopeSelect
                    inputId="selectProgressScope"
                    minimumWidth={46.42}
                    onChange={setProgressScope}
                    value={progressScope}
                  />
                  <span>Order Progress</span>
                </h5>
                <ProgressAreaChart
                  data={progressChartData}
                  hasLoadedData={hasLoadedData}
                  onWindowChange={setProgressWindow}
                  windowDays={progressWindow}
                />
              </section>
            </div>
            <div className="flex flex-col gap-5 xl:flex-row">
              <section className="home-card home-shadow-sm px-6.25 py-5 w-full xl:w-[calc(40%-10px)]">
                <h5 className="home-h5">
                  <ScopeSelect
                    inputId="selectOwnerScope"
                    minimumWidth={46.42}
                    onChange={setOwnerScope}
                    value={ownerScope}
                  />
                  <span className="owner-title-with-help">
                    <span>Workload Snapshot</span>
                    <HelpTooltip
                      content={
                        <>
                          Open = Bidding + Pending
                          <br />
                          Win Rate = Ordered / (Ordered + Pass + Failed)
                        </>
                      }
                      triggerClassName="text-[#8d93a0]"
                    />
                  </span>
                </h5>
                <OwnerWorkloadSnapshot
                  hasLoadedData={hasLoadedData}
                  items={ownerWorkloadData}
                />
              </section>
              <section className="home-card home-shadow-sm px-6.25 py-5 w-full xl:w-[calc(60%-10px)]">
                <h5 className="home-h5">Quick Access</h5>

                <div className="flex flex-col gap-5 items-start justify-start">
                  <div className="grow w-full">
                    <h6 className="home-h6">Korea</h6>
                    <div className="grid grid-cols-4 gap-3">
                      {QUICK_ACCESS.KR.map((item) => (
                        <QuickAccessCard
                          description={item.description}
                          icon={item.icon}
                          key={`${item.mode}-KR`}
                          mode={item.mode}
                          region="KR"
                          title={item.title}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="grow w-full">
                    <h6 className="home-h6">Overseas</h6>
                    <div className="grid grid-cols-4 gap-3">
                      {QUICK_ACCESS.OS.map((item) => (
                        <QuickAccessCard
                          description={item.description}
                          icon={item.icon}
                          key={`${item.mode}-OS`}
                          mode={item.mode}
                          region="OS"
                          title={item.title}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
