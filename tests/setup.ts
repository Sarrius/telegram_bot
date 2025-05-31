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

// Jest setup file - runs before all tests
import { FeatureManager } from '../src/config/featureManager';

// Enable all features for testing
beforeAll(() => {
  const featureManager = FeatureManager.getInstance();
  featureManager.setTestConfiguration();
  console.log('🧪 Test setup: All features enabled for testing');
});

// Reset to defaults after all tests
afterAll(() => {
  const featureManager = FeatureManager.getInstance();
  featureManager.resetToDefaults();
  console.log('🔄 Test cleanup: Features reset to defaults');
}); 