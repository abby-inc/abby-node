# Abby Node.js, Bun & Deno SDK

[![npm version](https://img.shields.io/npm/v/@abby-inc/abby.svg)](https://www.npmjs.com/package/@abby-inc/abby)
[![npm downloads](https://img.shields.io/npm/dm/@abby-inc/abby.svg)](https://www.npmjs.com/package/@abby-inc/abby)
[![CI](https://github.com/abby-inc/abby-node/actions/workflows/ci.yml/badge.svg)](https://github.com/abby-inc/abby-node/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/abby-inc/abby-node/branch/master/graph/badge.svg?token=51rRlQV05f)](https://codecov.io/gh/abby-inc/abby-node)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

The official Node.js, Bun, and Deno library for the [Abby API](https://abby.fr). Abby is an all-in-one business management platform for freelancers and micro-enterprises.

## Table of Contents

- [Installation](#installation)
- [Requirements](#requirements)
- [Usage](#usage)
  - [Initialization](#initialization)
  - [Services](#services)
  - [Basic Example](#basic-example)
  - [Configuration](#configuration)
  - [Custom Fetch & Proxy Support](#custom-fetch--proxy-support)
  - [Error Handling](#error-handling)
  - [Event Listeners](#event-listeners)
  - [Interceptors](#interceptors)
  - [Raw Requests](#raw-requests)
- [Validation](#validation)
  - [Automatic Validation](#automatic-validation)
  - [Using Zod Schemas Directly](#using-zod-schemas-directly)
- [TypeScript Support](#typescript-support)
- [Versioning](#versioning)
- [Development](#development)
- [Support](#support)
- [License](#license)

## Installation

Install the package using your preferred package manager:

```bash
npm install @abby-inc/abby
# or
yarn add @abby-inc/abby
# or
pnpm add @abby-inc/abby
# or
bun add @abby-inc/abby
```

For Deno, you can import directly from npm:

```typescript
import Abby from 'npm:@abby-inc/abby';
```

## Requirements

- Node.js 18.0.0 or higher, Bun 1.0.0 or higher, or Deno 2.0.0 or higher
- An Abby account with an API key

## Usage

### Initialization

Get your API key from the [Abby settings](https://app.abby.fr/settings/integrations).

```typescript
import Abby from '@abby-inc/abby';

const abby = new Abby('your_api_key');
```

### Services

The SDK provides several services to interact with different parts of the Abby API:

- `abby.company`: Current company info and preferences.
- `abby.invoice`: Create and manage invoices.
- `abby.estimate`: Create and manage estimates (quotes).
- `abby.contact`: Manage your contacts (customers).
- `abby.organization`: Manage organizations.
- `abby.billing`: Shared billing utilities (PDFs, emails).
- `abby.opportunity`: CRM and opportunities management.
- `abby.asset`: Manage business assets.
- `abby.advance`: Manage advance payments.

### Basic Example

```typescript
import Abby from '@abby-inc/abby';

const abby = new Abby('your_api_key');

async function main() {
  // Get current company information
  const { data: me } = await abby.company.getMe();
  console.log(`Welcome back, ${me.user.firstname}!`);

  // List all contacts
  const { data: contacts } = await abby.contact.retrieveContacts({
    query: { limit: 10 },
  });

  console.log(`Found ${contacts.docs.length} contacts.`);
}

main().catch(console.error);
```

### Configuration

You can pass optional configuration settings when initializing the SDK:

```typescript
import Abby from '@abby-inc/abby';

const abby = new Abby('your_api_key', {
  baseUrl: 'https://api.app-abby.com',
  timeout: 30000,
  headers: {
    'X-Custom-Header': 'value',
  },
});
```

| Option    | Default                      | Description                                                                                                                     |
| --------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `baseUrl` | `'https://api.app-abby.com'` | Base URL for the Abby API.                                                                                                      |
| `timeout` | `30000`                      | Request timeout in milliseconds.                                                                                                |
| `headers` | `undefined`                  | Additional headers to include in every request.                                                                                 |
| `fetch`   | `globalThis.fetch`           | Custom fetch implementation for proxies, logging, or testing. See [Custom Fetch & Proxy Support](#custom-fetch--proxy-support). |

### Custom Fetch & Proxy Support

The SDK allows you to provide a custom `fetch` implementation for advanced use cases like proxies, custom logging, or testing.

#### Using a Proxy

With [undici](https://github.com/nodejs/undici) (recommended for Node.js):

```typescript
import Abby from '@abby-inc/abby';
import { fetch as undiciFetch, ProxyAgent } from 'undici';

const proxyAgent = new ProxyAgent('http://proxy.example.com:8080');

const abby = new Abby('your_api_key', {
  fetch: (url, init) =>
    undiciFetch(url, {
      ...init,
      dispatcher: proxyAgent,
    }),
});
```

With [node-fetch](https://github.com/node-fetch/node-fetch) and [https-proxy-agent](https://github.com/TooTallNate/proxy-agents):

```typescript
import Abby from '@abby-inc/abby';
import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';

const proxyAgent = new HttpsProxyAgent('http://proxy.example.com:8080');

const abby = new Abby('your_api_key', {
  fetch: (url, init) =>
    fetch(url, {
      ...init,
      agent: proxyAgent,
    }) as Promise<Response>,
});
```

#### Custom Logging

```typescript
const abby = new Abby('your_api_key', {
  fetch: async (url, init) => {
    console.log(`[Abby SDK] ${init?.method ?? 'GET'} ${url}`);
    const start = Date.now();

    const response = await globalThis.fetch(url, init);

    console.log(`[Abby SDK] ${response.status} in ${Date.now() - start}ms`);
    return response;
  },
});
```

#### Testing with Mock Fetch

```typescript
import { vi } from 'vitest';

const mockFetch = vi.fn(
  async () =>
    new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
);

const abby = new Abby('your_api_key', {
  fetch: mockFetch,
});
```

### Error Handling

The SDK throws descriptive errors when a request fails. You can catch these errors to handle different failure scenarios:

```typescript
try {
  const { data } = await abby.invoice.getInvoice({
    path: { invoiceId: 'inv_invalid' },
  });
} catch (error) {
  if (error.status === 404) {
    console.error('Invoice not found');
  } else if (error.status === 401) {
    console.error('Invalid API key');
  } else {
    console.error('An unexpected error occurred:', error.message);
  }
}
```

### Event Listeners

The SDK provides an event emitter pattern for global error handling and logging. This is useful for integrating with error tracking services like Sentry or for centralized logging.

#### Listening for Errors

Subscribe to all API errors across your application:

```typescript
import Abby from '@abby-inc/abby';

const abby = new Abby('your_api_key');

// Global error handler - fires on any 4xx/5xx response
abby.on('error', (error) => {
  console.error(`API Error: ${error.status} ${error.statusText}`);
  console.error(`URL: ${error.method} ${error.url}`);
  console.error(`Message: ${error.message}`);
  console.error(`Duration: ${error.duration}ms`);

  // Send to error tracking service
  Sentry.captureException(new Error(error.message), {
    extra: {
      status: error.status,
      url: error.url,
      requestId: error.requestId,
      body: error.body,
    },
  });
});
```

#### Listening for All Responses

Subscribe to all API responses (both successful and failed):

```typescript
// Log all API calls for debugging/monitoring
abby.on('response', (response) => {
  console.log(`${response.method} ${response.url} - ${response.status} (${response.duration}ms)`);
});
```

#### Removing Listeners

Use `off()` to remove a listener:

```typescript
const errorHandler = (error) => console.error(error);

// Add listener
abby.on('error', errorHandler);

// Remove listener later
abby.off('error', errorHandler);
```

#### Event Types

| Event      | Description                | Payload Type        |
| ---------- | -------------------------- | ------------------- |
| `error`    | Fires on 4xx/5xx responses | `AbbyErrorEvent`    |
| `response` | Fires on all responses     | `AbbyResponseEvent` |

**`AbbyErrorEvent` properties:**

| Property     | Type       | Description                                    |
| ------------ | ---------- | ---------------------------------------------- |
| `status`     | `number`   | HTTP status code (4xx or 5xx)                  |
| `statusText` | `string`   | HTTP status text                               |
| `url`        | `string`   | Request URL                                    |
| `method`     | `string`   | HTTP method (GET, POST, etc.)                  |
| `duration`   | `number`   | Request duration in milliseconds               |
| `message`    | `string?`  | Error message from response body, if available |
| `body`       | `unknown?` | Response body, if available                    |
| `requestId`  | `string?`  | X-Request-Id header, if available              |

**`AbbyResponseEvent` properties:**

| Property   | Type      | Description                               |
| ---------- | --------- | ----------------------------------------- |
| `status`   | `number`  | HTTP status code                          |
| `url`      | `string`  | Request URL                               |
| `method`   | `string`  | HTTP method (GET, POST, etc.)             |
| `duration` | `number`  | Request duration in milliseconds          |
| `ok`       | `boolean` | Whether the response was successful (2xx) |

### Interceptors

Interceptors allow you to hook into the request/response lifecycle:

```typescript
const client = abby.getClient();

// Request Interceptor: Add a custom header to every request
client.interceptors.request.use((request) => {
  request.headers.set('X-Request-ID', crypto.randomUUID());
  return request;
});

// Response Interceptor: Log every response status
client.interceptors.response.use((response) => {
  console.log(`API Response: ${response.status}`);
  return response;
});
```

### Raw Requests

If you need to call an endpoint that isn't covered by the SDK, or prefer to specify request details directly, you can use the underlying HTTP client:

```typescript
import Abby from '@abby-inc/abby';

const abby = new Abby('your_api_key');
const client = abby.getClient();

// GET request
const { data } = await client.get({
  url: '/v2/some/endpoint',
});

// POST request with body
const { data: result } = await client.post({
  url: '/v2/some/endpoint',
  body: {
    field: 'value',
  },
});

// Other methods available: put, patch, delete, head, options
```

The client automatically includes your API key and SDK headers in all requests.

## Validation

The SDK includes built-in [Zod](https://zod.dev) validation for all API requests and responses, ensuring type safety at runtime.

### Automatic Validation

All SDK methods automatically validate:

- **Request data**: Parameters, query strings, and request bodies are validated before sending
- **Response data**: API responses are validated to ensure they match the expected schema

If validation fails, a `ZodError` is thrown with detailed information about what went wrong:

```typescript
import Abby from '@abby-inc/abby';
import { ZodError } from 'zod';

const abby = new Abby('your_api_key');

try {
  // This will fail validation if the request body is invalid
  await abby.contact.createContact({
    body: {
      // Missing required fields will trigger a ZodError
    },
  });
} catch (error) {
  if (error instanceof ZodError) {
    console.error('Validation failed:', error.errors);
  }
}
```

### Using Zod Schemas Directly

All Zod schemas are exported and can be used for your own validation needs:

```typescript
import Abby, { zCreateContactDto, zReadContactDto } from '@abby-inc/abby';

// Validate user input before sending to the API
const userInput = {
  firstname: 'John',
  lastname: 'Doe',
  email: 'john@example.com',
};

// Parse and validate (throws ZodError if invalid)
const validatedContact = zCreateContactDto.parse(userInput);

// Or use safeParse for non-throwing validation
const result = zCreateContactDto.safeParse(userInput);
if (result.success) {
  console.log('Valid:', result.data);
} else {
  console.error('Invalid:', result.error.errors);
}

// Infer TypeScript types from schemas
import { z } from 'zod';
type CreateContactInput = z.infer<typeof zCreateContactDto>;
```

Available schema patterns:

- `z{DtoName}` - Schemas for DTOs (e.g., `zCreateContactDto`, `zReadInvoiceDto`)
- `z{ControllerMethod}Data` - Request data schemas (e.g., `zContactControllerCreateContactData`)

## TypeScript Support

The SDK is written in TypeScript and provides complete type definitions for all API resources and responses.

```typescript
import Abby, { ReadMeDto } from '@abby-inc/abby';

const abby = new Abby('your_api_key');

async function getCompanyData() {
  const { data }: { data: ReadMeDto } = await abby.company.getMe();
  return data;
}
```

You can also infer types directly from Zod schemas:

```typescript
import { z } from 'zod';
import { zReadContactDto } from '@abby-inc/abby';

// Infer the type from the Zod schema
type Contact = z.infer<typeof zReadContactDto>;
```

## Versioning

This SDK uses **independent versioning** from the Abby API:

- **SDK version** (`version` in `package.json`): Follows [semver](https://semver.org/) for SDK changes (bug fixes, new features, breaking changes)
- **API version** (`apiVersion` in `package.json`): Tracks which Abby API version was used to generate the SDK

```json
{
  "version": "1.2.0", // SDK version
  "apiVersion": "1.5.0" // API spec version used to generate
}
```

This allows the SDK to receive bug fixes and improvements independently from API changes.

## Development

Contributions are welcome! Please see our [Contributing Guidelines](CONTRIBUTING.md) for more information.

## Support

If you encounter any issues or have questions, please check the following resources:

- [Official Documentation](https://docs.abby.fr)
- [API Reference](https://api.app-abby.com/api-docs/public.json)
- [GitHub Issues](https://github.com/abby-inc/abby-node/issues)
- [Abby Support](https://abby.fr/contact)

## License

MIT License - see [LICENSE](LICENSE) for details.
