/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { AlertIcon, CheckIcon, CalendarIcon, ClockIcon } from './Icons';

interface Notification {
    id: string;
    type: 'info' | 'warning' | 'success' | 'deadline';
    title: string;
    message: string;
    timestamp: number;
    isRead: boolean;
    actionUrl?: string;
    relatedId?: string;
}

interface NotificationCenterProps {
    notifications: Notification[];
    onMarkRead: (id: string) => void;
    onMarkAllRead: () => void;
    onDismiss: (id: string) => void;
    onClearAll: () => void;
}

export default function NotificationCenter({
    notifications,
    onMarkRead,
    onMarkAllRead,
    onDismiss,
    onClearAll
}: NotificationCenterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [quietMode, setQuietMode] = useState(false);

    const unreadCount = notifications.filter(n => !n.isRead).length;
    const importantNotifications = notifications.filter(
        n => n.type === 'deadline' || n.type === 'warning'
    );

    // In quiet mode, only show important notifications
    const displayNotifications = quietMode
        ? importantNotifications
        : notifications;

    const getTimeAgo = (timestamp: number): string => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'deadline': return <CalendarIcon />;
            case 'warning': return <AlertIcon />;
            case 'success': return <CheckIcon />;
            default: return <ClockIcon />;
        }
    };

    return (
        <div className="notification-center">
            <button
                className={`notification-bell ${unreadCount > 0 ? 'has-unread' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                🔔
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h4>Notifications</h4>
                        <div className="notification-actions">
                            <button
                                className={`quiet-toggle ${quietMode ? 'active' : ''}`}
                                onClick={() => setQuietMode(!quietMode)}
                                title={quietMode ? 'Show all' : 'Quiet mode'}
                            >
                                {quietMode ? '🔕' : '🔔'}
                            </button>
                            {unreadCount > 0 && (
                                <button onClick={onMarkAllRead}>Mark all read</button>
                            )}
                            {notifications.length > 0 && (
                                <button onClick={onClearAll}>Clear all</button>
                            )}
                        </div>
                    </div>

                    {quietMode && (
                        <div className="quiet-mode-notice">
                            🔕 Quiet mode: Only important notifications shown
                        </div>
                    )}

                    <div className="notification-list">
                        {displayNotifications.length === 0 ? (
                            <div className="no-notifications">
                                <p>No notifications</p>
                            </div>
                        ) : (
                            displayNotifications.map(notif => (
                                <div
                                    key={notif.id}
                                    className={`notification-item ${notif.type} ${notif.isRead ? 'read' : 'unread'}`}
                                    onClick={() => onMarkRead(notif.id)}
                                >
                                    <div className={`notification-icon ${notif.type}`}>
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className="notification-content">
                                        <span className="notification-title">{notif.title}</span>
                                        <span className="notification-message">{notif.message}</span>
                                        <span className="notification-time">{getTimeAgo(notif.timestamp)}</span>
                                    </div>
                                    <button
                                        className="notification-dismiss"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDismiss(notif.id);
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// Notification types for export
export type { Notification };

// Helper to create deadline notifications
export const createDeadlineNotification = (
    title: string,
    daysUntil: number,
    relatedId?: string
): Notification => ({
    id: Math.random().toString(36).substring(2, 9),
    type: 'deadline',
    title: `Deadline: ${title}`,
    message: daysUntil === 0
        ? 'Due today!'
        : daysUntil < 0
            ? `Overdue by ${Math.abs(daysUntil)} days`
            : `Due in ${daysUntil} days`,
    timestamp: Date.now(),
    isRead: false,
    relatedId
});
