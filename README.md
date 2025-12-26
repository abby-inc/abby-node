# Abby Node.js SDK

[![npm version](https://img.shields.io/npm/v/@abby-inc/abby-node.svg)](https://www.npmjs.com/package/@abby-inc/abby-node)
[![npm downloads](https://img.shields.io/npm/dm/@abby-inc/abby-node.svg)](https://www.npmjs.com/package/@abby-inc/abby-node)
[![CI](https://github.com/abby-inc/abby-node/actions/workflows/ci.yml/badge.svg)](https://github.com/abby-inc/abby-node/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/abby-inc/abby-node/graph/badge.svg)](https://codecov.io/gh/abby-inc/abby-node)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

The official Node.js library for the [Abby API](https://abby.fr). Abby is an all-in-one business management platform for freelancers and micro-enterprises.

## Table of Contents

- [Installation](#installation)
- [Requirements](#requirements)
- [Usage](#usage)
  - [Initialization](#initialization)
  - [Services](#services)
  - [Basic Example](#basic-example)
  - [Configuration](#configuration)
  - [Error Handling](#error-handling)
  - [Interceptors](#interceptors)
- [Validation](#validation)
  - [Automatic Validation](#automatic-validation)
  - [Using Zod Schemas Directly](#using-zod-schemas-directly)
- [TypeScript Support](#typescript-support)
- [Development](#development)
- [Support](#support)
- [License](#license)

## Installation

Install the package using your preferred package manager:

```bash
npm install @abby-inc/abby-node
# or
yarn add @abby-inc/abby-node
# or
pnpm add @abby-inc/abby-node
```

## Requirements

- Node.js 18.0.0 or higher
- An Abby account with an API key

## Usage

### Initialization

Get your API key from the [Abby settings](https://app.abby.fr/settings/api).

```typescript
import Abby from '@abby-inc/abby-node';

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
import Abby from '@abby-inc/abby-node';

const abby = new Abby('your_api_key');

async function main() {
  // Get current company information
  const { data: me } = await abby.company.getMe();
  console.log(`Welcome back, ${me.user.firstname}!`);

  // List all contacts
  const { data: contacts } = await abby.contact.contactsControllerRetrieveContacts({
    query: { limit: 10 },
  });

  console.log(`Found ${contacts.length} contacts.`);
}

main().catch(console.error);
```

### Configuration

You can pass optional configuration settings when initializing the SDK:

```typescript
const abby = new Abby('your_api_key', {
  baseUrl: 'https://api.app-abby.com', // Default
  timeout: 30000, // Default: 30 seconds
  headers: {
    'X-Custom-Header': 'value',
  },
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

## Validation

The SDK includes built-in [Zod](https://zod.dev) validation for all API requests and responses, ensuring type safety at runtime.

### Automatic Validation

All SDK methods automatically validate:

- **Request data**: Parameters, query strings, and request bodies are validated before sending
- **Response data**: API responses are validated to ensure they match the expected schema

If validation fails, a `ZodError` is thrown with detailed information about what went wrong:

```typescript
import Abby from '@abby-inc/abby-node';
import { ZodError } from 'zod';

const abby = new Abby('your_api_key');

try {
  // This will fail validation if the request body is invalid
  await abby.contact.contactControllerCreateContact({
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
import Abby, { zCreateContactDto, zReadContactDto } from '@abby-inc/abby-node';

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
- `z{ControllerMethod}Response` - Response schemas (e.g., `zContactControllerCreateContactResponse`)

## TypeScript Support

The SDK is written in TypeScript and provides complete type definitions for all API resources and responses.

```typescript
import Abby, { ReadMeDto } from '@abby-inc/abby-node';

const abby = new Abby('your_api_key');

async function getCompanyData() {
  const { data }: { data: ReadMeDto } = await abby.company.getMe();
  return data;
}
```

You can also infer types directly from Zod schemas:

```typescript
import { z } from 'zod';
import { zReadContactDto } from '@abby-inc/abby-node';

// Infer the type from the Zod schema
type Contact = z.infer<typeof zReadContactDto>;
```

## Development

Contributions are welcome! Please see our [Contributing Guidelines](CONTRIBUTING.md) for more information.

## Support

If you encounter any issues or have questions, please check the following resources:

- [Official Documentation](https://abby.fr/docs)
- [API Reference](https://api.abby.fr/api-docs)
- [GitHub Issues](https://github.com/abby-inc/abby-node/issues)
- [Abby Support](https://abby.fr/contact)

## License

MIT License - see [LICENSE](LICENSE) for details.
