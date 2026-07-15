// src/components/CourseCard.tsx
import React from 'react';
import { 
    ClockIcon, 
    AcademicCapIcon
} from '@heroicons/react/24/outline';
import { getImageUrl } from '../utils/imageUtils';

interface Course {
    id: number;
    title: string;
    description: string;
    cover?: string;
    duration?: number;
    levels?: Array<{
        id: number;
        name: string;
        is_public: boolean;
    }>;
    is_published: boolean;
    created_at: string;
}

interface CourseCardProps {
    course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
    const levelDisplay = course.levels?.[0]?.name || 'N/A';

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-gray-200 transition-all duration-200 group">
            {/* Image - Compact */}
            <div className="relative h-32 bg-gradient-to-br from-indigo-400 to-purple-500 overflow-hidden">
                {course.cover ? (
                    <img
                        src={getImageUrl(course.cover)}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <AcademicCapIcon className="w-10 h-10 text-white opacity-40" />
                    </div>
                )}
                
                {/* Status Badge */}
                {course.is_published && (
                    <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-0.5 rounded text-xs font-medium">
                        ✓ Published
                    </div>
                )}
            </div>

            {/* Content - Compact */}
            <div className="p-3">
                <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">
                    {course.title}
                </h4>
                
                <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                    {course.description || '—'}
                </p>

                {/* Meta Info - Une seule ligne */}
                <div className="flex items-center gap-2 text-xs text-gray-600">
                    {course.duration && (
                        <span className="inline-flex items-center gap-0.5">
                            <ClockIcon className="w-3.5 h-3.5" />
                            {course.duration}h
                        </span>
                    )}
                    {course.duration && levelDisplay && (
                        <span className="text-gray-300">•</span>
                    )}
                    {levelDisplay && (
                        <span className="text-gray-600 truncate">{levelDisplay}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseCard;