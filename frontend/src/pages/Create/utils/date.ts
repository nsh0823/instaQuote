export function toLegacyDate(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

export function fromLegacyDate(value: string): Date {
  const [month, day, year] = value.split('/').map((token) => Number(token));
  if (
    Number.isFinite(month) &&
    Number.isFinite(day) &&
    Number.isFinite(year) &&
    month > 0 &&
    day > 0 &&
    year > 0
  ) {
    return new Date(year, month - 1, day);
  }

  return new Date();
}

export function todayString(): string {
  return toLegacyDate(new Date());
}
