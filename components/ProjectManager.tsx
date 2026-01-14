/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { Project, ProjectStatus, Paper } from '../types';
import { generateId, formatDate, PROJECT_COLORS, getProjectProgress } from '../utils';
import { PlusIcon, FolderIcon, TrashIcon, EditIcon } from './Icons';

interface ProjectManagerProps {
    projects: Project[];
    papers: Paper[];
    onAdd: (project: Project) => void;
    onUpdate: (id: string, updates: Partial<Project>) => void;
    onDelete: (id: string) => void;
    onSelectProject: (projectId: string | null) => void;
    selectedProjectId: string | null;
}

const STATUS_LABELS: Record<ProjectStatus, string> = {
    planning: 'Planning',
    writing: 'Writing',
    review: 'In Review',
    submitted: 'Submitted',
    published: 'Published',
    archived: 'Archived'
};

export default function ProjectManager({
    projects,
    papers,
    onAdd,
    onUpdate,
    onDelete,
    onSelectProject,
    selectedProjectId
}: ProjectManagerProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newStatus, setNewStatus] = useState<ProjectStatus>('planning');
    const [newColor, setNewColor] = useState(PROJECT_COLORS[0]);

    const handleAdd = () => {
        if (!newName.trim()) return;

        const project: Project = {
            id: generateId(),
            name: newName.trim(),
            description: newDescription.trim() || undefined,
            status: newStatus,
            paperIds: [],
            collaboratorIds: [],
            deadlines: [],
            color: newColor,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        onAdd(project);
        resetForm();
    };

    const handleUpdate = (id: string) => {
        onUpdate(id, {
            name: newName.trim(),
            description: newDescription.trim() || undefined,
            status: newStatus,
            color: newColor,
            updatedAt: Date.now()
        });
        resetForm();
    };

    const startEdit = (project: Project) => {
        setEditingId(project.id);
        setNewName(project.name);
        setNewDescription(project.description || '');
        setNewStatus(project.status);
        setNewColor(project.color || PROJECT_COLORS[0]);
        setIsAdding(true);
    };

    const resetForm = () => {
        setIsAdding(false);
        setEditingId(null);
        setNewName('');
        setNewDescription('');
        setNewStatus('planning');
        setNewColor(PROJECT_COLORS[0]);
    };

    return (
        <div className="project-manager">
            <div className="project-header">
                <h3><FolderIcon /> Projects</h3>
                <button className="add-btn-small" onClick={() => { resetForm(); setIsAdding(!isAdding); }}>
                    <PlusIcon /> New
                </button>
            </div>

            {isAdding && (
                <div className="project-form glass-card">
                    <input
                        type="text"
                        className="glass-input"
                        placeholder="Project name..."
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        autoFocus
                    />
                    <textarea
                        className="glass-input"
                        placeholder="Description..."
                        value={newDescription}
                        onChange={e => setNewDescription(e.target.value)}
                        rows={2}
                    />
                    <div className="form-row">
                        <select
                            className="glass-input"
                            value={newStatus}
                            onChange={e => setNewStatus(e.target.value as ProjectStatus)}
                        >
                            {Object.entries(STATUS_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                        <div className="color-picker">
                            {PROJECT_COLORS.map(color => (
                                <button
                                    key={color}
                                    className={`color-swatch ${newColor === color ? 'selected' : ''}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => setNewColor(color)}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="form-actions">
                        <button className="btn-secondary" onClick={resetForm}>Cancel</button>
                        <button
                            className="btn-primary"
                            onClick={() => editingId ? handleUpdate(editingId) : handleAdd()}
                        >
                            {editingId ? 'Update' : 'Create'}
                        </button>
                    </div>
                </div>
            )}

            <div className="project-list">
                <div
                    className={`project-item all-papers ${selectedProjectId === null ? 'active' : ''}`}
                    onClick={() => onSelectProject(null)}
                >
                    <div className="project-color" style={{ backgroundColor: '#6B7280' }} />
                    <div className="project-info">
                        <span className="project-name">All Papers</span>
                        <span className="project-count">{papers.length} papers</span>
                    </div>
                </div>

                {projects.map(project => {
                    const projectPapers = papers.filter(p => p.projectId === project.id);
                    const progress = getProjectProgress(project, papers);

                    return (
                        <div
                            key={project.id}
                            className={`project-item ${selectedProjectId === project.id ? 'active' : ''}`}
                            onClick={() => onSelectProject(project.id)}
                        >
                            <div
                                className="project-color"
                                style={{ backgroundColor: project.color || PROJECT_COLORS[0] }}
                            />
                            <div className="project-info">
                                <span className="project-name">{project.name}</span>
                                <div className="project-meta">
                                    <span className={`status-badge status-${project.status}`}>
                                        {STATUS_LABELS[project.status]}
                                    </span>
                                    <span className="project-count">{projectPapers.length} papers</span>
                                </div>
                                <div className="project-progress-bar">
                                    <div
                                        className="project-progress-fill"
                                        style={{ width: `${progress}%`, backgroundColor: project.color }}
                                    />
                                </div>
                            </div>
                            <div className="project-actions">
                                <button
                                    className="icon-btn-small"
                                    onClick={(e) => { e.stopPropagation(); startEdit(project); }}
                                >
                                    <EditIcon />
                                </button>
                                <button
                                    className="icon-btn-small danger"
                                    onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
