// src/components/admin/UsersByLevelChart.tsx
import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Legend,
    Tooltip
} from 'recharts';

interface LevelData {
    level: string;
    count: number;
}

interface UsersByLevelChartProps {
    data: any[];
}

const COLORS = ['#D4AF37', '#FFD700', '#B8860B', '#f59e0b', '#fbbf24', '#eab308'];

const UsersByLevelChart: React.FC<UsersByLevelChartProps> = ({ data }) => {
    return (
        <div className="relative bg-gradient-to-br from-amber-50/30 to-white dark:from-transparent dark:to-transparent dark:bg-bg-tertiary rounded-xl p-6 border border-gray-200 dark:border-gray-800 transition-colors duration-300 hover:border-amber-500 dark:hover:border-amber-500 group overflow-hidden shadow-sm hover:shadow-md">
            {/* Gold gradient accent - always visible */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent dark:from-amber-500/5 dark:to-transparent pointer-events-none" />
            <div className="relative z-10">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-text-primary mb-4">
                    Distribution by level
                </h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ level, percent }: any) => `${level} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1a1a1a',
                            border: '1px solid #D4AF37',
                            borderRadius: '0.5rem',
                            color: '#ffffff'
                        }}
                    />
                    <Legend
                        wrapperStyle={{ color: '#9ca3af' }}
                    />
                </PieChart>
            </ResponsiveContainer>
            </div>
        </div>
    );
};

export default UsersByLevelChart;