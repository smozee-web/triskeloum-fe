// src/components/CategoryCoursesModal.tsx
import React from 'react';
import { XMarkIcon, BookOpenIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Category } from '../utils/typeDef';
import { useGetCoursesByCategoryQuery } from '../services/api';
import { getImageUrl } from '../utils/imageUtils';

interface CategoryCoursesModalProps {
    isOpen: boolean;
    onClose: () => void;
    category: Category | null;
}

const CategoryCoursesModal: React.FC<CategoryCoursesModalProps> = ({
    isOpen,
    onClose,
    category
}) => {
    const { data, isLoading, isError } = useGetCoursesByCategoryQuery(
        category?.id || 0,
        { skip: !category }
    );

    if (!isOpen) return null;

    const courses = data?.payload?.data || [];

    // Helper to format the date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // Helper to get the level name
    const getLevelName = (level: any) => {
        if (!level) return '-';
        return typeof level === 'object' ? level.name : level;
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Overlay with blur */}
            <div 
                className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-all duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full transform transition-all animate-in zoom-in-95 duration-300">
                    {/* Header with gradient */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-2xl">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">
                                {category?.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                {courses.length} courses in this category
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-full p-2 transition-all duration-200"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                        {isLoading ? (
                            /* Loading State */
                            <div className="flex items-center justify-center py-12">
                                <div className="flex flex-col items-center gap-3">
                                    <svg className="animate-spin h-10 w-10 text-gray-400" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <p className="text-gray-600">Loading courses...</p>
                                </div>
                            </div>
                        ) : isError ? (
                            /* Error State */
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <p className="text-red-600 font-medium">An error occurred</p>
                                    <p className="text-gray-600 text-sm mt-1">Unable to load courses</p>
                                </div>
                            </div>
                        ) : courses.length === 0 ? (
                            /* Empty State */
                            <div className="flex flex-col items-center justify-center py-12">
                                <BookOpenIcon className="w-16 h-16 text-gray-300 mb-4" />
                                <p className="text-gray-600 font-medium">No courses in this category</p>
                                <p className="text-gray-500 text-sm mt-1">
                                    Add courses to get started
                                </p>
                            </div>
                        ) : (
                            /* Table */
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Course
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Level
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Duration
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Created date
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {courses.map((course: any) => (
                                            <tr 
                                                key={course.id}
                                                className="hover:bg-gray-50 transition-colors duration-150"
                                            >
                                                {/* Course (with image) */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg overflow-hidden">
                                                            {course.cover ? (
                                                                <img
                                                                    src={getImageUrl(course.cover)}
                                                                    alt={course.title}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <BookOpenIcon className="w-6 h-6 text-white" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                {course.title}
                                                            </p>
                                                            <p className="text-xs text-gray-500 truncate">
                                                                {course.description || 'No description'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Level */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {getLevelName(course.levels?.[0])}
                                                    </span>
                                                </td>

                                                {/* Duration */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {course.duration ? (
                                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                                            <ClockIcon className="w-4 h-4" />
                                                            <span>{course.duration}h</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">-</span>
                                                    )}
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {course.is_published ? (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            <CheckCircleIcon className="w-4 h-4" />
                                                            Published
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                            <XCircleIcon className="w-4 h-4" />
                                                            Unpublished
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Date */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {formatDate(course.created_at)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Footer with improved style */}
                    <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm font-medium"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryCoursesModal;