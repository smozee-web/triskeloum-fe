// src/pages/courses/Quotes.tsx
import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';
import { Lightbulb, PenTool, BarChart3 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import SearchBar from '../../components/SearchBar';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import Pagination from '../../components/Pagination';
import Modal2 from '../../components/Modal2';
import { quoteService } from '../../services/quotes';

interface QuoteFormData {
    content: string;
    author: string;
    coverFile?: File | null;
}

const Quotes: React.FC = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(9);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState<any | null>(null);
    const [formData, setFormData] = useState<QuoteFormData>({
        content: '',
        author: '',
        coverFile: null
    });
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [quotes, setQuotes] = useState<any[]>([]);
    const [totalPages, setTotalPages] = useState(1);

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

    // Fetch quotes
    useEffect(() => {
        const fetchQuotes = async () => {
            try {
                setIsLoading(true);
                const response = await quoteService.getQuotes(page, limit, debouncedSearch);
                setQuotes(response?.payload?.data || []);
                setTotalPages(response?.payload?.pagination?.totalPages || 1);
            } catch (error: any) {
                toast.error(error?.message || 'Error while loading');
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuotes();
    }, [page, limit, debouncedSearch]);

    const stats = {
        total: quotes.length,
    };

    const handleCreate = () => {
        setSelectedQuote(null);
        setFormData({
            content: '',
            author: '',
            coverFile: null
        });
        setCoverPreview(null);
        setIsFormModalOpen(true);
    };

    const handleEdit = (quote: any) => {
        setSelectedQuote(quote);
        setFormData({
            content: quote.content,
            author: quote.author,
            coverFile: null
        });
        // Show the existing cover as a preview
        setCoverPreview(quote.cover || null);
        setIsFormModalOpen(true);
    };

    const handleDelete = async (quoteId: number) => {
        if (!window.confirm('Are you sure you want to delete this quote?')) {
            return;
        }
        try {
            await quoteService.deleteQuote(quoteId);
            toast.success('Quote deleted');
            setPage(1);
        } catch (error: any) {
            toast.error(error?.message || 'Error while deleting');
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.content || !formData.author) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setIsSubmitting(true);

            // Build FormData
            const submitData = new FormData();
            submitData.append('content', formData.content);
            submitData.append('author', formData.author);

            // Add the file if selected
            if (formData.coverFile) {
                submitData.append('cover', formData.coverFile);
            }

            if (selectedQuote) {
                await quoteService.updateQuote(selectedQuote.id, submitData);
                toast.success('Quote updated');
            } else {
                await quoteService.createQuote(submitData);
                toast.success('Quote created');
            }

            setIsFormModalOpen(false);
            setPage(1);
        } catch (error: any) {
            console.error('Error:', error);
            toast.error(error?.message || 'Error while submitting');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-8xl mx-2 px-6 py-8 bg-gray-50 dark:bg-bg-primary min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-1"
                        style={{
                            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                        Quotes
                    </h1>
                    <p className="text-gray-600 dark:text-text-tertiary mt-1">Manage all your inspiring quotes</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-black rounded-lg hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] transition-colors shadow-md font-medium"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    New quote
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="relative bg-gradient-to-br from-purple-50/30 to-white dark:from-transparent dark:to-transparent dark:bg-bg-tertiary rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-purple-500 dark:hover:border-purple-500 transition-all duration-300 group overflow-hidden shadow-sm hover:shadow-md">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent dark:from-purple-500/5 dark:to-transparent" />
                    <div className="relative">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-text-tertiary">Total</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-text-primary mt-2">{stats.total}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Lightbulb className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative bg-gradient-to-br from-amber-50/30 to-white dark:from-transparent dark:to-transparent dark:bg-bg-tertiary rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-300 group overflow-hidden shadow-sm hover:shadow-md">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent dark:from-amber-500/5 dark:to-transparent" />
                    <div className="relative">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-text-tertiary">Unique authors</p>
                                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-2">
                                    {new Set(quotes.map(q => q.author)).size}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <PenTool className="w-6 h-6 text-black" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative bg-gradient-to-br from-gray-50/30 to-white dark:from-transparent dark:to-transparent dark:bg-bg-tertiary rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-gray-500 dark:hover:border-gray-500 transition-all duration-300 group overflow-hidden shadow-sm hover:shadow-md">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-transparent dark:from-gray-500/5 dark:to-transparent" />
                    <div className="relative">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-text-tertiary">Average length</p>
                                <p className="text-3xl font-bold text-gray-600 dark:text-text-secondary mt-2">
                                    {quotes.length > 0
                                        ? Math.round(quotes.reduce((sum, q) => sum + q.content.length, 0) / quotes.length)
                                        : 0}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <BarChart3 className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-bg-tertiary rounded-lg shadow-md p-4 mb-6 border border-gray-200 dark:border-gray-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <SearchBar
                        value={search}
                        onChange={setSearch}
                        placeholder="Search for a quote..."
                    />

                    <select
                        value={limit}
                        onChange={(e) => setLimit(Number(e.target.value))}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent text-sm transition-all"
                    >
                        <option value="9">9 per page</option>
                        <option value="18">18 per page</option>
                        <option value="27">27 per page</option>
                        <option value="36">36 per page</option>
                    </select>

                    {/* View Toggle */}
                    <div className="flex items-center justify-center">
                        <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-3 py-2 text-sm font-medium transition-colors ${
                                    viewMode === 'grid'
                                        ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-black'
                                        : 'bg-white dark:bg-bg-secondary text-gray-700 dark:text-text-primary hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                            >
                                <Squares2X2Icon className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-3 py-2 text-sm font-medium transition-colors border-l border-gray-300 dark:border-gray-700 ${
                                    viewMode === 'list'
                                        ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-black'
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
            ) : quotes.length === 0 ? (
                <div className="bg-white dark:bg-bg-tertiary rounded-lg shadow-md p-12 text-center border border-gray-200 dark:border-gray-800">
                    <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-primary-light)]/10 dark:from-[var(--color-primary)]/20 dark:to-[var(--color-primary-light)]/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--color-primary)]/30 dark:border-[var(--color-primary)]/50">
                        <Lightbulb className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-text-primary mb-2">No quote</h3>
                    <p className="text-gray-600 dark:text-text-tertiary mb-6">Start by creating your first quote</p>
                    <button
                        onClick={handleCreate}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-black rounded-lg hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] transition-colors font-medium"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Create a quote
                    </button>
                </div>
            ) : (
                <>
                    {/* Grid or List View */}
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {quotes.map((quote: any) => (
                                <div
                                    key={quote.id}
                                    className="bg-white dark:bg-bg-tertiary rounded-lg shadow-md border border-gray-200 dark:border-gray-800 hover:shadow-lg hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-300 overflow-hidden"
                                >
                                    {/* Cover Image */}
                                    {quote.cover && (
                                        <div className="h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
                                            <img
                                                src={quote.cover}
                                                alt={quote.author}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="p-6">
                                        <div className="flex items-start gap-3 mb-4">
                                            <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Lightbulb className="w-5 h-5 text-black" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-1">
                                                    {quote.author}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-text-tertiary">
                                                    {quote.content.length} characters
                                                </p>
                                            </div>
                                        </div>

                                        <blockquote className="text-sm text-gray-700 dark:text-text-secondary italic line-clamp-4 mb-4 border-l-4 border-amber-500 pl-3">
                                            "{quote.content}"
                                        </blockquote>

                                        {/* Actions */}
                                        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                                            <button
                                                onClick={() => handleEdit(quote)}
                                                title="Edit"
                                                className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(quote.id)}
                                                title="Delete"
                                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-bg-tertiary rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-800">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-primary-light)]/10 dark:from-[var(--color-primary)]/20 dark:to-[var(--color-primary-light)]/20 border-b border-gray-200 dark:border-gray-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-text-primary uppercase tracking-wider">Quote</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-text-primary uppercase tracking-wider">Author</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-text-primary uppercase tracking-wider">Length</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-text-primary uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {quotes.map((quote: any) => (
                                        <tr key={quote.id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-text-primary">
                                                <div className="line-clamp-2">"{quote.content}"</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-text-secondary font-medium">{quote.author}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-text-secondary">{quote.content.length} chars</td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(quote)}
                                                        title="Edit"
                                                        className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                                                    >
                                                        <PencilIcon className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(quote.id)}
                                                        title="Delete"
                                                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
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
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                </>
            )}

            {/* Form Modal */}
            <Modal2
                isOpen={isFormModalOpen}
                onClose={() => {
                    setIsFormModalOpen(false);
                    setCoverPreview(null);
                }}
                size="lg"
            >
                <div className="p-6 sm:p-8">
                    {/* Header with gradient accent */}
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center shadow-md">
                            {selectedQuote ? (
                                <PencilIcon className="w-6 h-6 text-black" />
                            ) : (
                                <PlusIcon className="w-6 h-6 text-black" />
                            )}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-text-primary">
                            {selectedQuote ? 'Edit quote' : 'Create a new quote'}
                        </h2>
                    </div>

                    <form onSubmit={handleFormSubmit} className="space-y-6">
                        {/* Content */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-text-primary mb-2">
                                Content *
                            </label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-bg-secondary border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-text-primary focus:bg-white dark:focus:bg-bg-secondary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent resize-none transition-all"
                                placeholder="Enter the inspiring quote"
                                required
                            />
                            <p className="text-xs text-gray-500 dark:text-text-tertiary mt-1">
                                {formData.content.length}/1000 characters
                            </p>
                        </div>

                        {/* Author */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-text-primary mb-2">
                                Author *
                            </label>
                            <input
                                type="text"
                                value={formData.author}
                                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-bg-secondary border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-text-primary focus:bg-white dark:focus:bg-bg-secondary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                                placeholder="Author name"
                                required
                            />
                        </div>

                        {/* Cover Image Upload */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-text-primary mb-2">
                                Cover image (optional)
                            </label>
                            <input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setFormData({ ...formData, coverFile: file });
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setCoverPreview(reader.result as string);
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-bg-secondary border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-text-primary focus:bg-white dark:focus:bg-bg-secondary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-[var(--color-primary)] file:to-[var(--color-primary-light)] file:text-black hover:file:shadow-md file:cursor-pointer"
                            />
                            <p className="text-xs text-gray-500 dark:text-text-tertiary mt-1">
                                Accepted formats: JPEG, PNG, WEBP (max 10 MB)
                            </p>

                            {/* Image Preview */}
                            {coverPreview && (
                                <div className="mt-4">
                                    <p className="text-xs text-gray-600 dark:text-text-secondary font-medium mb-2">Preview:</p>
                                    <div className="relative">
                                        <img
                                            src={coverPreview}
                                            alt="Preview"
                                            className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCoverPreview(null);
                                                setFormData({ ...formData, coverFile: null });
                                            }}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-md"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-800">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsFormModalOpen(false);
                                    setCoverPreview(null);
                                }}
                                disabled={isSubmitting}
                                className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-text-primary font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-black font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                        Processing...
                                    </>
                                ) : selectedQuote ? (
                                    <>
                                        <PencilIcon className="w-4 h-4" />
                                        Update quote
                                    </>
                                ) : (
                                    <>
                                        <PlusIcon className="w-4 h-4" />
                                        Create quote
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

export default Quotes;