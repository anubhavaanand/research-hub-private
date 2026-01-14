/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export type PaperType = 'journal' | 'conference' | 'other';
export type ReadingStatus = 'toread' | 'reading' | 'read';

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
  
  // New Research Features
  status: ReadingStatus;
  tags: string[];
  citationCount: number; // Global citations (Impact)
  personalNotes?: string;
}

export type CitationStyle = 'APA7' | 'IEEE' | 'Harvard';

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
