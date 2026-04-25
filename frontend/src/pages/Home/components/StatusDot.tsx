import type { StatusKey } from "../types/home";

export function StatusDot({
  blink,
  status,
}: {
  blink: boolean;
  status: StatusKey;
}): JSX.Element {
  return (
    <span
      className={`status-icon ${blink ? "blink" : ""}`}
      data-status={status}
    >
      ●
    </span>
  );
}
