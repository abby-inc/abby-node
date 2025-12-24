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

import { client } from './client/client.gen';
import type { ClientOptions } from './client/types.gen';
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

/**
 * Configuration options for the Abby SDK client.
 */
export interface AbbyConfig {
  /**
   * Base URL for the Abby API.
   * @default 'https://api.abby.fr'
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
}

/**
 * Default configuration values.
 */
const DEFAULT_CONFIG: Required<Omit<AbbyConfig, 'headers'>> = {
  baseUrl: 'https://api.abby.fr',
  timeout: 30000,
};

/**
 * Abby API client.
 *
 * The main entry point for interacting with the Abby API.
 * Initialize with your API key to start making requests.
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
  private readonly config: Required<Omit<AbbyConfig, 'headers'>> & {
    headers?: Record<string, string>;
  };

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
   *   baseUrl: 'https://api.abby.fr',
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

    this.initializeClient();
  }

  /**
   * Initialize the underlying HTTP client with authentication and configuration.
   */
  private initializeClient(): void {
    client.setConfig({
      baseUrl: this.config.baseUrl,
    } as ClientOptions);

    // Add authentication header to all requests
    client.interceptors.request.use((request) => {
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
  }

  /**
   * Get the SDK version from package.json.
   * Falls back to 'unknown' if version cannot be determined.
   */
  private getVersion(): string {
    try {
      return process.env.npm_package_version || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Get the underlying HTTP client for advanced usage.
   *
   * @returns The configured HTTP client instance
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
  public getClient(): typeof client {
    return client;
  }

  // ============================================
  // Service accessors
  // ============================================

  /**
   * Estimate service - Create and manage estimates/quotes
   */
  get estimate(): typeof Estimate {
    return Estimate;
  }

  /**
   * Invoice service - Create and manage invoices
   */
  get invoice(): typeof Invoice {
    return Invoice;
  }

  /**
   * Billing service - Common billing operations (download PDF, send emails, etc.)
   */
  get billing(): typeof Billing {
    return Billing;
  }

  /**
   * Advance service - Manage advance invoices
   */
  get advance(): typeof Advance {
    return Advance;
  }

  /**
   * Asset service - Manage assets
   */
  get asset(): typeof Asset {
    return Asset;
  }

  /**
   * Customer Portal service - Customer-facing operations
   */
  get customerPortal(): typeof CustomerPortal {
    return CustomerPortal;
  }

  /**
   * Contact service - Create and manage contacts
   */
  get contact(): typeof Contact {
    return Contact;
  }

  /**
   * Organization service - Create and manage organizations
   */
  get organization(): typeof Organization {
    return Organization;
  }

  /**
   * Opportunity service - Create and manage opportunities/deals
   */
  get opportunity(): typeof Opportunity {
    return Opportunity;
  }

  /**
   * Company service - Get current company information
   */
  get company(): typeof Company {
    return Company;
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
