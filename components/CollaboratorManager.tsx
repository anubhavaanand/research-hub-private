/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { Collaborator } from '../types';
import { generateId } from '../utils';
import { PlusIcon, TrashIcon, UserIcon, EditIcon } from './Icons';

interface CollaboratorManagerProps {
    collaborators: Collaborator[];
    onAdd: (collaborator: Collaborator) => void;
    onUpdate: (id: string, updates: Partial<Collaborator>) => void;
    onDelete: (id: string) => void;
}

export default function CollaboratorManager({
    collaborators,
    onAdd,
    onUpdate,
    onDelete
}: CollaboratorManagerProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [affiliation, setAffiliation] = useState('');
    const [role, setRole] = useState('');

    const handleSubmit = () => {
        if (!name.trim()) return;

        if (editingId) {
            onUpdate(editingId, {
                name: name.trim(),
                email: email.trim() || undefined,
                affiliation: affiliation.trim() || undefined,
                role: role.trim() || undefined
            });
        } else {
            const collaborator: Collaborator = {
                id: generateId(),
                name: name.trim(),
                email: email.trim() || undefined,
                affiliation: affiliation.trim() || undefined,
                role: role.trim() || undefined
            };
            onAdd(collaborator);
        }
        resetForm();
    };

    const startEdit = (collab: Collaborator) => {
        setEditingId(collab.id);
        setName(collab.name);
        setEmail(collab.email || '');
        setAffiliation(collab.affiliation || '');
        setRole(collab.role || '');
        setIsAdding(true);
    };

    const resetForm = () => {
        setIsAdding(false);
        setEditingId(null);
        setName('');
        setEmail('');
        setAffiliation('');
        setRole('');
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="collaborator-manager">
            <div className="collab-header">
                <h3><UserIcon /> Collaborators</h3>
                <button className="add-btn-small" onClick={() => { resetForm(); setIsAdding(!isAdding); }}>
                    <PlusIcon /> Add
                </button>
            </div>

            {isAdding && (
                <div className="collab-form glass-card">
                    <input
                        type="text"
                        className="glass-input"
                        placeholder="Full name *"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        autoFocus
                    />
                    <input
                        type="email"
                        className="glass-input"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <input
                        type="text"
                        className="glass-input"
                        placeholder="Affiliation (University, Lab...)"
                        value={affiliation}
                        onChange={e => setAffiliation(e.target.value)}
                    />
                    <input
                        type="text"
                        className="glass-input"
                        placeholder="Role (Advisor, Co-author...)"
                        value={role}
                        onChange={e => setRole(e.target.value)}
                    />
                    <div className="form-actions">
                        <button className="btn-secondary" onClick={resetForm}>Cancel</button>
                        <button className="btn-primary" onClick={handleSubmit}>
                            {editingId ? 'Update' : 'Add'}
                        </button>
                    </div>
                </div>
            )}

            <div className="collab-list">
                {collaborators.length === 0 ? (
                    <div className="empty-state-small">
                        <p>No collaborators added</p>
                    </div>
                ) : (
                    collaborators.map(collab => (
                        <div key={collab.id} className="collab-item">
                            <div className="collab-avatar">
                                {getInitials(collab.name)}
                            </div>
                            <div className="collab-info">
                                <span className="collab-name">{collab.name}</span>
                                {collab.role && <span className="collab-role">{collab.role}</span>}
                                {collab.affiliation && (
                                    <span className="collab-affiliation">{collab.affiliation}</span>
                                )}
                                {collab.email && (
                                    <a href={`mailto:${collab.email}`} className="collab-email">
                                        {collab.email}
                                    </a>
                                )}
                            </div>
                            <div className="collab-actions">
                                <button
                                    className="icon-btn-small"
                                    onClick={() => startEdit(collab)}
                                >
                                    <EditIcon />
                                </button>
                                <button
                                    className="icon-btn-small danger"
                                    onClick={() => onDelete(collab.id)}
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
