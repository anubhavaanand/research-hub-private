/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export const generateId = () => Math.random().toString(36).substring(2, 9);

export const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    }).format(new Date(timestamp));
};

// API Rate Limiting for Security
interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export const checkRateLimit = (apiKey: string, maxRequests: number = 60, windowMs: number = 60000): boolean => {
    const now = Date.now();
    const keyHash = hashApiKey(apiKey);
    const entry = rateLimitMap.get(keyHash);

    if (!entry || now > entry.resetTime) {
        rateLimitMap.set(keyHash, { count: 1, resetTime: now + windowMs });
        return true;
    }

    if (entry.count >= maxRequests) {
        return false;
    }

    entry.count++;
    return true;
};

// Simple hash function for API key (not for crypto, just for rate limiting)
const hashApiKey = (key: string): string => {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        const char = key.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
};

export const validateApiKey = (apiKey: string): boolean => {
    // Basic validation for Google Gemini API key format
    if (!apiKey || typeof apiKey !== 'string') return false;
    if (apiKey.length < 30) return false;
    if (apiKey === 'your_gemini_api_key_here') return false;
    return true;
};
