export function t<T>(lang: string, ko: T, en: T): T {
  return lang === "en" ? en : ko;
}
