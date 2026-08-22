export function normaliseSourceHostname(articleUrl: string): string {
  return new URL(articleUrl).hostname.toLowerCase().replace(/\.$/u, "").replace(/^www\./u, "");
}
