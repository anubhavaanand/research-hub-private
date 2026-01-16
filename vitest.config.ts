import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./test/setup.ts'],
        include: ['**/*.test.ts', '**/*.test.tsx'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            include: ['utils/**', 'components/**'],
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '.'),
        },
    },
});
