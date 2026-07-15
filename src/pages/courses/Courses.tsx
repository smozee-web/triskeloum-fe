// src/pages/admin/Courses.tsx
import React, { useState, useEffect } from 'react';
import { PlusIcon, AcademicCapIcon, CheckCircleIcon, DocumentTextIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../../components/SearchBar';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import Pagination from '../../components/Pagination';
import { Course } from '../../utils/typeDef';
import AdminCourseCard from '../../components/AdminCourseCard';
import { useGetAllCoursesQuery, useDeleteCourseMutation, useTogglePublishCourseMutation, useGetCourseDetailsQuery, useCreateCourseMutation, useCreateSectionMutation, useUpdateCourseMutation, useGetAllLevelsQuery } from '../../services/api';
import { courseService } from '../../services/courses';
import Modal2 from '../../components/Modal2';
import CourseDetails from './CourseDetails';
import CourseFormModal from '../../components/CourseFormModal';
import AdminCourseListItem from '../../components/AdminCourseListItem';

const Courses: React.FC = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(12);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [levelFilter, setLevelFilter] = useState<string>('');
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedCourseForEdit, setSelectedCourseForEdit] = useState<Course | undefined>(undefined);
    const [createCourse, { isLoading: isCreating }] = useCreateCourseMutation();
    const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();
    const [createSection, { isLoading: isCreatingSection }] = useCreateSectionMutation();

    const navigate = useNavigate();

    const { data: levelsData } = useGetAllLevelsQuery();
    const levels = Array.isArray(levelsData?.payload?.data) ? levelsData.payload.data : [];

    const { data: courseDetails, isLoading: isLoadingDetails } = useGetCourseDetailsQuery(
        selectedCourseId || -1,
        { skip: !selectedCourseId }
    );

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Reset page when limit changes
    useEffect(() => {
        setPage(1);
    }, [limit]);

    const { data: coursesData, isLoading, refetch } = useGetAllCoursesQuery({
        page,
        limit,
        search: debouncedSearch,
        status: statusFilter,
        level: levelFilter,
    });

    const [deleteCourse, { isLoading: isDeleting }] = useDeleteCourseMutation();
    const [togglePublish, { isLoading: isToggling }] = useTogglePublishCourseMutation();

    const handleCreate = () => {
        setSelectedCourseForEdit(undefined);
        setIsFormModalOpen(true);
    };

    const handleEdit = (course: Course) => {
        setSelectedCourseForEdit(course);
        setIsFormModalOpen(true);
    };

    const handleDelete = async (course: Course) => {
        if (!window.confirm(`Are you sure you want to delete "${course.title}"?`)) {
            return;
        }

        try {
            await deleteCourse(course.id).unwrap();
            toast.success('Course deleted successfully');
            refetch();
        } catch (error: any) {
            toast.error(error?.data?.message || 'Error while deleting');
        }
    };

    const handleViewDetails = (course: Course) => {
        setSelectedCourseId(course.id);
        setIsDetailModalOpen(true);
    };

    const handleTogglePublish = async (course: Course) => {
        try {
            await togglePublish(course.id).unwrap();
            toast.success(
                course.published ? 'Course unpublished successfully' : 'Course published successfully'
            );
            refetch();
        } catch (error: any) {
            toast.error(error?.data?.message || 'Error while changing status');
        }
    };

    const handleCloseModal = () => {
        setIsDetailModalOpen(false);
        setSelectedCourseId(null);
    };

    // Manage actions in the details modal
    const handleDetailEdit = (course: Course) => {
        handleEdit(course);
        handleCloseModal();
    };

    const handleDetailDelete = async (course: Course) => {
        await handleDelete(course);
        handleCloseModal();
    };

    const handleDetailTogglePublish = async (course: Course) => {
        await handleTogglePublish(course);
        // Do not close the modal so the user can see the change
    };

    const handleFormSubmit = async (formData: FormData) => {
        try {
            if (selectedCourseForEdit) {
                // Update the existing course
                await courseService.updateCourse(selectedCourseForEdit.id, formData);
                toast.success('Course updated successfully');
            } else {
                // Create a new course
                const result = await courseService.createCourse(formData);

                // Create the sections if any
                const sectionsData = formData.get('sections');
                if (sectionsData) {
                    const sections = JSON.parse(sectionsData as string);

                    // Create each section
                    for (const section of sections) {
                        await courseService.createSection(result.payload.id, {
                            title: section.title,
                            order: section.order,
                            content: section.content
                        });
                    }
                }

                toast.success('Course created successfully');
            }

            setIsFormModalOpen(false);
            refetch();
        } catch (error: any) {
            console.error('Error while submitting the form:', error);
            toast.error(error?.response?.data?.message || error?.message || 'An error occurred');
        }
    };

    const courses = coursesData?.payload?.courses || [];
    const totalPages = coursesData?.payload?.pagination?.totalPages || 1;
    const paginationTotal = coursesData?.payload?.pagination?.total || 0;

    // Calculate stats from backend pagination data
    const stats = {
        total: paginationTotal,
        published: coursesData?.payload?.stats?.published || 0,
        draft: coursesData?.payload?.stats?.draft || 0,
    };

    return (
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-bg-primary p-4 sm:p-6 lg:p-8 overflow-auto transition-colors duration-300">
            <div className="max-w-8xl mx-auto w-full">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold mb-1"
                            style={{
                                background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}>
                            Courses
                        </h1>
                        <p className="text-gray-600 dark:text-text-tertiary mt-1 text-sm sm:text-base">Manage all your courses</p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 w-full sm:w-auto justify-center sm:justify-start"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        New course
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {/* Total */}
                    <div className="relative bg-gradient-to-br from-amber-50/30 to-white dark:from-transparent dark:to-transparent dark:bg-bg-tertiary rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-300 group overflow-hidden shadow-sm hover:shadow-md">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent dark:from-amber-500/5 dark:to-transparent" />
                        <div className="relative">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#FFD700] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <AcademicCapIcon className="h-6 w-6 text-black" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-600 dark:text-text-tertiary mb-1">Total Courses</h3>
                            <p className="text-2xl font-bold text-gray-900 dark:text-text-primary">{stats.total}</p>
                        </div>
                    </div>

                    {/* Published */}
                    <div className="relative bg-gradient-to-br from-amber-50/30 to-white dark:from-transparent dark:to-transparent dark:bg-bg-tertiary rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-300 group overflow-hidden shadow-sm hover:shadow-md">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent dark:from-green-500/5 dark:to-transparent" />
                        <div className="relative">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <CheckCircleIcon className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-600 dark:text-text-tertiary mb-1">Published Courses</h3>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.published}</p>
                        </div>
                    </div>

                    {/* Drafts */}
                    <div className="relative bg-gradient-to-br from-amber-50/30 to-white dark:from-transparent dark:to-transparent dark:bg-bg-tertiary rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-300 group overflow-hidden shadow-sm hover:shadow-md">
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-transparent dark:from-gray-500/5 dark:to-transparent" />
                        <div className="relative">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <DocumentTextIcon className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-600 dark:text-text-tertiary mb-1">Drafts</h3>
                            <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{stats.draft}</p>
                        </div>
                    </div>
                </div>

                {/* Filters and Controls */}
                <div className="bg-gradient-to-br from-amber-50/30 to-white dark:from-transparent dark:to-transparent dark:bg-bg-tertiary rounded-xl shadow-sm hover:shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-800 transition-all duration-300">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                        <SearchBar
                            value={search}
                            onChange={setSearch}
                            placeholder="Search for a course..."
                        />

                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(1);
                            }}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent text-sm transition-all"
                        >
                            <option value="">All statuses</option>
                            <option value="published">Published</option>
                            <option value="draft">Drafts</option>
                        </select>

                        <select
                            value={levelFilter}
                            onChange={(e) => {
                                setLevelFilter(e.target.value);
                                setPage(1);
                            }}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent text-sm transition-all"
                        >
                            <option value="">All levels</option>
                            {levels.map((level: any) => (
                                <option key={level.id} value={level.id}>
                                    {level.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={limit}
                            onChange={(e) => setLimit(Number(e.target.value))}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent text-sm transition-all"
                        >
                            <option value="6">6 per page</option>
                            <option value="12">12 per page</option>
                            <option value="24">24 per page</option>
                            <option value="48">48 per page</option>
                        </select>

                        {/* View Toggle - Compact */}
                        <div className="flex items-center justify-center">
                            <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                                        viewMode === 'grid'
                                            ? 'bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black'
                                            : 'bg-white dark:bg-bg-secondary text-gray-700 dark:text-text-primary hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <Squares2X2Icon className="h-4 w-4" />
                            </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-3 py-2 text-sm font-medium transition-colors border-l border-gray-300 dark:border-gray-700 ${
                                        viewMode === 'list'
                                            ? 'bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black'
                                            : 'bg-white dark:bg-bg-secondary text-gray-700 dark:text-text-primary hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <ListBulletIcon className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {isLoading ? (
                    <LoadingSkeleton />
                ) : courses.length === 0 ? (
                    <div className="bg-white dark:bg-bg-tertiary rounded-xl shadow-md border border-gray-200 dark:border-gray-800 p-8 sm:p-12 text-center transition-colors">
                        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AcademicCapIcon className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-text-primary mb-2">
                            {debouncedSearch ? 'No course found' : 'No courses'}
                        </h3>
                        <p className="text-gray-600 dark:text-text-tertiary mb-6 text-sm sm:text-base">
                            {debouncedSearch
                                ? 'Try adjusting your search filters'
                                : 'Start by creating your first course'}
                        </p>
                        {!debouncedSearch && (
                            <button
                                onClick={handleCreate}
                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
                            >
                                <PlusIcon className="w-5 h-5 mr-2" />
                                Create a course
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Grid or List View */}
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                                {courses.map((course: any) => (
                                    <AdminCourseCard
                                        key={course.id}
                                        course={course}
                                        onView={handleViewDetails}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onTogglePublish={handleTogglePublish}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {courses.map((course: any) => (
                                    <AdminCourseListItem
                                        key={course.id}
                                        course={course}
                                        onView={handleViewDetails}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onTogglePublish={handleTogglePublish}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-8">
                                <Pagination
                                    currentPage={page}
                                    totalPages={totalPages}
                                    onPageChange={setPage}
                                />
                            </div>
                        )}
                    </>
                )}

                {/* Details modal */}
                <Modal2
                    isOpen={isDetailModalOpen}
                    onClose={handleCloseModal}
                    size="xl"
                >
                    {courseDetails?.payload && (
                        <CourseDetails
                            course={courseDetails.payload}
                            isLoading={isLoadingDetails}
                            onEdit={handleDetailEdit}
                            onDelete={handleDetailDelete}
                            onTogglePublish={handleDetailTogglePublish}
                        />
                    )}
                </Modal2>

                <CourseFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    initialData={selectedCourseForEdit}
                    onSubmit={handleFormSubmit}
                    isSubmitting={isCreating || isUpdating || isCreatingSection}
                    title={selectedCourseForEdit ? 'Edit course' : 'Create a new course'}
                />
            </div>
        </div>
    );
};

export default Courses;
