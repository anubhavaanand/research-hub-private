/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

interface WelcomeGuideProps {
    onClose: () => void;
}

export default function WelcomeGuide({ onClose }: WelcomeGuideProps) {
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
        }}>
            <div style={{
                background: 'linear-gradient(135deg, rgba(20, 20, 40, 0.95), rgba(40, 20, 60, 0.95))',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '24px',
                maxWidth: '700px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                padding: '40px',
                boxShadow: '0 25px 50px -12px rgba(139, 92, 246, 0.5)',
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #a78bfa, #ec4899)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '12px'
                    }}>
                        📚 Welcome to Research Hub
                    </h1>
                    <p style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '1.1rem'
                    }}>
                        Your intelligent research paper management system
                    </p>
                </div>

                <div style={{ marginBottom: '32px' }}>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        color: '#a78bfa',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        ✨ Features
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                            { icon: '📄', title: 'Paper Management', desc: 'Add, organize, and track research papers with metadata' },
                            { icon: '🏷️', title: 'Smart Tagging', desc: 'Categorize papers with custom tags and filters' },
                            { icon: '⭐', title: 'Favorites', desc: 'Mark important papers and access them quickly' },
                            { icon: '📊', title: 'Reading Status', desc: 'Track progress with To Read, Reading, and Read statuses' },
                            { icon: '🔍', title: 'Instant Search', desc: 'Search by title, author, tags, or content' },
                            { icon: '📑', title: 'AI Citations', desc: 'Generate citations in APA, MLA, Chicago, IEEE formats' },
                            { icon: '💾', title: 'Local Storage', desc: 'All data saved in your browser - works offline!' }
                        ].map((feature, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                gap: '12px',
                                padding: '16px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                                <span style={{ fontSize: '1.5rem' }}>{feature.icon}</span>
                                <div>
                                    <h3 style={{
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        color: '#fff',
                                        marginBottom: '4px'
                                    }}>
                                        {feature.title}
                                    </h3>
                                    <p style={{
                                        fontSize: '0.9rem',
                                        color: 'rgba(255, 255, 255, 0.6)',
                                        margin: 0
                                    }}>
                                        {feature.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: '32px' }}>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        color: '#ec4899',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        🚀 Getting Started
                    </h2>
                    <ol style={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '1rem',
                        lineHeight: '1.8',
                        paddingLeft: '24px'
                    }}>
                        <li>Click <strong>"+ Add Paper"</strong> to manually enter paper details</li>
                        <li>Use <strong>filters</strong> on the left to organize by type or status</li>
                        <li>Click any paper to view full details and generate citations</li>
                        <li>Add <strong>personal notes</strong> and track citation counts</li>
                        <li><strong>Optional:</strong> Add Google Gemini API key for AI citation generation</li>
                    </ol>
                </div>

                <div style={{
                    padding: '16px',
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '12px',
                    marginBottom: '24px'
                }}>
                    <h3 style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: '#a78bfa',
                        marginBottom: '8px'
                    }}>
                        🔑 AI Citation Generation (Optional)
                    </h3>
                    <p style={{
                        fontSize: '0.9rem',
                        color: 'rgba(255, 255, 255, 0.7)',
                        margin: 0,
                        lineHeight: '1.6'
                    }}>
                        To enable AI-powered citations:
                        <br />
                        1. Get a free API key from <a 
                            href="https://aistudio.google.com/app/apikey" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: '#a78bfa', textDecoration: 'underline' }}
                        >Google AI Studio</a>
                        <br />
                        2. Create a <code style={{ 
                            background: 'rgba(0, 0, 0, 0.3)', 
                            padding: '2px 6px', 
                            borderRadius: '4px',
                            color: '#fff'
                        }}>.env</code> file in the project root
                        <br />
                        3. Add: <code style={{ 
                            background: 'rgba(0, 0, 0, 0.3)', 
                            padding: '2px 6px', 
                            borderRadius: '4px',
                            color: '#fff'
                        }}>API_KEY=your_key_here</code>
                    </p>
                </div>

                <div style={{
                    padding: '16px',
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: '12px',
                    marginBottom: '24px'
                }}>
                    <h3 style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: '#4ade80',
                        marginBottom: '8px'
                    }}>
                        🔒 Security & Privacy
                    </h3>
                    <ul style={{
                        fontSize: '0.9rem',
                        color: 'rgba(255, 255, 255, 0.7)',
                        margin: 0,
                        paddingLeft: '24px',
                        lineHeight: '1.6'
                    }}>
                        <li>All data stored locally in your browser</li>
                        <li>API keys validated and rate-limited (60 requests/min)</li>
                        <li>No data sent to external servers (except AI citations)</li>
                        <li>Your research stays private and secure</li>
                    </ul>
                </div>

                <button
                    onClick={onClose}
                    style={{
                        width: '100%',
                        padding: '16px',
                        background: 'linear-gradient(135deg, #a78bfa, #ec4899)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    Get Started 🎉
                </button>
            </div>
        </div>
    );
}
