export function addComma(value: number | string): string {
  const parts = String(value).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

export function parseNumber(value: string): number | null {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value.replace(/,/g, '').trim());
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseInteger(value: string): number {
  return parseNumber(value) ?? 0;
}

export function parseIntegerOrZero(value: string): number {
  return parseInteger(value);
}

export function normalizeIntegerInput(raw: string): string {
  const compact = raw.replace(/,/g, '').replace(/[^\d-]/g, '');
  if (!compact || compact === '-') {
    return '';
  }

  const negative = compact.startsWith('-');
  const digits = compact.replace(/-/g, '');
  const normalized = `${negative ? '-' : ''}${digits}`;
  const parsed = Number.parseInt(normalized, 10);

  if (Number.isNaN(parsed)) {
    return '';
  }

  return addComma(parsed);
}

export function normalizeDecimalInput(raw: string): string {
  const compact = raw.replace(/,/g, '').replace(/[^\d.]/g, '');
  if (!compact) {
    return '';
  }

  const parts = compact.split('.');
  const integer = parts[0] || '0';
  const decimal = parts[1] ?? '';
  const intNumber = Number.parseInt(integer, 10);

  if (Number.isNaN(intNumber)) {
    return '';
  }

  if (parts.length === 1) {
    return addComma(intNumber);
  }

  return `${addComma(intNumber)}.${decimal.slice(0, 3)}`;
}

export function normalizeMarkupValue(raw: string): string {
  const compact = raw.replace(/,/g, '').replace(/[^\d.]/g, '');
  if (!compact) {
    return '';
  }

  const [integerPart = '0', decimalPart = ''] = compact.split('.');
  const integer = Number.parseInt(integerPart || '0', 10);

  if (Number.isNaN(integer)) {
    return '';
  }

  if (!compact.includes('.')) {
    return String(integer);
  }

  return `${integer}.${decimalPart.slice(0, 3)}`;
}

export function formatPercentDisplay(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  return trimmed.endsWith('%') ? trimmed : `${trimmed}%`;
}
