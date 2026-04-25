import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BsInfoCircle } from 'react-icons/bs';

type HelpTooltipProps = {
  content: ReactNode;
  iconSize?: number;
  label?: ReactNode;
  showIcon?: boolean;
  triggerClassName?: string;
  tooltipClassName?: string;
};

export function HelpTooltip({
  content,
  iconSize = 14,
  label,
  showIcon = true,
  triggerClassName = '',
  tooltipClassName = '',
}: HelpTooltipProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const triggerRef = useRef<HTMLSpanElement | null>(null);

  const updatePosition = useCallback((): void => {
    const trigger = triggerRef.current;
    if (!trigger) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    setPosition({
      left: rect.left + rect.width / 2,
      top: rect.top - 8,
    });
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    updatePosition();
    const handleReposition = (): void => updatePosition();

    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);

    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [open, updatePosition]);

  const openTooltip = (): void => {
    setOpen(true);
    updatePosition();
  };

  const closeTooltip = (): void => {
    setOpen(false);
  };

  const triggerBaseClass =
    'inline-flex cursor-help items-center focus-visible:rounded-[4px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d8ccff]';
  const triggerGapClass = label && showIcon ? 'gap-1' : '';
  const tooltipBaseClass =
    'pointer-events-none fixed z-[120] w-max max-w-[290px] -translate-x-1/2 -translate-y-full rounded-[8px] bg-[#3d3d43] px-[10px] py-2 text-[11px] font-normal leading-[1.35] text-white shadow-[0_0.5rem_1rem_rgba(0,0,0,0.24)]';

  return (
    <>
      <span
        className="relative inline-block align-middle"
        onMouseEnter={openTooltip}
        onMouseLeave={closeTooltip}
      >
        <span
          className={`${triggerBaseClass} ${triggerGapClass} ${triggerClassName}`}
          onBlur={closeTooltip}
          onFocus={openTooltip}
          ref={triggerRef}
          tabIndex={0}
        >
          {label ? <span>{label}</span> : null}
          {showIcon ? <BsInfoCircle size={iconSize} /> : null}
        </span>
      </span>
      {open && typeof document !== 'undefined'
        ? createPortal(
            <span
              className={`${tooltipBaseClass} ${tooltipClassName}`}
              role="tooltip"
              style={{ left: position.left, top: position.top }}
            >
              {content}
            </span>,
            document.body,
          )
        : null}
    </>
  );
}
