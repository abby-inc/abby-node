# Abby SDK Quickstart

A minimal example demonstrating how to use the Abby Node.js SDK.

## Prerequisites

- Node.js 18.0.0 or higher
- An Abby account with an API key

## Getting Your API Key

1. Log in to [Abby](https://app.abby.fr)
2. Go to **Settings** → **Integrations**
3. Generate or copy your API key

## Installation

```bash
npm install
```

## Running the Example

Set your API key and run:

```bash
ABBY_API_KEY=your_api_key_here npm start
```

Or export it first:

```bash
export ABBY_API_KEY=your_api_key_here
npm start
```

## What This Example Does

1. **Fetches company information** - Retrieves your company name and user details
2. **Lists contacts** - Shows the first 5 contacts with pagination info
3. **Demonstrates error handling** - Shows how to handle common API errors (401, 403, etc.)

## Expected Output

```
Abby SDK Quickstart Example
===========================

1. Fetching company information...
   Company: Your Company
   User: John Doe
   Email: john@example.com

2. Listing contacts (first 5)...
   1. Alice Smith (alice@example.com)
   2. Bob Johnson (bob@example.com)
   ...
   ... and 95 more

Done! Check out the SDK documentation for more features.
```

## Next Steps

- Check out the [SDK documentation](https://github.com/abby-inc/abby-node#readme)
- Explore other services: `invoice`, `estimate`, `organization`, `opportunity`
- Add custom interceptors for logging or retry logic
