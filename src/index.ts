/**
 * Abby Node.js SDK
 *
 * Official Node.js library for the Abby API.
 *
 * @example
 * ```typescript
 * import Abby from '@abby-inc/abby-node';
 *
 * const abby = new Abby('your_api_key');
 *
 * // Get current company info
 * const { data } = await abby.company.getMe();
 * console.log(data);
 * ```
 *
 * @packageDocumentation
 */

import { createClient, createConfig } from './client/client';
import type { Client } from './client/client/types.gen';

/**
 * SDK version injected at build time by rollup.
 * @internal
 */
declare const __SDK_VERSION__: string;
import {
  Estimate,
  Invoice,
  Billing,
  Advance,
  Asset,
  CustomerPortal,
  Contact,
  Organization,
  Opportunity,
  Company,
} from './client/sdk.gen';
import type { Options } from './client/sdk.gen';

// Re-export all generated types for consumers
export * from './client/types.gen';
export { client } from './client/client.gen';

// Re-export service classes for direct usage
export {
  Estimate,
  Invoice,
  Billing,
  Advance,
  Asset,
  CustomerPortal,
  Contact,
  Organization,
  Opportunity,
  Company,
} from './client/sdk.gen';

// Re-export Zod schemas for consumers who want to use them directly
export * from './client/zod.gen';

// ============================================
// Event Types
// ============================================

/**
 * Event emitted when an API error occurs.
 * Subscribe with `abby.on('error', callback)`.
 */
export interface AbbyErrorEvent {
  /** HTTP status code (4xx or 5xx) */
  status: number;
  /** HTTP status text */
  statusText: string;
  /** Request URL */
  url: string;
  /** HTTP method (GET, POST, etc.) */
  method: string;
  /** Error message extracted from response body, if available */
  message?: string;
  /** Response body, if available */
  body?: unknown;
  /** Request ID from X-Request-Id header, if available */
  requestId?: string;
  /** Request duration in milliseconds */
  duration: number;
}

/**
 * Event emitted for every API response (success or error).
 * Subscribe with `abby.on('response', callback)`.
 */
export interface AbbyResponseEvent {
  /** HTTP status code */
  status: number;
  /** Request URL */
  url: string;
  /** HTTP method (GET, POST, etc.) */
  method: string;
  /** Request duration in milliseconds */
  duration: number;
  /** Whether the response was successful (2xx) */
  ok: boolean;
}

/**
 * Map of event names to their event types.
 */
export type AbbyEventMap = {
  error: AbbyErrorEvent;
  response: AbbyResponseEvent;
};

/**
 * Event listener function type.
 */
export type AbbyEventListener<K extends keyof AbbyEventMap> = (event: AbbyEventMap[K]) => void;

/**
 * Configuration options for the Abby SDK client.
 */
export interface AbbyConfig {
  /**
   * Base URL for the Abby API.
   * @default 'https://api.app-abby.com'
   */
  baseUrl?: string;

  /**
   * Request timeout in milliseconds.
   * @default 30000
   */
  timeout?: number;

  /**
   * Additional headers to include in every request.
   */
  headers?: Record<string, string>;

  /**
   * Custom fetch implementation.
   * Use this to configure proxies, custom logging, or other advanced HTTP options.
   *
   * @example
   * ```typescript
   * // Using undici with a proxy
   * import { fetch as undiciFetch, ProxyAgent } from 'undici';
   *
   * const abby = new Abby('your_api_key', {
   *   fetch: (url, init) => undiciFetch(url, {
   *     ...init,
   *     dispatcher: new ProxyAgent('http://proxy.example.com:8080'),
   *   }),
   * });
   * ```
   */
  fetch?: typeof globalThis.fetch;
}

/**
 * Default configuration values.
 */
const DEFAULT_CONFIG: Required<Omit<AbbyConfig, 'headers' | 'fetch'>> = {
  baseUrl: 'https://api.app-abby.com',
  timeout: 30000,
};

/**
 * Helper type to create a service proxy that injects the client into every method.
 */
