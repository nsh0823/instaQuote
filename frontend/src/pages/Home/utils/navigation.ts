export function buildInternalHref(mode: string): string {
  return mode === "index" ? "/index" : `/${mode}`;
}
