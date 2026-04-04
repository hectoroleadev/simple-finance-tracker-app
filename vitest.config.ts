
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        include: ['**/*.test.{ts,tsx}'],
        exclude: ['**/node_modules/**', '**/dist/**'],
        setupFiles: ['./vitest.setup.tsx'],
        css: false,
    },
    resolve: {
        alias: {
            '@asamuzakjp/css-color': path.resolve(__dirname, 'empty-module.cjs'),
            '@csstools/css-calc': path.resolve(__dirname, 'empty-module.cjs'),
            'cssstyle': path.resolve(__dirname, 'empty-module.cjs'),
        },
    },
});
