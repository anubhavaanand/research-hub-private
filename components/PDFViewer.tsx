/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FileTextIcon, SearchIcon, PlusIcon } from './Icons';

interface PDFViewerProps {
    fileUrl: string;
    fileName: string;
    onClose: () => void;
}

export default function PDFViewer({ fileUrl, fileName, onClose }: PDFViewerProps) {
    const [scale, setScale] = useState(1);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
    const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
    const resetZoom = () => setScale(1);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
            if (e.ctrlKey && e.key === '+') {
                e.preventDefault();
                zoomIn();
            }
            if (e.ctrlKey && e.key === '-') {
                e.preventDefault();
                zoomOut();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div className={`pdf-viewer-overlay ${isDarkMode ? 'dark' : 'light'}`}>
            <div className="pdf-viewer-container">
                {/* Toolbar */}
                <div className="pdf-toolbar">
                    <div className="pdf-toolbar-left">
                        <FileTextIcon />
                        <span className="pdf-filename">{fileName}</span>
                    </div>

                    <div className="pdf-toolbar-center">
                        <button className="pdf-tool-btn" onClick={zoomOut} title="Zoom Out">
                            −
                        </button>
                        <span className="zoom-level">{Math.round(scale * 100)}%</span>
                        <button className="pdf-tool-btn" onClick={zoomIn} title="Zoom In">
                            +
                        </button>
                        <button className="pdf-tool-btn" onClick={resetZoom} title="Reset Zoom">
                            Reset
                        </button>
                        <div className="toolbar-divider" />
                        <button
                            className="pdf-tool-btn"
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            title="Search (Ctrl+F)"
                        >
                            <SearchIcon />
                        </button>
                        <div className="toolbar-divider" />
                        <button
                            className={`pdf-tool-btn ${isDarkMode ? 'active' : ''}`}
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            title="Toggle Dark Mode"
                        >
                            {isDarkMode ? '☀️' : '🌙'}
                        </button>
                    </div>

                    <div className="pdf-toolbar-right">
                        <button className="pdf-close-btn" onClick={onClose}>
                            ✕ Close
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                {isSearchOpen && (
                    <div className="pdf-search-bar">
                        <SearchIcon />
                        <input
                            type="text"
                            placeholder="Search in document..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                        <span className="search-hint">Press Enter to search</span>
                        <button onClick={() => setIsSearchOpen(false)}>✕</button>
                    </div>
                )}

                {/* PDF Content */}
                <div
                    className="pdf-content"
                    ref={containerRef}
                    style={{
                        filter: isDarkMode ? 'invert(0.88) hue-rotate(180deg)' : 'none'
                    }}
                >
                    <iframe
                        ref={iframeRef}
                        src={`${fileUrl}#toolbar=0&navpanes=0`}
                        className="pdf-iframe"
                        style={{
                            transform: `scale(${scale})`,
                            transformOrigin: 'top center'
                        }}
                        title="PDF Viewer"
                    />
                </div>
            </div>
        </div>
    );
}
