import { describe, it, expect, beforeEach, vi } from 'vitest';
import Abby from '../src/index';
import { generateTestApiKey } from './helpers';

describe('Abby SDK', () => {
  describe('constructor', () => {
    it('should create an instance with a valid API key', () => {
      const apiKey = generateTestApiKey();
      const abby = new Abby(apiKey);

      expect(abby).toBeInstanceOf(Abby);
    });

    it('should throw an error when API key is missing', () => {
      expect(() => new Abby('')).toThrow('Abby API key is required');
    });

    it('should throw an error when API key is undefined', () => {
      // @ts-expect-error Testing undefined API key
      expect(() => new Abby(undefined)).toThrow('Abby API key is required');
    });

    it('should accept custom configuration', () => {
      const apiKey = generateTestApiKey();
      const abby = new Abby(apiKey, {
        baseUrl: 'https://custom.api.abby.fr',
        timeout: 60000,
      });

      expect(abby).toBeInstanceOf(Abby);
    });

    it('should use default base URL when not specified', () => {
      const apiKey = generateTestApiKey();
      const abby = new Abby(apiKey);

      // The client should be configured with default URL
      expect(abby.getClient()).toBeDefined();
    });
  });

  describe('service accessors', () => {
    let abby: Abby;

    beforeEach(() => {
      abby = new Abby(generateTestApiKey());
    });

    it('should expose estimate service', () => {
      expect(abby.estimate).toBeDefined();
    });

    it('should expose invoice service', () => {
      expect(abby.invoice).toBeDefined();
    });

    it('should expose billing service', () => {
      expect(abby.billing).toBeDefined();
    });

    it('should expose contact service', () => {
      expect(abby.contact).toBeDefined();
    });

    it('should expose organization service', () => {
      expect(abby.organization).toBeDefined();
    });

    it('should expose opportunity service', () => {
      expect(abby.opportunity).toBeDefined();
    });

    it('should expose company service', () => {
      expect(abby.company).toBeDefined();
    });

    it('should expose advance service', () => {
      expect(abby.advance).toBeDefined();
    });

    it('should expose asset service', () => {
      expect(abby.asset).toBeDefined();
    });

    it('should expose customerPortal service', () => {
      expect(abby.customerPortal).toBeDefined();
    });
  });

  describe('getClient', () => {
    it('should return the underlying HTTP client', () => {
      const abby = new Abby(generateTestApiKey());
      const client = abby.getClient();

      expect(client).toBeDefined();
      expect(client.interceptors).toBeDefined();
    });
  });
});
