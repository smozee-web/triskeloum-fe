// src/pages/courses/Faq.tsx
import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { HelpCircle, CheckCircle, Eye, BarChart3 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import SearchBar from '../../components/SearchBar';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import Pagination from '../../components/Pagination';
import Modal2 from '../../components/Modal2';
import { faqService, FaqData } from '../../services/faqs';

interface FaqFormData extends FaqData {
    category: 'account' | 'courses' | 'payment' | 'settings';
}

const FAQ_CATEGORIES = [
    { value: 'account', label: 'Account' },
    { value: 'courses', label: 'Courses' },
    { value: 'payment', label: 'Payment' },
    { value: 'settings', label: 'Settings' },
];

const Faq: React.FC = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedFaq, setSelectedFaq] = useState<any | null>(null);
    const [formData, setFormData] = useState<FaqFormData>({
        question: '',
        answer: '',
        category: 'courses',
        order: 0,
        is_published: true,
        tags: [],
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [faqs, setFaqs] = useState<any[]>([]);
    const [totalPages, setTotalPages] = useState(1);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch FAQs
    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                setIsLoading(true);
                const response = await faqService.getFaqs(page, 10, debouncedSearch);
                setFaqs(response?.payload || []);
                setTotalPages(response?.payload?.pagination?.totalPages || 1);
            } catch (error: any) {
                toast.error(error?.message || 'Error while loading');
            } finally {
                setIsLoading(false);
            }
        };

        fetchFaqs();
    }, [page, debouncedSearch]);

    const stats = {
        total: faqs.length,
        published: faqs.filter(f => f.is_published).length,
        views: faqs.reduce((sum, f) => sum + (f.views || 0), 0),
    };

    const handleCreate = () => {
        setSelectedFaq(null);
        setFormData({
            question: '',
            answer: '',
            category: 'courses',
            order: 0,
            is_published: true,
            tags: [],
        });
        setIsFormModalOpen(true);
    };

    const handleEdit = (faq: any) => {
        setSelectedFaq(faq);
        setFormData({
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            order: faq.order,
            is_published: faq.is_published,
            tags: faq.tags || [],
        });
        setIsFormModalOpen(true);
    };

    const handleDelete = async (faqId: number) => {
        if (!window.confirm('Are you sure you want to delete this FAQ?')) {
            return;
        }
        try {
            await faqService.deleteFaq(faqId);
            toast.success('FAQ deleted');
            setPage(1);
        } catch (error: any) {
            toast.error(error?.message || 'Error while deleting');
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.question || !formData.answer) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setIsSubmitting(true);

            if (selectedFaq) {
                await faqService.updateFaq(selectedFaq.id, formData);
                toast.success('FAQ updated');
            } else {
                await faqService.createFaq(formData);
                toast.success('FAQ created');
            }

            setIsFormModalOpen(false);
            setPage(1);
            setDebouncedSearch('');
            setSearch('');
        } catch (error: any) {
            console.error('Error:', error);
            toast.error(error?.message || 'Error while submitting');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-bg-primary p-4 sm:p-6 lg:p-8 overflow-auto">
            <div className="max-w-8xl mx-2 w-full">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold mb-1"
                            style={{
                                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}>
                            FAQs
                        </h1>
                        <p className="text-gray-600 dark:text-text-tertiary mt-1 text-sm sm:text-base">Manage frequently asked questions</p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-black rounded-lg hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] transition-colors shadow-md w-full sm:w-auto justify-center sm:justify-start font-medium"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        New FAQ
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                    <div className="relative bg-gradient-to-br from-amber-50/30 to-white dark:from-transparent dark:to-transparent dark:bg-bg-tertiary rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-300 group overflow-hidden shadow-sm hover:shadow-md">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent dark:from-amber-500/5 dark:to-transparent" />
                        <div className="relative">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-text-tertiary">Total</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-text-primary mt-2">{stats.total}</p>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <HelpCircle className="w-6 h-6 text-black" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative bg-gradient-to-br from-green-50/30 to-white dark:from-transparent dark:to-transparent dark:bg-bg-tertiary rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 hover:border-green-500 dark:hover:border-green-500 transition-all duration-300 group overflow-hidden shadow-sm hover:shadow-md">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent dark:from-green-500/5 dark:to-transparent" />
                        <div className="relative">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-text-tertiary">Published</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{stats.published}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative bg-gradient-to-br from-purple-50/30 to-white dark:from-transparent dark:to-transparent dark:bg-bg-tertiary rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 hover:border-purple-500 dark:hover:border-purple-500 transition-all duration-300 group overflow-hidden shadow-sm hover:shadow-md">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent dark:from-purple-500/5 dark:to-transparent" />
                        <div className="relative">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-text-tertiary">Total views</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                        <p className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.views}</p>
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-bg-tertiary rounded-lg shadow-md p-4 sm:p-6 mb-6 border border-gray-200 dark:border-gray-800">
                    <SearchBar
                        value={search}
                        onChange={setSearch}
                        placeholder="Search for a FAQ..."
                    />
                </div>

                {/* Content */}
                {isLoading ? (
                    <LoadingSkeleton />
                ) : faqs.length === 0 ? (
                    <div className="bg-white dark:bg-bg-tertiary rounded-lg shadow-md p-8 sm:p-12 text-center border border-gray-200 dark:border-gray-800">
                        <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-primary-light)]/10 dark:from-[var(--color-primary)]/20 dark:to-[var(--color-primary-light)]/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--color-primary)]/30 dark:border-[var(--color-primary)]/50">
                            <HelpCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-text-primary mb-2">No FAQ</h3>
                        <p className="text-gray-600 dark:text-text-tertiary mb-6 text-sm sm:text-base">Start by creating your first FAQ</p>
                        <button
                            onClick={handleCreate}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-black rounded-lg hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] transition-colors font-medium"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Create a FAQ
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Table */}
                        <div className="bg-white dark:bg-bg-tertiary rounded-lg shadow-md overflow-x-auto border border-gray-200 dark:border-gray-800">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-primary-light)]/10 dark:from-[var(--color-primary)]/20 dark:to-[var(--color-primary-light)]/20 border-b border-gray-200 dark:border-gray-800">
                                    <tr>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-text-primary uppercase tracking-wider">Question</th>
                                        <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-text-primary uppercase tracking-wider">Category</th>
                                        <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-text-primary uppercase tracking-wider">Views</th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-text-primary uppercase tracking-wider">Status</th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-text-primary uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {faqs.map((faq: any) => (
                                        <tr key={faq.id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-900 dark:text-text-primary font-medium truncate">
                                                <div className="line-clamp-1">{faq.question}</div>
                                            </td>
                                            <td className="hidden sm:table-cell px-6 py-4 text-xs text-gray-600 dark:text-text-secondary">
                                                <span className="px-2 py-1 bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-primary-light)]/10 dark:from-[var(--color-primary)]/20 dark:to-[var(--color-primary-light)]/20 border border-[var(--color-primary)]/30 dark:border-[var(--color-primary)]/50 rounded text-xs font-medium text-gray-900 dark:text-text-primary">
                                                    {FAQ_CATEGORIES.find(c => c.value === faq.category)?.label || faq.category}
                                                </span>
                                            </td>
                                            <td className="hidden lg:table-cell px-6 py-4">
                                                <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-text-secondary">
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>{faq.views || 0}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4">
                                                <span
                                                    className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${
                                                        faq.is_published
                                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-700'
                                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                                                    }`}
                                                >
                                                    {faq.is_published ? 'Published' : 'Draft'}
                                                </span>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(faq)}
                                                        title="Edit"
                                                        className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                                                    >
                                                        <PencilIcon className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(faq.id)}
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

                        {/* Pagination */}
                        <div className="mt-6">
                            <Pagination
                                currentPage={page}
                                totalPages={totalPages}
                                onPageChange={setPage}
                            />
                        </div>
                    </>
                )}

                {/* Form Modal */}
                <Modal2
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    title={selectedFaq ? 'Edit FAQ' : 'Create a new FAQ'}
                    size="lg"
                >
                    <div className="p-4 sm:p-6">
                        <form onSubmit={handleFormSubmit} className="space-y-6">
                            {/* Question */}
                            <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                            Question *
                        </label>
                        <input
                            type="text"
                            value={formData.question}
                            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-bg-secondary border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                            placeholder="Enter the question"
                        />
                    </div>

                    {/* Answer */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                            Answer *
                        </label>
                        <textarea
                            value={formData.answer}
                            onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                            rows={5}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-bg-secondary border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent resize-none transition-all"
                            placeholder="Enter the detailed answer"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                            Category *
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-bg-secondary border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                        >
                            {FAQ_CATEGORIES.map(cat => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Order */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                            Display order
                        </label>
                        <input
                            type="number"
                            value={formData.order || 0}
                            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-bg-secondary border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                            placeholder="0"
                            min="0"
                        />
                        <p className="text-xs text-gray-500 dark:text-text-tertiary mt-1">FAQs are sorted in ascending order</p>
                    </div>

                    {/* Published */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="is_published"
                            checked={formData.is_published}
                            onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                            className="w-4 h-4 text-amber-600 dark:text-amber-500 border-gray-300 dark:border-gray-700 rounded focus:ring-amber-500"
                        />
                        <label htmlFor="is_published" className="ml-2 text-sm text-gray-900 dark:text-text-primary">
                            Publish this FAQ
                        </label>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setIsFormModalOpen(false)}
                            className="px-4 py-2 text-gray-700 dark:text-text-primary bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-black rounded-lg hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] transition-colors disabled:opacity-50 font-medium"
                        >
                            {isSubmitting ? 'Processing...' : selectedFaq ? 'Update' : 'Create'}
                        </button>
                            </div>
                        </form>
                    </div>
                </Modal2>
            </div>
        </div>
    );
};

export default Faq;