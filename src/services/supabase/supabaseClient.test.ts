import { describe, expect, it, vi } from 'vitest'

const createClient = vi.hoisted(() => vi.fn(() => ({ mocked: true })))
vi.mock('@supabase/supabase-js', () => ({ createClient }))

describe('Supabase client configuration', () => {
  it('does not create a client without both public environment values', async () => {
    vi.resetModules()
    vi.stubEnv('VITE_SUPABASE_URL', '')
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', '')
    const module = await import('./supabaseClient')

    expect(module.getSupabaseClient()).toBeNull()
    expect(createClient).not.toHaveBeenCalled()
  })

  it('creates one browser client for the configured project', async () => {
    vi.resetModules()
    vi.stubEnv('VITE_SUPABASE_URL', 'https://vistyxmouvqbkqetejbh.supabase.co')
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test')
    const module = await import('./supabaseClient')

    expect(module.getSupabaseClient()).toEqual({ mocked: true })
    expect(module.getSupabaseClient()).toEqual({ mocked: true })
    expect(createClient).toHaveBeenCalledOnce()
    expect(createClient).toHaveBeenCalledWith(
      'https://vistyxmouvqbkqetejbh.supabase.co',
      'sb_publishable_test',
      expect.objectContaining({
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
      }),
    )
  })
})
