// src/components/admin/categories/SearchBar.tsx
import React from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
    value,
    onChange,
    placeholder = 'Search for a category...'
}) => {
    return (
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-800 rounded-lg bg-white dark:bg-bg-tertiary text-gray-900 dark:text-text-primary placeholder-gray-400 dark:placeholder-text-tertiary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                placeholder={placeholder}
            />
            {value && (
                <button
                    onClick={() => onChange('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                    <XMarkIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                </button>
            )}
        </div>
    );
};

export default SearchBar;