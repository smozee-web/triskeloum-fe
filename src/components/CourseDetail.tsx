// src/pages/admin/CourseDetail.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import CourseDetails from '../pages/courses/CourseDetails';
import { useGetCourseDetailsQuery, useDeleteCourseMutation, useTogglePublishCourseMutation } from '../services/api';

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const courseId = parseInt(id || '-1');

  const { data, isLoading, error } = useGetCourseDetailsQuery(courseId);
  const [deleteCourse] = useDeleteCourseMutation();
  const [togglePublish] = useTogglePublishCourseMutation();

  const handleEdit = (course: any) => {
    toast('Edit feature under development', { icon: '🚧' });
  };

  const handleDelete = async (course: any) => {
    if (!window.confirm(`Are you sure you want to delete "${course.title}"?`)) {
      return;
    }

    try {
      await deleteCourse(course.id).unwrap();
      toast.success('Course deleted successfully');
      navigate('/admin/courses');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Error while deleting');
    }
  };

  const handleTogglePublish = async (course: any) => {
    try {
      await togglePublish(course.id).unwrap();
      toast.success(
        course.published ? 'Course unpublished successfully' : 'Course published successfully'
      );
    } catch (error: any) {
      toast.error(error?.data?.message || 'Error while changing status');
    }
  };

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Course not found
          </h2>
          <button
            onClick={() => navigate('/admin/courses/list')}
            className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center px-4 py-2 mb-6 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        Back
      </button>

      <CourseDetails
        course={data?.payload}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onTogglePublish={handleTogglePublish}
      />
    </div>
  );
};

export default CourseDetail;