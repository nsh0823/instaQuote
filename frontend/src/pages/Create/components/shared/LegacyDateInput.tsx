import { useEffect, useRef, useState } from "react";
import { Calendar } from "react-date-range";
import { BsCalendar4 } from "react-icons/bs";

import { fromLegacyDate, toLegacyDate } from "@/pages/Create/utils/date";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

export function LegacyDateInput({
  onChange,
  value,
}: {
  onChange: (next: string) => void;
  value: string;
}): JSX.Element {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleOutside(event: MouseEvent): void {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
    };
  }, [open]);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        className="flex h-7.75 w-full items-center rounded-lg border border-[#e4e4e4] bg-white px-2.5 text-left text-[13px] outline-none transition hover:bg-[#f3f3f3]"
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        <span>{value}</span>
        <BsCalendar4 className="ml-auto text-[14px] text-slate-500" />
      </button>
      {open ? (
        <div className="absolute left-0 z-40 rounded-lg bg-white shadow-xl">
          <Calendar
            color="#764cfc"
            date={fromLegacyDate(value)}
            maxDate={new Date()}
            onChange={(date) => {
              onChange(toLegacyDate(date));
              setOpen(false);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
