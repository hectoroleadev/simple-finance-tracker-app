# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

## Environment Setup

Copy `.env.example` to `.env.local` and fill in:

- `VITE_COGNITO_USER_POOL_ID` — AWS Cognito User Pool ID
- `VITE_COGNITO_CLIENT_ID` — AWS Cognito App Client ID
- `VITE_API_GATEWAY_URL` — API Gateway base URL (e.g. `https://api.example.com/prod`)

Without `VITE_API_GATEWAY_URL`, the app falls back to `LocalStorageAdapter` (no auth required for local dev).

## Architecture

The app follows a strict layered architecture with a **repository pattern**:

```
domain/        — pure business logic, no framework deps (FinanceService, FinanceCalculator, Money value object)
domain/ports.ts — FinanceRepository interface that all adapters implement
infrastructure/ — repository adapters (API Gateway, LocalStorage)
application/   — TanStack Query hooks (reads + mutations)
hooks/         — orchestration (useFinanceData.ts) + queryKeys factory + feature hooks
context/       — React context definitions (Finance, Auth, Language, Theme, Toast)
layouts/       — RootLayout provides FinanceContext via useFinanceData
pages/         — route-level components consuming context
components/    — presentational components
router/        — AppRoutes: /dashboard, /history, /charts (lazy-loaded, auth-gated)
```

### Data Flow

1. `infrastructure/createRepository.ts` selects the adapter at runtime: `ApiGatewayAdapter` when `VITE_API_GATEWAY_URL` is set and user is logged in, otherwise `LocalStorageAdapter`.
2. `application/useFinanceQueries.ts` owns all TanStack Query reads and mutations, scoped by the `queryKeys` factory (`hooks/queryKeys.ts`) — keys include `loggedIn`, `viewAs`, and `userId` so cache stays isolated per identity.
3. `application/useFinanceActions.ts` implements use cases (add/update/delete items, snapshot history, category management, sharing).
4. `hooks/useFinanceData.ts` is the thin orchestrator — it wires the repository into the application hooks and dispatches heavy calculations (totals, chart data) to a Web Worker (`utils/finance.worker.ts`).
5. `layouts/RootLayout.tsx` calls `useFinanceData` and provides `FinanceContext`. All pages and components consume it via `useFinanceContext()` from `context/FinanceContext.tsx`.

### Key Domain Concepts

- **`BalanceEffect`** (`domain/balanceEffect.ts`): `POSITIVE` (income/assets), `NEGATIVE` (expenses/debts), `INFORMATIVE` (hidden from dashboard), `INFORMATIVE_STAT` (shown in dashboard but doesn't affect balance).
- **`FinanceItem`** — a line item with `name`, `amount`, and `category` (references `Category.id`).
- **`HistoryEntry`** — a monthly snapshot of `savings`, `debt`, `balance`, `retirement`.
- **`viewAs`** / **`isReadOnly`** — when a user views another user's shared data, `viewAs` holds the owner's userId and all mutations are blocked.

### Auth

`context/AuthContext.tsx` wraps `amazon-cognito-identity-js` directly (no Amplify). It exposes `isLoggedIn`, `user.username`, `getIdToken()`, and `refreshAuthTokens()`. The `ApiGatewayAdapter` handles 401s by calling `refreshAuthTokens()` and retrying once before logging out.

### UI State & i18n

- `context/LanguageContext.tsx` + `utils/translations.ts` hold all UI strings (no i18n lib). `context/ThemeContext.tsx` and `hooks/useDensity.ts` persist theme/density to `localStorage`.
- App is a PWA via `vite-plugin-pwa` (config in `vite.config.ts`); `components/ReloadPrompt.tsx` surfaces update prompts.

### Testing

- Unit tests live alongside source files (`*.test.ts`, `*.test.tsx`).
- Integration tests use `@testing-library/react` and are named `*.integration.test.tsx`.
- Vitest uses `jsdom`; CSS modules and heavy CSS deps are aliased to `empty-module.cjs` to avoid parse errors.
- Tests inject a fake repository via `useFinanceData(externalRepository)` — no mocking of the infrastructure layer needed.

### Path Alias

`@` resolves to the project root (e.g. `import { foo } from '@/domain/finance.logic'`).

## Spec-Driven Workflow

Two installed skills (`.claude/skills/`, pinned in `skills-lock.json`, source `Klerith/fernando-skills`) drive a spec-first flow for large features. Specs live in `specs/` and are numbered sequentially (`NN-slug.md`).

### `/spec <short feature description>`

Guided spec designer. **Writes no code** — produces a spec `.md` file. Four phases:

1. **Context** — reads `CLAUDE.md`, lists existing `specs/`, reads the two most recent for conventions.
2. **Clarify** — asks questions in blocks of 3–5 (scope, data, integration, persistence, UX/states, risks) until file changes, first/last step, and "done" criteria are unambiguous.
3. **Develop** — writes the spec section by section (header → scope → data model → implementation plan → acceptance criteria → decisions → risks), confirming each with the user.
4. **Save** — writes `specs/NN-slug.md` in `Draft` state. User re-reads and flips it to `Approved` manually.

Use before writing code on a big feature. Replies match the prompt's language.

### `/spec-impl <NN-spec-name>`

Implements an **approved** spec. Accepts full name, number, or slug. Flow:

1. Locate the spec in `specs/`.
2. Validate status means `Approved` (any language) — otherwise stops, no branch, no code.
3. Create/switch to branch `spec-NN-slug`, echo objective/scope/plan/criteria.
4. Implement one plan step at a time, pausing after each for diff review. Out-of-scope requests are deferred to a new spec.

On finishing all steps: verify acceptance criteria, then user sets status to `Implemented` and commits.
