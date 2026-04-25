import {
  createStaticRanges,
  type Range,
  type StaticRange,
} from "react-date-range";

import { DATE_RANGE_PRESETS } from "./constants";
import type {
  DateRangePreset,
  DateRangeValue,
  GreetingKind,
} from "../types/home";

export function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function endOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfWeek(date: Date): Date {
  const next = startOfDay(date);
  next.setDate(next.getDate() - next.getDay());
  return next;
}

function endOfWeek(date: Date): Date {
  return endOfDay(addDays(startOfWeek(date), 6));
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date): Date {
  return endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

function startOfQuarter(date: Date): Date {
  const quarterStartMonth = Math.floor(date.getMonth() / 3) * 3;
  return new Date(date.getFullYear(), quarterStartMonth, 1);
}

function endOfQuarter(date: Date): Date {
  const start = startOfQuarter(date);
  return endOfDay(new Date(start.getFullYear(), start.getMonth() + 3, 0));
}

function getFiscalYearRange(today: Date): DateRangeValue {
  const month = today.getMonth();
  const year = today.getFullYear();

  if (month <= 2) {
    return {
      start: new Date(year - 1, 3, 1),
      end: endOfDay(new Date(year, 2, 31)),
    };
  }

  return {
    start: new Date(year, 3, 1),
    end: endOfDay(new Date(year + 1, 2, 31)),
  };
}

export function getPresetRange(
  preset: DateRangePreset,
  today = new Date(),
): DateRangeValue {
  const now = new Date(today);

  switch (preset) {
    case "Today":
      return { start: startOfDay(now), end: endOfDay(now) };
    case "Yesterday": {
      const yesterday = addDays(now, -1);
      return { start: startOfDay(yesterday), end: endOfDay(yesterday) };
    }
    case "This Week":
      return { start: startOfWeek(now), end: endOfWeek(now) };
    case "This Month":
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case "This Quarter":
      return { start: startOfQuarter(now), end: endOfQuarter(now) };
    case "This Year":
      return getFiscalYearRange(now);
    case "Last 7 Days":
      return { start: startOfDay(addDays(now, -6)), end: endOfDay(now) };
    case "Last 30 Days":
      return { start: startOfDay(addDays(now, -29)), end: endOfDay(now) };
    case "Last Month": {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
    }
  }
}

export function parseLegacyDate(value: string): Date | null {
  const text = value.trim();
  const match = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2}|\d{4})$/);

  if (!match) {
    const fallback = new Date(text);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }

  const month = Number(match[1]);
  const day = Number(match[2]);
  const rawYear = Number(match[3]);
  const year = rawYear < 100 ? 2000 + rawYear : rawYear;

  if (!month || !day || !year) {
    return null;
  }

  const parsed = new Date(year, month - 1, day);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function dateFromKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatRange(range: DateRangeValue): string {
  return `${formatShortDate(range.start)} ~ ${formatShortDate(range.end)}`;
}

export function formatLongDate(date: Date): string {
  const day = date.getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th";

  const month = new Intl.DateTimeFormat("en-US", { month: "long" }).format(
    date,
  );

  return `${month} ${day}${suffix}, ${date.getFullYear()}`;
}

export function getGreeting(now: Date): {
  label: "Morning" | "Afternoon" | "Evening";
  kind: GreetingKind;
} {
  const hour = now.getHours();

  if (hour >= 12 && hour <= 17) {
    return { label: "Afternoon", kind: "afternoon" };
  }

  if (hour > 17) {
    return { label: "Evening", kind: "evening" };
  }

  return { label: "Morning", kind: "morning" };
}

export function isInRange(date: Date, range: DateRangeValue): boolean {
  return (
    date.getTime() >= startOfDay(range.start).getTime() &&
    date.getTime() <= endOfDay(range.end).getTime()
  );
}

export function isSameCalendarDate(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export const DATE_RANGE_STATIC_RANGES: StaticRange[] = createStaticRanges(
  DATE_RANGE_PRESETS.map((preset) => ({
    label: preset,
    range: () => {
      const nextRange = getPresetRange(preset, new Date());
      return { startDate: nextRange.start, endDate: nextRange.end };
    },
    isSelected: (selectedRange: Range) => {
      if (!selectedRange.startDate || !selectedRange.endDate) {
        return false;
      }

      const nextRange = getPresetRange(preset, new Date());
      return (
        isSameCalendarDate(selectedRange.startDate, nextRange.start) &&
        isSameCalendarDate(selectedRange.endDate, nextRange.end)
      );
    },
  })),
);
