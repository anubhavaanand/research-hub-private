/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Tests for Security Utilities
 */

import { describe, it, expect } from 'vitest';
import {
    validateApiKey,
    sanitizeInput,
    sanitizePrompt,
    simpleHash,
    maskSensitiveData,
    safeJsonParse,
} from './securityUtils';

describe('securityUtils', () => {
    describe('validateApiKey', () => {
        it('should reject empty or null keys', () => {
            expect(validateApiKey(null).valid).toBe(false);
            expect(validateApiKey(undefined).valid).toBe(false);
            expect(validateApiKey('').valid).toBe(false);
        });

        it('should reject short keys', () => {
            const result = validateApiKey('short');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('too short');
        });

        it('should reject placeholder keys', () => {
            const result = validateApiKey('your_gemini_api_key_here');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('placeholder');
        });

        it('should reject keys with wrong format', () => {
            const result = validateApiKey('sk-1234567890abcdefghijklmnopqrstuv'); // OpenAI format
            expect(result.valid).toBe(false);
            expect(result.error).toContain('AIza');
        });

        it('should accept valid Gemini API keys', () => {
            const result = validateApiKey('AIzaSyA1234567890abcdefghijklmnopqrst');
            expect(result.valid).toBe(true);
        });
    });

    describe('sanitizeInput', () => {
        it('should remove script tags', () => {
            const dangerous = '<script>alert("xss")</script>Hello';
            const result = sanitizeInput(dangerous);
            expect(result).not.toContain('<script>');
            expect(result).toContain('Hello');
        });

        it('should escape HTML entities', () => {
            const input = '<div>Test & "quotes"</div>';
            const result = sanitizeInput(input);
            expect(result).toContain('&lt;');
            expect(result).toContain('&gt;');
            expect(result).toContain('&amp;');
            expect(result).toContain('&quot;');
        });

        it('should truncate long inputs', () => {
            const longInput = 'a'.repeat(10000);
            const result = sanitizeInput(longInput, 100);
            expect(result.length).toBe(100);
        });

        it('should remove template injections', () => {
            const input = 'Hello {{user.password}} and ${secret}';
            const result = sanitizeInput(input);
            expect(result).not.toContain('{{');
            expect(result).not.toContain('${');
        });
    });

    describe('sanitizePrompt', () => {
        it('should remove script tags but preserve most content', () => {
            const input = 'Summarize this: <script>bad</script>The paper discusses...';
            const result = sanitizePrompt(input);
            expect(result).not.toContain('<script>');
            expect(result).toContain('The paper discusses');
        });

        it('should trim and respect max length', () => {
            const input = '  ' + 'a'.repeat(2000) + '  ';
            const result = sanitizePrompt(input, 100);
            expect(result.length).toBe(100);
            expect(result).not.toMatch(/^\s/);
        });
    });

    describe('simpleHash', () => {
        it('should produce consistent hashes', () => {
            const hash1 = simpleHash('test-string');
            const hash2 = simpleHash('test-string');
            expect(hash1).toBe(hash2);
        });

        it('should produce different hashes for different inputs', () => {
            const hash1 = simpleHash('input1');
            const hash2 = simpleHash('input2');
            expect(hash1).not.toBe(hash2);
        });
    });

    describe('maskSensitiveData', () => {
        it('should mask API keys', () => {
            const apiKey = 'AIzaSyA1234567890abcdefghijklmnopqrst';
            const masked = maskSensitiveData(apiKey);
            expect(masked).toBe('AIza...qrst');
        });

        it('should handle short strings', () => {
            const short = 'abc';
            const masked = maskSensitiveData(short);
            expect(masked).toBe('****');
        });
    });

    describe('safeJsonParse', () => {
        it('should parse valid JSON', () => {
            const result = safeJsonParse('{"key": "value"}', {});
            expect(result).toEqual({ key: 'value' });
        });

        it('should return fallback for invalid JSON', () => {
            const fallback = { default: true };
            const result = safeJsonParse('not json', fallback);
            expect(result).toEqual(fallback);
        });
    });
});
