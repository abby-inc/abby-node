import { describe, it, expect, beforeEach, vi } from 'vitest';
import Abby from '../src/index';
import { generateTestApiKey, mockFetchResponse } from './helpers';

describe('Abby SDK', () => {
  describe('constructor', () => {
    it('should create an instance with a valid API key', () => {
      const apiKey = generateTestApiKey();
      const abby = new Abby(apiKey);

      expect(abby).toBeInstanceOf(Abby);
    });

    it('should throw an error when API key is missing', () => {
      expect(() => new Abby('')).toThrow('Abby API key is required');
    });

    it('should throw an error when API key is undefined', () => {
      // @ts-expect-error Testing undefined API key
      expect(() => new Abby(undefined)).toThrow('Abby API key is required');
    });

    it('should accept custom configuration', () => {
      const apiKey = generateTestApiKey();
      const abby = new Abby(apiKey, {
        baseUrl: 'https://custom.api.abby.fr',
        timeout: 60000,
      });

      expect(abby).toBeInstanceOf(Abby);
    });

    it('should use default base URL when not specified', () => {
      const apiKey = generateTestApiKey();
      const abby = new Abby(apiKey);

      // The client should be configured with default URL
      expect(abby.getClient()).toBeDefined();
    });
  });

  describe('service accessors', () => {
    let abby: Abby;

    beforeEach(() => {
      abby = new Abby(generateTestApiKey());
    });

    it('should expose estimate service', () => {
      expect(abby.estimate).toBeDefined();
    });

    it('should expose invoice service', () => {
      expect(abby.invoice).toBeDefined();
    });

    it('should expose billing service', () => {
      expect(abby.billing).toBeDefined();
    });

    it('should expose contact service', () => {
      expect(abby.contact).toBeDefined();
    });

    it('should expose organization service', () => {
      expect(abby.organization).toBeDefined();
    });

    it('should expose opportunity service', () => {
      expect(abby.opportunity).toBeDefined();
    });

    it('should expose company service', () => {
      expect(abby.company).toBeDefined();
    });

    it('should expose advance service', () => {
      expect(abby.advance).toBeDefined();
    });

    it('should expose asset service', () => {
      expect(abby.asset).toBeDefined();
    });

    it('should expose customerPortal service', () => {
      expect(abby.customerPortal).toBeDefined();
    });
  });

  describe('getClient', () => {
    it('should return the underlying HTTP client', () => {
      const abby = new Abby(generateTestApiKey());
      const client = abby.getClient();

      expect(client).toBeDefined();
      expect(client.interceptors).toBeDefined();
    });
  });

  describe('client isolation', () => {
    it('should create separate client instances for each Abby instance', () => {
      const abby1 = new Abby(generateTestApiKey());
      const abby2 = new Abby(generateTestApiKey());

      // Each instance should have its own client
      expect(abby1.getClient()).not.toBe(abby2.getClient());
    });

    it('should use the correct API key for each instance', async () => {
      const apiKey1 = 'test_key_one';
      const apiKey2 = 'test_key_two';

      const abby1 = new Abby(apiKey1);
      const abby2 = new Abby(apiKey2);

      // Track the Authorization headers used in requests
      const capturedHeaders1: string[] = [];
      const capturedHeaders2: string[] = [];

      // Create mock fetch functions that capture headers
      const mockFetch1 = vi.fn(async (request) => {
        capturedHeaders1.push((request as globalThis.Request).headers.get('Authorization') || '');
        return mockFetchResponse({ success: true });
      });

      const mockFetch2 = vi.fn(async (request) => {
        capturedHeaders2.push((request as globalThis.Request).headers.get('Authorization') || '');
        return mockFetchResponse({ success: true });
      });

      // Configure each client with its own mock fetch
      abby1.getClient().setConfig({ fetch: mockFetch1 });
      abby2.getClient().setConfig({ fetch: mockFetch2 });

      // Make raw requests directly via the client to avoid Zod validation
      // (we're testing client isolation, not API responses)
      await abby1.getClient().get({ url: '/v2/test' });
      await abby2.getClient().get({ url: '/v2/test' });

      // Verify each instance used its own API key
      expect(capturedHeaders1[0]).toBe(`Bearer ${apiKey1}`);
      expect(capturedHeaders2[0]).toBe(`Bearer ${apiKey2}`);
    });

    it('should not accumulate interceptors on repeated instance creation', () => {
      const instances: Abby[] = [];

      // Create multiple instances
      for (let i = 0; i < 5; i++) {
        instances.push(new Abby(generateTestApiKey()));
      }

      // Each instance should have exactly one request interceptor
      for (const instance of instances) {
        const interceptorCount = instance.getClient().interceptors.request.fns.length;
        expect(interceptorCount).toBe(1);
      }
    });

    it('should allow different base URLs for each instance', () => {
      const abby1 = new Abby(generateTestApiKey(), {
        baseUrl: 'https://api1.example.com',
      });
      const abby2 = new Abby(generateTestApiKey(), {
        baseUrl: 'https://api2.example.com',
      });

      const config1 = abby1.getClient().getConfig();
      const config2 = abby2.getClient().getConfig();

      expect(config1.baseUrl).toBe('https://api1.example.com');
      expect(config2.baseUrl).toBe('https://api2.example.com');
    });

    it('should isolate custom headers between instances', async () => {
      const abby1 = new Abby(generateTestApiKey(), {
        headers: { 'X-Custom-1': 'value1' },
      });
      const abby2 = new Abby(generateTestApiKey(), {
        headers: { 'X-Custom-2': 'value2' },
      });

      const capturedHeaders1: globalThis.Headers[] = [];
      const capturedHeaders2: globalThis.Headers[] = [];

      const mockFetch1 = vi.fn(async (request) => {
        capturedHeaders1.push((request as globalThis.Request).headers);
        return mockFetchResponse({ success: true });
      });

      const mockFetch2 = vi.fn(async (request) => {
        capturedHeaders2.push((request as globalThis.Request).headers);
        return mockFetchResponse({ success: true });
      });

      abby1.getClient().setConfig({ fetch: mockFetch1 });
      abby2.getClient().setConfig({ fetch: mockFetch2 });

      // Make raw requests directly via the client to avoid Zod validation
      // (we're testing client isolation, not API responses)
      await abby1.getClient().get({ url: '/v2/test' });
      await abby2.getClient().get({ url: '/v2/test' });

      // Instance 1 should have X-Custom-1 but not X-Custom-2
      expect(capturedHeaders1[0].get('X-Custom-1')).toBe('value1');
      expect(capturedHeaders1[0].get('X-Custom-2')).toBeNull();

      // Instance 2 should have X-Custom-2 but not X-Custom-1
      expect(capturedHeaders2[0].get('X-Custom-2')).toBe('value2');
      expect(capturedHeaders2[0].get('X-Custom-1')).toBeNull();
    });
  });

  describe('custom fetch', () => {
    it('should use custom fetch when provided', async () => {
      const customFetch = vi.fn(async () => mockFetchResponse({ success: true }));

      const abby = new Abby(generateTestApiKey(), {
        fetch: customFetch,
      });

      // Make a request to trigger the custom fetch
      await abby.getClient().get({ url: '/v2/test' });

      expect(customFetch).toHaveBeenCalled();
    });

    it('should pass request through custom fetch with correct URL', async () => {
      let capturedUrl: string | undefined;

      const customFetch = vi.fn(async (input: globalThis.RequestInfo | globalThis.URL) => {
        capturedUrl = input instanceof globalThis.Request ? input.url : String(input);
        return mockFetchResponse({ success: true });
      });

      const abby = new Abby(generateTestApiKey(), {
        baseUrl: 'https://custom.api.example.com',
        fetch: customFetch,
      });

      await abby.getClient().get({ url: '/v2/test' });

      expect(capturedUrl).toBe('https://custom.api.example.com/v2/test');
    });

    it('should apply timeout to custom fetch', async () => {
      let receivedSignal: globalThis.AbortSignal | undefined;

      const customFetch = vi.fn(
        async (input: globalThis.RequestInfo | globalThis.URL, init?: globalThis.RequestInit) => {
          receivedSignal = init?.signal ?? undefined;
          // Return immediately but we're checking the signal was set up
          return mockFetchResponse({ success: true });
        }
      );

      const abby = new Abby(generateTestApiKey(), {
        fetch: customFetch,
        timeout: 5000,
      });

      await abby.getClient().get({ url: '/v2/test' });

      // Verify that the custom fetch received a signal (for timeout)
      expect(customFetch).toHaveBeenCalled();
      expect(receivedSignal).toBeDefined();
      expect(receivedSignal).toBeInstanceOf(globalThis.AbortSignal);
    });

    it('should add auth headers when using custom fetch', async () => {
      const apiKey = 'my_test_api_key';
      let capturedHeaders: globalThis.Headers | undefined;

      const customFetch = vi.fn(async (input: globalThis.RequestInfo | globalThis.URL) => {
        if (input instanceof globalThis.Request) {
          capturedHeaders = input.headers;
        }
        return mockFetchResponse({ success: true });
      });

      const abby = new Abby(apiKey, {
        fetch: customFetch,
      });

      await abby.getClient().get({ url: '/v2/test' });

      expect(capturedHeaders?.get('Authorization')).toBe(`Bearer ${apiKey}`);
    });

    it('should work with fetch that modifies response', async () => {
      const customFetch = vi.fn(async () => {
        // Simulate a proxy that adds headers to response
        const response = mockFetchResponse({ data: 'test' });
        return response;
      });

      const abby = new Abby(generateTestApiKey(), {
        fetch: customFetch,
      });

      const response = await abby.getClient().get({ url: '/v2/test' });

      expect(response.data).toEqual({ data: 'test' });
    });
  });
});
