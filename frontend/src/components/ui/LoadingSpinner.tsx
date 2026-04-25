import "./LoadingSpinner.css";

export function LoadingSpinner({
  className,
  label,
}: {
  className?: string;
  label: string;
}): JSX.Element {
  const classes = ["iq-loading-spinner-root", className].filter(Boolean).join(" ");

  return (
    <div aria-live="polite" className={classes} role="status">
      <span aria-hidden="true" className="iq-loading-spinner-icon" />
      <span>{label}</span>
    </div>
  );
}
