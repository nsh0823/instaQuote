import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BsCalendar4 } from "react-icons/bs";
import { DateRangePicker, type Range, type RangeKeyDict } from "react-date-range";

import type { DateRangeValue } from "../types/home";
import {
  DATE_RANGE_STATIC_RANGES,
  endOfDay,
  startOfDay,
} from "../utils/date";

export function DateRangeControl({
  id,
  label,
  onApply,
  range,
}: {
  id: string;
  label?: string;
  onApply: (range: DateRangeValue) => void;
  range: DateRangeValue;
}): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [draftRange, setDraftRange] = useState<DateRangeValue>(range);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const [popoverStyle, setPopoverStyle] = useState<{
    left: number;
    top: number;
    visibility: "hidden" | "visible";
  }>({
    left: 0,
    top: 0,
    visibility: "hidden",
  });

  useEffect(() => {
    if (!isOpen) {
      setDraftRange(range);
    }
  }, [isOpen, range]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const updatePopoverPosition = (): void => {
      if (!triggerRef.current || !popoverRef.current) {
        return;
      }

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const popoverRect = popoverRef.current.getBoundingClientRect();
      const viewportPadding = 12;

      let left = triggerRect.right - popoverRect.width;
      left = Math.max(
        viewportPadding,
        Math.min(left, window.innerWidth - popoverRect.width - viewportPadding),
      );

      const availableBelow = window.innerHeight - triggerRect.bottom - viewportPadding;
      const shouldOpenAbove = availableBelow < popoverRect.height + 8;
      const top = shouldOpenAbove
        ? Math.max(viewportPadding, triggerRect.top - popoverRect.height - 8)
        : Math.min(
            window.innerHeight - popoverRect.height - viewportPadding,
            triggerRect.bottom + 8,
          );

      setPopoverStyle({
        left,
        top,
        visibility: "visible",
      });
    };

    const handlePointerDown = (event: MouseEvent): void => {
      const target = event.target as Node;
      if (
        (containerRef.current && containerRef.current.contains(target)) ||
        (popoverRef.current && popoverRef.current.contains(target))
      ) {
        return;
      }

      setIsOpen(false);
    };

    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", updatePopoverPosition);
    window.addEventListener("scroll", updatePopoverPosition, true);

    const frame = window.requestAnimationFrame(updatePopoverPosition);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", updatePopoverPosition);
      window.removeEventListener("scroll", updatePopoverPosition, true);
      window.cancelAnimationFrame(frame);
    };
  }, [isOpen]);

  const selectionRange = useMemo<Range>(
    () => ({
      startDate: draftRange.start,
      endDate: draftRange.end,
      key: "selection",
    }),
    [draftRange.end, draftRange.start],
  );

  function handleRangeChange(rangesByKey: RangeKeyDict): void {
    const selection = rangesByKey.selection;

    if (!selection?.startDate || !selection.endDate) {
      return;
    }

    setDraftRange({
      start: startOfDay(selection.startDate),
      end: endOfDay(selection.endDate),
    });
  }

  function handleCancel(): void {
    setDraftRange(range);
    setIsOpen(false);
  }

  function handleApply(): void {
    onApply({
      start: startOfDay(draftRange.start),
      end: endOfDay(draftRange.end),
    });
    setIsOpen(false);
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={`home-date-trigger ${label ? "has-label" : ""} ${isOpen ? "show-date-picker" : ""}`}
        id={id}
        onClick={() => setIsOpen((prev) => !prev)}
        ref={triggerRef}
        type="button"
      >
        {label ? <span className="home-date-trigger-label">{label}</span> : null}
        <BsCalendar4 className="text-[16px]" />
      </button>

      {isOpen
        ? createPortal(
            <div
              className="home-date-picker-popover"
              ref={popoverRef}
              style={{
                left: popoverStyle.left,
                position: "fixed",
                right: "auto",
                top: popoverStyle.top,
                visibility: popoverStyle.visibility,
              }}
            >
              <DateRangePicker
                direction="horizontal"
                inputRanges={[]}
                months={2}
                moveRangeOnFirstSelection={false}
                onChange={handleRangeChange}
                rangeColors={["#764cfc"]}
                ranges={[selectionRange]}
                showDateDisplay={false}
                staticRanges={DATE_RANGE_STATIC_RANGES}
                weekdayDisplayFormat="EEEEE"
              />
              <div className="home-date-picker-actions">
                <button
                  className="home-date-btn home-date-btn-cancel"
                  onClick={handleCancel}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="home-date-btn home-date-btn-apply"
                  onClick={handleApply}
                  type="button"
                >
                  Apply
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
