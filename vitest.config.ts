
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['**/*.test.{ts,tsx}'],
        exclude: ['**/node_modules/**', '**/dist/**'],
        setupFiles: ['./vitest.setup.tsx'],
        css: false,
        server: {
            deps: {
                inline: true,
            },
        },
    },
    resolve: {
        alias: {
            '@asamuzakjp/css-color': new URL('./empty-module.ts', import.meta.url).pathname,
            '@csstools/css-calc': new URL('./empty-module.ts', import.meta.url).pathname,
        },
    },
});
