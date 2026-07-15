// src/components/ui/LevelBadge.tsx
import React from 'react';

interface Level {
  id: number;
  name: string;
  rank: number;
  is_public?: boolean;
}

interface LevelBadgeProps {
  level: Level;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showRank?: boolean;
}

const LevelBadge: React.FC<LevelBadgeProps> = ({ 
  level, 
  size = 'md',
  showIcon = true,
  showRank = true
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

  // Level configuration based on rank
  const getLevelConfig = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          color: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: '🟦',
          label: 'Beginner'
        };
      case 2:
        return {
          color: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: '🟪',
          label: 'Intermediate'
        };
      case 3:
        return {
          color: 'bg-orange-50 text-orange-700 border-orange-200',
          icon: '🟧',
          label: 'Advanced'
        };
      case 4:
        return {
          color: 'bg-red-50 text-red-700 border-red-200',
          icon: '🟥',
          label: 'Expert'
        };
      default:
        return {
          color: 'bg-gray-50 text-gray-700 border-gray-200',
          icon: '⚪',
          label: 'Not defined'
        };
    }
  };

  const levelConfig = getLevelConfig(level?.rank || 0);
  const displayName = level?.name || 'Not defined';

  return (
    <span
      className={`
        inline-flex items-center space-x-1.5 font-medium rounded-full border
        ${sizeClasses[size]}
        ${levelConfig.color}
      `}
      title={`Level ${level?.rank} - ${levelConfig.label}`}
    >
      {showIcon && (
        <span className={iconSize[size]}>
          {levelConfig.icon}
        </span>
      )}
      <span>
        {showRank && level?.rank && `Lvl. ${level.rank} - `}
        {displayName}
      </span>
    </span>
  );
};

// Simplified version for common cases
export const SimpleLevelBadge: React.FC<{ rank: number; size?: 'sm' | 'md' | 'lg' }> = ({ 
  rank, 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const levelConfig = {
    1: { color: 'bg-blue-100 text-blue-800 border-blue-300', label: 'Lvl. 1' },
    2: { color: 'bg-purple-100 text-purple-800 border-purple-300', label: 'Lvl. 2' },
    3: { color: 'bg-orange-100 text-orange-800 border-orange-300', label: 'Lvl. 3' },
    4: { color: 'bg-red-100 text-red-800 border-red-300', label: 'Lvl. 4' }
  };

  const config = levelConfig[rank as keyof typeof levelConfig] ||
    { color: 'bg-gray-100 text-gray-800 border-gray-300', label: `Lvl. ${rank}` };

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border
        ${sizeClasses[size]}
        ${config.color}
      `}
    >
      {config.label}
    </span>
  );
};

export default LevelBadge;