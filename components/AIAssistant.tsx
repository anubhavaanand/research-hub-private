/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
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

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const apiKey = process.env.API_KEY;
            if (!apiKey) {
                throw new Error('API key not configured');
            }

            const ai = new GoogleGenAI({ apiKey });

            const systemPrompt = `You are a helpful AI research assistant for academics. You help with:
- Summarizing and explaining research papers
- Citation styles (APA, MLA, Chicago, IEEE, Harvard)
- Research methodology and best practices
- Academic writing tips
- Finding research directions

${context ? `Current context: The user is viewing a paper with the following abstract: "${context}"` : ''}

Be concise, helpful, and academic in tone. Use markdown formatting when appropriate.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: {
                    role: 'user',
                    parts: [{ text: `${systemPrompt}\n\nUser question: ${userMessage.content}` }]
                }
            });

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.text || 'I apologize, but I couldn\'t generate a response. Please try again.',
                timestamp: Date.now()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('AI Assistant error:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: '❌ Sorry, I encountered an error. Please check your API key configuration or try again later.',
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
        { label: 'Summarize', prompt: 'Can you summarize the key points of this paper?' },
        { label: 'Explain APA', prompt: 'How do I cite in APA 7th edition format?' },
        { label: 'Methodology', prompt: 'What are best practices for research methodology?' },
        { label: 'Writing Tips', prompt: 'Give me tips for academic writing.' }
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
