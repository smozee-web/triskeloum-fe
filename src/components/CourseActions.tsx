// src/components/course/CourseActions.tsx
import React from 'react';
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon, 
  EyeSlashIcon,
  DocumentDuplicateIcon 
} from '@heroicons/react/24/outline';
import { Course } from '../utils/typeDef';

interface CourseActionsProps {
  course: Course;
  onEdit?: (course: Course) => void;
  onDelete?: (course: Course) => void;
  onTogglePublish?: (course: Course) => void;
  onDuplicate?: (course: Course) => void;
}

const CourseActions: React.FC<CourseActionsProps> = ({
  course,
  onEdit,
  onDelete,
  onTogglePublish,
  onDuplicate
}) => {
  return (
    <div className="bg-gray-50 dark:bg-bg-secondary border-b border-gray-200 dark:border-gray-800 px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Publication status */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-text-secondary">
            <div className={`w-2 h-2 rounded-full ${
              course.published ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-600'
            }`} />
            <span>
              {course.published ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          {/* Duplicate */}
          {onDuplicate && (
            <button
              onClick={() => onDuplicate(course)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-text-primary bg-white dark:bg-bg-secondary hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
              Duplicate
            </button>
          )}

          {/* Publish/Unpublish */}
          {onTogglePublish && (
            <button
              onClick={() => onTogglePublish(course)}
              className={`inline-flex items-center px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                course.published
                  ? 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                  : 'border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/40'
              }`}
            >
              {course.published ? (
                <>
                  <EyeSlashIcon className="w-4 h-4 mr-2" />
                  Unpublish
                </>
              ) : (
                <>
                  <EyeIcon className="w-4 h-4 mr-2" />
                  Publish
                </>
              )}
            </button>
          )}

          {/* Edit */}
          {onEdit && (
            <button
              onClick={() => onEdit(course)}
              className="inline-flex items-center px-3 py-2 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-sm font-medium hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
            >
              <PencilIcon className="w-4 h-4 mr-2" />
              Edit
            </button>
          )}

          {/* Delete */}
          {onDelete && (
            <button
              onClick={() => onDelete(course)}
              className="inline-flex items-center px-3 py-2 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseActions;