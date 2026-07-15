import { useState, useEffect, useRef } from 'react';
import {
    BellIcon,
    XMarkIcon,
    TrashIcon,
    CheckIcon,
    EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import axiosClient from '../services/axiosClient';
import { useLoadUserQuery } from '../services/api';

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    icon?: string;
    image?: string;
    readAt?: string | null;
    createdAt: string;
    sender?: {
        id: number;
        firstname: string;
        lastname: string;
        picture?: string;
    };
}

export default function NotificationCenter() {
    const { data: userResponse } = useLoadUserQuery({});
    const currentUser = userResponse?.payload;
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchNotifications();
        
        // Refresh every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    const fetchNotifications = async () => {
        try {
            const [notifRes, countRes] = await Promise.all([
                axiosClient.get('/api/v1/notifications?limit=20&offset=0'),
                axiosClient.get('/api/v1/notifications/unread/count')
            ]);

            setNotifications(notifRes.data.payload?.notifications || []);
            setUnreadCount(countRes.data.payload?.count || 0);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markAsRead = async (notificationId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await axiosClient.put(`/api/v1/notifications/${notificationId}/read`);
            fetchNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const deleteNotification = async (notificationId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await axiosClient.delete(`/api/v1/notifications/${notificationId}`);
            fetchNotifications();
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axiosClient.put('/api/v1/notifications/read/all');
            fetchNotifications();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getNotificationIcon = (type: string): string => {
        switch (type) {
            case 'message':
                return '💬';
            case 'reminder':
                return '⏰';
            case 'assignment':
                return '📋';
            case 'announcement':
                return '📢';
            case 'admin_contact':
                return '👨‍💼';
            default:
                return '🔔';
        }
    };

    const getNotificationColor = (type: string): string => {
        switch (type) {
            case 'message':
                return 'bg-blue-50 border-l-blue-500';
            case 'reminder':
                return 'bg-amber-50 border-l-amber-500';
            case 'assignment':
                return 'bg-purple-50 border-l-purple-500';
            case 'announcement':
                return 'bg-green-50 border-l-green-500';
            case 'admin_contact':
                return 'bg-red-50 border-l-red-500';
            default:
                return 'bg-slate-50 border-l-slate-500';
        }
    };

    const timeAgo = (date: string): string => {
        const now = new Date();
        const notifDate = new Date(date);
        const seconds = Math.floor((now.getTime() - notifDate.getTime()) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
                <BellIcon className="w-6 h-6 text-slate-700" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-slate-200 z-50 flex flex-col max-h-96">
                    {/* Header */}
                    <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900">Notifications</h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors font-medium"
                                >
                                    Mark all as read
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <XMarkIcon className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="flex-1 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                <BellIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                <p className="font-medium">No notification</p>
                                <p className="text-sm">You are all caught up!</p>
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif.id}
                                    className={`p-4 border-b border-slate-100 border-l-4 ${getNotificationColor(
                                        notif.type
                                    )} ${!notif.readAt ? 'bg-opacity-100' : 'bg-opacity-50'} hover:bg-opacity-100 transition-all cursor-pointer group`}
                                >
                                    <div className="flex gap-3">
                                        {/* Icon */}
                                        <div className="text-2xl flex-shrink-0">
                                            {getNotificationIcon(notif.type)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-slate-900 text-sm">
                                                        {notif.title}
                                                    </h4>
                                                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                                                        {notif.message}
                                                    </p>
                                                </div>
                                                {!notif.readAt && (
                                                    <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-1" />
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-400 mt-2">
                                                {timeAgo(notif.createdAt)}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                            {!notif.readAt && (
                                                <button
                                                    onClick={(e) => markAsRead(notif.id, e)}
                                                    className="p-1 hover:bg-slate-200 rounded transition-colors"
                                                    title="Mark as read"
                                                >
                                                    <CheckIcon className="w-4 h-4 text-slate-600" />
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => deleteNotification(notif.id, e)}
                                                className="p-1 hover:bg-red-100 rounded transition-colors"
                                                title="Delete"
                                            >
                                                <TrashIcon className="w-4 h-4 text-red-600" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-slate-200 text-center">
                            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}