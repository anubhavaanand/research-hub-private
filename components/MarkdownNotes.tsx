/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect } from 'react';
import { EditIcon, CheckIcon, SparklesIcon } from './Icons';

interface MarkdownNotesProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
}

// Simple markdown parser for preview
const parseMarkdown = (text: string): string => {
    if (!text) return '';

    let html = text
        // Headers
        .replace(/^### (.*$)/gim, '<h4>$1</h4>')
        .replace(/^## (.*$)/gim, '<h3>$1</h3>')
        .replace(/^# (.*$)/gim, '<h2>$1</h2>')
        // Bold
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        // Code blocks
        .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
        // Inline code
        .replace(/`(.*?)`/gim, '<code>$1</code>')
        // Links
        .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" rel="noopener">$1</a>')
        // Lists
        .replace(/^\s*[-*]\s+(.*$)/gim, '<li>$1</li>')
        // Blockquotes
        .replace(/^>\s+(.*$)/gim, '<blockquote>$1</blockquote>')
        // Line breaks
        .replace(/\n/gim, '<br>');

    // Wrap consecutive li elements in ul
    html = html.replace(/(<li>.*?<\/li>(<br>)?)+/gim, (match) => {
        return '<ul>' + match.replace(/<br>/g, '') + '</ul>';
    });

    // Basic LaTeX-like math support (inline)
    html = html.replace(/\$([^$]+)\$/gim, '<span class="math-inline">$1</span>');

    return html;
};

export default function MarkdownNotes({ value, onChange, placeholder, label }: MarkdownNotesProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
            // Auto-resize
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [isEditing, value]);

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value);
        // Auto-resize
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    };

    const insertTemplate = (template: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = value.substring(0, start) + template + value.substring(end);
        onChange(newValue);

        // Set cursor position after template
        setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + template.length;
            textarea.focus();
        }, 0);
    };

    const templates = [
        { label: 'H1', insert: '# Heading\n' },
        { label: 'H2', insert: '## Subheading\n' },
        { label: 'B', insert: '**bold**' },
        { label: 'I', insert: '*italic*' },
        { label: '•', insert: '- List item\n' },
        { label: '`', insert: '`code`' },
        { label: '```', insert: '```\ncode block\n```' },
        { label: '>', insert: '> Quote\n' },
        { label: '∑', insert: ' $formula$ ' }
    ];

    return (
        <div className="markdown-notes">
            {label && (
                <div className="markdown-header">
                    <label>{label}</label>
                    <div className="markdown-actions">
                        <button
                            className="markdown-help-btn"
                            onClick={() => setShowHelp(!showHelp)}
                            title="Markdown Help"
                        >
                            ?
                        </button>
                        <button
                            className={`markdown-toggle-btn ${isEditing ? 'active' : ''}`}
                            onClick={() => setIsEditing(!isEditing)}
                        >
                            {isEditing ? <><CheckIcon /> Preview</> : <><EditIcon /> Edit</>}
                        </button>
                    </div>
                </div>
            )}

            {showHelp && (
                <div className="markdown-help">
                    <p><strong>Markdown Shortcuts:</strong></p>
                    <ul>
                        <li><code># H1</code>, <code>## H2</code>, <code>### H3</code> - Headings</li>
                        <li><code>**bold**</code> - Bold text</li>
                        <li><code>*italic*</code> - Italic text</li>
                        <li><code>`code`</code> - Inline code</li>
                        <li><code>```code```</code> - Code block</li>
                        <li><code>- item</code> - Bullet list</li>
                        <li><code>&gt; quote</code> - Blockquote</li>
                        <li><code>[text](url)</code> - Link</li>
                        <li><code>$formula$</code> - Math formula</li>
                    </ul>
                </div>
            )}

            {isEditing && (
                <div className="markdown-toolbar">
                    {templates.map((t, i) => (
                        <button
                            key={i}
                            className="toolbar-btn"
                            onClick={() => insertTemplate(t.insert)}
                            title={t.insert}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            )}

            {isEditing ? (
                <textarea
                    ref={textareaRef}
                    className="markdown-textarea"
                    value={value}
                    onChange={handleTextareaChange}
                    placeholder={placeholder || 'Write your notes here... (Markdown supported)'}
                />
            ) : (
                <div
                    className="markdown-preview"
                    onClick={() => setIsEditing(true)}
                >
                    {value ? (
                        <div
                            className="markdown-content"
                            dangerouslySetInnerHTML={{ __html: parseMarkdown(value) }}
                        />
                    ) : (
                        <p className="markdown-placeholder">
                            {placeholder || 'Click to add notes... (Markdown supported)'}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
