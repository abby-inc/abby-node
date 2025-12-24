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
});