type ServiceProxy<T> = {
  [K in keyof T]: T[K] extends (options: infer O) => infer R
    ? (options: Omit<O, 'client'>) => R
    : T[K];
};

/**
 * Creates a proxy for a service class that automatically injects the client into every method call.
 */
function createServiceProxy<T extends object>(service: T, instanceClient: Client): ServiceProxy<T> {
  return new Proxy(service, {
    get(target, prop) {
      const value = (target as Record<string | symbol, unknown>)[prop];
      if (typeof value === 'function') {
        return (options: Options) => {
          return value({ ...options, client: instanceClient });
        };
      }
      return value;
    },
  }) as ServiceProxy<T>;
}

/**
 * Abby API client.
 *
 * The main entry point for interacting with the Abby API.
 * Initialize with your API key to start making requests.
 *
 * Each instance creates its own isolated HTTP client with its own interceptors,
 * ensuring multiple instances with different API keys work correctly.
 *
 * @example
 * ```typescript
 * const abby = new Abby('your_api_key');
 *
 * // Access services
 * const { data } = await abby.company.getMe();
 * const invoice = await abby.invoice.getInvoice({ path: { invoiceId: '...' } });
 * ```
 */
export class Abby {
  private readonly apiKey: string;
  private readonly config: Required<Omit<AbbyConfig, 'headers' | 'fetch'>> & {
    headers?: Record<string, string>;
    fetch?: typeof globalThis.fetch;
  };
  private readonly instanceClient: Client;

  // Event listeners for each event type
  private readonly eventListeners: {
    [K in keyof AbbyEventMap]: Set<AbbyEventListener<K>>;
  } = {
    error: new Set(),
    response: new Set(),
  };

  // Cached service proxies
  private _estimate?: ServiceProxy<typeof Estimate>;
  private _invoice?: ServiceProxy<typeof Invoice>;
  private _billing?: ServiceProxy<typeof Billing>;
  private _advance?: ServiceProxy<typeof Advance>;
  private _asset?: ServiceProxy<typeof Asset>;
  private _customerPortal?: ServiceProxy<typeof CustomerPortal>;
  private _contact?: ServiceProxy<typeof Contact>;
  private _organization?: ServiceProxy<typeof Organization>;
  private _opportunity?: ServiceProxy<typeof Opportunity>;
  private _company?: ServiceProxy<typeof Company>;

  /**
   * Creates a new Abby API client.
   *
   * @param apiKey - Your Abby API key
   * @param config - Optional configuration options
   *
   * @example
   * ```typescript
   * // Basic usage
   * const abby = new Abby('your_api_key');
   *
   * // With custom configuration
   * const abby = new Abby('your_api_key', {
   *   baseUrl: 'https://api.app-abby.com',
   *   timeout: 60000,
   * });
   * ```
   */
  constructor(apiKey: string, config: AbbyConfig = {}) {
    if (!apiKey) {
      throw new Error(
        'Abby API key is required. Get your API key from https://app.abby.fr/settings/api'
      );
    }

    this.apiKey = apiKey;
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };

    // Use custom fetch if provided, otherwise use global fetch
    const baseFetch = config.fetch ?? globalThis.fetch;

    // Create a fetch wrapper that implements timeout using AbortController
    const timeoutMs = this.config.timeout;
    const fetchWithTimeout: typeof globalThis.fetch = async (input, init) => {
      const controller = new globalThis.AbortController();
      const timeoutId = globalThis.setTimeout(() => controller.abort(), timeoutMs);

      try {
        // Merge any existing signal with our timeout signal
        const existingSignal = init?.signal;
        if (existingSignal) {
          // If the signal is already aborted, abort immediately
          if (existingSignal.aborted) {
            controller.abort();
          } else {
            // If caller provided a signal, abort on either signal
            existingSignal.addEventListener('abort', () => controller.abort());
          }
        }

        return await baseFetch(input, {
          ...init,
          signal: controller.signal,
        });
      } finally {
        globalThis.clearTimeout(timeoutId);
      }
    };

