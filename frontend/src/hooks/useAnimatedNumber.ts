import { useEffect, useRef, useState } from "react";

export function useAnimatedNumber(target: number, decimals = 0): number {
  const precision = 10 ** decimals;
  const roundToStep = (value: number): number =>
    Math.round(value * precision) / precision;
  const [displayValue, setDisplayValue] = useState(() => roundToStep(target));
  const valueRef = useRef(roundToStep(target));

  useEffect(() => {
    const start = valueRef.current;
    const targetRounded = roundToStep(target);
    const delta = targetRounded - start;
    const minStep = 1 / precision;

    if (Math.abs(delta) < minStep / 2) {
      valueRef.current = targetRounded;
      setDisplayValue(targetRounded);
      return;
    }

    const totalSteps = Math.max(
      12,
      Math.min(220, Math.round(Math.abs(delta) * precision)),
    );
    const duration = Math.min(
      650,
      Math.max(180, 120 + totalSteps * (decimals > 0 ? 5 : 4)),
    );

    let frameId = 0;
    let lastStep = -1;
    const startTime = performance.now();

    const animate = (timestamp: number): void => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      const currentStep = Math.min(totalSteps, Math.floor(eased * totalSteps));

      if (currentStep !== lastStep) {
        lastStep = currentStep;
        const nextValue = roundToStep(start + (delta * currentStep) / totalSteps);
        valueRef.current = nextValue;
        setDisplayValue(nextValue);
      }

      if (progress < 1) {
        frameId = window.requestAnimationFrame(animate);
      } else {
        valueRef.current = targetRounded;
        setDisplayValue(targetRounded);
      }
    };

    frameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [decimals, precision, target]);

  return displayValue;
}
