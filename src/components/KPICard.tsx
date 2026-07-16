// src/components/admin/KPICard.tsx
import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

interface KPICardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    trend?: {
        value: string;
        isPositive: boolean;
    };
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

const KPICard: React.FC<KPICardProps> = ({
    title,
    value,
    subtitle,
    icon,
    trend,
}) => {
    return (
        <div className="relative bg-gradient-to-br from-amber-50/30 to-white dark:from-transparent dark:to-transparent dark:bg-bg-tertiary rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-300 group overflow-hidden shadow-sm hover:shadow-md">
            {/* Gold gradient accent - always visible */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent dark:from-amber-500/5 dark:to-transparent" />

            {/* Content */}
            <div className="relative">
                {/* Icon */}
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-black">
                        {icon}
                    </div>
                </div>

                {/* Title */}
                <p className="text-xs font-medium text-gray-600 dark:text-text-tertiary uppercase tracking-wider mb-2">
                    {title}
                </p>

                {/* Value */}
                <p className="text-3xl font-bold text-gray-900 dark:text-text-primary mb-1">
                    {value}
                </p>

                {/* Subtitle */}
                {subtitle && (
                    <p className="text-sm text-gray-500 dark:text-text-muted">
                        {subtitle}
                    </p>
                )}

                {/* Trend */}
                {trend && (
                    <div className="flex items-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                        {trend.isPositive ? (
                            <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
                        ) : (
                            <ArrowDownIcon className="w-4 h-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm font-semibold ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {trend.value}%
                        </span>
                        <span className="text-xs text-gray-500 dark:text-text-muted ml-2">
                            vs last month
                        </span>
                    </div>
                )}
            </div>

            {/* Corner decoration */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
    );
};

export default KPICard;
