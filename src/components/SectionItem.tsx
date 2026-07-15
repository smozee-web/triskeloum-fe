// src/components/CourseForm/SectionItem.tsx
import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import RichTextEditor from './RichTextEditor';
import PartItem from './PartItem';


interface SectionItemProps {
  section: any;
  sectionIndex: number;
  isCollapsed: boolean;
  coverPreview?: string;
  onToggle: () => void;
  onRemove: () => void;
  onChange: (field: string, value: any) => void;
  onContentChange: (field: string, value: any) => void;
  onCoverChange: (file: File, preview: string) => void;
  onCoverRemove: () => void;
}

const SectionItem: React.FC<SectionItemProps> = ({
  section,
  sectionIndex,
  isCollapsed,
  coverPreview,
  onToggle,
  onRemove,
  onChange,
  onContentChange,
  onCoverChange,
  onCoverRemove
}) => {
  const [collapsedParts, setCollapsedParts] = useState<Set<number>>(new Set());

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('The image must not exceed 5 MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onCoverChange(file, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddPart = () => {
    const newParts = [
      ...section.content.parts,
      {
        title: `Part ${section.content.parts.length + 1}`,
        content: ''
      }
    ];
    onContentChange('parts', newParts);
  };

  const handleRemovePart = (partIndex: number) => {
    const newParts = [...section.content.parts];
    newParts.splice(partIndex, 1);
    onContentChange('parts', newParts);
    
    setCollapsedParts(prev => {
      const newSet = new Set(prev);
      newSet.delete(partIndex);
      return newSet;
    });
  };

  const handlePartChange = (partIndex: number, field: string, value: any) => {
    const newParts = [...section.content.parts];
    newParts[partIndex][field] = value;
    onContentChange('parts', newParts);
  };

  const togglePart = (partIndex: number) => {
    setCollapsedParts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(partIndex)) {
        newSet.delete(partIndex);
      } else {
        newSet.add(partIndex);
      }
      return newSet;
    });
  };

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden shadow-sm">
      {/* Section header */}
      <div className="bg-gradient-to-r from-[#D4AF37]/10 to-[#FFD700]/10 dark:from-[#D4AF37]/20 dark:to-[#FFD700]/20 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <button
              type="button"
              onClick={onToggle}
              className="text-gray-500 dark:text-text-secondary hover:text-gray-700 dark:hover:text-text-primary transition-colors"
            >
              {isCollapsed ? (
                <ChevronDownIcon className="w-5 h-5" />
              ) : (
                <ChevronUpIcon className="w-5 h-5" />
              )}
            </button>
            <span className="w-7 h-7 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] text-black rounded-full flex items-center justify-center text-sm font-bold">
              {sectionIndex + 1}
            </span>
            <input
              type="text"
              value={section.title}
              onChange={(e) => onChange('title', e.target.value)}
              className="font-semibold text-gray-900 dark:text-text-primary bg-transparent border-none focus:ring-0 p-0 flex-1"
              placeholder="Section title"
            />
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 px-3 py-1 rounded transition-all duration-200"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Section content */}
      {!isCollapsed && (
        <div className="p-4 space-y-4 bg-white dark:bg-bg-secondary">
          {/* Section cover */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
              Section cover image
            </label>
            <div className="flex items-start space-x-4">
              <div className="flex-1">
                <label
                  htmlFor={`section-cover-${sectionIndex}`}
                  className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:border-amber-500 dark:hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all duration-200"
                >
                  <div className="text-center">
                    <PhotoIcon className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-600" />
                    <p className="mt-1 text-sm text-gray-600 dark:text-text-secondary">
                      {coverPreview ? 'Change image' : 'Click to upload'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-text-tertiary mt-1">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                  <input
                    id={`section-cover-${sectionIndex}`}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="hidden"
                  />
                </label>
              </div>
              {coverPreview && (
                <div className="relative">
                  <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-[#D4AF37]/30 dark:border-[#D4AF37]/50">
                    <img
                      src={coverPreview}
                      alt="Section cover preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={onCoverRemove}
                    className="absolute -top-2 -right-2 bg-red-500 dark:bg-red-600 text-white rounded-full p-1 hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section summary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
              Section summary
            </label>
            <RichTextEditor
              value={section.content.summary}
              onChange={(value) => onContentChange('summary', value)}
              placeholder="Section summary..."
            />
          </div>

          {/* Section parts */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-text-primary">
                Section parts ({section.content.parts.length})
              </h4>
              <button
                type="button"
                onClick={handleAddPart}
                className="text-sm text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30 px-3 py-1 rounded transition-all duration-200"
              >
                + Add a part
              </button>
            </div>
            
            <div className="space-y-3">
              {section.content.parts.map((part: any, partIndex: number) => (
                <PartItem
                  key={partIndex}
                  part={part}
                  partIndex={partIndex}
                  isCollapsed={collapsedParts.has(partIndex)}
                  onToggle={() => togglePart(partIndex)}
                  onRemove={() => handleRemovePart(partIndex)}
                  onChange={(field, value) => handlePartChange(partIndex, field, value)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionItem;