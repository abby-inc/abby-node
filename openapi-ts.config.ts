import { defineConfig, defaultPlugins } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'public-openapi.json',
  output: {
    path: 'src/client',
    lint: 'eslint',
  },
  plugins: [
    ...defaultPlugins,
    {
      name: '@hey-api/client-fetch',
    },
    {
      name: '@hey-api/schemas',
      type: 'json',
    },
    {
      enums: 'typescript+namespace',
      name: '@hey-api/typescript',
    },
    {
      dates: true,
      name: '@hey-api/transformers',
    },
    // Zod plugin for schema validation
    {
      name: 'zod',
      // Generate schemas for requests, responses, and reusable definitions
      requests: true,
      responses: true,
      definitions: true,
      // Include metadata from OpenAPI spec (descriptions, etc.)
      metadata: true,
      // Allow timezone offsets in datetime validation
      dates: {
        offset: true,
      },
    },
    {
      asClass: true,
      serviceNameBuilder: '{{name}}',
      methodNameBuilder: (context: { id: string }) => {
        // Transform "CompanyController-getMe" to "getMe"
        const parts = context.id.split('-');
        if (parts.length > 1) {
          const methodName = parts.slice(1).join('-');
          return methodName.charAt(0).toLowerCase() + methodName.slice(1);
        }
        return context.id;
      },
      name: '@hey-api/sdk',
      transformer: true,
      // Enable Zod validation in SDK methods
      validator: true,
    },
  ],
});
