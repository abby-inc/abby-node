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
    },
  ],
});
