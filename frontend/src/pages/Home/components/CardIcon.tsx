import {
  BsBarChartLine,
  BsChevronRight,
  BsFileEarmarkRuled,
  BsPeople,
  BsPlusSquare,
  BsSpeedometer2,
  BsSticky,
  BsTable,
} from "react-icons/bs";

import type { QuickAccessIconKind } from "../types/home";

export function CardIcon({
  className,
  kind,
  size,
}: {
  className?: string;
  kind: QuickAccessIconKind;
  size?: number;
}): JSX.Element {
  const common = className ?? "h-4 w-4";

  if (kind === "plus") {
    return <BsPlusSquare className={common} size={size} />;
  }

  if (kind === "table") {
    return <BsTable className={common} size={size} />;
  }

  if (kind === "dashboard") {
    return <BsSpeedometer2 className={common} size={size} />;
  }

  if (kind === "chart") {
    return <BsBarChartLine className={common} size={size} />;
  }

  if (kind === "sticky") {
    return <BsSticky className={common} size={size} />;
  }

  if (kind === "file") {
    return <BsFileEarmarkRuled className={common} size={size} />;
  }

  if (kind === "people") {
    return <BsPeople className={common} size={size} />;
  }

  return <BsChevronRight className={common} size={size} />;
}
