/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SparklesIcon, SearchIcon } from './Icons';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

interface AIAssistantProps {
    isOpen: boolean;
    onClose: () => void;
    context?: string; // Optional context like current paper abstract
}

export default function AIAssistant({ isOpen, onClose, context }: AIAssistantProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "👋 Hi! I'm your AI Research Assistant. I can help you with:\n\n• Summarizing papers\n• Explaining citation styles\n• Research methodology questions\n• Finding related topics\n• Writing assistance\n\nHow can I help you today?",
            timestamp: Date.now()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        // Import rate limiter
        const { canMakeRequest, recordRequest, getCachedResponse, cacheResponse, createCacheKey, getUsageStats } =
            await import('../utils/apiRateLimiter');

        // Check rate limits first
        const rateCheck = canMakeRequest();
        if (!rateCheck.allowed) {
            const usageStats = getUsageStats();
            const errorMessage: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: `⏳ ${rateCheck.reason}\n\n📊 Today's usage: ${usageStats.used}/${usageStats.limit} requests`,
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, errorMessage]);
            return;
        }

        // Sanitize input to prevent prompt injection
        const sanitizedInput = input.trim()
            .slice(0, 1000) // Limit input length
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
            .replace(/\{\{.*?\}\}/g, '') // Remove template injections
            .replace(/\$\{.*?\}/g, ''); // Remove JS template literals

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: sanitizedInput,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');

        // Check cache for similar questions
        const cacheKey = createCacheKey(sanitizedInput, context || '');
        const cachedResponse = getCachedResponse(cacheKey);

        if (cachedResponse) {
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: cachedResponse + '\n\n_💾 (cached)_',
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, assistantMessage]);
            return;
        }

        setIsLoading(true);

        try {
            const apiKey = process.env.API_KEY;
            if (!apiKey) {
                throw new Error('API key not configured');
            }

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel(
                { model: 'gemini-2.5-flash' },
                { apiVersion: 'v1' }
            );

            const prompt = `You are a concise AI research assistant. Give brief, helpful answers about academic research, citations, and papers.${context ? ` Context: "${context.slice(0, 200)}"` : ''}\n\nQ: ${sanitizedInput}`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const responseText = response.text() || 'I apologize, but I couldn\'t generate a response.';

            // Record successful request for rate limiting
            recordRequest();

            // Cache the response
            cacheResponse(cacheKey, responseText);

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: responseText,
                timestamp: Date.now()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('AI Assistant error:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: '❌ Error: Please check your API key or try again later.',
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const quickActions = [
        { label: '📝 Summarize Paper', prompt: 'Can you summarize the key points of this paper?', desc: 'Get a concise summary' },
        { label: '📚 APA Citation Help', prompt: 'How do I cite in APA 7th edition format? Give me examples.', desc: 'Citation formatting' },
        { label: '🔬 Research Methods', prompt: 'What are best practices for research methodology in academic papers?', desc: 'Methodology tips' },
        { label: '✍️ Writing Tips', prompt: 'Give me tips for academic writing style and structure.', desc: 'Improve your writing' },
        { label: '🔍 Find Keywords', prompt: 'What are good keywords and search terms for literature review on this topic?', desc: 'Search optimization' },
        { label: '📊 Data Analysis', prompt: 'What statistical methods should I consider for research data analysis?', desc: 'Analytics guidance' }
    ];

    if (!isOpen) return null;

    return (
        <div className="ai-assistant-overlay" onClick={onClose}>
            <div className="ai-assistant-panel" onClick={e => e.stopPropagation()}>
                <div className="ai-assistant-header">
                    <div className="ai-header-title">
                        <SparklesIcon />
                        <span>AI Research Assistant</span>
                    </div>
                    <button className="ai-close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="ai-messages">
                    {messages.map(msg => (
                        <div key={msg.id} className={`ai-message ${msg.role}`}>
                            <div className="ai-message-content">
                                {msg.content.split('\n').map((line, i) => (
                                    <p key={i}>{line || <br />}</p>
                                ))}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="ai-message assistant">
                            <div className="ai-message-content typing">
                                <span className="dot"></span>
                                <span className="dot"></span>
                                <span className="dot"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="ai-quick-actions">
                    {quickActions.map((action, i) => (
                        <button
                            key={i}
                            className="quick-action-btn"
                            onClick={() => setInput(action.prompt)}
                        >
                            {action.label}
                        </button>
                    ))}
                </div>

                <div className="ai-input-area">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Ask anything about research..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                    />
                    <button
                        className="ai-send-btn"
                        onClick={sendMessage}
                        disabled={!input.trim() || isLoading}
                    >
                        {isLoading ? '...' : '→'}
                    </button>
                </div>
            </div>
        </div>
    );
}
