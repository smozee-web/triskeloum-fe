// src/components/course/CourseStats.tsx
import React from 'react';
import { Course } from '../utils/typeDef';


interface CourseStatsProps {
  course: Course;
}

const CourseStats: React.FC<CourseStatsProps> = ({ course }) => {
  const totalParts = course.sections?.reduce(
    (total, section) => total + (section.content?.parts?.length || 0), 
    0
  ) || 0;

  const stats = [
    {
      label: 'Sections',
      value: course.sections?.length || 0,
      icon: '📑',
      color: 'gold'
    },
    {
      label: 'Parts',
      value: totalParts,
      icon: '📝',
      color: 'gold'
    },
    {
      label: 'Estimated duration',
      value: `${course.est_time_min} min`,
      icon: '⏱️',
      color: 'gold'
    },
    {
      label: 'Level',
      value: course.levels?.[0]?.name || 'Not defined',
      icon: '🎯',
      color: 'gold'
    }
  ];

  const colorClasses = {
    gold: 'bg-gradient-to-br from-[#D4AF37]/10 to-[#FFD700]/10 dark:from-[#D4AF37]/20 dark:to-[#FFD700]/20 border-[#D4AF37]/30 dark:border-[#D4AF37]/50'
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`border rounded-lg p-4 text-center ${colorClasses[stat.color as keyof typeof colorClasses]}`}
        >
          <div className="text-xl mb-2">{stat.icon}</div>
          <div className="text-xl font-bold mb-1 text-gray-900 dark:text-text-primary">{stat.value}</div>
          <div className="text-xs font-medium text-gray-600 dark:text-text-secondary">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

export default CourseStats;