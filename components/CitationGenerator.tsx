/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Paper, CitationStyle } from '../types';
import { SparklesIcon, CheckIcon } from './Icons';

interface CitationGeneratorProps {
    paper: Paper;
}

export default function CitationGenerator({ paper }: CitationGeneratorProps) {
    const [style, setStyle] = useState<CitationStyle>('APA7');
    const [citation, setCitation] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const generateCitation = async () => {
        setIsLoading(true);
        setCitation('');
        
        try {
            const apiKey = process.env.API_KEY || import.meta.env.VITE_API_KEY;
            if (!apiKey) {
                setCitation("⚠️ API Key not configured. Please add your Google Gemini API key to .env file.\n\nGet your free key at: https://aistudio.google.com/app/apikey\n\nThen create a .env file with: API_KEY=your_key_here");
                setIsLoading(false);
                return;
            }

            const ai = new GoogleGenAI({ apiKey });
            
            // Construct a prompt that asks for a raw string
            const prompt = `
                Generate a bibliographic citation for the following academic paper in **${style}** format.
                Return ONLY the raw citation string. No markdown formatting.
                
                Metadata:
                Title: ${paper.title}
                Authors: ${paper.authors.join(', ')}
                Publication (Journal/Conf): ${paper.publication}
                Year: ${paper.year}
                Volume: ${paper.volume || 'N/A'}
                Issue: ${paper.issue || 'N/A'}
                Pages: ${paper.pages || 'N/A'}
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash-exp',
                contents: { role: 'user', parts: [{ text: prompt }] }
            });

            const text = response.text || '';
            setCitation(text.trim());
        } catch (e: any) {
            console.error('Citation generation error:', e);
            const errorMsg = e?.message || 'Unknown error';
            setCitation(`❌ Failed to generate citation.\n\nError: ${errorMsg}\n\nPlease check:\n1. Your API key is valid\n2. You have internet connection\n3. The Gemini API is accessible`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (!citation) return;
        navigator.clipboard.writeText(citation);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                    <select 
                        value={style} 
                        onChange={(e) => setStyle(e.target.value as CitationStyle)}
                        style={{ 
                            background: 'rgba(255,255,255,0.05)', 
                            color: 'var(--text-primary)', 
                            border: '1px solid var(--border-glass)', 
                            padding: '6px 12px', 
                            borderRadius: '8px', 
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            outline: 'none',
                            appearance: 'none',
                            paddingRight: '24px'
                        }}
                    >
                        <option value="APA7">APA 7th Ed.</option>
                        <option value="IEEE">IEEE</option>
                        <option value="Harvard">Harvard</option>
                        <option value="MLA">MLA 9</option>
                    </select>
                    <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '0.6rem', color: 'var(--text-muted)' }}>▼</div>
                </div>
                
                <button 
                    onClick={generateCitation} 
                    disabled={isLoading}
                    className="ai-action-btn"
                    style={{ 
                        opacity: isLoading ? 0.7 : 1,
                        background: isLoading ? 'var(--glass-light)' : 'transparent'
                    }}
                >
                    {isLoading ? 'Thinking...' : <><SparklesIcon /> Generate</>}
                </button>
            </div>

            <div 
                onClick={citation ? handleCopy : undefined}
                style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '8px',
                    padding: '16px',
                    minHeight: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: citation ? 'pointer' : 'default',
                    position: 'relative',
                    transition: 'all 0.2s'
                }}
            >
                {citation ? (
                    <>
                        <p style={{ 
                            margin: 0, 
                            fontFamily: 'var(--font-mono)', 
                            fontSize: '0.85rem', 
                            lineHeight: '1.5',
                            color: 'var(--text-secondary)',
                            width: '100%'
                        }}>
                            {citation}
                        </p>
                        <div style={{ 
                            position: 'absolute', 
                            top: '8px', 
                            right: '8px', 
                            color: copied ? 'var(--success)' : 'transparent',
                            transition: 'color 0.2s'
                        }}>
                            <CheckIcon />
                        </div>
                    </>
                ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                        {isLoading ? 'Gemini is crafting your citation...' : 'Select a style and generate to see the result.'}
                    </span>
                )}
            </div>
        </div>
    );
}
