// src/pages/courses/Exercises.tsx
import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, DocumentTextIcon, XMarkIcon, PlayIcon, InformationCircleIcon, Squares2X2Icon, ListBulletIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Dumbbell, CheckCircle, PauseCircle, FileText, Film, Image, Pencil, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import SearchBar from '../../components/SearchBar';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import Pagination from '../../components/Pagination';
import Modal2 from '../../components/Modal2';
import RichTextEditor from '../../components/RichTextEditor';
import MarkdownViewer from '../../components/MarkdownViewer';
import { useGetAdminExercisesQuery, useDeleteExerciseMutation, useToggleActiveExerciseMutation, useGetAdminLevelsQuery } from '../../services/api';
import { exerciseService } from '../../services/exercises';
import { buildFileUrl } from '../../utils/urlUtils';

const EXERCISE_TYPES = [
    { value: 'PHYSICAL', label: 'Physical' },
    { value: 'MENTAL', label: 'Mental' },
    { value: 'BREATHING', label: 'Breathing' },
    { value: 'MEDITATION', label: 'Meditation' },
    { value: 'YOGA', label: 'Yoga' },
    { value: 'OTHER', label: 'Other' }
];

interface ExerciseFormData {
    title: string;
    type: string;
    duration: number;
    description: string;
    levelId: number;
    mediaFile?: File;
    mediaType?: 'PDF' | 'VIDEO';
    coverFile?: File;
}

