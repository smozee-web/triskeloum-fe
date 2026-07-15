// src/components/admin/categories/EmptyState.tsx
import React from 'react';
import { FolderPlusIcon } from '@heroicons/react/24/outline';

interface EmptyStateProps {
    onCreateClick: () => void;
    isSearching?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onCreateClick, isSearching = false }) => {
    return (
        <div className="text-center py-12">
            <FolderPlusIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
                {isSearching ? 'No results' : 'No category'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
                {isSearching
                    ? 'Try adjusting your search'
                    : 'Start by creating a new category'
                }
            </p>
            {!isSearching && (
                <div className="mt-6">
                    <button
                        onClick={onCreateClick}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                    >
                        <FolderPlusIcon className="-ml-1 mr-2 h-5 w-5" />
                        Create a category
                    </button>
                </div>
            )}
        </div>
    );
};

export default EmptyState;