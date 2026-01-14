/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { CheckIcon, EditIcon } from './Icons';

interface WorkflowStage {
    id: string;
    name: string;
    description?: string;
    isCompleted: boolean;
    completedAt?: number;
}

interface ResearchJourney {
    id: string;
    name: string;
    stages: WorkflowStage[];
    currentStageIndex: number;
    createdAt: number;
}

interface WorkflowTrackerProps {
    journey: ResearchJourney | null;
    onUpdate: (journey: ResearchJourney) => void;
    onCreate: (journey: ResearchJourney) => void;
}

const DEFAULT_STAGES: Omit<WorkflowStage, 'id'>[] = [
    { name: 'Literature Review', description: 'Reviewing existing research', isCompleted: false },
    { name: 'Research Design', description: 'Designing methodology', isCompleted: false },
    { name: 'Data Collection', description: 'Gathering data', isCompleted: false },
    { name: 'Data Analysis', description: 'Analyzing results', isCompleted: false },
    { name: 'Writing Draft', description: 'First draft of paper', isCompleted: false },
    { name: 'Peer Review', description: 'Internal review', isCompleted: false },
    { name: 'Revision', description: 'Addressing feedback', isCompleted: false },
    { name: 'Submission', description: 'Submitted to journal', isCompleted: false },
    { name: 'Published', description: 'Paper published!', isCompleted: false }
];

const generateId = () => Math.random().toString(36).substring(2, 9);

export default function WorkflowTracker({ journey, onUpdate, onCreate }: WorkflowTrackerProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [journeyName, setJourneyName] = useState('');

    const createJourney = () => {
        const newJourney: ResearchJourney = {
            id: generateId(),
            name: journeyName || 'Research Project',
            stages: DEFAULT_STAGES.map((s, i) => ({ ...s, id: generateId() })),
            currentStageIndex: 0,
            createdAt: Date.now()
        };
        onCreate(newJourney);
        setJourneyName('');
    };

    const toggleStage = (stageIndex: number) => {
        if (!journey) return;

        const updatedStages = journey.stages.map((stage, idx) => {
            if (idx === stageIndex) {
                return {
                    ...stage,
                    isCompleted: !stage.isCompleted,
                    completedAt: !stage.isCompleted ? Date.now() : undefined
                };
            }
            // If completing a stage, complete all previous stages
            if (idx < stageIndex && !stage.isCompleted) {
                return {
                    ...stage,
                    isCompleted: true,
                    completedAt: Date.now()
                };
            }
            return stage;
        });

        // Find current stage (first incomplete)
        const currentStageIndex = updatedStages.findIndex(s => !s.isCompleted);

        onUpdate({
            ...journey,
            stages: updatedStages,
            currentStageIndex: currentStageIndex === -1 ? updatedStages.length : currentStageIndex
        });
    };

    const getProgressPercentage = () => {
        if (!journey) return 0;
        const completed = journey.stages.filter(s => s.isCompleted).length;
        return Math.round((completed / journey.stages.length) * 100);
    };

    if (!journey) {
        return (
            <div className="workflow-empty">
                <h4>📊 Research Journey</h4>
                <p>Track your research progress through key milestones</p>
                <div className="journey-create">
                    <input
                        type="text"
                        className="glass-input"
                        placeholder="Project name..."
                        value={journeyName}
                        onChange={e => setJourneyName(e.target.value)}
                    />
                    <button className="btn-primary" onClick={createJourney}>
                        Start Journey
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="workflow-tracker">
            <div className="workflow-header">
                <div className="workflow-title">
                    <h4>📊 {journey.name}</h4>
                    <span className="workflow-progress">{getProgressPercentage()}% Complete</span>
                </div>
            </div>

            <div className="workflow-progress-bar">
                <div
                    className="workflow-progress-fill"
                    style={{ width: `${getProgressPercentage()}%` }}
                />
            </div>

            <div className="workflow-stages">
                {journey.stages.map((stage, index) => {
                    const isCurrent = index === journey.currentStageIndex;
                    const isPast = index < journey.currentStageIndex;

                    return (
                        <div
                            key={stage.id}
                            className={`workflow-stage ${stage.isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                            onClick={() => toggleStage(index)}
                        >
                            <div className="stage-indicator">
                                {stage.isCompleted ? (
                                    <CheckIcon />
                                ) : (
                                    <span className="stage-number">{index + 1}</span>
                                )}
                            </div>
                            <div className="stage-content">
                                <span className="stage-name">{stage.name}</span>
                                {stage.description && (
                                    <span className="stage-desc">{stage.description}</span>
                                )}
                                {stage.completedAt && (
                                    <span className="stage-date">
                                        ✓ {new Date(stage.completedAt).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                            <div className="stage-line" />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
