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
      throwOnError: true,
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
      // Generate schemas for requests only (response validation disabled due to API/spec mismatches)
      requests: true,
      responses: false,
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
        // Transform "companyControllerGetMe" to "getMe"
        const name = context.id.split('Controller')[1];
        if (name) {
          return name.charAt(0).toLowerCase() + name.slice(1);
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
