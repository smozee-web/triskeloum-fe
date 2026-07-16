// src/components/admin/UsersGrowthChart.tsx
import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

interface ChartData {
    date: string;
    count: number;
}

interface UsersGrowthChartProps {
    data: ChartData[];
}

const UsersGrowthChart: React.FC<UsersGrowthChartProps> = ({ data }) => {
    const formattedData = data.map(item => ({
        ...item,
        formattedDate: format(new Date(item.date), 'dd MMM', { locale: enUS })
    }));

    return (
        <div className="relative bg-gradient-to-br from-amber-50/30 to-white dark:from-transparent dark:to-transparent dark:bg-bg-tertiary rounded-xl p-6 border border-gray-200 dark:border-gray-800 transition-colors duration-300 hover:border-amber-500 dark:hover:border-amber-500 group overflow-hidden shadow-sm hover:shadow-md">
            {/* Gold gradient accent - always visible */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent dark:from-amber-500/5 dark:to-transparent pointer-events-none" />
            <div className="relative z-10">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-text-primary mb-4">
                    Registration growth
                </h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={formattedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis
                        dataKey="formattedDate"
                        tick={{ fontSize: 12, fill: '#9ca3af' }}
                        stroke="#374151"
                    />
                    <YAxis
                        tick={{ fontSize: 12, fill: '#9ca3af' }}
                        stroke="#374151"
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1a1a1a',
                            border: '1px solid var(--color-primary)',
                            borderRadius: '0.5rem',
                            color: '#ffffff'
                        }}
                    />
                    <Legend
                        wrapperStyle={{ color: '#9ca3af' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="count"
                        stroke="var(--color-primary)"
                        strokeWidth={3}
                        name="New users"
                        dot={{ fill: 'var(--color-primary-light)', r: 4, strokeWidth: 2, stroke: 'var(--color-primary)' }}
                        activeDot={{ r: 6, fill: 'var(--color-primary-light)', stroke: 'var(--color-primary)', strokeWidth: 2 }}
                    />
                </LineChart>
            </ResponsiveContainer>
            </div>
        </div>
    );
};

export default UsersGrowthChart;