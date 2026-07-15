// src/components/admin/categories/StatsCards.tsx
import React from 'react';
import { FolderIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface StatsCardsProps {
    total: number;
    withCourses: number;
    empty: number;
}

const StatsCards: React.FC<StatsCardsProps> = ({ total, withCourses, empty }) => {
    const stats = [
        {
            label: 'Total',
            value: total,
            icon: FolderIcon,
            color: 'blue',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600'
        },
        {
            label: 'With courses',
            value: withCourses,
            icon: CheckCircleIcon,
            color: 'green',
            bgColor: 'bg-green-50',
            textColor: 'text-green-600'
        },
        {
            label: 'Empty',
            value: empty,
            icon: XCircleIcon,
            color: 'orange',
            bgColor: 'bg-orange-50',
            textColor: 'text-orange-600'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                    <div
                        key={stat.label}
                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    {stat.label}
                                </p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {stat.value}
                                </p>
                            </div>
                            <div className={`${stat.bgColor} p-3 rounded-lg`}>
                                <Icon className={`w-8 h-8 ${stat.textColor}`} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default StatsCards;