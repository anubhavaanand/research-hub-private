/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * API Rate Limiter & Cache
 * Minimizes API usage to stay within free tier limits
 */

// Rate limiting configuration
const RATE_LIMIT = {
    maxRequestsPerMinute: 10,  // Keep well under free tier limits
    maxRequestsPerDay: 100,    // Daily safety limit
    cooldownMs: 6000,          // 6 second cooldown between requests
};

// Request tracking
let requestTimestamps: number[] = [];
let lastRequestTime = 0;
let dailyRequestCount = 0;
let lastDailyReset = Date.now();

// Response cache to avoid duplicate API calls
const responseCache = new Map<string, { response: string; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 30; // 30 minute cache

/**
 * Check if we're within rate limits
 */
export function canMakeRequest(): { allowed: boolean; reason?: string; waitMs?: number } {
    const now = Date.now();

    // Reset daily counter if new day
    if (now - lastDailyReset > 24 * 60 * 60 * 1000) {
        dailyRequestCount = 0;
        lastDailyReset = now;
    }

    // Check daily limit
    if (dailyRequestCount >= RATE_LIMIT.maxRequestsPerDay) {
        return {
            allowed: false,
            reason: `Daily limit reached (${RATE_LIMIT.maxRequestsPerDay} requests). Resets tomorrow.`,
            waitMs: 24 * 60 * 60 * 1000 - (now - lastDailyReset)
        };
    }

    // Check cooldown
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < RATE_LIMIT.cooldownMs) {
        return {
            allowed: false,
            reason: 'Please wait a moment between requests.',
            waitMs: RATE_LIMIT.cooldownMs - timeSinceLastRequest
        };
    }

    // Check per-minute rate
    const oneMinuteAgo = now - 60000;
    requestTimestamps = requestTimestamps.filter(t => t > oneMinuteAgo);

    if (requestTimestamps.length >= RATE_LIMIT.maxRequestsPerMinute) {
        return {
            allowed: false,
            reason: 'Too many requests. Please wait.',
            waitMs: 60000 - (now - requestTimestamps[0])
        };
    }

    return { allowed: true };
}

/**
 * Record a request (call after successful API call)
 */
export function recordRequest(): void {
    const now = Date.now();
    requestTimestamps.push(now);
    lastRequestTime = now;
    dailyRequestCount++;

    // Save to localStorage for persistence across refreshes
    try {
        localStorage.setItem('rh_daily_requests', JSON.stringify({
            count: dailyRequestCount,
            resetTime: lastDailyReset
        }));
    } catch (e) {
        // localStorage might not be available
    }
}

/**
 * Load saved rate limit state from localStorage
 */
export function loadRateLimitState(): void {
    try {
        const saved = localStorage.getItem('rh_daily_requests');
        if (saved) {
            const { count, resetTime } = JSON.parse(saved);
            const now = Date.now();

            // Check if it's a new day
            if (now - resetTime < 24 * 60 * 60 * 1000) {
                dailyRequestCount = count;
                lastDailyReset = resetTime;
            }
        }
    } catch (e) {
        // Ignore errors
    }
}

/**
 * Get cached response if available and not expired
 */
export function getCachedResponse(key: string): string | null {
    const cached = responseCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.response;
    }
    return null;
}

/**
 * Cache a response
 */
export function cacheResponse(key: string, response: string): void {
    responseCache.set(key, { response, timestamp: Date.now() });

    // Limit cache size to prevent memory issues
    if (responseCache.size > 50) {
        const oldestKey = responseCache.keys().next().value;
        if (oldestKey) responseCache.delete(oldestKey);
    }
}

/**
 * Create a cache key from prompt/context
 */
export function createCacheKey(...parts: string[]): string {
    return parts.map(p => p.slice(0, 100)).join('|');
}

/**
 * Get usage statistics
 */
export function getUsageStats(): { used: number; limit: number; remaining: number } {
    loadRateLimitState();
    return {
        used: dailyRequestCount,
        limit: RATE_LIMIT.maxRequestsPerDay,
        remaining: Math.max(0, RATE_LIMIT.maxRequestsPerDay - dailyRequestCount)
    };
}

// Initialize on load
loadRateLimitState();
