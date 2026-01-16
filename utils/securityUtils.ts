/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Security Utilities
 * Provides input sanitization, API key validation, and security helpers
 */

/**
 * Validate Google Gemini API key format
 * Gemini keys start with 'AIza' and are 39 characters long
 */
export function validateApiKey(apiKey: string | undefined | null): { valid: boolean; error?: string } {
    if (!apiKey) {
        return { valid: false, error: 'API key is required' };
    }

    const trimmedKey = apiKey.trim();

    // Check placeholders first (they should fail even if short)
    if (trimmedKey.includes('your_') || trimmedKey.includes('YOUR_') || trimmedKey === 'your_gemini_api_key_here') {
        return { valid: false, error: 'Please replace the placeholder with your actual API key' };
    }

    if (trimmedKey.length < 30) {
        return { valid: false, error: 'API key is too short' };
    }

    // Gemini API keys typically start with 'AIza'
    if (!trimmedKey.startsWith('AIza')) {
        return { valid: false, error: 'Invalid API key format. Gemini keys start with "AIza"' };
    }

    return { valid: true };
}

/**
 * Sanitize user input to prevent XSS and injection attacks
 */
export function sanitizeInput(input: string, maxLength: number = 5000): string {
    if (!input || typeof input !== 'string') {
        return '';
    }

    return input
        .slice(0, maxLength)
        // Remove script tags
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        // Remove event handlers
        .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
        // Remove javascript: URLs
        .replace(/javascript:/gi, '')
        // Remove template injection patterns
        .replace(/\{\{.*?\}\}/g, '')
        .replace(/\$\{.*?\}/g, '')
        // Escape HTML entities
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

/**
 * Sanitize input for API prompts (less aggressive than HTML sanitization)
 */
export function sanitizePrompt(input: string, maxLength: number = 1000): string {
    if (!input || typeof input !== 'string') {
        return '';
    }

    return input
        .trim()
        .slice(0, maxLength)
        // Remove potential prompt injection patterns
        .replace(/\{\{.*?\}\}/g, '')
        .replace(/\$\{.*?\}/g, '')
        // Remove script tags
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

/**
 * Generate a simple hash for tracking purposes (not cryptographic)
 */
export function simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
}

/**
 * Mask sensitive data for logging (shows first 4 and last 4 characters)
 */
export function maskSensitiveData(data: string): string {
    if (!data || data.length < 10) {
        return '****';
    }
    return `${data.slice(0, 4)}...${data.slice(-4)}`;
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
    return import.meta.env?.DEV ?? process.env.NODE_ENV === 'development';
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
    try {
        return JSON.parse(json) as T;
    } catch {
        return fallback;
    }
}
