// src/components/admin/courses/AdminCourseListItem.tsx
import React from 'react';
import {
    PencilIcon,
    TrashIcon,
    ClockIcon,
    EyeIcon,
    EyeSlashIcon,
    BookOpenIcon,
    AcademicCapIcon
} from '@heroicons/react/24/outline';
import { Course } from '../utils/typeDef';
import { getImageUrl } from '../utils/imageUtils';

interface AdminCourseListItemProps {
    course: Course;
    onView: (course: Course) => void;
    onEdit: (course: Course) => void;
    onDelete: (course: Course) => void;
    onTogglePublish: (course: Course) => void;
}

const AdminCourseListItem: React.FC<AdminCourseListItemProps> = ({
    course,
    onView,
    onEdit,
    onDelete,
    onTogglePublish
}) => {
    return (
        <div className="bg-white dark:bg-bg-tertiary rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-200 group">
            <div className="flex items-center gap-4 p-4">
                {/* Image - Compact square */}
                <div className="relative w-24 h-24 flex-shrink-0 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-lg overflow-hidden">
                    {course.cover ? (
                        <img
                            src={getImageUrl(course.cover)}
                            alt={course.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                    ) : (
                        <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                            <AcademicCapIcon className="w-10 h-10 text-black opacity-30" />
                        </div>
                    )}
                </div>

                {/* Content - Main info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-text-primary line-clamp-1 mb-1">
                                {course.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-text-tertiary line-clamp-1">
                                {course.legend || '—'}
                            </p>
                        </div>

                        {/* Status Badge */}
                        <div className="flex-shrink-0">
                            {course.published ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 dark:bg-green-700 text-white rounded-full text-xs font-medium shadow-sm">
                                    <EyeSlashIcon className="w-3.5 h-3.5" />
                                    Published
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-600 dark:bg-gray-700 text-white rounded-full text-xs font-medium shadow-sm">
                                    <EyeIcon className="w-3.5 h-3.5" />
                                    Draft
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-text-secondary">
                        <span className="inline-flex items-center gap-1">
                            <ClockIcon className="w-4 h-4" />
                            {course.est_time_min} min
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <BookOpenIcon className="w-4 h-4" />
                            {course.sections?.length || 0} sections
                        </span>
                        <span className="text-gray-400 dark:text-gray-600">•</span>
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-text-primary rounded text-xs font-medium">
                            {course.levels?.[0]?.name || 'N/A'}
                        </span>
                        <span className="text-gray-400 dark:text-gray-600">•</span>
                        <span className="text-gray-600 dark:text-text-secondary">{course.category.title}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                        onClick={() => onView(course)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                        title="View details"
                    >
                        <EyeIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">Details</span>
                    </button>
                    <button
                        onClick={() => onTogglePublish(course)}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            course.published
                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40'
                        }`}
                        title={course.published ? 'Unpublish' : 'Publish'}
                    >
                        {course.published ? (
                            <>
                                <EyeSlashIcon className="w-4 h-4" />
                                <span>Unpublish</span>
                            </>
                        ) : (
                            <>
                                <EyeIcon className="w-4 h-4" />
                                <span>Publish</span>
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => onEdit(course)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                        title="Edit"
                    >
                        <PencilIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">Edit</span>
                    </button>
                    <button
                        onClick={() => onDelete(course)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                        title="Delete"
                    >
                        <TrashIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">Delete</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminCourseListItem;
