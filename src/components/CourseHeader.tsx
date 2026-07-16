// src/components/course/CourseHeader.tsx
import React from 'react';
import { Course } from '../utils/typeDef';
import StatusBadge from './StatusBadge';
import LevelBadge from './LevelBadge';
import { getImageUrl } from '../utils/imageUtils';

interface CourseHeaderProps {
    course: Course;
}

const CourseHeader: React.FC<CourseHeaderProps> = ({ course }) => {
  
    return (
        <div className="relative">
            <div className="h-64 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] relative overflow-hidden">
                {course?.cover && (
                    <img
                        src={getImageUrl(course?.cover)}
                        alt={course.title}
                        className="w-full h-full object-cover"
                    />
                )}
                <div className="absolute inset-0 bg-black/20 dark:bg-black/40" />

                {/* Floating badges */}
                <div className="absolute top-6 right-6 flex space-x-3">
                    <StatusBadge published={course.published} />
                    {course.levels?.[0] && <LevelBadge level={course.levels[0]} />}
                </div>
            </div>

            {/* Overlaid content */}
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black/80 to-transparent">
                <div className="max-w-4xl">
                    {/* Category */}
                    {course.category && (
                        <span className="inline-block px-3 py-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-black text-sm font-medium rounded-full mb-3">
                            {course.category.title}
                        </span>
                    )}

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-bold mb-3"
                        style={{
                            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                        {course.title}
                    </h1>

                    {/* Metadata */}
                    <div className="flex items-center space-x-6 text-white text-sm">
                        <div className="flex items-center space-x-2">
                            <span>⏱️</span>
                            <span>{course.est_time_min} min</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span>📚</span>
                            <span>{course.sections?.length || 0} sections</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span>📅</span>
                            <span>
                                Created on {new Date(course.created_at).toLocaleDateString('en-US')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseHeader;