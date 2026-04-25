function getOwnerInitials(owner: string): string {
  const tokens = owner
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (tokens.length === 0) {
    return "NA";
  }

  if (tokens.length === 1) {
    return tokens[0].slice(0, 2).toUpperCase();
  }

  return `${tokens[0][0] ?? ""}${tokens[1][0] ?? ""}`.toUpperCase();
}

export function buildOwnerAvatar(owner: string): string {
  const initials = getOwnerInitials(owner);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'><rect width='64' height='64' rx='32' fill='#764cfc'/><circle cx='32' cy='32' r='24' fill='rgba(255,255,255,0.12)'/><text x='32' y='38' text-anchor='middle' font-family='Poppins,Arial,sans-serif' font-size='20' font-weight='700' fill='white'>${initials}</text></svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
