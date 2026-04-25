import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  BsCardChecklist,
  BsFileEarmarkText,
  BsFloppy,
  BsFolderSymlink,
} from "react-icons/bs";

import type { OsSubmitAction } from "@/pages/Create/hooks/useOsSubmit";

type OsHeaderSaveActionsProps = {
  activeRecordId: string;
  headerActionRoot: HTMLElement | null;
  isRequiredReady: boolean;
  isSubmitting: boolean;
  onOpenConfirm: (action: OsSubmitAction, onOpen?: () => void) => void;
};

export function OsHeaderSaveActions({
  activeRecordId,
  headerActionRoot,
  isRequiredReady,
  isSubmitting,
  onOpenConfirm,
}: OsHeaderSaveActionsProps): JSX.Element | null {
  const [saveMenuOpen, setSaveMenuOpen] = useState(false);
  const saveMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!saveMenuOpen) {
      return;
    }

    function handleOutside(event: MouseEvent): void {
      if (
        saveMenuRef.current &&
        !saveMenuRef.current.contains(event.target as Node)
      ) {
        setSaveMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
    };
  }, [saveMenuOpen]);

  if (!headerActionRoot) {
    return null;
  }

  return createPortal(
    <div
      className="relative inline-flex h-8 w-42.5 rounded-[50px]"
      ref={saveMenuRef}
    >
      <div
        className={`os-main-save-btn inline-flex overflow-hidden rounded-[50px] size-full ${
          isRequiredReady ? "os-flash-save-btn" : ""
        }`}
      >
        <button
          className={`inline-flex h-full w-[80%] items-center justify-center gap-2 rounded-l-[50px] border-0 bg-transparent text-sm text-white transition-all duration-300 ${
            isSubmitting ? "opacity-50" : ""
          }`}
          disabled={isSubmitting}
          onClick={() => onOpenConfirm("save-export")}
          type="button"
        >
          {isSubmitting ? (
            <span className="animate-spin rounded-full border-2 border-white/70 border-t-white size-3.5" />
          ) : (
            <BsFloppy className="text-[13px]" />
          )}
          <span>Save & Export</span>
        </button>
        <button
          className="inline-flex h-full w-[20%] items-center justify-center rounded-r-[50px] border-0 border-l border-white/25 bg-transparent text-white"
          onClick={() => setSaveMenuOpen((prev) => !prev)}
          type="button"
        >
          ▾
        </button>
      </div>

      {saveMenuOpen ? (
        <ul className="absolute right-0 top-[calc(100%+8px)] z-30 min-w-42.5 rounded-lg border border-slate-200 bg-white py-1 text-[13px] shadow-xl">
          <li>
            <button
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-[#6800cb26]"
              onClick={() => onOpenConfirm("save", () => setSaveMenuOpen(false))}
              type="button"
            >
              <BsFloppy className="text-[12px]" />
              Save only
            </button>
          </li>
          <li>
            <button
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-[#6800cb26]"
              onClick={() => onOpenConfirm("export", () => setSaveMenuOpen(false))}
              type="button"
            >
              <BsFolderSymlink className="text-[12px]" />
              Export only
            </button>
          </li>
          <li>
            <button
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-[#6800cb26]"
              onClick={() =>
                onOpenConfirm("save-draft", () => setSaveMenuOpen(false))
              }
              type="button"
            >
              <BsFileEarmarkText className="text-[12px]" />
              Save as draft
            </button>
          </li>
          {activeRecordId ? (
            <li>
              <button
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-[#6800cb26]"
                onClick={() => onOpenConfirm("update", () => setSaveMenuOpen(false))}
                type="button"
              >
                <BsCardChecklist className="text-[12px]" />
                Update
              </button>
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>,
    headerActionRoot,
  );
}
