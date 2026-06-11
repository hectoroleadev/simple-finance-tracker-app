# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server at http://localhost:3000
npm run build      # TypeScript check + Vite production build
npm run preview    # Preview production build locally
npm test           # Run Vitest test suite (watch mode)
npx vitest run     # Run tests once (CI mode)
npx vitest run path/to/file.test.ts  # Run a single test file
npx playwright test  # Run E2E tests
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
domain/        — pure business logic, no framework deps
infrastructure/ — repository adapters (API Gateway, LocalStorage)
application/   — TanStack Query hooks (reads + mutations)
hooks/         — orchestration layer (useFinanceData.ts)
context/       — React context definitions (thin wrappers)
layouts/       — RootLayout provides FinanceContext via useFinanceData
pages/         — route-level components consuming context
components/    — presentational components
```

### Data Flow

1. `infrastructure/createRepository.ts` selects the adapter at runtime: `ApiGatewayAdapter` when `VITE_API_GATEWAY_URL` is set and user is logged in, otherwise `LocalStorageAdapter`.
2. `application/useFinanceQueries.ts` owns all TanStack Query reads and mutations, scoped by `queryKeys` that include `userId` and `viewAs`.
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

### Testing

- Unit tests live alongside source files (`*.test.ts`, `*.test.tsx`).
- Integration tests use `@testing-library/react` and are named `*.integration.test.tsx`.
- Vitest uses `jsdom`; CSS modules and heavy CSS deps are aliased to `empty-module.cjs` to avoid parse errors.
- Tests inject a fake repository via `useFinanceData(externalRepository)` — no mocking of the infrastructure layer needed.

### Path Alias

`@` resolves to the project root (e.g. `import { foo } from '@/domain/finance.logic'`).
