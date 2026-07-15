// src/components/CourseForm/PartItem.tsx
import React from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import RichTextEditor from './RichTextEditor';

interface PartItemProps {
  part: any;
  partIndex: number;
  isCollapsed: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onChange: (field: string, value: any) => void;
}

const PartItem: React.FC<PartItemProps> = ({
  part,
  partIndex,
  isCollapsed,
  onToggle,
  onRemove,
  onChange
}) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
      {/* Part header */}
      <div className="px-4 py-2 bg-gray-100 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1">
            <button
              type="button"
              onClick={onToggle}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              {isCollapsed ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronUpIcon className="w-4 h-4" />
              )}
            </button>
            <span className="text-xs font-medium text-gray-500">
              Part {partIndex + 1}
            </span>
            <input
              type="text"
              value={part.title}
              onChange={(e) => onChange('title', e.target.value)}
              className="font-medium text-gray-900 border-none focus:ring-0 p-0 bg-transparent flex-1"
              placeholder="Part title"
            />
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="text-sm text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded transition-all duration-200"
          >
            Delete
          </button>
        </div>
      </div>
      
      {/* Part content */}
      {!isCollapsed && (
        <div className="p-4 bg-white">
          <RichTextEditor
            value={part.content}
            onChange={(value) => onChange('content', value)}
            placeholder="Part content..."
          />
        </div>
      )}
    </div>
  );
};

export default PartItem;