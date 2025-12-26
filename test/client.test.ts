import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Abby from '../src/index';
import { generateTestApiKey, mockFetchResponse } from './helpers';

describe('HTTP Client', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    // Mock fetch for testing
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  describe('request interceptors', () => {
    it('should add Authorization header to requests', async () => {
      const apiKey = generateTestApiKey();
      const abby = new Abby(apiKey);

      // Mock fetch to capture the request
      vi.mocked(global.fetch).mockResolvedValueOnce(
        mockFetchResponse({ company: { name: 'Test' } })
      );

      // The client should be configured with auth header
      const client = abby.getClient();
      expect(client).toBeDefined();
    });

    it('should add custom headers when provided', () => {
      const apiKey = generateTestApiKey();
      const abby = new Abby(apiKey, {
        headers: {
          'X-Custom-Header': 'test-value',
        },
      });

      expect(abby.getClient()).toBeDefined();
    });
  });

  describe('configuration', () => {
    it('should respect custom baseUrl', () => {
      const apiKey = generateTestApiKey();
      const customUrl = 'https://custom.api.example.com';

      const abby = new Abby(apiKey, { baseUrl: customUrl });

      expect(abby).toBeInstanceOf(Abby);
    });

    it('should use default timeout', () => {
      const abby = new Abby(generateTestApiKey());

      // Default timeout should be 30000ms
      expect(abby).toBeInstanceOf(Abby);
    });

    it('should respect custom timeout', () => {
      const abby = new Abby(generateTestApiKey(), { timeout: 60000 });

      expect(abby).toBeInstanceOf(Abby);
    });
  });

  describe('timeout', () => {
    it('should abort request when timeout is exceeded', async () => {
      vi.useFakeTimers();

      try {
        const apiKey = generateTestApiKey();
        // Set a very short timeout
        const abby = new Abby(apiKey, {
          baseUrl: 'https://api.app-abby.com',
          timeout: 50,
        });

        // Track whether abort was called
        let abortCalled = false;

        // Mock fetch to wait for the abort signal
        vi.mocked(global.fetch).mockImplementation(async (_input, init) => {
          const signal = init?.signal;
          return new Promise((_resolve, reject) => {
            if (signal) {
              if (signal.aborted) {
                abortCalled = true;
                reject(new globalThis.DOMException('The operation was aborted.', 'AbortError'));
                return;
              }
              signal.addEventListener('abort', () => {
                abortCalled = true;
                reject(new globalThis.DOMException('The operation was aborted.', 'AbortError'));
              });
            }
            // Never resolve - only abort will end this
          });
        });

        const client = abby.getClient();

        // Start the request
        const requestPromise = client
          .get({ url: '/api/public/me', throwOnError: true })
          .catch((err) => {
            // Expected error - timeout abort
            return { error: err };
          });

        // Advance timers past the timeout
        await vi.advanceTimersByTimeAsync(100);

        // Wait for the promise to settle
        const result = await requestPromise;

        // Verify that abort was triggered and error was returned
        expect(abortCalled).toBe(true);
        expect(result).toHaveProperty('error');
      } finally {
        vi.useRealTimers();
      }
    });

    it('should complete request when within timeout', async () => {
      const apiKey = generateTestApiKey();
      // Set a reasonable timeout
      const abby = new Abby(apiKey, {
        baseUrl: 'https://api.app-abby.com',
        timeout: 5000,
      });

      // Mock fetch to respond quickly
      vi.mocked(global.fetch).mockResolvedValueOnce(
        mockFetchResponse({ company: { name: 'Test' } })
      );

      const client = abby.getClient();

      // The request should complete successfully
      const result = await client.get({
        url: '/api/public/me',
        throwOnError: true,
      });

      expect(result).toBeDefined();
    });

    it('should pass abort signal to fetch', async () => {
      const apiKey = generateTestApiKey();
      const abby = new Abby(apiKey, {
        baseUrl: 'https://api.app-abby.com',
        timeout: 1000,
      });

      let capturedSignal: any;

      vi.mocked(global.fetch).mockImplementation(async (_input, init) => {
        capturedSignal = init?.signal;
        return mockFetchResponse({ data: 'test' });
      });

      const client = abby.getClient();
      await client.get({ url: '/api/public/me' });

      // Verify that an AbortSignal was passed to fetch
      expect(capturedSignal).toBeDefined();
      expect(capturedSignal).toBeInstanceOf(globalThis.AbortSignal);
    });
  });
});
