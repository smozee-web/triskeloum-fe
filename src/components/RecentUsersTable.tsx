// src/components/admin/RecentUsersTable.tsx
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { User } from '../utils/typeDef';
import { getImageUrl } from '../utils/imageUtils';

interface RecentUsersTableProps {
    users: User[];
}

const RecentUsersTable: React.FC<RecentUsersTableProps> = ({ users }) => {
    // ✅ Gérer le cas où il n'y a pas d'utilisateurs
    if (!users || users.length === 0) {
        return (
            <div className="bg-white dark:bg-bg-tertiary rounded-xl border border-gray-200 dark:border-border overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-border">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-text-primary">Recent users</h3>
                </div>
                <div className="px-6 py-12 text-center">
                    <p className="text-gray-500 dark:text-text-muted">No users found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-bg-tertiary rounded-xl border border-gray-200 dark:border-border transition-colors duration-300 hover:border-amber-500 dark:hover:border-amber-500 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-border">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-text-primary">Recent users</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-border">
                    <thead className="bg-gray-50 dark:bg-bg-secondary">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-text-tertiary uppercase tracking-wider">
                                User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-text-tertiary uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-text-tertiary uppercase tracking-wider">
                                Level
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-text-tertiary uppercase tracking-wider">
                                Registered
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-text-tertiary uppercase tracking-wider">
                                Last login
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-bg-tertiary divide-y divide-gray-200 dark:divide-border">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-amber-900/10 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            {/* ✅ Gérer l'absence de firstname/lastname */}
                                            {user.picture ? (
                                                <img
                                                    className="h-10 w-10 rounded-full object-cover"
                                                    src={getImageUrl(user.picture)}
                                                    alt={`${user.firstname} ${user.lastname}`}
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center">
                                                    <span className="text-sm font-medium text-black">
                                                        {user.firstname?.[0]?.toUpperCase() || 'U'}
                                                        {user.lastname?.[0]?.toUpperCase() || ''}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-text-primary">
                                                {user.firstname} {user.lastname}
                                            </div>
                                            {/* ✅ Afficher le rôle si c'est un admin */}
                                            {user.role === 'admin' && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400">
                                                    Admin
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-text-primary">{user.email}</div>
                                    {/* ✅ Afficher le téléphone s'il existe */}
                                    {user.phone && (
                                        <div className="text-xs text-gray-500 dark:text-text-muted">{user.phone}</div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {/* ✅ Gérer l'absence de niveau */}
                                    {user.level ? (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400">
                                            {user.level.name}
                                        </span>
                                    ) : (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                            No level
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-text-muted">
                                    {/* ✅ Gérer les dates invalides */}
                                    {user.created_at ? (
                                        formatDistanceToNow(new Date(user.created_at), { 
                                            addSuffix: true, 
                                            locale: enUS
                                        })
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {/* ✅ Afficher un badge si jamais connecté */}
                                    {user.last_login ? (
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                            <span className="text-sm text-gray-500 dark:text-text-muted">
                                                {formatDistanceToNow(new Date(user.last_login), {
                                                    addSuffix: true,
                                                    locale: enUS
                                                })}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full mr-2"></div>
                                            <span className="text-sm text-gray-400 dark:text-text-muted">Never logged in</span>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentUsersTable;