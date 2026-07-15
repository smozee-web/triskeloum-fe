import { useState, useEffect } from 'react';
import {
    BellIcon,
    TrashIcon,
    CheckIcon,
    FunnelIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import axiosClient from '../../services/axiosClient';

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
    };
}

const notificationTypes = [
    { value: 'all', label: 'All' },
    { value: 'message', label: 'Messages' },
    { value: 'reminder', label: 'Reminders' },
    { value: 'assignment', label: 'Assignments' },
    { value: 'announcement', label: 'Announcements' },
    { value: 'admin_contact', label: 'Admin Contact' }
];

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedType, setSelectedType] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotifications();
    }, []);

    useEffect(() => {
        filterNotifications();
    }, [notifications, selectedType, searchQuery]);

    const fetchNotifications = async () => {
        try {
            setIsLoading(true);
            const response = await axiosClient.get('/api/v1/notifications?limit=100&offset=0');
            setNotifications(response.data.payload?.notifications || []);
            setUnreadCount(response.data.payload?.unreadCount || 0);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterNotifications = () => {
        let filtered = notifications;

        // Filter by type
        if (selectedType !== 'all') {
            filtered = filtered.filter(n => n.type === selectedType);
        }

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(n =>
                n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                n.message.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredNotifications(filtered);
    };

    const markAsRead = async (notificationId: number) => {
        try {
            await axiosClient.put(`/api/v1/notifications/${notificationId}/read`);
            fetchNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const deleteNotification = async (notificationId: number) => {
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
        const icons: Record<string, string> = {
            message: '💬',
            reminder: '⏰',
            assignment: '📋',
            announcement: '📢',
            admin_contact: '👨‍💼',
            system: '⚙️'
        };
        return icons[type] || '🔔';
    };

    const getNotificationColor = (type: string): string => {
        const colors: Record<string, string> = {
            message: 'from-blue-500 to-blue-600',
            reminder: 'from-amber-500 to-amber-600',
            assignment: 'from-purple-500 to-purple-600',
            announcement: 'from-green-500 to-green-600',
            admin_contact: 'from-red-500 to-red-600',
            system: 'from-slate-500 to-slate-600'
        };
        return colors[type] || 'from-slate-500 to-slate-600';
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

    const unreadFiltered = filteredNotifications.filter(n => !n.readAt).length;
    const readFiltered = filteredNotifications.filter(n => n.readAt).length;

    return (
        <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 p-8 overflow-auto">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-8 flex-shrink-0">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-blue-100 rounded-lg">
                        <BellIcon className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900">Notifications</h1>
                        <p className="text-slate-600 mt-1">
                            {unreadCount} unread
                        </p>
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-white rounded-lg shadow-sm p-6 flex gap-4 items-center flex-wrap">
                    {/* Search */}
                    <div className="flex-1 min-w-64 relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                            >
                                <CheckIcon className="w-5 h-5" />
                                Mark all as read
                            </button>
                        )}
                        <button
                            onClick={fetchNotifications}
                            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                        >
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="max-w-6xl mx-auto mb-6">
                <div className="flex gap-2 flex-wrap">
                    {notificationTypes.map(type => (
                        <button
                            key={type.value}
                            onClick={() => setSelectedType(type.value)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                selectedType === type.value
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-white text-slate-700 border border-slate-200 hover:border-blue-300'
                            }`}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="max-w-6xl mx-auto mb-8 grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-l-blue-600">
                    <p className="text-slate-600 text-sm font-medium">Unread</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{unreadFiltered}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-l-green-600">
                    <p className="text-slate-600 text-sm font-medium">Read</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{readFiltered}</p>
                </div>
            </div>

            {/* Notifications List */}
            <div className="max-w-6xl mx-auto">
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin">
                            <BellIcon className="w-8 h-8 text-blue-600" />
                        </div>
                        <p className="text-slate-600 mt-4">Loading...</p>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <BellIcon className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-600 text-lg font-medium">No notification</p>
                        <p className="text-slate-500 text-sm mt-2">
                            {selectedType === 'all' ? 'You are all caught up!' : 'No notification of this type'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredNotifications.map(notif => (
                            <div
                                key={notif.id}
                                className={`bg-white rounded-lg shadow-sm border-l-4 border-l-blue-600 p-6 hover:shadow-md transition-all ${
                                    !notif.readAt ? 'ring-1 ring-blue-200' : ''
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getNotificationColor(notif.type)} flex items-center justify-center text-2xl flex-shrink-0`}>
                                        {getNotificationIcon(notif.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-lg">
                                                    {notif.title}
                                                </h3>
                                                <p className="text-slate-600 mt-2">
                                                    {notif.message}
                                                </p>
                                                <p className="text-slate-400 text-sm mt-3">
                                                    {timeAgo(notif.createdAt)}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {!notif.readAt && (
                                                    <>
                                                        <span className="inline-block w-3 h-3 rounded-full bg-blue-600"></span>
                                                        <button
                                                            onClick={() => markAsRead(notif.id)}
                                                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                                            title="Mark as read"
                                                        >
                                                            <CheckIcon className="w-5 h-5 text-slate-600" />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => deleteNotification(notif.id)}
                                                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <TrashIcon className="w-5 h-5 text-red-600" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}