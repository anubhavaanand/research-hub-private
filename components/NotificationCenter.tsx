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
    const [quietMode, setQuietMode] = useState(() => {
        const saved = localStorage.getItem('notification_quiet_mode');
        return saved === 'true';
    });
    const [soundEnabled, setSoundEnabled] = useState(() => {
        const saved = localStorage.getItem('notification_sound');
        return saved !== 'false'; // Default to enabled
    });
    const [showSettings, setShowSettings] = useState(false);

    // Save settings to localStorage
    useEffect(() => {
        localStorage.setItem('notification_quiet_mode', quietMode.toString());
    }, [quietMode]);

    useEffect(() => {
        localStorage.setItem('notification_sound', soundEnabled.toString());
    }, [soundEnabled]);

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

    const getActionLabel = (type: Notification['type']) => {
        switch (type) {
            case 'deadline': return 'View Deadline';
            case 'warning': return 'View Issue';
            case 'success': return 'View Details';
            default: return 'View';
        }
    };

    return (
        <div className="notification-center">
            <button
                className={`notification-bell ${unreadCount > 0 ? 'has-unread' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
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
                                className="settings-toggle"
                                onClick={() => setShowSettings(!showSettings)}
                                title="Settings"
                            >
                                ⚙️
                            </button>
                            {unreadCount > 0 && (
                                <button onClick={onMarkAllRead}>Mark all read</button>
                            )}
                            {notifications.length > 0 && (
                                <button onClick={onClearAll}>Clear all</button>
                            )}
                        </div>
                    </div>

                    {showSettings && (
                        <div className="notification-settings">
                            <label className="setting-row">
                                <span>🔕 Quiet Mode</span>
                                <span className="setting-desc">Only show critical notifications</span>
                                <input
                                    type="checkbox"
                                    checked={quietMode}
                                    onChange={() => setQuietMode(!quietMode)}
                                />
                            </label>
                            <label className="setting-row">
                                <span>🔊 Sound Alerts</span>
                                <span className="setting-desc">Play sound for new notifications</span>
                                <input
                                    type="checkbox"
                                    checked={soundEnabled}
                                    onChange={() => setSoundEnabled(!soundEnabled)}
                                />
                            </label>
                        </div>
                    )}

                    {quietMode && !showSettings && (
                        <div className="quiet-mode-notice">
                            🔕 Quiet mode: Only important notifications shown
                        </div>
                    )}

                    <div className="notification-list">
                        {displayNotifications.length === 0 ? (
                            <div className="no-notifications">
                                <p>🎉 All caught up!</p>
                                <span>No new notifications</span>
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
                                        <div className="notification-footer">
                                            <span className="notification-time">{getTimeAgo(notif.timestamp)}</span>
                                            {notif.relatedId && (
                                                <button className="notification-action-btn">
                                                    {getActionLabel(notif.type)} →
                                                </button>
                                            )}
                                        </div>
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
