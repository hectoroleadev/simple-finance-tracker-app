<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1dwiDkGR61Mz8k4MNiybD3v4HxXpdV7H7

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Commands

```bash
npm run dev          # Start dev server at http://localhost:3000
npm run build        # tsc --noEmit + Vite production build
npm run preview      # Preview production build locally
npm test             # Vitest in watch mode
npm run test:run     # Run tests once (CI mode)
npm run test:run path/to/file.test.ts  # Run a single test file
npm run test:coverage  # Tests with v8 coverage
npm run typecheck    # tsc --noEmit only
npm run lint         # ESLint (lint:fix to autofix)
npm run format       # Prettier write (format:check to verify)
npm run test:e2e     # Playwright E2E (loads .env.local)
```