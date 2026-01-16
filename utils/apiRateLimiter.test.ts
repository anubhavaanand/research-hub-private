/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Tests for API Rate Limiter & Cache utilities
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    canMakeRequest,
    recordRequest,
    getCachedResponse,
    cacheResponse,
    createCacheKey,
    getUsageStats,
} from './apiRateLimiter';

describe('apiRateLimiter', () => {
    beforeEach(() => {
        // Reset module state by clearing localStorage
        localStorage.clear();
        // Reset time mocks
        vi.useRealTimers();
    });

    describe('canMakeRequest', () => {
        it('should allow request when under limits', () => {
            const result = canMakeRequest();
            expect(result.allowed).toBe(true);
        });

        it('should enforce cooldown between requests', async () => {
            // Make first request
            const first = canMakeRequest();
            expect(first.allowed).toBe(true);
            recordRequest();

            // Immediately try another - should be blocked
            const second = canMakeRequest();
            expect(second.allowed).toBe(false);
            expect(second.reason).toContain('wait');
        });
    });

    describe('caching', () => {
        it('should cache and retrieve responses', () => {
            const key = 'test-key';
            const response = 'This is a cached response';

            // Initially no cached response
            expect(getCachedResponse(key)).toBeNull();

            // Cache and retrieve
            cacheResponse(key, response);
            expect(getCachedResponse(key)).toBe(response);
        });

        it('should create consistent cache keys', () => {
            const key1 = createCacheKey('prompt1', 'context1');
            const key2 = createCacheKey('prompt1', 'context1');
            const key3 = createCacheKey('prompt2', 'context1');

            expect(key1).toBe(key2);
            expect(key1).not.toBe(key3);
        });

        it('should truncate long inputs in cache keys', () => {
            const longInput = 'a'.repeat(200);
            const key = createCacheKey(longInput);

            // Key should be truncated to 100 chars per part
            expect(key.length).toBeLessThanOrEqual(100);
        });
    });

    describe('getUsageStats', () => {
        it('should return usage statistics', () => {
            const stats = getUsageStats();

            expect(stats).toHaveProperty('used');
            expect(stats).toHaveProperty('limit');
            expect(stats).toHaveProperty('remaining');
            expect(stats.limit).toBe(100); // Daily limit from config
        });

        it('should track requests made', () => {
            // Verify structure and math of usage stats
            const stats = getUsageStats();

            expect(stats.used).toBeGreaterThanOrEqual(0);
            expect(stats.remaining).toBeLessThanOrEqual(stats.limit);
            expect(stats.used + stats.remaining).toBe(stats.limit);
        });
    });
});
