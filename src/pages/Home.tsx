// src/pages/admin/Dashboard.tsx
import React from 'react';
import { KPICardSkeleton, ChartSkeleton, TableSkeleton } from '../components/LoadingSkeleton';
import RecentUsersTable from '../components/RecentUsersTable';
import StatsGrid from '../components/StatGrid';
import TopCoursesTable from '../components/TopCoursesTable';
import UsersByLevelChart from '../components/UsersByLevelChart';
import UsersGrowthChart from '../components/UsersGrowthChart';
import { useGetDashboardOverviewQuery, useGetUsersGrowthChartQuery, useGetUsersByLevelQuery, useGetRecentActivityQuery } from '../services/api';



const Dashboard: React.FC = () => {
    // ✅ Fetch data
    const { data: overviewData, isLoading: isLoadingOverview } = useGetDashboardOverviewQuery();
    const { data: growthData, isLoading: isLoadingGrowth } = useGetUsersGrowthChartQuery(30);
    const { data: levelData, isLoading: isLoadingLevel } = useGetUsersByLevelQuery();
    const { data: activityData, isLoading: isLoadingActivity } = useGetRecentActivityQuery(10);

    return (
        <div className="min-h-screen p-4 md:p-6 bg-gray-50 dark:bg-bg-primary transition-colors duration-300">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold mb-1"
                    style={{
                        background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                    Dashboard
                </h1>
                <p className="text-sm text-gray-600 dark:text-text-tertiary">
                    Overview of your platform
                </p>
            </div>

            {/* KPIs */}
            {isLoadingOverview ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[...Array(4)].map((_, i) => (
                        <KPICardSkeleton key={i} />
                    ))}
                </div>
            ) : overviewData?.payload?.kpis ? (
                <StatsGrid kpis={overviewData.payload.kpis} />
            ) : null}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                {isLoadingGrowth ? (
                    <ChartSkeleton />
                ) : growthData?.payload ? (
                    <UsersGrowthChart data={growthData.payload} />
                ) : null}

                {isLoadingLevel ? (
                    <ChartSkeleton />
                ) : levelData?.payload ? (
                    <UsersByLevelChart data={levelData.payload} />
                ) : null}
            </div>

            {/* Recent Activity - Hidden for now */}
            <div className="hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Recent Users */}
                    {isLoadingActivity ? (
                        <TableSkeleton />
                    ) : activityData?.payload?.users ? (
                        <RecentUsersTable users={activityData.payload.users} />
                    ) : null}

                    {/* Top Courses */}
                    {isLoadingOverview ? (
                        <TableSkeleton />
                    ) : overviewData?.payload?.topCourses ? (
                        <TopCoursesTable courses={overviewData.payload.topCourses} />
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
