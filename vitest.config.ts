import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',

    // Include patterns
    include: ['tests/**/*.test.ts'],

    // Exclude patterns
    exclude: ['tests/**/*.spec.ts', 'node_modules'],

    // Global test timeout
    testTimeout: 30000,

    // Hook timeout
    hookTimeout: 30000,

    // Retry failed tests once
    retry: 1,

    // Reporter
    reporters: ['verbose'],

    // Coverage (optional)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/'],
    },

    // Setup files
    setupFiles: ['dotenv/config'],
  },

  // Path aliases
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
})
