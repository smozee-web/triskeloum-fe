// src/components/course/CourseDescription.tsx
import React from 'react';

interface CourseDescriptionProps {
  legend: string;
}

const CourseDescription: React.FC<CourseDescriptionProps> = ({ legend }) => {
  if (!legend) return null;

  return (
    <div className="bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-primary-light)]/5 dark:from-[var(--color-primary)]/10 dark:to-[var(--color-primary-light)]/10 rounded-lg p-6 border border-[var(--color-primary)]/20 dark:border-[var(--color-primary)]/30">
      <span className="text-sm font-semibold mb-4 block"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
        About this course
      </span>
      <p className="text-gray-700 dark:text-text-secondary text-sm leading-relaxed">
        {legend}
      </p>
    </div>
  );
};

export default CourseDescription;