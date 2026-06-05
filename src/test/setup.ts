import '@testing-library/jest-dom/vitest';

Object.defineProperty(globalThis, 'fetch', {
  configurable: true,
  value: vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString();

    if (url.endsWith('/api/auth/me')) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    throw new Error(`Unhandled fetch request in test setup: ${url}`);
  }),
});
