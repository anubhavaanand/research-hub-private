/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { Paper, PaperType, ReadingStatus, Project, Deadline, Collaborator, AppState } from './types';
import {
    generateId, formatDate, formatDateShort, loadState, saveState,
    getUpcomingDeadlines, getOverdueDeadlines, getDaysUntil, getDeadlineUrgency,
    papersToCSV, paperToBibTeX
} from './utils';
import {
    SearchIcon, FolderIcon, FileTextIcon,
    PlusIcon, StarIcon, QuoteIcon, TrashIcon,
    CalendarIcon, UsersIcon, DownloadIcon, ChartIcon, AlertIcon, ExternalLinkIcon, LinkIcon
} from './components/Icons';
import CitationGenerator from './components/CitationGenerator';
import DottedGlowBackground from './components/DottedGlowBackground';
import DeadlineTracker from './components/DeadlineTracker';
import ProjectManager from './components/ProjectManager';
import CollaboratorManager from './components/CollaboratorManager';
import PDFViewer from './components/PDFViewer';
import AIAssistant from './components/AIAssistant';
import MarkdownNotes from './components/MarkdownNotes';
import BibTeXImporter from './components/BibTeXImporter';
import WorkflowTracker from './components/WorkflowTracker';
import SmartPopup, { useSmartPopup } from './components/SmartPopup';
import NotificationCenter, { Notification, createDeadlineNotification } from './components/NotificationCenter';
import { GoogleGenAI } from '@google/genai';

type ViewMode = 'papers' | 'deadlines' | 'collaborators';
type ViewLayout = 'grid' | 'list';

