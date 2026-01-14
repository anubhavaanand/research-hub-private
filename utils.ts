/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { Paper, Project, Deadline, Collaborator, AppState } from './types';

export const generateId = () => Math.random().toString(36).substring(2, 9);

export const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }).format(new Date(timestamp));
};

export const formatDateShort = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric'
    }).format(new Date(timestamp));
};

export const formatDateFull = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    }).format(new Date(timestamp));
};

// Calculate days until deadline
export const getDaysUntil = (timestamp: number): number => {
    const now = new Date();
    const target = new Date(timestamp);
    const diffTime = target.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Get deadline urgency class
export const getDeadlineUrgency = (daysUntil: number): string => {
    if (daysUntil < 0) return 'overdue';
    if (daysUntil <= 3) return 'critical';
    if (daysUntil <= 7) return 'high';
    if (daysUntil <= 14) return 'medium';
    return 'low';
};

// Color palette for projects
export const PROJECT_COLORS = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#F97316', // Orange
];

// Storage keys
const STORAGE_KEY = 'research_hub_data';

// Load state from localStorage
export const loadState = (): AppState => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error('Failed to load state:', e);
    }
    return {
        papers: [],
        projects: [],
        deadlines: [],
        collaborators: []
    };
};

// Save state to localStorage
export const saveState = (state: AppState): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error('Failed to save state:', e);
    }
};

// Export to BibTeX format
export const paperToBibTeX = (paper: Paper): string => {
    const entryType = paper.type === 'journal' ? 'article' :
        paper.type === 'conference' ? 'inproceedings' : 'misc';
    const key = `${paper.authors[0]?.split(' ').pop()?.toLowerCase() || 'unknown'}${paper.year}`;

    let bibtex = `@${entryType}{${key},\n`;
    bibtex += `  title = {${paper.title}},\n`;
    bibtex += `  author = {${paper.authors.join(' and ')}},\n`;
    bibtex += `  year = {${paper.year}},\n`;

    if (paper.publication) bibtex += `  ${paper.type === 'journal' ? 'journal' : 'booktitle'} = {${paper.publication}},\n`;
    if (paper.volume) bibtex += `  volume = {${paper.volume}},\n`;
    if (paper.issue) bibtex += `  number = {${paper.issue}},\n`;
    if (paper.pages) bibtex += `  pages = {${paper.pages}},\n`;
    if (paper.doi) bibtex += `  doi = {${paper.doi}},\n`;
    if (paper.url) bibtex += `  url = {${paper.url}},\n`;

    bibtex += `}\n`;
    return bibtex;
};

// Export papers to CSV
export const papersToCSV = (papers: Paper[]): string => {
    const headers = ['Title', 'Authors', 'Year', 'Type', 'Publication', 'Status', 'Tags', 'Citations', 'DOI'];
    const rows = papers.map(p => [
        `"${p.title.replace(/"/g, '""')}"`,
        `"${p.authors.join('; ')}"`,
        p.year,
        p.type,
        `"${p.publication.replace(/"/g, '""')}"`,
        p.status,
        `"${p.tags.join('; ')}"`,
        p.citationCount,
        p.doi || ''
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
};

// Validate DOI format
export const isValidDOI = (doi: string): boolean => {
    const doiRegex = /^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i;
    return doiRegex.test(doi);
};

// Get upcoming deadlines (sorted by date)
export const getUpcomingDeadlines = (deadlines: Deadline[], limit: number = 5): Deadline[] => {
    const now = Date.now();
    return deadlines
        .filter(d => !d.isCompleted && d.dueDate >= now)
        .sort((a, b) => a.dueDate - b.dueDate)
        .slice(0, limit);
};

// Get overdue deadlines
export const getOverdueDeadlines = (deadlines: Deadline[]): Deadline[] => {
    const now = Date.now();
    return deadlines
        .filter(d => !d.isCompleted && d.dueDate < now)
        .sort((a, b) => b.dueDate - a.dueDate);
};

// Calculate project progress
export const getProjectProgress = (project: Project, papers: Paper[]): number => {
    const projectPapers = papers.filter(p => project.paperIds.includes(p.id));
    if (projectPapers.length === 0) return 0;

    const readPapers = projectPapers.filter(p => p.status === 'read').length;
    return Math.round((readPapers / projectPapers.length) * 100);
};

// Get papers by project
export const getPapersByProject = (projectId: string, papers: Paper[]): Paper[] => {
    return papers.filter(p => p.projectId === projectId);
};

// Empty mock papers for fresh start
export const MOCK_PAPERS: Paper[] = [];
