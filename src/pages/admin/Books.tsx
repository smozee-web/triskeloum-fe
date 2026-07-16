// src/pages/admin/Books.tsx
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { PlusIcon, BookOpenIcon, CheckCircleIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import SearchBar from '../../components/SearchBar';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import AdminBookCard from '../../components/AdminBookCard';
import BookFormModal from '../../components/BookFormModal';
import {
    useGetAdminBooksQuery,
    useCreateBookMutation,
    useUpdateBookMutation,
    useDeleteBookMutation,
    useGetBookCategoriesQuery,
    useCreateBookCategoryMutation,
    useUpdateBookCategoryMutation,
    useDeleteBookCategoryMutation,
} from '../../services/api';

type BooksTab = 'catalog' | 'categories';
type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'title';

const Books: React.FC = () => {
    const [activeTab, setActiveTab] = useState<BooksTab>('catalog');

    // ========== Catalog ==========
    const { data: booksData, isLoading } = useGetAdminBooksQuery();
    const { data: categoriesData } = useGetBookCategoriesQuery();
    const [createBook, { isLoading: isCreating }] = useCreateBookMutation();
    const [updateBook, { isLoading: isUpdating }] = useUpdateBookMutation();
    const [deleteBook] = useDeleteBookMutation();

    const books = booksData?.payload || [];
    const categories = categoriesData?.payload || [];

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [sort, setSort] = useState<SortOption>('newest');

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState<any>(undefined);

    const stats = {
        total: books.length,
        published: books.filter((b: any) => b.isActive).length,
        draft: books.filter((b: any) => !b.isActive).length,
    };

    const filteredBooks = books
        .filter((b: any) => {
            if (statusFilter === 'published' && !b.isActive) return false;
            if (statusFilter === 'draft' && b.isActive) return false;
            if (categoryFilter && String(b.category?.id) !== String(categoryFilter)) return false;
            if (search) {
                const q = search.toLowerCase();
                const matches = b.titleEn?.toLowerCase().includes(q)
                    || b.titleFr?.toLowerCase().includes(q)
                    || b.authorName?.toLowerCase().includes(q);
                if (!matches) return false;
            }
            return true;
        })
        .slice()
        .sort((a: any, b: any) => {
            switch (sort) {
                case 'price_asc': return (parseFloat(a.priceGhs) || 0) - (parseFloat(b.priceGhs) || 0);
                case 'price_desc': return (parseFloat(b.priceGhs) || 0) - (parseFloat(a.priceGhs) || 0);
                case 'title': return (a.titleEn || '').localeCompare(b.titleEn || '');
                case 'newest':
                default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
        });

    const handleCreate = () => {
        setSelectedBook(undefined);
        setIsFormModalOpen(true);
    };

    const handleEdit = (book: any) => {
        setSelectedBook(book);
        setIsFormModalOpen(true);
    };

    const handleFormSubmit = async (formData: FormData) => {
        try {
            if (selectedBook) {
                await updateBook({ id: selectedBook.id, data: formData }).unwrap();
                toast.success('Book updated successfully');
            } else {
                await createBook(formData).unwrap();
                toast.success('Book created successfully');
            }
            setIsFormModalOpen(false);
        } catch (error: any) {
            console.error('Save book error:', error);
            toast.error(error?.data?.message || 'Error while saving the book');
        }
    };

    const handleDelete = async (book: any) => {
        if (!confirm(`Are you sure you want to delete "${book.titleEn}"?`)) return;
        try {
            await deleteBook(book.id).unwrap();
            toast.success('Book deleted successfully');
        } catch (error: any) {
            console.error('Delete book error:', error);
            toast.error(error?.data?.message || 'Error while deleting the book');
        }
    };

    const handleTogglePublish = async (book: any) => {
        try {
            const formData = new FormData();
            formData.append('is_active', String(!book.isActive));
            await updateBook({ id: book.id, data: formData }).unwrap();
            toast.success(book.isActive ? 'Book unpublished successfully' : 'Book published successfully');
        } catch (error: any) {
            console.error('Toggle publish error:', error);
            toast.error(error?.data?.message || 'Error while changing status');
        }
    };

    // ========== Categories ==========
    const [createCategory] = useCreateBookCategoryMutation();
    const [updateCategory] = useUpdateBookCategoryMutation();
    const [deleteCategory] = useDeleteBookCategoryMutation();
    const [localCategories, setLocalCategories] = useState<any[]>([]);

    React.useEffect(() => {
        setLocalCategories(categories.map((c: any) => ({
            id: c.id,
            name_fr: c.nameFr,
            name_en: c.nameEn,
            slug: c.slug,
            icon: c.icon || '',
            sort_order: c.sortOrder || 0,
            is_active: c.isActive !== undefined ? c.isActive : true,
        })));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categoriesData]);

    const handleAddCategory = () => {
        setLocalCategories([...localCategories, {
            id: `temp-${Date.now()}`,
            name_fr: '', name_en: '', slug: '', icon: '', sort_order: localCategories.length + 1, is_active: true,
        }]);
    };

    const handleSaveCategory = async (category: any, index: number) => {
        try {
            const data = {
                name_fr: category.name_fr,
                name_en: category.name_en,
                slug: category.slug,
                icon: category.icon,
                sort_order: category.sort_order,
                is_active: category.is_active,
            };
            const isPersisted = typeof category.id === 'number' || (typeof category.id === 'string' && !category.id.startsWith('temp-'));
            if (isPersisted) {
                await updateCategory({ id: category.id, data }).unwrap();
                toast.success('Category updated successfully');
            } else {
                const result = await createCategory(data).unwrap();
                const updated = [...localCategories];
                updated[index].id = result.payload.id;
                setLocalCategories(updated);
                toast.success('Category created successfully');
            }
        } catch (error: any) {
            console.error('Save category error:', error);
            toast.error(error?.data?.message || 'Error while saving the category');
        }
    };

    const handleDeleteCategory = async (category: any) => {
        const isTempId = typeof category.id === 'string' && category.id.startsWith('temp-');
        if (!category.id || isTempId) {
            setLocalCategories(localCategories.filter(c => c !== category));
            return;
        }
        if (!confirm('Are you sure you want to delete this category?')) return;
        try {
            await deleteCategory(category.id).unwrap();
            setLocalCategories(localCategories.filter(c => c.id !== category.id));
            toast.success('Category deleted successfully');
        } catch (error: any) {
            console.error('Delete category error:', error);
            toast.error(error?.data?.message || 'Error while deleting the category');
        }
    };

    const inputClass = "w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-text-primary mb-2";

    return (
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-bg-primary p-4 sm:p-6 lg:p-8 overflow-auto transition-colors duration-300">
            <div className="max-w-8xl mx-auto w-full">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold mb-1"
                            style={{
                                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}>
                            Books
                        </h1>
                        <p className="text-gray-600 dark:text-text-tertiary mt-1 text-sm sm:text-base">
                            Manage the book catalog and categories
                        </p>
                    </div>
                    {activeTab === 'catalog' && (
                        <button
                            onClick={handleCreate}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-black font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 w-full sm:w-auto justify-center sm:justify-start"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            New book
                        </button>
                    )}
                    {activeTab === 'categories' && (
                        <button
                            onClick={handleAddCategory}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-black font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 w-full sm:w-auto justify-center sm:justify-start"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            New category
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-800">
                    {(['catalog', 'categories'] as BooksTab[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                                : 'border-transparent text-gray-500 dark:text-text-tertiary hover:text-gray-700 dark:hover:text-text-primary'
                                }`}
                        >
                            {tab === 'catalog' ? 'Catalog' : 'Categories'}
                        </button>
                    ))}
                </div>

                {activeTab === 'catalog' && (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            <div className="relative bg-gradient-to-br from-amber-50/30 to-white dark:from-transparent dark:to-transparent dark:bg-bg-tertiary rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-300 group overflow-hidden shadow-sm hover:shadow-md">
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent dark:from-amber-500/5 dark:to-transparent" />
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <BookOpenIcon className="h-6 w-6 text-black" />
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-600 dark:text-text-tertiary mb-1">Total Books</h3>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-text-primary">{stats.total}</p>
                                </div>
                            </div>

                            <div className="relative bg-gradient-to-br from-amber-50/30 to-white dark:from-transparent dark:to-transparent dark:bg-bg-tertiary rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-300 group overflow-hidden shadow-sm hover:shadow-md">
                                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent dark:from-green-500/5 dark:to-transparent" />
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <CheckCircleIcon className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-600 dark:text-text-tertiary mb-1">Published Books</h3>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.published}</p>
                                </div>
                            </div>

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

                        {/* Filters */}
                        <div className="bg-gradient-to-br from-amber-50/30 to-white dark:from-transparent dark:to-transparent dark:bg-bg-tertiary rounded-xl shadow-sm hover:shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-800 transition-all duration-300">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                                <SearchBar
                                    value={search}
                                    onChange={setSearch}
                                    placeholder="Search for a book or author..."
                                />

                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent text-sm transition-all"
                                >
                                    <option value="">All statuses</option>
                                    <option value="published">Published</option>
                                    <option value="draft">Drafts</option>
                                </select>

                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent text-sm transition-all"
                                >
                                    <option value="">All categories</option>
                                    {categories.map((c: any) => (
                                        <option key={c.id} value={c.id}>{c.icon} {c.nameEn}</option>
                                    ))}
                                </select>

                                <select
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value as SortOption)}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent text-sm transition-all"
                                >
                                    <option value="newest">Newest</option>
                                    <option value="price_asc">Price: low to high</option>
                                    <option value="price_desc">Price: high to low</option>
                                    <option value="title">Title</option>
                                </select>
                            </div>
                        </div>

                        {/* Content */}
                        {isLoading ? (
                            <LoadingSkeleton />
                        ) : filteredBooks.length === 0 ? (
                            <div className="bg-white dark:bg-bg-tertiary rounded-xl shadow-md border border-gray-200 dark:border-gray-800 p-8 sm:p-12 text-center transition-colors">
                                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <BookOpenIcon className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-text-primary mb-2">
                                    {search || statusFilter || categoryFilter ? 'No book found' : 'No books yet'}
                                </h3>
                                <p className="text-gray-600 dark:text-text-tertiary mb-6 text-sm sm:text-base">
                                    {search || statusFilter || categoryFilter
                                        ? 'Try adjusting your search or filters'
                                        : 'Start by creating your first book'}
                                </p>
                                {!(search || statusFilter || categoryFilter) && (
                                    <button
                                        onClick={handleCreate}
                                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-black font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
                                    >
                                        <PlusIcon className="w-5 h-5 mr-2" />
                                        Create a book
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                                {filteredBooks.map((book: any) => (
                                    <AdminBookCard
                                        key={book.id}
                                        book={book}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onTogglePublish={handleTogglePublish}
                                    />
                                ))}
                            </div>
                        )}

                        <BookFormModal
                            isOpen={isFormModalOpen}
                            onClose={() => setIsFormModalOpen(false)}
                            initialData={selectedBook}
                            categories={categories}
                            onSubmit={handleFormSubmit}
                            isSubmitting={isCreating || isUpdating}
                        />
                    </>
                )}

                {activeTab === 'categories' && (
                    <div className="space-y-6">
                        {localCategories.map((category, index) => (
                            <div key={category.id} className="p-6 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-medium text-gray-900 dark:text-text-primary">Category {index + 1}</h4>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleSaveCategory(category, index)} className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">Save</button>
                                        <button onClick={() => handleDeleteCategory(category)} className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">Delete</button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Name (French)</label>
                                        <input type="text" value={category.name_fr} onChange={(e) => {
                                            const updated = [...localCategories]; updated[index].name_fr = e.target.value; setLocalCategories(updated);
                                        }} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Name (English)</label>
                                        <input type="text" value={category.name_en} onChange={(e) => {
                                            const updated = [...localCategories]; updated[index].name_en = e.target.value; setLocalCategories(updated);
                                        }} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Slug</label>
                                        <input type="text" value={category.slug} onChange={(e) => {
                                            const updated = [...localCategories]; updated[index].slug = e.target.value; setLocalCategories(updated);
                                        }} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Icon (emoji)</label>
                                        <input type="text" value={category.icon} onChange={(e) => {
                                            const updated = [...localCategories]; updated[index].icon = e.target.value; setLocalCategories(updated);
                                        }} className={inputClass} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" checked={category.is_active} onChange={(e) => {
                                            const updated = [...localCategories]; updated[index].is_active = e.target.checked; setLocalCategories(updated);
                                        }} />
                                        <label className="text-sm text-gray-700 dark:text-text-primary">Active</label>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Books;
