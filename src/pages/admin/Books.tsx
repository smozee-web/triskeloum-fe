// src/pages/admin/Books.tsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import FileUploadZone from '../../components/FileUploadZone';
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

const DELIVERY_MODES = ['READ_ONLY', 'DOWNLOADABLE'];
const FILE_SOURCES = ['UPLOAD', 'EXTERNAL_URL'];

const Books: React.FC = () => {
    const [activeTab, setActiveTab] = useState<BooksTab>('catalog');

    // ========== Catalog ==========
    const { data: booksData } = useGetAdminBooksQuery();
    const { data: categoriesData } = useGetBookCategoriesQuery();
    const [createBook] = useCreateBookMutation();
    const [updateBook] = useUpdateBookMutation();
    const [deleteBook] = useDeleteBookMutation();

    const [books, setBooks] = useState<any[]>([]);
    const categories = categoriesData?.payload || [];

    useEffect(() => {
        if (booksData?.payload) {
            setBooks(booksData.payload.map((b: any) => ({
                id: b.id,
                title_fr: b.titleFr,
                title_en: b.titleEn,
                description_fr: b.descriptionFr || '',
                description_en: b.descriptionEn || '',
                author_name: b.authorName || '',
                price_ghs: b.priceGhs || 0,
                price_usd: b.priceUsd || 0,
                delivery_mode: b.deliveryMode || 'READ_ONLY',
                file_source: b.fileSource || 'UPLOAD',
                external_url_raw: b.externalUrlRaw || '',
                cover_image_url: b.coverImageUrl || '',
                file_url: b.fileUrl || '',
                category_id: b.category?.id || '',
                sort_order: b.sortOrder || 0,
                is_active: b.isActive !== undefined ? b.isActive : true,
                coverFile: undefined as File | undefined,
                bookFile: undefined as File | undefined,
            })));
        }
    }, [booksData]);

    const handleAddBook = () => {
        setBooks([...books, {
            id: `temp-${Date.now()}`,
            title_fr: '', title_en: '', description_fr: '', description_en: '',
            author_name: '', price_ghs: 0, price_usd: 0,
            delivery_mode: 'READ_ONLY', file_source: 'UPLOAD', external_url_raw: '',
            cover_image_url: '', category_id: '', sort_order: books.length + 1, is_active: true,
            coverFile: undefined, bookFile: undefined,
        }]);
    };

    const handleSaveBook = async (book: any, index: number) => {
        try {
            if (book.file_source === 'UPLOAD' && !book.bookFile && !book.file_url && typeof book.id === 'string') {
                toast.error('Upload a book file, or switch to "External URL" and paste a link');
                return;
            }
            if (book.file_source === 'EXTERNAL_URL' && !book.external_url_raw) {
                toast.error('Paste an external URL, or switch to "Upload a file"');
                return;
            }

            const formData = new FormData();
            formData.append('title_fr', book.title_fr);
            formData.append('title_en', book.title_en);
            formData.append('description_fr', book.description_fr || '');
            formData.append('description_en', book.description_en || '');
            formData.append('author_name', book.author_name || '');
            formData.append('price_ghs', String(book.price_ghs || 0));
            formData.append('price_usd', String(book.price_usd || 0));
            formData.append('delivery_mode', book.delivery_mode);
            formData.append('file_source', book.file_source);
            formData.append('sort_order', String(book.sort_order || 0));
            formData.append('is_active', String(book.is_active));
            if (book.category_id) formData.append('category_id', String(book.category_id));

            if (book.file_source === 'EXTERNAL_URL') {
                formData.append('external_url_raw', book.external_url_raw || '');
            } else if (book.bookFile) {
                formData.append('file', book.bookFile);
            }
            if (book.coverFile) {
                formData.append('cover', book.coverFile);
            }

            const isPersisted = typeof book.id === 'number' || (typeof book.id === 'string' && !book.id.startsWith('temp-'));

            if (isPersisted) {
                await updateBook({ id: book.id, data: formData }).unwrap();
                toast.success('Book updated successfully');
            } else {
                const result = await createBook(formData).unwrap();
                const updated = [...books];
                updated[index].id = result.payload.id;
                setBooks(updated);
                toast.success('Book created successfully');
            }
        } catch (error: any) {
            console.error('Save book error:', error);
            toast.error(error?.data?.message || 'Error while saving the book');
        }
    };

    const handleDeleteBook = async (book: any) => {
        const isTempId = typeof book.id === 'string' && book.id.startsWith('temp-');
        if (!book.id || isTempId) {
            setBooks(books.filter(b => b !== book));
            return;
        }
        if (!confirm('Are you sure you want to delete this book?')) return;
        try {
            await deleteBook(book.id).unwrap();
            setBooks(books.filter(b => b.id !== book.id));
            toast.success('Book deleted successfully');
        } catch (error: any) {
            console.error('Delete book error:', error);
            toast.error(error?.data?.message || 'Error while deleting the book');
        }
    };

    // ========== Categories ==========
    const [createCategory] = useCreateBookCategoryMutation();
    const [updateCategory] = useUpdateBookCategoryMutation();
    const [deleteCategory] = useDeleteBookCategoryMutation();
    const [localCategories, setLocalCategories] = useState<any[]>([]);

    useEffect(() => {
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
            <div className="max-w-6xl mx-auto w-full">
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-1"
                        style={{
                            background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                        Books
                    </h1>
                    <p className="text-gray-600 dark:text-text-tertiary mt-1 text-sm sm:text-base">
                        Manage the book catalog and categories
                    </p>
                </div>

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
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-text-primary">Books</h3>
                            <button
                                onClick={handleAddBook}
                                className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
                            >
                                + Add a book
                            </button>
                        </div>

                        {books.map((book, index) => (
                            <div key={book.id} className="p-6 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-medium text-gray-900 dark:text-text-primary">Book {index + 1}</h4>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleSaveBook(book, index)} className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">Save</button>
                                        <button onClick={() => handleDeleteBook(book)} className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">Delete</button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Title (French)</label>
                                        <input type="text" value={book.title_fr} onChange={(e) => {
                                            const updated = [...books]; updated[index].title_fr = e.target.value; setBooks(updated);
                                        }} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Title (English)</label>
                                        <input type="text" value={book.title_en} onChange={(e) => {
                                            const updated = [...books]; updated[index].title_en = e.target.value; setBooks(updated);
                                        }} className={inputClass} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className={labelClass}>Description (French)</label>
                                        <textarea rows={2} value={book.description_fr} onChange={(e) => {
                                            const updated = [...books]; updated[index].description_fr = e.target.value; setBooks(updated);
                                        }} className={inputClass} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className={labelClass}>Description (English)</label>
                                        <textarea rows={2} value={book.description_en} onChange={(e) => {
                                            const updated = [...books]; updated[index].description_en = e.target.value; setBooks(updated);
                                        }} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Author</label>
                                        <input type="text" value={book.author_name} onChange={(e) => {
                                            const updated = [...books]; updated[index].author_name = e.target.value; setBooks(updated);
                                        }} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Category</label>
                                        <select value={book.category_id} onChange={(e) => {
                                            const updated = [...books]; updated[index].category_id = e.target.value; setBooks(updated);
                                        }} className={inputClass}>
                                            <option value="">No category</option>
                                            {categories.map((c: any) => (
                                                <option key={c.id} value={c.id}>{c.nameEn}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Price (GHS)</label>
                                        <input type="number" value={book.price_ghs} onChange={(e) => {
                                            const updated = [...books]; updated[index].price_ghs = parseFloat(e.target.value) || 0; setBooks(updated);
                                        }} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Price (USD)</label>
                                        <input type="number" value={book.price_usd} onChange={(e) => {
                                            const updated = [...books]; updated[index].price_usd = parseFloat(e.target.value) || 0; setBooks(updated);
                                        }} className={inputClass} />
                                    </div>
                                    <p className="md:col-span-2 text-xs text-gray-500 dark:text-text-tertiary -mt-2">
                                        Free (price 0/0) books can be read online or downloaded directly from the site. Paid books show a "Buy via WhatsApp" button instead — there's no automated checkout yet.
                                    </p>
                                    <div>
                                        <label className={labelClass}>Delivery mode</label>
                                        <select value={book.delivery_mode} onChange={(e) => {
                                            const updated = [...books]; updated[index].delivery_mode = e.target.value; setBooks(updated);
                                        }} className={inputClass}>
                                            {DELIVERY_MODES.map(m => <option key={m} value={m}>{m === 'READ_ONLY' ? 'Read-only (in-browser)' : 'Downloadable'}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>File source</label>
                                        <select value={book.file_source} onChange={(e) => {
                                            const updated = [...books]; updated[index].file_source = e.target.value; setBooks(updated);
                                        }} className={inputClass}>
                                            {FILE_SOURCES.map(s => <option key={s} value={s}>{s === 'UPLOAD' ? 'Upload a file' : 'Paste a URL'}</option>)}
                                        </select>
                                    </div>

                                    {book.file_source === 'EXTERNAL_URL' ? (
                                        <div className="md:col-span-2">
                                            <label className={labelClass}>External URL (Google Drive, Dropbox, ...)</label>
                                            <input type="text" placeholder="https://drive.google.com/file/d/..." value={book.external_url_raw} onChange={(e) => {
                                                const updated = [...books]; updated[index].external_url_raw = e.target.value; setBooks(updated);
                                            }} className={inputClass} />
                                        </div>
                                    ) : (
                                        <div className="md:col-span-2">
                                            <label className={labelClass}>Book file (PDF or EPUB)</label>
                                            <input type="file" accept="application/pdf,application/epub+zip" onChange={(e) => {
                                                const updated = [...books]; updated[index].bookFile = e.target.files?.[0]; setBooks(updated);
                                            }} className={inputClass} />
                                            {book.file_url && !book.bookFile && (
                                                <p className="text-xs text-gray-500 dark:text-text-tertiary mt-1">Current file: {book.file_url}</p>
                                            )}
                                        </div>
                                    )}

                                    <div className="md:col-span-2">
                                        <FileUploadZone
                                            label="Cover image"
                                            type="image"
                                            accept="image/*"
                                            selectedFile={book.coverFile}
                                            preview={!book.coverFile ? book.cover_image_url : undefined}
                                            onChange={(file) => {
                                                const updated = [...books]; updated[index].coverFile = file; setBooks(updated);
                                            }}
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" checked={book.is_active} onChange={(e) => {
                                            const updated = [...books]; updated[index].is_active = e.target.checked; setBooks(updated);
                                        }} />
                                        <label className="text-sm text-gray-700 dark:text-text-primary">Active (visible on the site)</label>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'categories' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-text-primary">Categories</h3>
                            <button
                                onClick={handleAddCategory}
                                className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
                            >
                                + Add a category
                            </button>
                        </div>

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
