/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { Paper, PaperType, ReadingStatus } from './types';
import { generateId, formatDate } from './utils';
import { 
    SearchIcon, FolderIcon, FileTextIcon, 
    PlusIcon, StarIcon, QuoteIcon, TrashIcon 
} from './components/Icons';
import CitationGenerator from './components/CitationGenerator';
import DottedGlowBackground from './components/DottedGlowBackground';
import WelcomeGuide from './components/WelcomeGuide';
import { GoogleGenAI } from '@google/genai';

function App() {
    const [papers, setPapers] = useState<Paper[]>([]);
    const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'date' | 'year' | 'citations' | 'impact'>('date');
    const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
    const [toasts, setToasts] = useState<string[]>([]);
    const [showWelcome, setShowWelcome] = useState(false);
    
    // File input ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load papers from localStorage on mount
    useEffect(() => {
        const savedPapers = localStorage.getItem('researchPapers');
        const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
        
        if (savedPapers) {
            setPapers(JSON.parse(savedPapers));
        }
        
        // Show welcome guide only on first visit
        if (!hasSeenWelcome) {
            setShowWelcome(true);
            localStorage.setItem('hasSeenWelcome', 'true');
        }
    }, []);

    // Save papers to localStorage whenever they change
    useEffect(() => {
        if (papers.length > 0) {
            localStorage.setItem('researchPapers', JSON.stringify(papers));
        }
    }, [papers]);

    // --- Derived Data & Stats ---

    const filteredPapers = useMemo(() => {
        let result = papers.filter(p => {
            const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  p.authors.some(a => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
                                  p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
            
            const matchesFilter = activeFilter === 'all' ? true :
                                  activeFilter === 'favorites' ? p.isFavorite :
                                  activeFilter === 'toread' ? p.status === 'toread' :
                                  activeFilter === 'reading' ? p.status === 'reading' :
                                  activeFilter === 'read' ? p.status === 'read' :
                                  p.type === activeFilter;
            
            return matchesSearch && matchesFilter;
        });

        // Sorting
        result.sort((a, b) => {
            if (sortBy === 'date') return b.addedAt - a.addedAt;
            if (sortBy === 'year') return b.year - a.year;
            if (sortBy === 'citations' || sortBy === 'impact') return b.citationCount - a.citationCount;
            return 0;
        });

        return result;
    }, [papers, activeFilter, searchQuery, sortBy]);

    const selectedPaper = papers.find(p => p.id === selectedPaperId);

    // Stats Calculation
    const stats = useMemo(() => {
        const total = papers.length;
        const read = papers.filter(p => p.status === 'read').length;
        const reading = papers.filter(p => p.status === 'reading').length;
        const toread = papers.filter(p => p.status === 'toread').length;
        const totalCitations = papers.reduce((acc, p) => acc + (p.citationCount || 0), 0);
        
        // Year Distribution (Last 5 years + Older)
        const currentYear = new Date().getFullYear();
        const yearDist = Array.from({length: 6}, (_, i) => {
            const y = currentYear - i;
            if (i === 5) return { label: `<${y + 1}`, count: papers.filter(p => p.year <= y).length };
            return { label: `${y}`, count: papers.filter(p => p.year === y).length };
        }).reverse();

        return { total, read, reading, toread, totalCitations, yearDist };
    }, [papers]);

    // --- Handlers ---

    const addToast = (msg: string) => {
        setToasts(prev => [...prev, msg]);
        setTimeout(() => setToasts(prev => prev.slice(1)), 3000);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const newPaper: Paper = {
            id: generateId(),
            title: file.name.replace(/\.[^/.]+$/, ""), // remove extension
            authors: ["Unknown Author"],
            type: 'other',
            publication: "Unpublished",
            year: new Date().getFullYear(),
            addedAt: Date.now(),
            isFavorite: false,
            fileName: file.name,
            fileUrl: URL.createObjectURL(file),
            status: 'toread',
            tags: [],
            citationCount: 0
        };

        setPapers(prev => [newPaper, ...prev]);
        setSelectedPaperId(newPaper.id);
        setIsRightPanelOpen(true);
        addToast("File uploaded successfully");
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this paper?")) {
            setPapers(prev => prev.filter(p => p.id !== id));
            if (selectedPaperId === id) {
                setSelectedPaperId(null);
                setIsRightPanelOpen(false);
            }
            addToast("Paper deleted");
        }
    };

    const toggleFavorite = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setPapers(prev => prev.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p));
    };

    const updatePaper = (id: string, updates: Partial<Paper>) => {
        setPapers(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    };

    const handleAuthorChange = (val: string) => {
        if (!selectedPaperId) return;
        const authors = val.split(',').map(s => s.trim());
        updatePaper(selectedPaperId, { authors });
    };

    const handleTagsChange = (val: string) => {
        if (!selectedPaperId) return;
        const tags = val.split(',').map(s => s.trim()).filter(s => s.length > 0);
        updatePaper(selectedPaperId, { tags });
    };
    
    const summarizeAbstract = async () => {
        if (!selectedPaper || !selectedPaper.abstract) return;
        try {
            addToast("Summarizing abstract...");
            const apiKey = process.env.API_KEY;
            if(!apiKey) return;
            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: { 
                    role: 'user', 
                    parts: [{ text: `Summarize this academic abstract into one concise sentence:\n\n${selectedPaper.abstract}` }] 
                }
            });
            const summary = response.text;
            if (summary) updatePaper(selectedPaper.id, { abstract: summary });
            addToast("Abstract summarized by AI");
        } catch (e) {
            console.error(e);
            addToast("Summarization failed");
        }
    };

    return (
        <div className="app-container">
            {/* Background Animation */}
            <div className="ambient-background">
                <DottedGlowBackground 
                    gap={24} 
                    radius={1} 
                    color="rgba(255, 255, 255, 0.05)" 
                    glowColor="rgba(59, 130, 246, 0.4)" 
                />
                <div className="ambient-gradient-1"></div>
                <div className="ambient-gradient-2"></div>
            </div>

            {/* Notifications */}
            <div className="toast-container">
                {toasts.map((msg, i) => (
                    <div key={i} className="toast">{msg}</div>
                ))}
            </div>

            {/* Welcome Guide */}
            {showWelcome && <WelcomeGuide onClose={() => setShowWelcome(false)} />}

            {/* Sidebar */}
            <aside className="sidebar">
                <div className="brand">
                    <div className="brand-icon">
                        <div className="brand-dot"></div>
                    </div>
                    <span className="brand-text">Research Hub</span>
                    <button
                        onClick={() => setShowWelcome(true)}
                        style={{
                            marginLeft: 'auto',
                            padding: '6px 12px',
                            background: 'rgba(139, 92, 246, 0.2)',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            borderRadius: '8px',
                            color: '#a78bfa',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        title="Show Welcome Guide"
                    >
                        ?
                    </button>
                </div>

                <nav className="nav-container">
                    <div className="nav-group">
                        <div className="nav-label">Library</div>
                        <div className={`nav-item ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>
                            <FolderIcon /> <span>All Papers</span>
                        </div>
                        <div className={`nav-item ${activeFilter === 'favorites' ? 'active' : ''}`} onClick={() => setActiveFilter('favorites')}>
                            <StarIcon /> <span>Favorites</span>
                        </div>
                    </div>

                    <div className="nav-group">
                        <div className="nav-label">Reading List</div>
                        <div className={`nav-item ${activeFilter === 'toread' ? 'active' : ''}`} onClick={() => setActiveFilter('toread')}>
                            <div className="status-dot toread"></div> <span>To Read</span>
                            <span className="nav-count">{stats.toread}</span>
                        </div>
                        <div className={`nav-item ${activeFilter === 'reading' ? 'active' : ''}`} onClick={() => setActiveFilter('reading')}>
                            <div className="status-dot reading"></div> <span>Reading</span>
                            <span className="nav-count">{stats.reading}</span>
                        </div>
                        <div className={`nav-item ${activeFilter === 'read' ? 'active' : ''}`} onClick={() => setActiveFilter('read')}>
                            <div className="status-dot read"></div> <span>Read</span>
                            <span className="nav-count">{stats.read}</span>
                        </div>
                    </div>

                    <div className="nav-group">
                        <div className="nav-label">Types</div>
                        <div className={`nav-item ${activeFilter === 'journal' ? 'active' : ''}`} onClick={() => setActiveFilter('journal')}>
                            <FileTextIcon /> <span>Journals</span>
                        </div>
                        <div className={`nav-item ${activeFilter === 'conference' ? 'active' : ''}`} onClick={() => setActiveFilter('conference')}>
                            <QuoteIcon /> <span>Conferences</span>
                        </div>
                    </div>
                </nav>

                {/* Dashboard / Stats Widget */}
                <div className="stats-card">
                    <h4>Research Analytics</h4>
                    
                    <div className="progress-section">
                        <div className="progress-header">
                            <span>Reading Progress</span>
                            <span>{Math.round((stats.read / stats.total) * 100 || 0)}%</span>
                        </div>
                        <div className="progress-bar-bg">
                            <div className="progress-bar-fill" style={{width: `${(stats.read / stats.total) * 100}%`}}></div>
                        </div>
                    </div>

                    <div className="stats-grid-mini">
                        <div className="stat-mini">
                            <span className="val">{stats.totalCitations.toLocaleString()}</span>
                            <span className="lbl">Global Citations</span>
                        </div>
                    </div>

                    <div className="chart-container">
                        <span className="chart-label">Timeline</span>
                        <div className="bar-chart">
                            {stats.yearDist.map((d, i) => (
                                <div key={i} className="bar-col" title={`${d.label}: ${d.count}`}>
                                    <div 
                                        className="bar-fill" 
                                        style={{height: `${Math.max(10, (d.count / stats.total) * 100)}%`}}
                                    ></div>
                                    <span className="bar-label">{d.label.slice(-2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="top-bar">
                    <div className="search-wrapper">
                        <SearchIcon />
                        <input 
                            type="text" 
                            placeholder="Search by title, author, or #tags..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <div className="actions">
                        <div className="sort-dropdown">
                            <span className="sort-label">Sort by:</span>
                            <select 
                                value={sortBy} 
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="glass-select"
                            >
                                <option value="date">Date Added</option>
                                <option value="year">Year Published</option>
                                <option value="citations">Impact Factor</option>
                            </select>
                        </div>

                        <div className="divider-vertical"></div>

                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            style={{display: 'none'}} 
                            onChange={handleFileUpload} 
                            accept=".pdf,.doc,.docx,.txt"
                        />
                        <button className="add-btn" onClick={() => fileInputRef.current?.click()}>
                            <PlusIcon /> <span>Add Paper</span>
                        </button>
                    </div>
                </header>

                <div className="doc-grid-container">
                    {filteredPapers.length === 0 ? (
                        <div className="empty-state">
                            <p>No papers found</p>
                        </div>
                    ) : (
                        <div className="doc-grid">
                            {filteredPapers.map((paper, index) => (
                                <div 
                                    key={paper.id} 
                                    className={`doc-card ${selectedPaperId === paper.id ? 'selected' : ''}`}
                                    onClick={() => {
                                        setSelectedPaperId(paper.id);
                                        setIsRightPanelOpen(true);
                                    }}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="doc-card-inner">
                                        <div className="doc-header">
                                            <div className="status-badge" data-status={paper.status}>
                                                {paper.status === 'toread' ? 'To Read' : paper.status}
                                            </div>
                                            <button 
                                                className={`fav-btn ${paper.isFavorite ? 'active' : ''}`}
                                                onClick={(e) => toggleFavorite(paper.id, e)} 
                                            >
                                                <StarIcon filled={paper.isFavorite} />
                                            </button>
                                        </div>
                                        
                                        <div className="doc-meta">
                                            <h3 className="doc-title" title={paper.title}>{paper.title}</h3>
                                            <p className="doc-authors">{paper.authors.join(', ')}</p>
                                        </div>

                                        <div className="tags-row">
                                            {paper.tags.slice(0, 3).map(tag => (
                                                <span key={tag} className="tag-pill">{tag}</span>
                                            ))}
                                            {paper.tags.length > 3 && <span className="tag-pill">+{paper.tags.length - 3}</span>}
                                        </div>

                                        <div className="doc-footer">
                                            <span className="type-badge">{paper.type}</span>
                                            <span className="year-badge">{paper.year} • {paper.citationCount > 0 ? `${(paper.citationCount/1000).toFixed(1)}k cites` : '0 cites'}</span>
                                        </div>
                                    </div>
                                    <div className="doc-glow"></div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Right Panel */}
            <aside className={`right-panel ${isRightPanelOpen && selectedPaper ? 'open' : ''}`}>
                {selectedPaper ? (
                    <>
                        <div className="panel-header">
                            <div className="panel-header-content">
                                <span className="panel-subtitle">Paper Details</span>
                                <h2>{selectedPaper.title}</h2>
                            </div>
                            <div className="panel-actions">
                                <button className="icon-btn danger" onClick={(e) => handleDelete(selectedPaper.id, e)} title="Delete">
                                    <TrashIcon />
                                </button>
                                <button className="icon-btn" onClick={() => setIsRightPanelOpen(false)} title="Close">
                                    &times;
                                </button>
                            </div>
                        </div>

                        <div className="panel-scroll-area">
                            {/* Research Status Section */}
                            <div className="panel-section highlight-section">
                                <div className="form-group">
                                    <label>Status</label>
                                    <div className="status-selector">
                                        {(['toread', 'reading', 'read'] as ReadingStatus[]).map(s => (
                                            <button 
                                                key={s}
                                                className={`status-opt ${selectedPaper.status === s ? 'active' : ''}`}
                                                onClick={() => updatePaper(selectedPaper.id, { status: s })}
                                                data-status={s}
                                            >
                                                {s === 'toread' ? 'To Read' : s.charAt(0).toUpperCase() + s.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Tags (comma separated)</label>
                                    <input 
                                        className="glass-input"
                                        value={selectedPaper.tags.join(', ')} 
                                        onChange={(e) => handleTagsChange(e.target.value)}
                                        placeholder="e.g. AI, Vision, Survey"
                                    />
                                </div>
                            </div>

                            <div className="panel-section">
                                <div className="form-group">
                                    <label>Title</label>
                                    <input 
                                        className="glass-input"
                                        value={selectedPaper.title} 
                                        onChange={(e) => updatePaper(selectedPaper.id, { title: e.target.value })} 
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Authors</label>
                                    <input 
                                        className="glass-input"
                                        value={selectedPaper.authors.join(', ')} 
                                        onChange={(e) => handleAuthorChange(e.target.value)} 
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Type</label>
                                        <select 
                                            className="glass-input"
                                            value={selectedPaper.type} 
                                            onChange={(e) => updatePaper(selectedPaper.id, { type: e.target.value as PaperType })}
                                        >
                                            <option value="journal">Journal</option>
                                            <option value="conference">Conference</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Year</label>
                                        <input 
                                            className="glass-input"
                                            type="number"
                                            value={selectedPaper.year} 
                                            onChange={(e) => updatePaper(selectedPaper.id, { year: parseInt(e.target.value) || 0 })} 
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Publication</label>
                                        <input 
                                            className="glass-input"
                                            value={selectedPaper.publication} 
                                            onChange={(e) => updatePaper(selectedPaper.id, { publication: e.target.value })} 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Citation Count</label>
                                        <input 
                                            className="glass-input"
                                            type="number"
                                            value={selectedPaper.citationCount || 0}
                                            onChange={(e) => updatePaper(selectedPaper.id, { citationCount: parseInt(e.target.value) || 0 })} 
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="panel-section">
                                <h3>Research Notes</h3>
                                <textarea 
                                    className="glass-input notes-area"
                                    value={selectedPaper.personalNotes || ''} 
                                    onChange={(e) => updatePaper(selectedPaper.id, { personalNotes: e.target.value })} 
                                    placeholder="Add your thoughts, critique, or key takeaways..."
                                />
                            </div>

                            <div className="panel-section">
                                <div className="section-header">
                                    <h3>Abstract</h3>
                                    <button onClick={summarizeAbstract} className="ai-action-btn">
                                        <span className="sparkle">✨</span> Summarize
                                    </button>
                                </div>
                                <textarea 
                                    className="glass-input abstract-area"
                                    value={selectedPaper.abstract || ''} 
                                    onChange={(e) => updatePaper(selectedPaper.id, { abstract: e.target.value })} 
                                />
                            </div>

                            <div className="panel-section">
                                <h3>Citation Generator</h3>
                                <CitationGenerator paper={selectedPaper} />
                            </div>

                            {selectedPaper.fileUrl && (
                                <div className="panel-section">
                                    <h3>Preview</h3>
                                    <div className="preview-area">
                                        {selectedPaper.fileName?.endsWith('.pdf') ? (
                                            <iframe src={selectedPaper.fileUrl} className="preview-iframe" title="preview" />
                                        ) : (
                                            <div className="file-placeholder">
                                                <FileTextIcon />
                                                <p>{selectedPaper.fileName}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="empty-panel">
                        <p>Select a paper to edit details</p>
                    </div>
                )}
            </aside>
        </div>
    );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<React.StrictMode><App /></React.StrictMode>);
}
