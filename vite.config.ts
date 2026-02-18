import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

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
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg', 'favicon.ico', 'apple-touch-icon.png'],
        manifest: {
          name: 'Simple Finance Tracker',
          short_name: 'FinanceApp',
          description: 'Sigue tus finanzas de forma simple y elegante',
          theme_color: '#10b981',
          background_color: '#0f172a',
          display: 'standalone',
          icons: [
            {
              src: 'icon.svg',
              sizes: '192x192 512x512',
              type: 'image/svg+xml',
              purpose: 'any maskable'
            }
          ]
        }
      })
    ].filter(Boolean),
    // If we are in test mode, we might want to skip some postcss logic if it's causing issues
    css: isTest ? { postcss: { plugins: [] } } : undefined,
    define: {
      global: 'globalThis',
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.VITE_API_GATEWAY_URL': JSON.stringify(env.VITE_API_GATEWAY_URL),
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
