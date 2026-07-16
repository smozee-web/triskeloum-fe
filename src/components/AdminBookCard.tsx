// src/components/AdminBookCard.tsx
import React from 'react';
import {
    PencilIcon,
    TrashIcon,
    BookOpenIcon,
    EyeIcon,
    EyeSlashIcon,
    ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { getImageUrl } from '../utils/imageUtils';

interface AdminBookCardProps {
    book: any;
    onEdit: (book: any) => void;
    onDelete: (book: any) => void;
    onTogglePublish: (book: any) => void;
}

const AdminBookCard: React.FC<AdminBookCardProps> = ({ book, onEdit, onDelete, onTogglePublish }) => {
    const isFree = (parseFloat(book.priceGhs) || 0) === 0 && (parseFloat(book.priceUsd) || 0) === 0;
    const priceLabel = isFree ? 'Free' : `${Number(book.priceGhs).toLocaleString()} GHS`;

    return (
        <div className="bg-white dark:bg-bg-tertiary rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-200 group">
            {/* Cover */}
            <div className="relative h-32 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] overflow-hidden">
                {book.coverImageUrl ? (
                    <img
                        src={getImageUrl(book.coverImageUrl)}
                        alt={book.titleEn}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                ) : (
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                        <BookOpenIcon className="w-12 h-12 text-black opacity-30" />
                    </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-2 left-2 z-20">
                    {book.isActive ? (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-green-600 dark:bg-green-700 text-white rounded text-xs font-medium shadow-sm">
                            <EyeIcon className="w-3 h-3" />
                            Published
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-gray-600 dark:bg-gray-700 text-white rounded text-xs font-medium shadow-sm">
                            <EyeSlashIcon className="w-3 h-3" />
                            Draft
                        </span>
                    )}
                </div>

                {/* Category Badge */}
                <div className="absolute top-2 right-2 bg-white dark:bg-bg-secondary bg-opacity-95 dark:bg-opacity-95 px-2 py-0.5 rounded text-xs font-medium text-gray-700 dark:text-text-primary shadow-sm max-w-[65%] truncate">
                    {book.category ? `${book.category.icon || ''} ${book.category.nameEn}`.trim() : 'Uncategorized'}
                </div>
            </div>

            {/* Content */}
            <div className="p-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-text-primary line-clamp-2 mb-1">
                    {book.titleEn}
                </h3>

                <p className="text-xs text-gray-500 dark:text-text-tertiary mb-2 line-clamp-1">
                    {book.authorName ? `by ${book.authorName}` : '—'}
                </p>

                {/* Meta Info */}
                <div className="flex items-center gap-2 mb-2 text-xs text-gray-600 dark:text-text-secondary">
                    <span className={`font-semibold ${isFree ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {priceLabel}
                    </span>
                    <span className="text-gray-400 dark:text-gray-600">•</span>
                    <span className="inline-flex items-center gap-0.5">
                        {book.deliveryMode === 'DOWNLOADABLE' ? (
                            <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                        ) : (
                            <BookOpenIcon className="w-3.5 h-3.5" />
                        )}
                        {book.deliveryMode === 'DOWNLOADABLE' ? 'Downloadable' : 'Read-only'}
                    </span>
                </div>

                {/* Actions */}
                <div className="flex gap-1.5">
                    <button
                        onClick={() => book.fileUrl && window.open(getImageUrl(book.fileUrl), '_blank', 'noopener,noreferrer')}
                        disabled={!book.fileUrl}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        title={book.fileUrl ? 'Preview file' : 'No file uploaded yet'}
                    >
                        <EyeIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => onTogglePublish(book)}
                        className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${book.isActive
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40'
                            }`}
                        title={book.isActive ? 'Unpublish' : 'Publish'}
                    >
                        {book.isActive ? (
                            <EyeSlashIcon className="w-3.5 h-3.5" />
                        ) : (
                            <EyeIcon className="w-3.5 h-3.5" />
                        )}
                    </button>
                    <button
                        onClick={() => onEdit(book)}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                        title="Edit"
                    >
                        <PencilIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => onDelete(book)}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                        title="Delete"
                    >
                        <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminBookCard;
