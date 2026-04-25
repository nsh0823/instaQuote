import { useMemo } from "react";

import { useAnimatedNumber } from "../../../hooks/useAnimatedNumber";
import { formatAnimatedNumber } from "../utils/number";

export function AnimatedNumber({
  className,
  decimals = 0,
  value,
}: {
  className: string;
  decimals?: number;
  value: number;
}): JSX.Element {
  const animatedValue = useAnimatedNumber(value, decimals);
  const label = useMemo(
    () => formatAnimatedNumber(animatedValue, decimals),
    [animatedValue, decimals],
  );

  return <span className={className}>{label}</span>;
}
