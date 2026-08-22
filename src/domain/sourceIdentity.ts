export const SOURCE_COLOURS = [
  "#223a5e",
  "#5e2b52",
  "#b2451f",
  "#2e5339",
  "#145a64",
  "#4a3a75",
] as const;

export interface SourceIdentity {
  hostname: string;
  characters: string;
  colour: (typeof SOURCE_COLOURS)[number];
  faviconUrl: string;
}

export function createSourceIdentity(articleUrl: string): SourceIdentity {
  const url = new URL(articleUrl);
  const hostname = normaliseHostname(url.hostname);

  return {
    hostname,
    characters: deriveSourceCharacters(hostname),
    colour: SOURCE_COLOURS[hashSourceHostname(hostname) % SOURCE_COLOURS.length]!,
    faviconUrl: new URL("/favicon.ico", url.origin).href,
  };
}

export function normaliseSourceHostname(articleUrl: string): string {
  return normaliseHostname(new URL(articleUrl).hostname);
}

export function deriveSourceCharacters(hostname: string): string {
  return hostname.match(/[a-z0-9]/gu)?.slice(0, 2).join("").toUpperCase() ?? "?";
}

export function hashSourceHostname(hostname: string): number {
  let hash = 0x811c9dc5;

  for (const byte of new TextEncoder().encode(hostname)) {
    hash ^= byte;
    hash = Math.imul(hash, 0x01000193);
  }

  return hash >>> 0;
}

function normaliseHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/\.$/u, "").replace(/^www\./u, "");
}
