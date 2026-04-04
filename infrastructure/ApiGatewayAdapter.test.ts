import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { ApiGatewayAdapter } from './ApiGatewayAdapter';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ApiGatewayAdapter', () => {
  let adapter: ApiGatewayAdapter;
  let mockGetToken: Mock<() => string | null>;
  let mockRefreshAuthTokens: Mock<() => Promise<boolean>>;
  let mockLogout: Mock<() => void>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetToken = vi.fn().mockReturnValue('old-token');
    mockRefreshAuthTokens = vi.fn().mockResolvedValue(true);
    mockLogout = vi.fn();

    adapter = new ApiGatewayAdapter(
      'https://api.example.com',
      mockGetToken,
      mockRefreshAuthTokens,
      mockLogout
    );
  });

  describe('Response Error Handling', () => {
    it('should throw simple status message if no JSON', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      await expect(adapter.getItems()).rejects.toThrow('Failed to fetch items: 500 Internal Server Error');
    });

    it('should parse error messages from the server', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({
          message: 'Invalid item state',
          errorCode: 'ERR_100',
          details: { field: 'name' }
        }),
      });

      await expect(adapter.getItems()).rejects.toThrow('Invalid item state (Code: ERR_100) | Details: {"field":"name"}');
    });
  });

  describe('Token Refresh Logic', () => {
    it('should retry request with a new token if 401 and refresh successful', async () => {
      // First call -> 401 Unauthorized
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Unauthorized' })
      });

      // Second call -> OK
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ items: [{ id: '1', amount: 100 }] })
      });

      mockGetToken.mockReturnValueOnce('old-token').mockReturnValueOnce('new-token');

      const result = await adapter.getItems();

      expect(mockFetch).toHaveBeenCalledTimes(2);
      // The second call should use the new token
      expect(mockFetch.mock.calls[1][1].headers.Authorization).toBe('Bearer new-token');
      expect(result).toHaveLength(1);
    });

    it('should call logout if refresh fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Unauthorized' })
      });

      mockRefreshAuthTokens.mockResolvedValueOnce(false); // Refresh fails

      await expect(adapter.getItems()).rejects.toThrow('Unauthorized');
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it('should call logout if the refreshed token returns null', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Session expired' })
      });

      mockRefreshAuthTokens.mockResolvedValueOnce(true); // Claims success
      mockGetToken.mockReturnValueOnce('old-token').mockReturnValueOnce(null); // But returns null

      await expect(adapter.getItems()).rejects.toThrow('Session expired');
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });

  describe('Shared Access (viewAs)', () => {
    it('should include viewAs in URL when saving items for another user', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({}) });

      await adapter.saveItems([], 'other-user');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/items?viewAs=other-user'),
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('should include viewAs in URL when saving history for another user', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({}) });

      await adapter.saveHistory([], 'other-user');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/history?viewAs=other-user'),
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('should include viewAs in URL when saving categories for another user', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({}) });

      await adapter.saveCategories([], 'other-user');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/categories?viewAs=other-user'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });
});