const Exercises: React.FC = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(12);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState<any | null>(null);
    const [formData, setFormData] = useState<ExerciseFormData>({
        title: '',
        type: '',
        duration: 0,
        description: '',
        levelId: 0,
        mediaType: 'PDF',
    });
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const [mediaModalOpen, setMediaModalOpen] = useState(false);
    const [mediaInModal, setMediaInModal] = useState<any | null>(null);
    const [descriptionModalOpen, setDescriptionModalOpen] = useState(false);
    const [descriptionInModal, setDescriptionInModal] = useState<string>('');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data: exercisesData, isLoading, refetch } = useGetAdminExercisesQuery({
        page,
        limit,
        search: debouncedSearch,
        type: typeFilter,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active' ? true : false,
    });

    const { data: levelsData } = useGetAdminLevelsQuery({
        page: 1,
        limit: 100,
        search: '',
    });

    const [deleteExercise, { isLoading: isDeleting }] = useDeleteExerciseMutation();
    const [toggleActive, { isLoading: isToggling }] = useToggleActiveExerciseMutation();

    // Get levels for form
    const levels = levelsData?.payload?.data || [];

    const exercises = exercisesData?.payload?.data || [];
    const totalPages = exercisesData?.payload?.pagination?.totalPages || 1;

    const stats = {
        total: exercisesData?.payload?.pagination?.total || exercises?.length,
        active: exercises?.filter((e: any) => e.isActive).length,
        inactive: exercises?.filter((e: any) => !e.isActive).length,
    };

    const handleCreate = () => {
        setSelectedExercise(null);
        setFormData({
            title: '',
            type: '',
            duration: 0,
            description: '',
            levelId: 0,
            mediaType: 'PDF',
        });
        setIsFormModalOpen(true);
    };

    const handleEdit = (exercise: any) => {
        setSelectedExercise(exercise);
        setFormData({
            title: exercise.title,
            type: exercise.type,
            duration: exercise.duration,
            description: exercise.description,
            levelId: exercise.level?.id,
        });
        setIsFormModalOpen(true);
    };

    const handleDelete = async (exerciseId: number) => {
        if (!window.confirm('Are you sure you want to delete this exercise?')) {
            return;
        }
        try {
            await deleteExercise(exerciseId).unwrap();
            toast.success('Exercise deleted');
            setDeleteConfirmId(null);
            refetch();
        } catch (error: any) {
            toast.error(error?.data?.message || 'Error while deleting');
        }
    };

    const handleToggleActive = async (exercise: any) => {
        try {
            await toggleActive(exercise.id).unwrap();
            toast.success(exercise.isActive ? 'Exercise deactivated' : 'Exercise activated');
            refetch();
        } catch (error: any) {
            toast.error(error?.data?.message || 'Error');
        }
    };

    const handleViewMedia = (exercise: any) => {
        if (!exercise.mediaUrl) {
            toast.error('No file available');
            return;
        }

        const fullUrl = buildFileUrl(exercise.mediaUrl);

        if (exercise.mediaType === 'PDF') {
            window.open(fullUrl, '_blank');
        } else {
            setMediaInModal({
                ...exercise,
                mediaUrl: fullUrl
            });
            setMediaModalOpen(true);
        }
    };

    const handleViewDescription = (exercise: any) => {
        if (exercise.description) {
            setDescriptionInModal(exercise.description);
            setDescriptionModalOpen(true);
        } else {
            toast.error('No description available');
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.title || !formData.type || !formData.duration || !formData.levelId) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (!selectedExercise && !formData.mediaFile) {
            toast.error('Please add a file (PDF or VIDEO)');
            return;
        }

        try {
            setIsUploading(true);

            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('type', formData.type);
            formDataToSend.append('duration', formData.duration.toString());
            formDataToSend.append('description', formData.description);
            formDataToSend.append('levelId', formData.levelId.toString());

            if (formData.mediaFile) {
                formDataToSend.append('media', formData.mediaFile);
            }
            if (formData.coverFile) {
                formDataToSend.append('cover', formData.coverFile);
            }

            if (selectedExercise) {
                await exerciseService.updateExercise(selectedExercise.id, formDataToSend, setUploadProgress);
                toast.success('Exercise updated');
            } else {
                await exerciseService.createExercise(formDataToSend, setUploadProgress);
                toast.success('Exercise created');
            }

            setIsFormModalOpen(false);
            setUploadProgress(0);
            refetch();
        } catch (error: any) {
            console.error('Error:', error);
            toast.error(error?.message || 'Error while submitting');
        } finally {
            setIsUploading(false);
        }
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
                            Exercises
                        </h1>
                        <p className="text-gray-600 dark:text-text-tertiary mt-1 text-sm sm:text-base">Manage all your exercises</p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 w-full sm:w-auto justify-center sm:justify-start"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        New exercise
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div className="relative bg-gradient-to-br from-amber-50/30 to-white dark:from-transparent dark:to-transparent dark:bg-bg-tertiary rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-300 group overflow-hidden shadow-sm hover:shadow-md">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent dark:from-amber-500/5 dark:to-transparent" />
                        <div className="relative">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#FFD700] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Dumbbell className="w-6 h-6 text-black" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-600 dark:text-text-tertiary mb-1">Total Exercises</h3>
                            <p className="text-2xl font-bold text-gray-900 dark:text-text-primary">{stats.total}</p>
                        </div>
                    </div>

                    <div className="relative bg-gradient-to-br from-amber-50/30 to-white dark:from-transparent dark:to-transparent dark:bg-bg-tertiary rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-300 group overflow-hidden shadow-sm hover:shadow-md">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent dark:from-green-500/5 dark:to-transparent" />
                        <div className="relative">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-600 dark:text-text-tertiary mb-1">Active Exercises</h3>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
                        </div>
                    </div>

                    <div className="relative bg-gradient-to-br from-amber-50/30 to-white dark:from-transparent dark:to-transparent dark:bg-bg-tertiary rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-300 group overflow-hidden shadow-sm hover:shadow-md">
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-transparent dark:from-gray-500/5 dark:to-transparent" />
                        <div className="relative">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <PauseCircle className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-600 dark:text-text-tertiary mb-1">Inactive</h3>
                            <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{stats.inactive}</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-gradient-to-br from-amber-50/30 to-white dark:from-transparent dark:to-transparent dark:bg-bg-tertiary rounded-xl shadow-sm hover:shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-800 transition-all duration-300">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                            <SearchBar
                                value={search}
                                onChange={setSearch}
                                placeholder="Search for an exercise..."
                            />

                            <select
                                value={typeFilter}
                                onChange={(e) => {
                                    setTypeFilter(e.target.value);
                                    setPage(1);
                                }}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent text-sm transition-all"
                            >
                                <option value="">All types</option>
                                {EXERCISE_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value as 'all' | 'active' | 'inactive');
                                    setPage(1);
                                }}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent text-sm transition-all"
                            >
                                <option value="all">All statuses</option>
                                <option value="active">Active only</option>
                                <option value="inactive">Inactive only</option>
                            </select>

                            <select
                                value={limit}
                                onChange={(e) => {
                                    setLimit(Number(e.target.value));
                                    setPage(1);
                                }}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent text-sm transition-all"
                            >
                                <option value={6}>6 per page</option>
                                <option value={12}>12 per page</option>
                                <option value={24}>24 per page</option>
                                <option value={48}>48 per page</option>
                            </select>
                        </div>

                        {/* View Toggle */}
                        <div className="flex items-center justify-center sm:justify-end">
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
            </div>

            {/* Content */}
            {isLoading ? (
                <LoadingSkeleton />
            ) : exercises.length === 0 ? (
                <div className="bg-white dark:bg-bg-tertiary rounded-lg shadow-md p-12 text-center border border-gray-200 dark:border-gray-800">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#D4AF37]/20 to-[#FFD700]/20 dark:from-[#D4AF37]/30 dark:to-[#FFD700]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Dumbbell className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-text-primary mb-2">No exercise</h3>
                    <p className="text-gray-600 dark:text-text-secondary mb-6">Start by creating your first exercise</p>
                    <button
                        onClick={handleCreate}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-medium rounded-lg hover:from-[#B8860B] hover:to-[#D4AF37] transition-all duration-200"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Create an exercise
                    </button>
                </div>
            ) : (
                <>
                    {/* Grid or List View */}
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {exercises.map((exercise: any) => (
                                <div key={exercise.id} className="bg-white dark:bg-bg-tertiary rounded-lg shadow-md border border-gray-200 dark:border-gray-800 hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-300 overflow-hidden group">
                                    {/* Status Badge */}
                                    <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                exercise.isActive
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-text-tertiary'
                                            }`}>
                                                {exercise.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4AF37]/10 to-[#FFD700]/10 dark:from-[#D4AF37]/20 dark:to-[#FFD700]/20 flex items-center justify-center border border-[#D4AF37]/30 dark:border-[#D4AF37]/50">
                                                <Dumbbell className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                            </div>
                                        </div>
                                        <h3 className="font-semibold text-gray-900 dark:text-text-primary text-sm mb-1 line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                            {exercise.title}
                                        </h3>
                                        <p className="text-xs text-gray-600 dark:text-text-secondary">
                                            {EXERCISE_TYPES.find(t => t.value === exercise.type)?.label || exercise.type}
                                        </p>
                                    </div>

                                    {/* Info */}
                                    <div className="p-4 space-y-2">
                                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-text-secondary">
                                            <ClockIcon className="w-4 h-4" />
                                            <span>{exercise.duration} min</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-text-secondary">
                                            <span className="font-medium">Level:</span>
                                            <span>{exercise.level?.name}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="p-4 pt-0 flex gap-2">
                                        <button
                                            onClick={() => handleViewMedia(exercise)}
                                            className="flex-1 p-2 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded transition"
                                            title={exercise.mediaType === 'VIDEO' ? 'Watch the video' : 'View the PDF'}
                                        >
                                            {exercise.mediaType === 'VIDEO' ? (
                                                <PlayIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 mx-auto" />
                                            ) : (
                                                <DocumentTextIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 mx-auto" />
                                            )}
                                        </button>
                                        {exercise.description && (
                                            <button
                                                onClick={() => handleViewDescription(exercise)}
                                                className="flex-1 p-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition"
                                                title="View the description"
                                            >
                                                <InformationCircleIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 mx-auto" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleToggleActive(exercise)}
                                            disabled={isToggling}
                                            className="flex-1 p-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                                            title={exercise.isActive ? 'Deactivate' : 'Activate'}
                                        >
                                            <EyeIcon className={`w-4 h-4 mx-auto ${exercise.isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-600 opacity-50'}`} />
                                        </button>
                                        <button
                                            onClick={() => handleEdit(exercise)}
                                            className="flex-1 p-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                                        >
                                            <PencilIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 mx-auto" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(exercise.id)}
                                            disabled={isDeleting}
                                            className="flex-1 p-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition"
                                        >
                                            <TrashIcon className="w-4 h-4 text-red-600 dark:text-red-400 mx-auto" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-bg-tertiary rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-800">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-[#D4AF37]/10 to-[#FFD700]/10 dark:from-[#D4AF37]/20 dark:to-[#FFD700]/20 border-b border-gray-200 dark:border-gray-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-text-primary uppercase">Title</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-text-primary uppercase">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-text-primary uppercase">Duration</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-text-primary uppercase">Level</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-text-primary uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-text-primary uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {exercises.map((exercise: any) => (
                                        <tr key={exercise.id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-text-primary font-medium">{exercise.title}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-text-secondary">
                                                {EXERCISE_TYPES.find(t => t.value === exercise.type)?.label || exercise.type}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-text-secondary">{exercise.duration} min</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-text-secondary">{exercise.level?.name}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    exercise.isActive
                                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-text-tertiary'
                                                }`}>
                                                    {exercise.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleViewMedia(exercise)}
                                                        className="p-2 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded transition"
                                                        title={exercise.mediaType === 'VIDEO' ? 'Watch the video' : 'View the PDF'}
                                                    >
                                                        {exercise.mediaType === 'VIDEO' ? (
                                                            <PlayIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                                        ) : (
                                                            <DocumentTextIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                                        )}
                                                    </button>
                                                    {exercise.description && (
                                                        <button
                                                            onClick={() => handleViewDescription(exercise)}
                                                            className="p-2 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded transition"
                                                            title="View the description"
                                                        >
                                                            <InformationCircleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleToggleActive(exercise)}
                                                        disabled={isToggling}
                                                        className="p-2 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded transition"
                                                        title={exercise.isActive ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {exercise.isActive ? (
                                                            <EyeIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                        ) : (
                                                            <EyeIcon className="w-5 h-5 text-gray-400 dark:text-gray-600 opacity-50" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(exercise)}
                                                        className="p-2 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded transition"
                                                    >
                                                        <PencilIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(exercise.id)}
                                                        disabled={isDeleting}
                                                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition"
                                                    >
                                                        <TrashIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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

            {/* Description Modal */}
            <Modal2 isOpen={descriptionModalOpen} onClose={() => setDescriptionModalOpen(false)}>
                <div className="bg-white dark:bg-bg-tertiary rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-text-primary flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Description
                        </h2>
                        <button
                            onClick={() => setDescriptionModalOpen(false)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition"
                        >
                            <XMarkIcon className="w-5 h-5 text-gray-600 dark:text-text-secondary" />
                        </button>
                    </div>
                    <MarkdownViewer content={descriptionInModal} />
                </div>
            </Modal2>

            {/* Media Player Modal */}
            <Modal2 isOpen={mediaModalOpen} onClose={() => setMediaModalOpen(false)}>
                <div className="bg-white dark:bg-bg-tertiary rounded-lg p-6 max-w-2xl w-full border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-text-primary flex items-center gap-2">
                            {mediaInModal?.mediaType === 'VIDEO' ? (
                                <>
                                    <Film className="w-5 h-5" />
                                    Video
                                </>
                            ) : (
                                <>
                                    <FileText className="w-5 h-5" />
                                    PDF
                                </>
                            )}
                        </h2>
                        <button
                            onClick={() => setMediaModalOpen(false)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition"
                        >
                            <XMarkIcon className="w-5 h-5 text-gray-600 dark:text-text-secondary" />
                        </button>
                    </div>

                    {mediaInModal?.mediaType === 'VIDEO' ? (
                        <div className="bg-black rounded-lg overflow-hidden">
                            <video
                                controls
                                className="w-full"
                                style={{ maxHeight: '500px' }}
                            >
                                <source src={mediaInModal?.mediaUrl} type="video/mp4" />
                                Your browser does not support video playback.
                            </video>
                        </div>
                    ) : (
                        <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                            <iframe
                                src={mediaInModal?.mediaUrl}
                                className="w-full"
                                style={{ height: '600px' }}
                                title="PDF Viewer"
                            />
                        </div>
                    )}

                    <div className="mt-4 flex justify-between items-center text-sm text-gray-600 dark:text-text-secondary">
                        <span>{mediaInModal?.title}</span>
                        {mediaInModal?.mediaType === 'VIDEO' && mediaInModal?.duration && (
                            <span>Duration: {mediaInModal.duration} min</span>
                        )}
                    </div>
                </div>
            </Modal2>

            {/* Form Modal */}
            <Modal2 isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} size="lg">
                <div className="p-6 sm:p-8">
                    {/* Header with gradient accent */}
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#FFD700] flex items-center justify-center shadow-md">
                            {selectedExercise ? (
                                <PencilIcon className="w-6 h-6 text-black" />
                            ) : (
                                <PlusIcon className="w-6 h-6 text-black" />
                            )}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-text-primary">
                            {selectedExercise ? 'Edit exercise' : 'Create a new exercise'}
                        </h2>
                    </div>

                    <form onSubmit={handleFormSubmit} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-text-primary mb-2">Title *</label>
                            <input
                                type="text"
                                placeholder="Enter the exercise title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-bg-secondary border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-text-primary focus:bg-white dark:focus:bg-bg-secondary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        {/* Type and Duration - Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Type */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-text-primary mb-2">Type *</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-bg-secondary border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-text-primary focus:bg-white dark:focus:bg-bg-secondary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all appearance-none cursor-pointer"
                                    required
                                >
                                    <option value="">Select</option>
                                    {EXERCISE_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Duration */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-text-primary mb-2">Duration (min) *</label>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Ex: 30"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-bg-secondary border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-text-primary focus:bg-white dark:focus:bg-bg-secondary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Level */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-text-primary mb-2">Level *</label>
                            <select
                                value={formData.levelId}
                                onChange={(e) => setFormData({ ...formData, levelId: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-bg-secondary border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-text-primary focus:bg-white dark:focus:bg-bg-secondary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all appearance-none cursor-pointer"
                                required
                            >
                                <option value="0">Select a level</option>
                                {levels.map((level: any) => (
                                    <option key={level.id} value={level.id}>{level.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Description - Rich Text Editor */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-text-primary mb-2">Description</label>
                            <RichTextEditor
                                value={formData.description}
                                onChange={(value) => setFormData({ ...formData, description: value })}
                                placeholder="Describe this exercise in detail..."
                            />
                        </div>

                        {/* Media Type Selector */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-text-primary mb-2">Content type *</label>
                            <div className="flex gap-4">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="mediaType"
                                        value="PDF"
                                        checked={formData.mediaType === 'PDF'}
                                        onChange={(e) => setFormData({ ...formData, mediaType: e.target.value as 'PDF' | 'VIDEO' })}
                                        className="mr-2 w-4 h-4 text-amber-600 dark:text-amber-500 focus:ring-amber-500"
                                    />
                                    <span className="text-gray-700 dark:text-text-secondary flex items-center gap-1">
                                        <FileText className="w-4 h-4" />
                                        PDF
                                    </span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="mediaType"
                                        value="VIDEO"
                                        checked={formData.mediaType === 'VIDEO'}
                                        onChange={(e) => setFormData({ ...formData, mediaType: e.target.value as 'PDF' | 'VIDEO' })}
                                        className="mr-2 w-4 h-4 text-amber-600 dark:text-amber-500 focus:ring-amber-500"
                                    />
                                    <span className="text-gray-700 dark:text-text-secondary flex items-center gap-1">
                                        <Film className="w-4 h-4" />
                                        VIDEO
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Media File Upload */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-text-primary mb-2">
                                {formData.mediaType} file {!selectedExercise && <span className="text-red-500 dark:text-red-400">*</span>}
                            </label>
                            <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer bg-gray-50 dark:bg-bg-secondary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <div className="text-center">
                                    <div className="flex justify-center mb-2">
                                        {formData.mediaType === 'PDF' ? (
                                            <FileText className="w-8 h-8 text-gray-600 dark:text-text-secondary" />
                                        ) : (
                                            <Film className="w-8 h-8 text-gray-600 dark:text-text-secondary" />
                                        )}
                                    </div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-text-primary">
                                        {formData.mediaFile ? formData.mediaFile.name : `Click or drag the ${formData.mediaType}`}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-text-tertiary mt-1">
                                        {formData.mediaType === 'PDF' ? 'PDF up to 10MB' : 'VIDEO (MP4, MOV, WEBM) up to 100MB'}
                                    </p>
                                </div>
                                <input
                                    type="file"
                                    accept={formData.mediaType === 'PDF' ? '.pdf' : 'video/*'}
                                    onChange={(e) => setFormData({ ...formData, mediaFile: e.target.files?.[0] })}
                                    className="hidden"
                                    required={!selectedExercise}
                                />
                            </label>
                            {selectedExercise && !formData.mediaFile && (
                                <p className="text-xs text-gray-500 dark:text-text-tertiary mt-2">Current file: {selectedExercise.mediaUrl}</p>
                            )}
                        </div>

                        {/* Cover Image */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-text-primary mb-2">Cover image</label>
                            <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer bg-gray-50 dark:bg-bg-secondary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <div className="text-center">
                                    <div className="flex justify-center mb-2">
                                        <Image className="w-8 h-8 text-gray-600 dark:text-text-secondary" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-text-primary">
                                        {formData.coverFile ? formData.coverFile.name : 'Click or drag the image'}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-text-tertiary mt-1">JPG, PNG, GIF, WEBP up to 5MB</p>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFormData({ ...formData, coverFile: e.target.files?.[0] })}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {/* Upload Progress */}
                        {isUploading && (
                            <div className="bg-gradient-to-r from-[#D4AF37]/10 to-[#FFD700]/10 dark:from-[#D4AF37]/20 dark:to-[#FFD700]/20 rounded-lg p-4 border border-[#D4AF37]/30 dark:border-[#D4AF37]/50">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-gray-900 dark:text-text-primary">Uploading...</p>
                                    <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">{uploadProgress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] h-2 rounded-full transition-all"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-800">
                            <button
                                type="button"
                                onClick={() => setIsFormModalOpen(false)}
                                disabled={isUploading}
                                className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-text-primary font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={
                                    isUploading ||
                                    !formData.title.trim() ||
                                    !formData.type ||
                                    !formData.duration ||
                                    formData.duration <= 0 ||
                                    !formData.levelId ||
                                    formData.levelId <= 0 ||
                                    (!selectedExercise && !formData.mediaFile)
                                }
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isUploading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                        {uploadProgress}%
                                    </>
                                ) : selectedExercise ? (
                                    <>
                                        <Pencil className="w-4 h-4" />
                                        Update exercise
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4" />
                                        Create exercise
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal2>
        </div>
    );
};

export default Exercises;