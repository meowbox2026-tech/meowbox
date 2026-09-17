import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'html'],
      include: ['src/game/core/**/*.ts', 'src/game/rules/**/*.ts', 'src/services/save/**/*.ts']
    }
  }
})
