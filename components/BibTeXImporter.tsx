/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { DownloadIcon, PlusIcon, FileTextIcon, LinkIcon } from './Icons';

interface BibTeXEntry {
    type: string;
    key: string;
    title?: string;
    author?: string;
    year?: string;
    journal?: string;
    booktitle?: string;
    volume?: string;
    number?: string;
    pages?: string;
    doi?: string;
    url?: string;
    abstract?: string;
    [key: string]: string | undefined;
}

interface BibTeXImporterProps {
    onImport: (entries: BibTeXEntry[]) => void;
    onClose: () => void;
}

// Parse BibTeX file content
const parseBibTeX = (content: string): BibTeXEntry[] => {
    const entries: BibTeXEntry[] = [];

    // Match @type{key, ... }
    const entryRegex = /@(\w+)\s*\{\s*([^,]+)\s*,\s*([\s\S]*?)\n\s*\}/gm;

    let match;
    while ((match = entryRegex.exec(content)) !== null) {
        const type = match[1].toLowerCase();
        const key = match[2].trim();
        const fieldsStr = match[3];

        const entry: BibTeXEntry = { type, key };

        // Parse each field - handles {value} and "value" and plain values
        // This regex captures: fieldName = {value with spaces} or "value" or plain_value
        const lines = fieldsStr.split('\n');

        for (const line of lines) {
            // Match field = value pattern
            const fieldMatch = line.match(/^\s*(\w+)\s*=\s*(.+?)\s*,?\s*$/);
            if (fieldMatch) {
                const fieldName = fieldMatch[1].toLowerCase();
                let fieldValue = fieldMatch[2].trim();

                // Remove surrounding braces {value}
                if (fieldValue.startsWith('{') && fieldValue.endsWith('}')) {
                    fieldValue = fieldValue.slice(1, -1);
                }
                // Remove surrounding quotes "value"
                else if (fieldValue.startsWith('"') && fieldValue.endsWith('"')) {
                    fieldValue = fieldValue.slice(1, -1);
                }
                // Remove trailing comma and braces
                fieldValue = fieldValue.replace(/[,}]+$/, '').trim();

                if (fieldValue) {
                    entry[fieldName] = fieldValue;
                }
            }
        }

        entries.push(entry);
    }

    return entries;
};

export default function BibTeXImporter({ onImport, onClose }: BibTeXImporterProps) {
    const [content, setContent] = useState('');
    const [parsedEntries, setParsedEntries] = useState<BibTeXEntry[]>([]);
    const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
    const [error, setError] = useState<string | null>(null);
    const [importMode, setImportMode] = useState<'paste' | 'file' | 'url'>('paste');
    const [urlInput, setUrlInput] = useState('');

    const handleParse = () => {
        setError(null);
        try {
            const entries = parseBibTeX(content);
            if (entries.length === 0) {
                setError('No valid BibTeX entries found. Please check the format.');
                return;
            }
            setParsedEntries(entries);
            setSelectedEntries(new Set(entries.map(e => e.key)));
        } catch (e) {
            setError('Failed to parse BibTeX. Please check the format.');
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            setContent(text);
        };
        reader.onerror = () => {
            setError('Failed to read file.');
        };
        reader.readAsText(file);
    };

    const toggleEntry = (key: string) => {
        const newSelected = new Set(selectedEntries);
        if (newSelected.has(key)) {
            newSelected.delete(key);
        } else {
            newSelected.add(key);
        }
        setSelectedEntries(newSelected);
    };

    const selectAll = () => {
        setSelectedEntries(new Set(parsedEntries.map(e => e.key)));
    };

    const selectNone = () => {
        setSelectedEntries(new Set());
    };

    const handleImport = () => {
        const entriesToImport = parsedEntries.filter(e => selectedEntries.has(e.key));
        onImport(entriesToImport);
        onClose();
    };

    return (
        <div className="bibtex-importer-overlay" onClick={onClose}>
            <div className="bibtex-importer-panel" onClick={e => e.stopPropagation()}>
                <div className="bibtex-header">
                    <h2><DownloadIcon /> Import References</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="import-tabs">
                    <button
                        className={`import-tab ${importMode === 'paste' ? 'active' : ''}`}
                        onClick={() => setImportMode('paste')}
                    >
                        Paste BibTeX
                    </button>
                    <button
                        className={`import-tab ${importMode === 'file' ? 'active' : ''}`}
                        onClick={() => setImportMode('file')}
                    >
                        Upload .bib File
                    </button>
                </div>

                {parsedEntries.length === 0 ? (
                    <div className="import-input-area">
                        {importMode === 'paste' && (
                            <>
                                <textarea
                                    className="bibtex-textarea"
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    placeholder={`Paste your BibTeX entries here...

Example:
@article{smith2023,
  title = {Example Paper Title},
  author = {Smith, John and Doe, Jane},
  journal = {Nature},
  year = {2023},
  volume = {123},
  pages = {1-10}
}`}
                                />
                            </>
                        )}

                        {importMode === 'file' && (
                            <div className="file-upload-area">
                                <FileTextIcon />
                                <p>Drop a .bib file here or click to browse</p>
                                <input
                                    type="file"
                                    accept=".bib,.bibtex,.txt"
                                    onChange={handleFileUpload}
                                />
                            </div>
                        )}

                        {error && <div className="import-error">{error}</div>}

                        <button
                            className="parse-btn"
                            onClick={handleParse}
                            disabled={!content.trim()}
                        >
                            Parse BibTeX
                        </button>
                    </div>
                ) : (
                    <div className="parsed-entries">
                        <div className="entries-actions">
                            <span>{parsedEntries.length} entries found</span>
                            <div className="selection-btns">
                                <button onClick={selectAll}>Select All</button>
                                <button onClick={selectNone}>Select None</button>
                            </div>
                        </div>

                        <div className="entries-list">
                            {parsedEntries.map(entry => (
                                <div
                                    key={entry.key}
                                    className={`entry-item ${selectedEntries.has(entry.key) ? 'selected' : ''}`}
                                    onClick={() => toggleEntry(entry.key)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedEntries.has(entry.key)}
                                        onChange={() => toggleEntry(entry.key)}
                                    />
                                    <div className="entry-info">
                                        <span className="entry-title">{entry.title || entry.key}</span>
                                        <span className="entry-meta">
                                            {entry.author && <span>{entry.author}</span>}
                                            {entry.year && <span> • {entry.year}</span>}
                                            {entry.journal && <span> • {entry.journal}</span>}
                                            {entry.booktitle && <span> • {entry.booktitle}</span>}
                                        </span>
                                    </div>
                                    <span className="entry-type">{entry.type}</span>
                                </div>
                            ))}
                        </div>

                        <div className="import-actions">
                            <button
                                className="btn-secondary"
                                onClick={() => setParsedEntries([])}
                            >
                                Back
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleImport}
                                disabled={selectedEntries.size === 0}
                            >
                                Import {selectedEntries.size} {selectedEntries.size === 1 ? 'Entry' : 'Entries'}
                            </button>
                        </div>
                    </div>
                )}

                <div className="import-help">
                    <p>💡 <strong>Tip:</strong> You can export references from Mendeley, Zotero, EndNote, or Google Scholar as BibTeX.</p>
                </div>
            </div>
        </div>
    );
}