    // Create a new client instance for this Abby instance to ensure isolation
    this.instanceClient = createClient(
      createConfig({
        baseUrl: this.config.baseUrl,
        fetch: fetchWithTimeout,
        throwOnError: true,
      })
    );

    this.initializeClient();
  }

  /**
   * Initialize the underlying HTTP client with authentication and configuration.
   */
  private initializeClient(): void {
    // Track request start times for duration calculation
    // Using 'object' as key type since Request is the fetch API Request type
    const requestStartTimes = new WeakMap<object, number>();

    // Add authentication header to all requests on this instance's client
    this.instanceClient.interceptors.request.use((request) => {
      // Record start time for duration calculation
      requestStartTimes.set(request, Date.now());

      request.headers.set('Authorization', `Bearer ${this.apiKey}`);

      // Add any custom headers
      if (this.config.headers) {
        for (const [key, value] of Object.entries(this.config.headers)) {
          request.headers.set(key, value);
        }
      }

      // Add SDK identification header
      request.headers.set('X-Abby-Client', 'abby-node');
      request.headers.set('X-Abby-Client-Version', this.getVersion());

      return request;
    });

    // Add response interceptor to emit events
    // The hey-api client passes (response, request, options) to response interceptors
    this.instanceClient.interceptors.response.use(async (response, request) => {
      const startTime = request ? requestStartTimes.get(request) : undefined;
      const duration = startTime ? Date.now() - startTime : 0;

      // Clean up the start time
      if (request) {
        requestStartTimes.delete(request);
      }

      const baseEvent = {
        status: response.status,
        url: response.url,
        method: request?.method || 'GET',
        duration,
        ok: response.ok,
      };

      // Always emit 'response' event
      this.emit('response', baseEvent);

      // Emit 'error' event for non-2xx responses
      if (!response.ok) {
        let message: string | undefined;
        let body: unknown;

        // Try to extract error message from response body
        try {
          const clonedResponse = response.clone();
          body = await clonedResponse.json();
          if (body && typeof body === 'object') {
            const bodyRecord = body as Record<string, unknown>;
            message =
              typeof bodyRecord.message === 'string'
                ? bodyRecord.message
                : typeof bodyRecord.error === 'string'
                  ? bodyRecord.error
                  : undefined;
          }
        } catch {
          // Body is not JSON or couldn't be parsed
        }

        this.emit('error', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          method: request?.method || 'GET',
          duration,
          message,
          body,
          requestId: response.headers.get('x-request-id') ?? undefined,
        });
      }

      return response;
    });
  }

  /**
   * Get the SDK version.
   * This value is injected at build time by rollup.
   */
  private getVersion(): string {
    return __SDK_VERSION__;
  }

  /**
   * Get the underlying HTTP client for advanced usage.
   *
   * @returns The configured HTTP client instance for this Abby instance
   *
   * @example
   * ```typescript
   * const httpClient = abby.getClient();
   * // Add custom interceptors
   * httpClient.interceptors.response.use((response) => {
   *   console.log('Response received:', response.status);
   *   return response;
   * });
   * ```
   */
  public getClient(): Client {
    return this.instanceClient;
  }

  // ============================================
  // Event Emitter Methods
  // ============================================

  /**
   * Subscribe to SDK events.
   *
   * @param event - The event name to listen for ('error' or 'response')
   * @param listener - The callback function to invoke when the event occurs
   * @returns The Abby instance for chaining
   *
   * @example
   * ```typescript
   * // Listen for all API errors
   * abby.on('error', (error) => {
   *   Sentry.captureException(new Error(error.message), {
   *     extra: { status: error.status, url: error.url }
   *   });
   * });
   *
   * // Listen for all API responses
   * abby.on('response', (response) => {
   *   console.log(`${response.method} ${response.url} - ${response.status} (${response.duration}ms)`);
   * });
   * ```
   */
  public on<K extends keyof AbbyEventMap>(event: K, listener: AbbyEventListener<K>): this {
    this.eventListeners[event].add(listener as AbbyEventListener<K>);
    return this;
  }

  /**
   * Unsubscribe from SDK events.
   *
   * @param event - The event name to stop listening for
   * @param listener - The callback function to remove
   * @returns The Abby instance for chaining
   *
   * @example
   * ```typescript
   * const errorHandler = (error) => console.error(error);
   * abby.on('error', errorHandler);
   * // Later...
   * abby.off('error', errorHandler);
   * ```
   */
  public off<K extends keyof AbbyEventMap>(event: K, listener: AbbyEventListener<K>): this {
    this.eventListeners[event].delete(listener as AbbyEventListener<K>);
    return this;
  }

  /**
   * Emit an event to all registered listeners.
   * @internal
   */
  private emit<K extends keyof AbbyEventMap>(event: K, data: AbbyEventMap[K]): void {
    for (const listener of this.eventListeners[event]) {
      try {
        (listener as AbbyEventListener<K>)(data);
      } catch {
        // Swallow errors from listeners to prevent breaking the SDK
      }
    }
  }

  // ============================================
  // Service accessors
  // ============================================

  /**
   * Estimate service - Create and manage estimates/quotes
   */
  get estimate(): ServiceProxy<typeof Estimate> {
    if (!this._estimate) {
      this._estimate = createServiceProxy(Estimate, this.instanceClient);
    }
    return this._estimate;
  }

  /**
   * Invoice service - Create and manage invoices
   */
  get invoice(): ServiceProxy<typeof Invoice> {
    if (!this._invoice) {
      this._invoice = createServiceProxy(Invoice, this.instanceClient);
    }
    return this._invoice;
  }

  /**
   * Billing service - Common billing operations (download PDF, send emails, etc.)
   */
  get billing(): ServiceProxy<typeof Billing> {
    if (!this._billing) {
      this._billing = createServiceProxy(Billing, this.instanceClient);
    }
    return this._billing;
  }

  /**
   * Advance service - Manage advance invoices
   */
  get advance(): ServiceProxy<typeof Advance> {
    if (!this._advance) {
      this._advance = createServiceProxy(Advance, this.instanceClient);
    }
    return this._advance;
  }

  /**
   * Asset service - Manage assets
   */
  get asset(): ServiceProxy<typeof Asset> {
    if (!this._asset) {
      this._asset = createServiceProxy(Asset, this.instanceClient);
    }
    return this._asset;
  }

  /**
   * Customer Portal service - Customer-facing operations
   */
  get customerPortal(): ServiceProxy<typeof CustomerPortal> {
    if (!this._customerPortal) {
      this._customerPortal = createServiceProxy(CustomerPortal, this.instanceClient);
    }
    return this._customerPortal;
  }

  /**
   * Contact service - Create and manage contacts
   */
  get contact(): ServiceProxy<typeof Contact> {
    if (!this._contact) {
      this._contact = createServiceProxy(Contact, this.instanceClient);
    }
    return this._contact;
  }

  /**
   * Organization service - Create and manage organizations
   */
  get organization(): ServiceProxy<typeof Organization> {
    if (!this._organization) {
      this._organization = createServiceProxy(Organization, this.instanceClient);
    }
    return this._organization;
  }

  /**
   * Opportunity service - Create and manage opportunities/deals
   */
  get opportunity(): ServiceProxy<typeof Opportunity> {
    if (!this._opportunity) {
      this._opportunity = createServiceProxy(Opportunity, this.instanceClient);
    }
    return this._opportunity;
  }

  /**
   * Company service - Get current company information
   */
  get company(): ServiceProxy<typeof Company> {
    if (!this._company) {
      this._company = createServiceProxy(Company, this.instanceClient);
    }
    return this._company;
  }
}

/**
 * Default export for convenient importing.
 *
 * @example
 * ```typescript
 * import Abby from '@abby-inc/abby-node';
 * const abby = new Abby('your_api_key');
 * ```
 */
export default Abby;
