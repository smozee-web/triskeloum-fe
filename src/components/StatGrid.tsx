// src/components/admin/StatsGrid.tsx
import React from 'react';
import KPICard from './KPICard';
import {
    UsersIcon,
    AcademicCapIcon,
    ChatBubbleLeftRightIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import { DashboardKPIs } from '../utils/typeDef';


interface StatsGridProps {
    kpis: DashboardKPIs;
}

const StatsGrid: React.FC<StatsGridProps> = ({ kpis }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KPICard
                title="Total users"
                value={kpis.totalUsers.toLocaleString()}
                subtitle={`+${kpis.newUsersWeek} this week`}
                icon={<UsersIcon className="w-6 h-6" />}
                trend={{
                    value: kpis.usersGrowth,
                    isPositive: parseFloat(kpis.usersGrowth) > 0
                }}
            />

            <KPICard
                title="Available courses"
                value={kpis.totalCourses}
                subtitle={`${kpis.publishedCourses} published`}
                icon={<AcademicCapIcon className="w-6 h-6" />}
            />

            <KPICard
                title="Messages"
                value={kpis.messagesToday}
                subtitle={`${kpis.messagesWeek} this week`}
                icon={<ChatBubbleLeftRightIcon className="w-6 h-6" />}
            />

            <KPICard
                title="Active users"
                value={kpis.activeUsers}
                subtitle={`${kpis.activeUsersPercentage}% of total`}
                icon={<ChartBarIcon className="w-6 h-6" />}
            />
        </div>
    );
};

export default StatsGrid;
