export function formatAnimatedNumber(value: number, decimals: number): string {
  const rounded =
    decimals === 0 ? Math.round(value) : Number(value.toFixed(decimals));

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(rounded);
}
