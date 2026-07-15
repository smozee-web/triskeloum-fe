// src/components/CourseForm/BasicInfo.tsx
import React, { useState, useEffect } from 'react';
import { UseFormRegister, FieldErrors, Controller, useFormContext } from 'react-hook-form';
import { useGetAllLevelsQuery, useGetAllCategoriesQuery } from '../services/api';
import { Level, Category } from '../utils/typeDef';
import { getImageUrl } from '../utils/imageUtils';

interface BasicInfoProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  coverPreview: string | null;
  setCoverPreview: (preview: string | null) => void;
  setMainCoverFile: (file: File | null) => void;
}

const BasicInfo: React.FC<BasicInfoProps> = ({
  register,
  errors,
  coverPreview,
  setCoverPreview,
  setMainCoverFile
}) => {
  const { data: levelsData } = useGetAllLevelsQuery();
  const { data: categoriesData } = useGetAllCategoriesQuery({ page: 1, limit: 100 });
  const { watch, setValue } = useFormContext();
  const [selectedLevels, setSelectedLevels] = useState<number[]>([]);
  
  const levels = Array.isArray(levelsData?.payload) 
    ? levelsData.payload 
    : (levelsData?.payload as any)?.data || [];
  const categories = categoriesData?.payload?.data || [];

  useEffect(() => {
    const watchedLevel = watch('level');
    const watchedLevels = watch('levels');
    
    if (watchedLevels && Array.isArray(watchedLevels)) {
      setSelectedLevels(watchedLevels);
    } else if (watchedLevel) {
      setSelectedLevels([watchedLevel]);
    }
  }, [watch('level'), watch('levels'), watch]);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setMainCoverFile(file);
    }
  };

  const handleRemoveCover = () => {
    setCoverPreview(null);
    setMainCoverFile(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left column */}
      <div className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-1">
            Course title *
          </label>
          <input
            id="title"
            type="text"
            {...register('title', { required: 'Title is required' })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary rounded-md focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent"
            placeholder="Enter the course title"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title.message as string}</p>
          )}
        </div>

        {/* Legend */}
        <div>
          <label htmlFor="legend" className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-1">
            Course legend *
          </label>
          <textarea
            id="legend"
            {...register('legend', { required: 'Legend is required' })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary rounded-md focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent"
            placeholder="Brief course description"
          />
          {errors.legend && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.legend.message as string}</p>
          )}
        </div>

        {/* Estimated time */}
        <div>
          <label htmlFor="est_time_min" className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-1">
            Estimated duration (minutes) *
          </label>
          <input
            id="est_time_min"
            type="number"
            min="1"
            {...register('est_time_min', {
              required: 'Duration is required',
              min: { value: 1, message: 'Duration must be positive' }
            })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary rounded-md focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent"
          />
          {errors.est_time_min && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.est_time_min.message as string}</p>
          )}
        </div>
      </div>
      
      {/* Right column */}
      <div className="space-y-6">
        {/* Cover image */}
        <div>
          <label htmlFor="cover" className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-1">
            Cover image
          </label>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                id="cover"
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary rounded-md focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent"
              />
            </div>
            {coverPreview && (
              <div className="relative">
                <div className="w-16 h-16 rounded-md overflow-hidden border-2 border-[#D4AF37]/30 dark:border-[#D4AF37]/50">
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCover}
                  className="absolute -top-2 -right-2 bg-red-500 dark:bg-red-600 text-white rounded-full p-1 hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
                  title="Remove image"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Levels (Multi-select) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
            Levels * <span className="text-xs text-gray-500 dark:text-text-tertiary">(select 1 or more)</span>
          </label>
          <div className="space-y-2 border border-gray-300 dark:border-gray-700 rounded-md p-3 bg-white dark:bg-bg-secondary max-h-48 overflow-y-auto">
            {levels.map((level: Level) => (
              <div key={level.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`level_${level.id}`}
                  checked={selectedLevels.includes(level.id)}
                  onChange={(e) => {
                    const newLevels = e.target.checked
                      ? [...selectedLevels, level.id]
                      : selectedLevels.filter(l => l !== level.id);
                    setSelectedLevels(newLevels);
                    setValue('levels', newLevels);
                  }}
                  className="h-4 w-4 text-amber-600 dark:text-amber-500 focus:ring-amber-500 border-gray-300 dark:border-gray-700 rounded"
                />
                <label htmlFor={`level_${level.id}`} className="ml-2 text-sm text-gray-700 dark:text-text-secondary cursor-pointer">
                  {level.name}
                </label>
              </div>
            ))}
          </div>
          {errors.levels && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.levels.message as string}</p>
          )}
          {selectedLevels.length === 0 && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">Select at least one level</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-1">
            Category *
          </label>
          <select
            id="category"
            {...register('category', { required: 'Category is required' })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary rounded-md focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent"
          >
            <option value="">Select a category</option>
            {categories.map((category: Category) => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category.message as string}</p>
          )}
        </div>

        {/* Published status */}
        <div className="flex items-center space-x-2 mt-4">
          <input
            id="published"
            type="checkbox"
            {...register('published')}
            className="h-4 w-4 text-amber-600 dark:text-amber-500 focus:ring-amber-500 border-gray-300 dark:border-gray-700 rounded"
          />
          <label htmlFor="published" className="text-sm font-medium text-gray-700 dark:text-text-primary">
            Publish immediately
          </label>
        </div>
      </div>
    </div>
  );
};

export default BasicInfo;