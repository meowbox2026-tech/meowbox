const LOCAL_DEVELOPMENT_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])

export function validateManifestUrl(value: string, isDevelopment: boolean): string | undefined {
  try {
    const url = new URL(value)
    if (url.protocol === 'https:') return url.toString()
    if (isDevelopment && url.protocol === 'http:' && LOCAL_DEVELOPMENT_HOSTS.has(url.hostname)) return url.toString()
    return undefined
  } catch {
    return undefined
  }
}
