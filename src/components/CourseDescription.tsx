// src/components/course/CourseDescription.tsx
import React from 'react';

interface CourseDescriptionProps {
  legend: string;
}

const CourseDescription: React.FC<CourseDescriptionProps> = ({ legend }) => {
  if (!legend) return null;

  return (
    <div className="bg-gradient-to-br from-[#D4AF37]/5 to-[#FFD700]/5 dark:from-[#D4AF37]/10 dark:to-[#FFD700]/10 rounded-lg p-6 border border-[#D4AF37]/20 dark:border-[#D4AF37]/30">
      <span className="text-sm font-semibold mb-4 block"
        style={{
          background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
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