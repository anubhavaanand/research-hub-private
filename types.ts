/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export type PaperType = 'journal' | 'conference' | 'thesis' | 'grant' | 'other';
export type ReadingStatus = 'toread' | 'reading' | 'read';
export type ProjectStatus = 'planning' | 'writing' | 'review' | 'submitted' | 'published' | 'archived';
export type DeadlinePriority = 'low' | 'medium' | 'high' | 'critical';

// Collaborator/Co-author
export interface Collaborator {
  id: string;
  name: string;
  email?: string;
  affiliation?: string;
  role?: string; // e.g., "Lead Author", "Co-author", "Advisor"
}

// Deadline for submissions
export interface Deadline {
  id: string;
  title: string;
  description?: string;
  dueDate: number; // timestamp
  priority: DeadlinePriority;
  isCompleted: boolean;
  relatedPaperId?: string;
  relatedProjectId?: string;
  reminderDays?: number[]; // e.g., [7, 3, 1] for reminders 7, 3, 1 days before
  createdAt: number;
}

// Research Project
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  paperIds: string[]; // Papers associated with this project
  collaboratorIds: string[];
  deadlines: string[]; // Deadline IDs
  startDate?: number;
  targetEndDate?: number;
  notes?: string;
  color?: string; // For visual identification
  createdAt: number;
  updatedAt: number;
}

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  type: PaperType;
  publication: string; // Journal name or Conference proceedings
  year: number;
  volume?: string;
  issue?: string;
  pages?: string;
  abstract?: string;
  addedAt: number;
  isFavorite: boolean;
  fileName?: string;
  fileUrl?: string; // For blob preview

  // Research Features
  status: ReadingStatus;
  tags: string[];
  citationCount: number; // Global citations (Impact)
  personalNotes?: string;

  // Enhanced Features
  doi?: string; // Digital Object Identifier
  url?: string; // External link to paper
  projectId?: string; // Associated project
  collaboratorIds?: string[]; // Co-authors from collaborator list
  submissionDeadline?: number; // Submission deadline timestamp
  keyFindings?: string; // Key takeaways
  methodology?: string; // Research methodology notes
}

export type CitationStyle = 'APA7' | 'IEEE' | 'Harvard' | 'MLA' | 'Chicago' | 'BibTeX';

export interface GeneratedCitation {
  style: CitationStyle;
  text: string;
}

export interface Artifact {
  id: string;
  html: string;
  styleName: string;
  status: 'streaming' | 'complete' | 'error';
}

// App State for persistence
export interface AppState {
  papers: Paper[];
  projects: Project[];
  deadlines: Deadline[];
  collaborators: Collaborator[];
}
