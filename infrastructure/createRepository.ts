import { FinanceRepository } from '../domain/ports';
import { ApiGatewayAdapter } from './ApiGatewayAdapter';
import { LocalStorageAdapter } from './LocalStorageAdapter';

export interface ApiAdapterDeps {
  getToken: () => string | null;
  refreshAuthTokens: () => Promise<boolean>;
  logout: () => void;
}

/**
 * Infrastructure factory — decides which FinanceRepository adapter to use
 * based on environment config and auth state. Keeps this infrastructure
 * decision out of the application layer (hooks/useFinanceData).
 */
export function createRepository(
  isLoggedIn: boolean,
  deps: ApiAdapterDeps
): FinanceRepository {
  const apiUrl = import.meta.env.VITE_API_GATEWAY_URL;

  if (apiUrl && isLoggedIn) {
    if (import.meta.env.DEV) console.log('Using API Gateway Repository:', apiUrl);
    return new ApiGatewayAdapter(apiUrl, deps.getToken, deps.refreshAuthTokens, deps.logout);
  }

  if (import.meta.env.DEV) console.log('Using LocalStorage Repository (or not logged in)');
  return new LocalStorageAdapter();
}
