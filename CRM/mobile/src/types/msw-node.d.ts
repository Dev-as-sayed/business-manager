declare module 'msw/node' {
  export function setupServer(...handlers: unknown[]): {
    listen(options?: { onUnhandledRequest?: 'error' | 'warn' | 'bypass' }): void;
    close(): void;
    resetHandlers(...handlers: unknown[]): void;
    use(...handlers: unknown[]): void;
  };
}