function App() {
    // Load initial state from localStorage
    const initialState = loadState();

    const [papers, setPapers] = useState<Paper[]>(initialState.papers);
    const [projects, setProjects] = useState<Project[]>(initialState.projects);
    const [deadlines, setDeadlines] = useState<Deadline[]>(initialState.deadlines);
    const [collaborators, setCollaborators] = useState<Collaborator[]>(initialState.collaborators);

    const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'date' | 'year' | 'citations' | 'deadline'>('date');
    const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
    const [toasts, setToasts] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>('papers');
    const [viewLayout, setViewLayout] = useState<ViewLayout>('grid');

    // New feature states
    const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
    const [isPDFViewerOpen, setIsPDFViewerOpen] = useState(false);
    const [pdfViewerUrl, setPdfViewerUrl] = useState('');
    const [pdfViewerName, setPdfViewerName] = useState('');
    const [isBibTeXImporterOpen, setIsBibTeXImporterOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [researchJourney, setResearchJourney] = useState<any>(null);

    // Smart popup hook
    const { popupPaper, popupPosition, showPopup, hidePopup } = useSmartPopup();

    // File input ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Persist state to localStorage
    useEffect(() => {
        saveState({ papers, projects, deadlines, collaborators });
    }, [papers, projects, deadlines, collaborators]);

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
                                activeFilter === 'hasDeadline' ? p.submissionDeadline != null :
                                    p.type === activeFilter;

            const matchesProject = selectedProjectId === null ? true : p.projectId === selectedProjectId;

            return matchesSearch && matchesFilter && matchesProject;
        });

        // Sorting
        result.sort((a, b) => {
            if (sortBy === 'date') return b.addedAt - a.addedAt;
            if (sortBy === 'year') return b.year - a.year;
            if (sortBy === 'citations') return b.citationCount - a.citationCount;
            if (sortBy === 'deadline') {
                const aDeadline = a.submissionDeadline || Infinity;
                const bDeadline = b.submissionDeadline || Infinity;
                return aDeadline - bDeadline;
            }
            return 0;
        });

        return result;
    }, [papers, activeFilter, searchQuery, sortBy, selectedProjectId]);

    const selectedPaper = papers.find(p => p.id === selectedPaperId);

    // Stats Calculation
    const stats = useMemo(() => {
        const total = papers.length;
        const read = papers.filter(p => p.status === 'read').length;
        const reading = papers.filter(p => p.status === 'reading').length;
        const toread = papers.filter(p => p.status === 'toread').length;
        const totalCitations = papers.reduce((acc, p) => acc + (p.citationCount || 0), 0);
        const withDeadlines = papers.filter(p => p.submissionDeadline).length;

        // Year Distribution (Last 5 years + Older)
        const currentYear = new Date().getFullYear();
        const yearDist = Array.from({ length: 6 }, (_, i) => {
            const y = currentYear - i;
            if (i === 5) return { label: `<${y + 1}`, count: papers.filter(p => p.year <= y).length };
            return { label: `${y}`, count: papers.filter(p => p.year === y).length };
        }).reverse();

        return { total, read, reading, toread, totalCitations, yearDist, withDeadlines };
    }, [papers]);

    // Upcoming deadlines
    const upcomingDeadlines = useMemo(() => getUpcomingDeadlines(deadlines, 3), [deadlines]);
    const overdueDeadlines = useMemo(() => getOverdueDeadlines(deadlines), [deadlines]);

    // --- Handlers ---

    const addToast = useCallback((msg: string) => {
        setToasts(prev => [...prev, msg]);
        setTimeout(() => setToasts(prev => prev.slice(1)), 3000);
    }, []);

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
            citationCount: 0,
            projectId: selectedProjectId || undefined
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

    // Project handlers
    const addProject = (project: Project) => {
        setProjects(prev => [...prev, project]);
        addToast("Project created");
    };

    const updateProject = (id: string, updates: Partial<Project>) => {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    };

    const deleteProject = (id: string) => {
        if (confirm("Delete this project? Papers won't be deleted.")) {
            setProjects(prev => prev.filter(p => p.id !== id));
            // Remove project association from papers
            setPapers(prev => prev.map(p => p.projectId === id ? { ...p, projectId: undefined } : p));
            if (selectedProjectId === id) setSelectedProjectId(null);
            addToast("Project deleted");
        }
    };

    // Deadline handlers
    const addDeadline = (deadline: Deadline) => {
        setDeadlines(prev => [...prev, deadline]);
        addToast("Deadline added");
    };

    const updateDeadline = (id: string, updates: Partial<Deadline>) => {
        setDeadlines(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    };

    const deleteDeadline = (id: string) => {
        setDeadlines(prev => prev.filter(d => d.id !== id));
        addToast("Deadline removed");
    };

    // Collaborator handlers
    const addCollaborator = (collaborator: Collaborator) => {
        setCollaborators(prev => [...prev, collaborator]);
        addToast("Collaborator added");
    };

    const updateCollaborator = (id: string, updates: Partial<Collaborator>) => {
        setCollaborators(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    };

    const deleteCollaborator = (id: string) => {
        setCollaborators(prev => prev.filter(c => c.id !== id));
        addToast("Collaborator removed");
    };

    // Export functions
    const exportToCSV = () => {
        const csv = papersToCSV(papers);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'research_papers.csv';
        a.click();
        addToast("Exported to CSV");
    };

    const exportToBibTeX = () => {
        const bibtex = papers.map(p => paperToBibTeX(p)).join('\n');
        const blob = new Blob([bibtex], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'references.bib';
        a.click();
        addToast("Exported to BibTeX");
    };

    // PDF Viewer handlers
    const openPDFViewer = (url: string, name: string) => {
        setPdfViewerUrl(url);
        setPdfViewerName(name);
        setIsPDFViewerOpen(true);
    };

    const closePDFViewer = () => {
        setIsPDFViewerOpen(false);
        setPdfViewerUrl('');
        setPdfViewerName('');
    };

    // BibTeX import handler
    const handleBibTeXImport = (entries: any[]) => {
        const newPapers: Paper[] = entries.map(entry => ({
            id: generateId(),
            title: entry.title || 'Untitled',
            authors: entry.author ? entry.author.split(' and ').map((a: string) => a.trim()) : ['Unknown'],
            type: entry.type === 'article' ? 'journal' : entry.type === 'inproceedings' ? 'conference' : 'other',
            publication: entry.journal || entry.booktitle || 'Unknown',
            year: parseInt(entry.year) || new Date().getFullYear(),
            addedAt: Date.now(),
            isFavorite: false,
            status: 'toread',
            tags: [],
            citationCount: 0,
            doi: entry.doi,
            url: entry.url,
            abstract: entry.abstract,
            volume: entry.volume,
            issue: entry.number,
            pages: entry.pages
        }));

        setPapers(prev => [...newPapers, ...prev]);
        addToast(`Imported ${newPapers.length} papers from BibTeX`);
    };

    // Notification handlers
    const markNotificationRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    const markAllNotificationsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const dismissNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const clearAllNotifications = () => {
        setNotifications([]);
    };

    // Research journey handlers
    const createJourney = (journey: any) => {
        setResearchJourney(journey);
        addToast("Research journey started!");
    };

    const updateJourney = (journey: any) => {
        setResearchJourney(journey);
    };

    const summarizeAbstract = async () => {
        if (!selectedPaper || !selectedPaper.abstract) return;
        try {
            addToast("Summarizing abstract...");
            const apiKey = process.env.API_KEY;
            if (!apiKey) return;
            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash',
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
            {/* PDF Viewer Modal */}
            {isPDFViewerOpen && pdfViewerUrl && (
                <PDFViewer
                    fileUrl={pdfViewerUrl}
                    fileName={pdfViewerName}
                    onClose={closePDFViewer}
                />
            )}

            {/* AI Assistant */}
            <AIAssistant
                isOpen={isAIAssistantOpen}
                onClose={() => setIsAIAssistantOpen(false)}
                context={selectedPaper?.abstract}
            />

            {/* BibTeX Importer */}
            {isBibTeXImporterOpen && (
                <BibTeXImporter
                    onImport={handleBibTeXImport}
                    onClose={() => setIsBibTeXImporterOpen(false)}
                />
            )}

            {/* Smart Popup */}
            {popupPaper && (
                <SmartPopup
                    paper={popupPaper}
                    position={popupPosition}
                    onClose={hidePopup}
                    onOpenPaper={(id) => {
                        setSelectedPaperId(id);
                        setIsRightPanelOpen(true);
                        hidePopup();
                    }}
                />
            )}

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

            {/* Sidebar */}
            <aside className="sidebar">
                <div className="brand">
                    <div className="brand-icon">
                        <div className="brand-dot"></div>
                    </div>
                    <span className="brand-text">Research Hub</span>
                </div>

                {/* View Mode Tabs */}
                <div className="view-tabs">
                    <button
                        className={`view-tab ${viewMode === 'papers' ? 'active' : ''}`}
                        onClick={() => setViewMode('papers')}
                    >
                        <FileTextIcon /> Papers
                    </button>
                    <button
                        className={`view-tab ${viewMode === 'deadlines' ? 'active' : ''}`}
                        onClick={() => setViewMode('deadlines')}
                    >
                        <CalendarIcon /> Deadlines
                        {overdueDeadlines.length > 0 && (
                            <span className="badge-alert">{overdueDeadlines.length}</span>
                        )}
                    </button>
                    <button
                        className={`view-tab ${viewMode === 'collaborators' ? 'active' : ''}`}
                        onClick={() => setViewMode('collaborators')}
                    >
                        <UsersIcon /> Team
                    </button>
                </div>

                {viewMode === 'papers' && (
                    <>
                        {/* Project Manager */}
                        <ProjectManager
                            projects={projects}
                            papers={papers}
                            onAdd={addProject}
                            onUpdate={updateProject}
                            onDelete={deleteProject}
                            onSelectProject={setSelectedProjectId}
                            selectedProjectId={selectedProjectId}
                        />

                        <nav className="nav-container">
                            <div className="nav-group">
                                <div className="nav-label">Library</div>
                                <div className={`nav-item ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>
                                    <FolderIcon /> <span>All Papers</span>
                                </div>
                                <div className={`nav-item ${activeFilter === 'favorites' ? 'active' : ''}`} onClick={() => setActiveFilter('favorites')}>
                                    <StarIcon /> <span>Favorites</span>
                                </div>
                                <div className={`nav-item ${activeFilter === 'hasDeadline' ? 'active' : ''}`} onClick={() => setActiveFilter('hasDeadline')}>
                                    <CalendarIcon /> <span>With Deadlines</span>
                                    <span className="nav-count">{stats.withDeadlines}</span>
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
                                <div className={`nav-item ${activeFilter === 'thesis' ? 'active' : ''}`} onClick={() => setActiveFilter('thesis')}>
                                    <FileTextIcon /> <span>Thesis</span>
                                </div>
                            </div>
                        </nav>
                    </>
                )}

                {viewMode === 'deadlines' && (
                    <DeadlineTracker
                        deadlines={deadlines}
                        onAdd={addDeadline}
                        onUpdate={updateDeadline}
                        onDelete={deleteDeadline}
                    />
                )}

                {viewMode === 'collaborators' && (
                    <CollaboratorManager
                        collaborators={collaborators}
                        onAdd={addCollaborator}
                        onUpdate={updateCollaborator}
                        onDelete={deleteCollaborator}
                    />
                )}

                {/* Dashboard / Stats Widget */}
                {viewMode === 'papers' && (
                    <div className="stats-card">
                        <h4><ChartIcon /> Analytics</h4>

                        <div className="progress-section">
                            <div className="progress-header">
                                <span>Reading Progress</span>
                                <span>{stats.total > 0 ? Math.round((stats.read / stats.total) * 100) : 0}%</span>
                            </div>
                            <div className="progress-bar-bg">
                                <div className="progress-bar-fill" style={{ width: `${stats.total > 0 ? (stats.read / stats.total) * 100 : 0}%` }}></div>
                            </div>
                        </div>

                        <div className="stats-grid-mini">
                            <div className="stat-mini">
                                <span className="val">{stats.totalCitations.toLocaleString()}</span>
                                <span className="lbl">Total Citations</span>
                            </div>
                            <div className="stat-mini">
                                <span className="val">{projects.length}</span>
                                <span className="lbl">Projects</span>
                            </div>
                        </div>

                        {upcomingDeadlines.length > 0 && (
                            <div className="upcoming-deadlines-widget">
                                <span className="widget-label"><AlertIcon /> Upcoming</span>
                                {upcomingDeadlines.map(d => (
                                    <div key={d.id} className={`mini-deadline urgency-${getDeadlineUrgency(getDaysUntil(d.dueDate))}`}>
                                        <span>{d.title}</span>
                                        <span className="mini-date">{formatDateShort(d.dueDate)}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="export-buttons">
                            <button className="export-btn" onClick={exportToCSV} title="Export to CSV">
                                <DownloadIcon /> CSV
                            </button>
                            <button className="export-btn" onClick={exportToBibTeX} title="Export to BibTeX">
                                <DownloadIcon /> BibTeX
                            </button>
                        </div>
                    </div>
                )}
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
                        {/* View Toggle */}
                        <div className="view-toggle">
                            <button
                                className={`view-toggle-btn ${viewLayout === 'grid' ? 'active' : ''}`}
                                onClick={() => setViewLayout('grid')}
                                title="Grid View"
                            >
                                ⊞
                            </button>
                            <button
                                className={`view-toggle-btn ${viewLayout === 'list' ? 'active' : ''}`}
                                onClick={() => setViewLayout('list')}
                                title="List View"
                            >
                                ☰
                            </button>
                        </div>

                        <div className="divider-vertical"></div>

                        <div className="sort-dropdown">
                            <span className="sort-label">Sort by:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="glass-select"
                            >
                                <option value="date">Date Added</option>
                                <option value="year">Year Published</option>
                                <option value="citations">Citations</option>
                                <option value="deadline">Deadline</option>
                            </select>
                        </div>

                        <div className="divider-vertical"></div>

                        {/* AI Assistant Button */}
                        <button
                            className="icon-btn"
                            onClick={() => setIsAIAssistantOpen(true)}
                            title="AI Research Assistant"
                        >
                            ✨
                        </button>

                        {/* Import Button */}
                        <button
                            className="icon-btn"
                            onClick={() => setIsBibTeXImporterOpen(true)}
                            title="Import BibTeX"
                        >
                            <DownloadIcon />
                        </button>

                        {/* Notifications */}
                        <NotificationCenter
                            notifications={notifications}
                            onMarkRead={markNotificationRead}
                            onMarkAllRead={markAllNotificationsRead}
                            onDismiss={dismissNotification}
                            onClearAll={clearAllNotifications}
                        />

                        <div className="divider-vertical"></div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
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
                            <FileTextIcon />
                            <h3>No papers found</h3>
                            <p>Upload a paper or import from BibTeX</p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button className="add-btn" onClick={() => fileInputRef.current?.click()}>
                                    <PlusIcon /> Upload Paper
                                </button>
                                <button className="btn-secondary" onClick={() => setIsBibTeXImporterOpen(true)}>
                                    <DownloadIcon /> Import BibTeX
                                </button>
                            </div>
                        </div>
                    ) : viewLayout === 'grid' ? (
                        <div className="doc-grid">
                            {filteredPapers.map((paper, index) => {
                                const project = projects.find(p => p.id === paper.projectId);
                                const hasDeadline = paper.submissionDeadline != null;
                                const daysUntil = hasDeadline ? getDaysUntil(paper.submissionDeadline!) : null;

                                return (
                                    <div
                                        key={paper.id}
                                        className={`doc-card ${selectedPaperId === paper.id ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedPaperId(paper.id);
                                            setIsRightPanelOpen(true);
                                        }}
                                        onMouseEnter={(e) => showPopup(paper, e)}
                                        onMouseLeave={hidePopup}
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <div className="doc-card-inner">
                                            <div className="doc-header">
                                                <div className="doc-badges">
                                                    <div className="status-badge" data-status={paper.status}>
                                                        {paper.status === 'toread' ? 'To Read' : paper.status}
                                                    </div>
                                                    {project && (
                                                        <div
                                                            className="project-badge"
                                                            style={{ backgroundColor: project.color }}
                                                        >
                                                            {project.name}
                                                        </div>
                                                    )}
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
                                                <div className="footer-left">
                                                    <span className="type-badge">{paper.type}</span>
                                                    <span className="year-badge">{paper.year}</span>
                                                </div>
                                                {hasDeadline && daysUntil !== null && (
                                                    <span className={`deadline-badge ${getDeadlineUrgency(daysUntil)}`}>
                                                        <CalendarIcon />
                                                        {daysUntil < 0
                                                            ? 'Overdue'
                                                            : daysUntil === 0
                                                                ? 'Today'
                                                                : `${daysUntil}d`
                                                        }
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="doc-glow"></div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* List View */
                        <div className="doc-list">
                            {filteredPapers.map((paper) => {
                                const project = projects.find(p => p.id === paper.projectId);

                                return (
                                    <div
                                        key={paper.id}
                                        className={`doc-list-item ${selectedPaperId === paper.id ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedPaperId(paper.id);
                                            setIsRightPanelOpen(true);
                                        }}
                                        onMouseEnter={(e) => showPopup(paper, e)}
                                        onMouseLeave={hidePopup}
                                    >
                                        <div className="status-badge" data-status={paper.status}>
                                            {paper.status === 'toread' ? 'To Read' : paper.status}
                                        </div>
                                        <h3 className="doc-title">{paper.title}</h3>
                                        <span className="doc-authors">{paper.authors.slice(0, 2).join(', ')}</span>
                                        <span className="doc-year">{paper.year}</span>
                                        {project && (
                                            <div
                                                className="project-badge"
                                                style={{ backgroundColor: project.color }}
                                            >
                                                {project.name}
                                            </div>
                                        )}
                                        <button
                                            className={`fav-btn ${paper.isFavorite ? 'active' : ''}`}
                                            onClick={(e) => toggleFavorite(paper.id, e)}
                                        >
                                            <StarIcon filled={paper.isFavorite} />
                                        </button>
                                    </div>
                                );
                            })}
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
                                    <label>Project</label>
                                    <select
                                        className="glass-input"
                                        value={selectedPaper.projectId || ''}
                                        onChange={(e) => updatePaper(selectedPaper.id, { projectId: e.target.value || undefined })}
                                    >
                                        <option value="">No Project</option>
                                        {projects.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
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

                                <div className="form-group">
                                    <label>Submission Deadline</label>
                                    <input
                                        type="date"
                                        className="glass-input"
                                        value={selectedPaper.submissionDeadline
                                            ? new Date(selectedPaper.submissionDeadline).toISOString().split('T')[0]
                                            : ''
                                        }
                                        onChange={(e) => updatePaper(selectedPaper.id, {
                                            submissionDeadline: e.target.value ? new Date(e.target.value).getTime() : undefined
                                        })}
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
                                            <option value="thesis">Thesis</option>
                                            <option value="grant">Grant</option>
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

                                <div className="form-row">
                                    <div className="form-group">
                                        <label><LinkIcon /> DOI</label>
                                        <input
                                            className="glass-input"
                                            value={selectedPaper.doi || ''}
                                            onChange={(e) => updatePaper(selectedPaper.id, { doi: e.target.value })}
                                            placeholder="10.xxxx/xxxxx"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label><ExternalLinkIcon /> URL</label>
                                        <input
                                            className="glass-input"
                                            value={selectedPaper.url || ''}
                                            onChange={(e) => updatePaper(selectedPaper.id, { url: e.target.value })}
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="panel-section">
                                <h3>Key Findings</h3>
                                <textarea
                                    className="glass-input notes-area"
                                    value={selectedPaper.keyFindings || ''}
                                    onChange={(e) => updatePaper(selectedPaper.id, { keyFindings: e.target.value })}
                                    placeholder="What are the main takeaways from this paper?"
                                />
                            </div>

                            <div className="panel-section">
                                <h3>Research Notes</h3>
                                <textarea
                                    className="glass-input notes-area"
                                    value={selectedPaper.personalNotes || ''}
                                    onChange={(e) => updatePaper(selectedPaper.id, { personalNotes: e.target.value })}
                                    placeholder="Add your thoughts, critique, or notes..."
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
                                    <div className="section-header">
                                        <h3>Preview</h3>
                                        {selectedPaper.fileName?.endsWith('.pdf') && (
                                            <button
                                                className="ai-action-btn"
                                                onClick={() => openPDFViewer(selectedPaper.fileUrl!, selectedPaper.fileName || 'Document')}
                                            >
                                                🔍 Full View
                                            </button>
                                        )}
                                    </div>
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
if (rootElement && !(rootElement as any).__reactRoot) {
    const root = ReactDOM.createRoot(rootElement);
    (rootElement as any).__reactRoot = root;
    root.render(<React.StrictMode><App /></React.StrictMode>);
}

