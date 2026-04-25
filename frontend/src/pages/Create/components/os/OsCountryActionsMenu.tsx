import { createPortal } from "react-dom";
import { BsCopy, BsPencil, BsTrash } from "react-icons/bs";

type MenuPosition = {
  left: number;
  top: number;
};

type OsCountryActionsMenuProps = {
  onDuplicate: (panelId: string) => void;
  onRemove: (panelId: string) => void;
  onStartRename: (panelId: string) => void;
  panelId: string | null;
  position: MenuPosition | null;
};

export function OsCountryActionsMenu({
  onDuplicate,
  onRemove,
  onStartRename,
  panelId,
  position,
}: OsCountryActionsMenuProps): JSX.Element | null {
  if (!panelId || !position || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed z-60 w-35 rounded-lg border border-slate-200 bg-white py-1 text-[13px] shadow-xl"
      data-country-menu
      style={{
        left: position.left,
        top: position.top,
      }}
    >
      <button
        className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-[#6800cb26]"
        onClick={() => onStartRename(panelId)}
        type="button"
      >
        <BsPencil className="shrink-0 text-[12px]" />
        Rename
      </button>
      <button
        className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-[#6800cb26]"
        onClick={() => onDuplicate(panelId)}
        type="button"
      >
        <BsCopy className="shrink-0 text-[12px]" />
        Duplicate
      </button>
      <button
        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[#cc2b4f] hover:bg-red-50"
        onClick={() => onRemove(panelId)}
        type="button"
      >
        <BsTrash className="shrink-0 text-[12px]" />
        Delete
      </button>
    </div>,
    document.body,
  );
}
