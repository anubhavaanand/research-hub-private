/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PDF Metadata Extractor
 * Extracts metadata from PDF files using AI-powered text analysis
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ExtractedMetadata {
    title: string;
    authors: string[];
    year: number;
    abstract?: string;
    journal?: string;
    doi?: string;
    keywords?: string[];
    volume?: string;
    issue?: string;
    pages?: string;
}

/**
 * Sanitize user input to prevent injection attacks
 */
export function sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') return '';

    // Remove potential script tags and dangerous patterns
    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim()
        .slice(0, 10000); // Limit length to prevent DoS
}

/**
 * Extract text content from a PDF file using the FileReader API
 * This is a simplified extraction - for production, consider using pdf.js
 */
export async function extractPDFText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const arrayBuffer = event.target?.result as ArrayBuffer;
                const bytes = new Uint8Array(arrayBuffer);

                // Simple text extraction from PDF
                // This extracts visible text strings from the PDF binary
                let text = '';
                let inText = false;
                let textBuffer = '';

                for (let i = 0; i < bytes.length - 1; i++) {
                    // Look for text objects in PDF (between BT and ET)
                    if (bytes[i] === 66 && bytes[i + 1] === 84) { // BT
                        inText = true;
                    } else if (bytes[i] === 69 && bytes[i + 1] === 84) { // ET
                        inText = false;
                        if (textBuffer) {
                            text += textBuffer + ' ';
                            textBuffer = '';
                        }
                    }

                    // Extract printable ASCII characters when in text mode
                    if (inText && bytes[i] >= 32 && bytes[i] <= 126) {
                        textBuffer += String.fromCharCode(bytes[i]);
                    }
                }

                // Also try to extract from stream objects
                const decoder = new TextDecoder('utf-8', { fatal: false });
                const fullText = decoder.decode(bytes);

                // Extract text between parentheses (common PDF text format)
                const parenMatches = fullText.match(/\(([^)]+)\)/g);
                if (parenMatches) {
                    const additionalText = parenMatches
                        .map(m => m.slice(1, -1))
                        .filter(t => t.length > 2 && /[a-zA-Z]/.test(t))
                        .join(' ');
                    text += additionalText;
                }

                // Clean up the extracted text
                text = text
                    .replace(/\s+/g, ' ')
                    .replace(/[^\x20-\x7E\n]/g, ' ')
                    .trim()
                    .slice(0, 15000); // Limit to first ~15k chars for API

                resolve(text);
            } catch (error) {
                reject(new Error('Failed to extract PDF text'));
            }
        };

        reader.onerror = () => reject(new Error('Failed to read PDF file'));
        reader.readAsArrayBuffer(file);
    });
}

/**
 * Use AI to extract structured metadata from PDF text
 */
export async function extractMetadataWithAI(text: string): Promise<ExtractedMetadata | null> {
    const apiKey = import.meta.env.VITE_API_KEY || process.env.API_KEY;

    if (!apiKey) {
        console.warn('API key not found for metadata extraction');
        return null;
    }

    // Import and check rate limits
    try {
        const { canMakeRequest, recordRequest } = await import('./apiRateLimiter');
        const rateCheck = canMakeRequest();
        if (!rateCheck.allowed) {
            console.warn('Rate limit reached for metadata extraction');
            return null;
        }
    } catch (e) {
        // Rate limiter not available, continue anyway
    }

    // Sanitize the text before sending to AI
    const sanitizedText = sanitizeInput(text);

    if (!sanitizedText || sanitizedText.length < 50) {
        console.warn('Insufficient text for metadata extraction');
        return null;
    }

    try {
        const ai = new GoogleGenerativeAI({ apiKey });

        // Minimal prompt to save tokens
        const prompt = `Extract paper metadata as JSON: {"title":"","authors":[],"year":0,"journal":"","doi":""}. Text: ${sanitizedText.slice(0, 3000)}`;

        const response = await ai.models.generateContent({
            model: 'gemini-pro', // Cheapest reliable model
            contents: { role: 'user', parts: [{ text: prompt }] }
        });

        // Record the request
        try {
            const { recordRequest } = await import('./apiRateLimiter');
            recordRequest();
        } catch (e) { }

        const responseText = response.text || '';

        // Extract JSON from response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.warn('No JSON found in AI response');
            return null;
        }

        const parsed = JSON.parse(jsonMatch[0]);

        // Validate and sanitize the extracted metadata
        return {
            title: sanitizeInput(parsed.title) || 'Untitled',
            authors: Array.isArray(parsed.authors)
                ? parsed.authors.map((a: string) => sanitizeInput(a)).filter(Boolean)
                : ['Unknown'],
            year: typeof parsed.year === 'number' && parsed.year > 1900 && parsed.year < 2100
                ? parsed.year
                : new Date().getFullYear(),
            abstract: parsed.abstract ? sanitizeInput(parsed.abstract) : undefined,
            journal: parsed.journal ? sanitizeInput(parsed.journal) : undefined,
            doi: parsed.doi ? sanitizeInput(parsed.doi) : undefined,
            keywords: Array.isArray(parsed.keywords)
                ? parsed.keywords.map((k: string) => sanitizeInput(k)).filter(Boolean)
                : undefined,
            volume: parsed.volume ? sanitizeInput(String(parsed.volume)) : undefined,
            issue: parsed.issue ? sanitizeInput(String(parsed.issue)) : undefined,
            pages: parsed.pages ? sanitizeInput(String(parsed.pages)) : undefined
        };
    } catch (error) {
        console.error('AI metadata extraction failed:', error);
        return null;
    }
}

/**
 * Main function to extract metadata from a PDF file
 */
export async function extractPDFMetadata(file: File): Promise<ExtractedMetadata | null> {
    // Validate file type
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
        console.warn('Not a PDF file');
        return null;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
        console.warn('PDF file too large');
        return null;
    }

    try {
        // Extract text from PDF
        const text = await extractPDFText(file);

        if (!text || text.length < 50) {
            console.warn('Could not extract enough text from PDF');
            return null;
        }

        // Use AI to extract structured metadata
        const metadata = await extractMetadataWithAI(text);

        return metadata;
    } catch (error) {
        console.error('PDF metadata extraction failed:', error);
        return null;
    }
}

/**
 * Fallback: Extract basic metadata from filename
 */
export function extractFromFilename(filename: string): Partial<ExtractedMetadata> {
    const sanitizedName = sanitizeInput(filename);
    const name = sanitizedName.replace(/\.pdf$/i, '').replace(/[_-]/g, ' ');

    // Try to extract year from filename
    const yearMatch = name.match(/\b(19|20)\d{2}\b/);
    const year = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();

    return {
        title: name.trim() || 'Untitled',
        year,
        authors: ['Unknown']
    };
}
