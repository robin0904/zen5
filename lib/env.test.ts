import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { validateEnv, getEnv, getOptionalEnv } from './env';

describe('Environment Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset process.env before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  it('should throw error when required env vars are missing', () => {
    process.env = {};
    
    expect(() => validateEnv()).toThrow('Missing required environment variables');
  });

  it('should not throw when all required env vars are present', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
    
    expect(() => validateEnv()).not.toThrow();
  });

  it('should get environment variable value', () => {
    process.env.TEST_VAR = 'test-value';
    
    expect(getEnv('TEST_VAR')).toBe('test-value');
  });

  it('should throw when getting non-existent env var', () => {
    expect(() => getEnv('NON_EXISTENT')).toThrow();
  });

  it('should return undefined for optional env var that does not exist', () => {
    expect(getOptionalEnv('NON_EXISTENT')).toBeUndefined();
  });

  it('should return value for optional env var that exists', () => {
    process.env.OPTIONAL_VAR = 'optional-value';
    
    expect(getOptionalEnv('OPTIONAL_VAR')).toBe('optional-value');
  });
});
