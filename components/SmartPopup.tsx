/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { Paper } from '../types';
import { ExternalLinkIcon, FileTextIcon } from './Icons';

interface SmartPopupProps {
    paper: Paper;
    position: { x: number; y: number };
    onClose: () => void;
    onOpenPaper: (id: string) => void;
}

export default function SmartPopup({ paper, position, onClose, onOpenPaper }: SmartPopupProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Animate in
        setTimeout(() => setIsVisible(true), 10);

        // Close on escape or outside click
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    // Adjust position to stay within viewport
    const adjustedPosition = {
        x: Math.min(position.x, window.innerWidth - 350),
        y: Math.min(position.y, window.innerHeight - 300)
    };

    return (
        <div
            className={`smart-popup ${isVisible ? 'visible' : ''}`}
            style={{
                left: adjustedPosition.x,
                top: adjustedPosition.y
            }}
            onMouseLeave={onClose}
        >
            <div className="popup-arrow" />
            <div className="popup-content">
                <div className="popup-header">
                    <span className={`popup-status status-${paper.status}`}>
                        {paper.status === 'toread' ? 'To Read' : paper.status}
                    </span>
                    <span className="popup-type">{paper.type}</span>
                </div>

                <h3 className="popup-title">{paper.title}</h3>

                <p className="popup-authors">
                    {paper.authors.slice(0, 3).join(', ')}
                    {paper.authors.length > 3 && ` +${paper.authors.length - 3} more`}
                </p>

                <div className="popup-meta">
                    <span>{paper.year}</span>
                    <span>•</span>
                    <span>{paper.publication}</span>
                    {paper.citationCount > 0 && (
                        <>
                            <span>•</span>
                            <span>{paper.citationCount.toLocaleString()} citations</span>
                        </>
                    )}
                </div>

                {paper.abstract && (
                    <p className="popup-abstract">
                        {paper.abstract.length > 200
                            ? paper.abstract.substring(0, 200) + '...'
                            : paper.abstract
                        }
                    </p>
                )}

                {paper.tags.length > 0 && (
                    <div className="popup-tags">
                        {paper.tags.slice(0, 4).map(tag => (
                            <span key={tag} className="popup-tag">{tag}</span>
                        ))}
                    </div>
                )}

                <div className="popup-actions">
                    <button
                        className="popup-btn primary"
                        onClick={() => onOpenPaper(paper.id)}
                    >
                        <FileTextIcon /> View Details
                    </button>
                    {paper.doi && (
                        <a
                            href={`https://doi.org/${paper.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="popup-btn"
                        >
                            <ExternalLinkIcon /> DOI
                        </a>
                    )}
                    {paper.url && (
                        <a
                            href={paper.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="popup-btn"
                        >
                            <ExternalLinkIcon /> Link
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

// Hook to manage popup state
export function useSmartPopup() {
    const [popupPaper, setPopupPaper] = useState<Paper | null>(null);
    const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
    const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

    const showPopup = (paper: Paper, event: React.MouseEvent) => {
        // Delay showing popup
        const timeout = setTimeout(() => {
            setPopupPaper(paper);
            setPopupPosition({ x: event.clientX + 10, y: event.clientY + 10 });
        }, 500); // 500ms hover delay
        setHoverTimeout(timeout);
    };

    const hidePopup = () => {
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            setHoverTimeout(null);
        }
        setPopupPaper(null);
    };

    return {
        popupPaper,
        popupPosition,
        showPopup,
        hidePopup
    };
}
