/**
 * Test helper utilities for the Abby SDK test suite.
 */

/**
 * Generate a fake API key for testing.
 */
export function generateTestApiKey(): string {
  return `test_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Mock fetch response helper.
 */
export function mockFetchResponse<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Mock error response helper.
 */
export function mockErrorResponse(message: string, status = 400): Response {
  return new Response(
    JSON.stringify({
      error: {
        message,
        code: 'test_error',
      },
    }),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Wait for a specified amount of time.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
