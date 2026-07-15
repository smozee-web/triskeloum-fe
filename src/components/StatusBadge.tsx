// src/components/ui/StatusBadge.tsx
import React from 'react';

interface StatusBadgeProps {
  published: boolean;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  published, 
  size = 'md',
  showIcon = true 
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const statusConfig = published
    ? {
        label: 'Published',
        icon: '🟢',
        classes: 'bg-green-50 text-green-700 border-green-200'
      }
    : {
        label: 'Draft',
        icon: '🟡',
        classes: 'bg-yellow-50 text-yellow-700 border-yellow-200'
      };

  return (
    <span
      className={`
        inline-flex items-center space-x-1.5 font-medium rounded-full border
        ${sizeClasses[size]}
        ${statusConfig.classes}
      `}
    >
      {showIcon && (
        <span className={iconSize[size]}>
          {statusConfig.icon}
        </span>
      )}
      <span>{statusConfig.label}</span>
    </span>
  );
};

export default StatusBadge;