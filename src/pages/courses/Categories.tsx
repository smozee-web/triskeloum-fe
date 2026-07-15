// src/pages/admin/Categories.tsx
import React, { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

import {
    useGetAllCategoriesQuery,
    useGetCategoryStatsQuery,
    useDeleteCategoryMutation,
} from '../../services/api';
import CategoryCard from '../../components/CategoryCard';
import CategoryModal from '../../components/CategoryModal';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import EmptyState from '../../components/EmptyState';
import SearchBar from '../../components/SearchBar';
import StatsCards from '../../components/StatsCard';
import { Category } from '../../utils/typeDef';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import Pagination from '../../components/Pagination';
import { uploadService } from '../../services/axios';
import CategoryCoursesModal from '../../components/CategoryCourseModal';

const Categories: React.FC = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isCoursesModalOpen, setIsCoursesModalOpen] = useState(false); // ✅ Nouveau
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedCategoryForCourses, setSelectedCategoryForCourses] = useState<Category | null>(null); // ✅ Nouveau
    
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    // Queries
    const { data: categoriesData, isLoading: isLoadingCategories, refetch } = useGetAllCategoriesQuery({
        page,
        limit: 12,
        search: debouncedSearch
    });

    const { data: statsData, refetch: refetchStats } = useGetCategoryStatsQuery();

    // Mutations
    const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

    // Handlers
    const handleCreate = () => {
        setSelectedCategory(null);
        setIsModalOpen(true);
    };

    const handleEdit = (category: Category) => {
        setSelectedCategory(category);
        setIsModalOpen(true);
    };

    const handleDelete = (category: Category) => {
        setSelectedCategory(category);
        setIsDeleteModalOpen(true);
    };

    // ✅ Nouveau handler pour voir les cours
    const handleViewCourses = (category: Category) => {
        setSelectedCategoryForCourses(category);
        setIsCoursesModalOpen(true);
    };

    const handleSubmit = async (formData: FormData) => {
        try {
            setIsUploading(true);
            setUploadProgress(0);

            if (selectedCategory) {
                await uploadService.updateCategory(
                    selectedCategory.id,
                    formData,
                    (progress) => setUploadProgress(progress)
                );
                toast.success('Category updated successfully');
            } else {
                await uploadService.createCategory(
                    formData,
                    (progress) => setUploadProgress(progress)
                );
                toast.success('Category created successfully');
            }

            setIsModalOpen(false);
            setSelectedCategory(null);
            refetch();
            refetchStats();
        } catch (error: any) {
            console.error('Upload error:', error);
            const message = error.response?.data?.message || 'An error occurred during the upload';
            toast.error(message);
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedCategory) return;

        try {
            await deleteCategory(selectedCategory.id).unwrap();
            toast.success('Category deleted successfully');
            setIsDeleteModalOpen(false);
            setSelectedCategory(null);
            refetchStats();
        } catch (error: any) {
            toast.error(error?.data?.message || 'An error occurred');
        }
    };

    const categories = categoriesData?.payload?.data || [];
    const totalPages = categoriesData?.payload?.pagination?.totalPages || 1;
    const currentPage = categoriesData?.payload?.pagination?.page || 1;
    const stats = statsData?.payload;

    return (
        <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8 overflow-auto">
            <div className="max-w-8xl mx-auto w-full">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Categories</h1>
                        <p className="text-gray-600 mt-1 text-sm sm:text-base">
                            Manage course categories
                        </p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-md w-full sm:w-auto justify-center sm:justify-start"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        New category
                    </button>
                </div>

                {/* Stats */}
                {stats && (
                    <StatsCards
                        total={stats.total}
                        withCourses={stats.withCourses}
                        empty={stats.empty}
                    />
                )}

                {/* Search */}
                <div className="mb-6">
                    <SearchBar
                        value={search}
                        onChange={setSearch}
                        placeholder="Search for a category..."
                    />
                </div>

                {/* Content */}
                {isLoadingCategories ? (
                    <LoadingSkeleton />
                ) : categories.length === 0 ? (
                    <EmptyState
                        onCreateClick={handleCreate}
                        isSearching={debouncedSearch.length > 0}
                    />
                ) : (
                    <>
                        {/* Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {categories.map((category: any) => (
                                <CategoryCard
                                    key={category.id}
                                    category={category}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onViewCourses={handleViewCourses}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-8">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setPage}
                                />
                            </div>
                        )}
                    </>
                )}

                {/* Progress Bar */}
                {isUploading && uploadProgress > 0 && (
                    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-xl border border-gray-200 z-50">
                        <p className="text-sm font-medium text-gray-900 mb-2">
                            Upload in progress...
                        </p>
                        <div className="w-64 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                            <div 
                                className="bg-black h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-600 mt-2 text-right">
                            {uploadProgress}%
                        </p>
                    </div>
                )}

                {/* Modals */}
                <CategoryModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedCategory(null);
                    }}
                    onSubmit={handleSubmit}
                    category={selectedCategory}
                    isLoading={isUploading}
                />

                <CategoryCoursesModal
                    isOpen={isCoursesModalOpen}
                    onClose={() => {
                        setIsCoursesModalOpen(false);
                        setSelectedCategoryForCourses(null);
                    }}
                    category={selectedCategoryForCourses}
                />

                <DeleteConfirmModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => {
                        setIsDeleteModalOpen(false);
                        setSelectedCategory(null);
                    }}
                    onConfirm={handleConfirmDelete}
                    category={selectedCategory}
                    isLoading={isDeleting}
                />
            </div>
        </div>
    );
};

export default Categories;