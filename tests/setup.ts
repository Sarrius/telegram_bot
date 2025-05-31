// Global test setup
beforeEach(() => {
  // Reset console.log for clean test output
  jest.clearAllMocks();
});

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Test utilities
export const createMockUser = (id: string = 'user123') => ({
  userId: id,
  userName: `TestUser${id}`,
});

export const createMockMessage = (
  text: string = 'test message',
  userId: string = 'user123',
  chatId: string = 'chat456'
) => ({
  text,
  userId,
  chatId,
  userName: `TestUser${userId}`,
  isGroupChat: true,
});

export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Custom Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeOneOf(expected: any[]): R;
    }
  }
}

expect.extend({
  toBeOneOf(received: any, expected: any[]) {
    const pass = expected.includes(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be one of ${expected}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be one of ${expected}`,
        pass: false,
      };
    }
  },
});

export {}; 