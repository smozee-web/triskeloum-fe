// src/components/CategoryCard.tsx
import React, { useState } from 'react';
import {
    PencilIcon,
    TrashIcon,
    BookOpenIcon
} from '@heroicons/react/24/outline';
import { Category } from '../utils/typeDef';

interface CategoryCardProps {
    category: Category;
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
    onViewCourses: (category: Category) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
    category,
    onEdit,
    onDelete,
    onViewCourses
}) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(!!category.cover);

    const getImageUrl = (): string | null => {
        if (!category.cover) return null;
        return category.cover;
    };

    const imageUrl = getImageUrl();

    const handleImageLoad = () => {
        setImageLoading(false);
    };

    const handleImageError = () => {
        console.error('Failed to load image:', imageUrl);
        setImageError(true);
        setImageLoading(false);
    };

    const isDisabled = (category.courses_count || 0) > 0;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-gray-200 transition-all duration-200 group">
            {/* Image Section - Plus compact */}
            <div
                className="relative h-32 bg-gray-100 overflow-hidden cursor-pointer"
                onClick={() => onViewCourses(category)}
            >
                {imageUrl && !imageError && (
                    <div className="relative w-full h-full">
                        <img
                            src={imageUrl}
                            alt={category.title}
                            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 ${imageLoading ? 'opacity-0' : 'opacity-100'
                                }`}
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                        />

                        {imageLoading && (
                            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                        )}
                    </div>
                )}

                {(!imageUrl || imageError) && (
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-50">
                        <BookOpenIcon className="w-10 h-10 text-gray-300" />
                    </div>
                )}

                {/* Course count badge - compact */}
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-0.5 rounded text-xs font-medium">
                    {category.courses_count || 0}
                </div>
            </div>

            {/* Content */}
            <div className="p-3">
                <h3
                    className="text-sm font-semibold text-gray-900 line-clamp-1 mb-0.5 cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => onViewCourses(category)}
                    title={category.title}
                >
                    {category.title}
                </h3>

                <p className="text-xs text-gray-400 mb-2">
                    {new Date(category.created_at).toLocaleDateString('en-US')}
                </p>

                {/* Actions - Compact */}
                <div className="flex gap-1.5">
                    <button
                        onClick={() => onEdit(category)}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors text-xs font-medium"
                        title="Edit"
                    >
                        <PencilIcon className="w-3.5 h-3.5" />
                    </button>

                    <button
                        onClick={() => onDelete(category)}
                        className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${isDisabled
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-red-50 text-red-700 hover:bg-red-100'
                            }`}
                        disabled={isDisabled}
                        title={isDisabled ? 'Not possible (associated courses)' : 'Delete'}
                    >
                        <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CategoryCard;