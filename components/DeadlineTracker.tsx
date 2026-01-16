/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { Deadline, DeadlinePriority } from '../types';
import { generateId, formatDateFull, getDaysUntil, getDeadlineUrgency } from '../utils';
import { PlusIcon, CheckIcon, TrashIcon, CalendarIcon, ClockIcon } from './Icons';

interface DeadlineTrackerProps {
    deadlines: Deadline[];
    onAdd: (deadline: Deadline) => void;
    onUpdate: (id: string, updates: Partial<Deadline>) => void;
    onDelete: (id: string) => void;
}

export default function DeadlineTracker({ deadlines, onAdd, onUpdate, onDelete }: DeadlineTrackerProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDate, setNewDate] = useState('');
    const [newPriority, setNewPriority] = useState<DeadlinePriority>('medium');
    const [newDescription, setNewDescription] = useState('');

    const handleAdd = () => {
        if (!newTitle.trim() || !newDate) return;

        const deadline: Deadline = {
            id: generateId(),
            title: newTitle.trim(),
            description: newDescription.trim() || undefined,
            dueDate: new Date(newDate).getTime(),
            priority: newPriority,
            isCompleted: false,
            reminderDays: [7, 3, 1],
            createdAt: Date.now()
        };

        onAdd(deadline);
        setNewTitle('');
        setNewDate('');
        setNewPriority('medium');
        setNewDescription('');
        setIsAdding(false);
    };

    const toggleComplete = (id: string, currentState: boolean) => {
        onUpdate(id, { isCompleted: !currentState });
    };

    // Sort deadlines: incomplete first (by date), then completed
    const sortedDeadlines = [...deadlines].sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
        return a.dueDate - b.dueDate;
    });

    return (
        <div className="deadline-tracker">
            <div className="deadline-header">
                <h3><CalendarIcon /> Deadlines</h3>
                <button className="add-btn-small" onClick={() => setIsAdding(!isAdding)}>
                    <PlusIcon /> Add
                </button>
            </div>

            {isAdding && (
                <div className="deadline-form glass-card">
                    <input
                        type="text"
                        className="glass-input"
                        placeholder="Deadline title..."
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        autoFocus
                    />
                    <textarea
                        className="glass-input"
                        placeholder="Description (optional)..."
                        value={newDescription}
                        onChange={e => setNewDescription(e.target.value)}
                        rows={2}
                    />
                    <div className="form-row">
                        <input
                            type="date"
                            className="glass-input"
                            value={newDate}
                            onChange={e => setNewDate(e.target.value)}
                            onInput={e => setNewDate((e.target as HTMLInputElement).value)}
                        />
                        <select
                            className="glass-input"
                            value={newPriority}
                            onChange={e => setNewPriority(e.target.value as DeadlinePriority)}
                        >
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                            <option value="critical">Critical</option>
                        </select>
                    </div>
                    <div className="form-actions">
                        <button className="btn-secondary" onClick={() => setIsAdding(false)}>Cancel</button>
                        <button
                            className="btn-primary"
                            onClick={handleAdd}
                            disabled={!newTitle.trim() || !newDate}
                        >
                            Add Deadline
                        </button>
                    </div>
                </div>
            )}

            <div className="deadline-list">
                {sortedDeadlines.length === 0 ? (
                    <div className="empty-state-small">
                        <p>No deadlines yet</p>
                    </div>
                ) : (
                    sortedDeadlines.map(deadline => {
                        const daysUntil = getDaysUntil(deadline.dueDate);
                        const urgency = getDeadlineUrgency(daysUntil);

                        return (
                            <div
                                key={deadline.id}
                                className={`deadline-item ${deadline.isCompleted ? 'completed' : ''} priority-${deadline.priority} urgency-${urgency}`}
                            >
                                <button
                                    className={`check-btn ${deadline.isCompleted ? 'checked' : ''}`}
                                    onClick={() => toggleComplete(deadline.id, deadline.isCompleted)}
                                >
                                    {deadline.isCompleted && <CheckIcon />}
                                </button>

                                <div className="deadline-content">
                                    <span className="deadline-title">{deadline.title}</span>
                                    {deadline.description && (
                                        <span className="deadline-desc">{deadline.description}</span>
                                    )}
                                    <div className="deadline-meta">
                                        <span className="deadline-date">
                                            <ClockIcon /> {formatDateFull(deadline.dueDate)}
                                        </span>
                                        <span className={`days-badge ${urgency}`}>
                                            {daysUntil < 0
                                                ? `${Math.abs(daysUntil)} days overdue`
                                                : daysUntil === 0
                                                    ? 'Due today!'
                                                    : `${daysUntil} days left`
                                            }
                                        </span>
                                    </div>
                                </div>

                                <button
                                    className="delete-btn-small"
                                    onClick={() => onDelete(deadline.id)}
                                    title="Delete"
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
