import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: { provider: 'v8' },
  },
  resolve: {
    alias: [
      { find: /^@\/api\/(.*)$/, replacement: path.resolve(__dirname, 'src/app/api/$1') },
      { find: /^@\/lib\/(.*)$/, replacement: path.resolve(__dirname, 'src/lib/$1') },
      { find: /^@\/(.*)$/, replacement: path.resolve(__dirname, 'src/$1') },
    ],
  },
});
