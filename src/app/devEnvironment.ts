const LOCAL_DEVELOPMENT_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])

export function isLocalDevelopment(): boolean {
  return import.meta.env.DEV
    && typeof window !== 'undefined'
    && LOCAL_DEVELOPMENT_HOSTS.has(window.location.hostname)
}
