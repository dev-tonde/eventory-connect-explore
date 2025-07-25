// Jest configuration for React + TypeScript + Vite
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    deps: {
      inline: ['@testing-library/react', '@testing-library/jest-dom']
    }
  },
});

// Add test scripts to package.json:
// "test": "vitest",
// "test:ui": "vitest --ui",
// "test:coverage": "vitest --coverage"