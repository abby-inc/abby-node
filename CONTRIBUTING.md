# Contributing to Abby Node.js SDK

First off, thank you for considering contributing to the Abby Node.js SDK! 🎉

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/abby-node.git
   cd abby-node
   ```
3. Add the original repository as an upstream remote:
   ```bash
   git remote add upstream https://github.com/abby-inc/abby-node.git
   ```

## Development Setup

### Prerequisites

- Node.js 18 or higher
- pnpm 9 or higher
- Git

### Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Set up git hooks:

   ```bash
   pnpm prepare
   ```

3. Run tests to verify everything works:
   ```bash
   pnpm test
   ```

### Available Scripts

| Command              | Description                      |
| -------------------- | -------------------------------- |
| `pnpm build`         | Generate SDK and build           |
| `pnpm build:only`    | Build without regenerating       |
| `pnpm generate`      | Regenerate SDK from OpenAPI spec |
| `pnpm test`          | Run tests                        |
| `pnpm test:coverage` | Run tests with coverage          |
| `pnpm lint`          | Run ESLint                       |
| `pnpm format`        | Format code with Prettier        |
| `pnpm format:check`  | Check code formatting            |
| `pnpm typecheck`     | Run TypeScript type checking     |

## Making Changes

1. Create a new branch from `main`:

   ```bash
   git checkout -b feat/my-new-feature
   ```

2. Make your changes and commit them following our [commit guidelines](#commit-guidelines)

3. Push your branch to your fork:

   ```bash
   git push origin feat/my-new-feature
   ```

4. Open a Pull Request against the `main` branch

## Commit Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages. This leads to more readable messages and enables automatic changelog generation.

### Commit Message Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to our CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files
- `revert`: Reverts a previous commit

### Examples

```
feat(invoice): add support for recurring invoices
fix(client): handle timeout errors correctly
docs: update API reference in README
test(estimate): add tests for sign method
```

## Pull Request Process

1. Ensure your changes pass all tests and linting
2. Update the documentation if needed
3. Fill out the pull request template completely
4. Request a review from maintainers
5. Address any feedback from reviewers
6. Once approved, a maintainer will merge your PR

### PR Checklist

- [ ] Tests pass locally
- [ ] Code follows the project style guidelines
- [ ] Documentation is updated
- [ ] Commit messages follow the conventional commits format
- [ ] Changes are focused and don't include unrelated modifications

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Avoid using `any` type when possible
- Use explicit types for function parameters and return values
- Prefer interfaces over type aliases for object shapes

### Style

- Follow the existing code style
- Use ESLint and Prettier for formatting
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### Example

````typescript
/**
 * Creates a new invoice for the specified customer.
 *
 * @param customerId - The unique identifier of the customer
 * @param options - Invoice creation options
 * @returns The created invoice
 *
 * @example
 * ```typescript
 * const invoice = await abby.invoice.create('cust_123', {
 *   items: [{ description: 'Service', amount: 100 }],
 * });
 * ```
 */
public async create(
  customerId: string,
  options: CreateInvoiceOptions
): Promise<Invoice> {
  // Implementation
}
````

## Testing

- Write tests for all new features and bug fixes
- Maintain or improve code coverage
- Use descriptive test names
- Follow the Arrange-Act-Assert pattern

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test -- --watch

# Run tests with coverage
pnpm test:coverage
```

## Documentation

- Update the README if adding new features
- Add JSDoc comments to all public APIs
- Include code examples where helpful
- Keep documentation up to date with code changes

## Questions?

Feel free to open an issue if you have questions or need help!

Thank you for contributing! 🙏
