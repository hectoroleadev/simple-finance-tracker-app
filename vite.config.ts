import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const isTest = typeof process !== 'undefined' && !!process.env.VITEST;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: '/',
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react({
        // Disable fast refresh in tests if needed, but the main issue is CSS
      })
    ].filter(Boolean),
    // If we are in test mode, we might want to skip some postcss logic if it's causing issues
    css: isTest ? { postcss: { plugins: [] } } : undefined,
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-ui': ['recharts', 'lucide-react'],
            'vendor-utils': ['react-window'],
          }
        }
      }
    },
    test: {
      environment: 'jsdom',
      globals: true,
      css: false,
      pool: 'threads',
      poolOptions: {
        threads: {
          singleThread: true,
        }
      },
      server: {
        deps: {
          inline: true,
        },
      },
    }
  };
});
