/** Rewrite an internal blob SAS URL to a browser-reachable public base (dev proxy). */
export function rewriteBlobUrlForClient(
  url: string,
  publicBase: string | undefined,
): string {
  if (!publicBase) {
    return url
  }
  const parsed = new URL(url)
  const base = publicBase.replace(/\/$/, '')
  return `${base}${parsed.pathname}${parsed.search}`
}
