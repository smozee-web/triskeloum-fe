// src/components/BookFormModal.tsx
import React, { useState, useEffect } from 'react';
import Modal2 from './Modal2';
import FileUploadZone from './FileUploadZone';

const DELIVERY_MODES = ['READ_ONLY', 'DOWNLOADABLE'];
const FILE_SOURCES = ['UPLOAD', 'EXTERNAL_URL'];

interface BookFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: any;
    categories: any[];
    onSubmit: (formData: FormData) => Promise<void>;
    isSubmitting?: boolean;
}

const emptyForm = {
    title_fr: '', title_en: '', description_fr: '', description_en: '',
    author_name: '', price_ghs: 0, price_usd: 0,
    delivery_mode: 'READ_ONLY', file_source: 'UPLOAD', external_url_raw: '',
    category_id: '', sort_order: 0, is_active: true,
};

const BookFormModal: React.FC<BookFormModalProps> = ({ isOpen, onClose, initialData, categories, onSubmit, isSubmitting }) => {
    const [form, setForm] = useState<any>(emptyForm);
    const [coverFile, setCoverFile] = useState<File | undefined>(undefined);
    const [bookFile, setBookFile] = useState<File | undefined>(undefined);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setForm({
                    title_fr: initialData.titleFr || '',
                    title_en: initialData.titleEn || '',
                    description_fr: initialData.descriptionFr || '',
                    description_en: initialData.descriptionEn || '',
                    author_name: initialData.authorName || '',
                    price_ghs: initialData.priceGhs || 0,
                    price_usd: initialData.priceUsd || 0,
                    delivery_mode: initialData.deliveryMode || 'READ_ONLY',
                    file_source: initialData.fileSource || 'UPLOAD',
                    external_url_raw: initialData.externalUrlRaw || '',
                    category_id: initialData.category?.id || '',
                    sort_order: initialData.sortOrder || 0,
                    is_active: initialData.isActive !== undefined ? initialData.isActive : true,
                    file_url: initialData.fileUrl || '',
                    cover_image_url: initialData.coverImageUrl || '',
                });
            } else {
                setForm(emptyForm);
            }
            setCoverFile(undefined);
            setBookFile(undefined);
        }
    }, [isOpen, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('title_fr', form.title_fr);
        formData.append('title_en', form.title_en);
        formData.append('description_fr', form.description_fr || '');
        formData.append('description_en', form.description_en || '');
        formData.append('author_name', form.author_name || '');
        formData.append('price_ghs', String(form.price_ghs || 0));
        formData.append('price_usd', String(form.price_usd || 0));
        formData.append('delivery_mode', form.delivery_mode);
        formData.append('file_source', form.file_source);
        formData.append('sort_order', String(form.sort_order || 0));
        formData.append('is_active', String(form.is_active));
        if (form.category_id) formData.append('category_id', String(form.category_id));

        if (form.file_source === 'EXTERNAL_URL') {
            formData.append('external_url_raw', form.external_url_raw || '');
        } else if (bookFile) {
            formData.append('file', bookFile);
        }
        if (coverFile) {
            formData.append('cover', coverFile);
        }

        await onSubmit(formData);
    };

    const inputClass = "w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-text-primary mb-2";

    return (
        <Modal2 isOpen={isOpen} onClose={onClose} size="lg" title={initialData ? 'Edit book' : 'Create a new book'}>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Title (French)</label>
                        <input required type="text" value={form.title_fr} onChange={(e) => setForm({ ...form, title_fr: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Title (English)</label>
                        <input required type="text" value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Description (French)</label>
                        <textarea rows={2} value={form.description_fr} onChange={(e) => setForm({ ...form, description_fr: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Description (English)</label>
                        <textarea rows={2} value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Author</label>
                        <input type="text" value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Category</label>
                        <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className={inputClass}>
                            <option value="">No category</option>
                            {categories.map((c: any) => (
                                <option key={c.id} value={c.id}>{c.icon} {c.nameEn}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Price (GHS)</label>
                        <input type="number" min="0" value={form.price_ghs} onChange={(e) => setForm({ ...form, price_ghs: parseFloat(e.target.value) || 0 })} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Price (USD)</label>
                        <input type="number" min="0" value={form.price_usd} onChange={(e) => setForm({ ...form, price_usd: parseFloat(e.target.value) || 0 })} className={inputClass} />
                    </div>

                    <p className="md:col-span-2 text-xs text-gray-500 dark:text-text-tertiary -mt-2">
                        Free (price 0/0) books can be read online or downloaded directly from the site. Paid books show a "Buy via WhatsApp" button instead — there's no automated checkout yet.
                    </p>

                    <div>
                        <label className={labelClass}>Delivery mode</label>
                        <select value={form.delivery_mode} onChange={(e) => setForm({ ...form, delivery_mode: e.target.value })} className={inputClass}>
                            {DELIVERY_MODES.map(m => <option key={m} value={m}>{m === 'READ_ONLY' ? 'Read-only (in-browser)' : 'Downloadable'}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>File source</label>
                        <select value={form.file_source} onChange={(e) => setForm({ ...form, file_source: e.target.value })} className={inputClass}>
                            {FILE_SOURCES.map(s => <option key={s} value={s}>{s === 'UPLOAD' ? 'Upload a file' : 'Paste a URL'}</option>)}
                        </select>
                    </div>

                    {form.file_source === 'EXTERNAL_URL' ? (
                        <div className="md:col-span-2">
                            <label className={labelClass}>External URL (Google Drive, Dropbox, ...)</label>
                            <input type="text" placeholder="https://drive.google.com/file/d/..." value={form.external_url_raw} onChange={(e) => setForm({ ...form, external_url_raw: e.target.value })} className={inputClass} />
                        </div>
                    ) : (
                        <div className="md:col-span-2">
                            <label className={labelClass}>Book file (PDF or EPUB)</label>
                            <input type="file" accept="application/pdf,application/epub+zip" onChange={(e) => setBookFile(e.target.files?.[0])} className={inputClass} />
                            {form.file_url && !bookFile && (
                                <p className="text-xs text-gray-500 dark:text-text-tertiary mt-1">Current file: {form.file_url}</p>
                            )}
                        </div>
                    )}

                    <div className="md:col-span-2">
                        <FileUploadZone
                            label="Cover image"
                            type="image"
                            accept="image/*"
                            selectedFile={coverFile}
                            preview={!coverFile ? form.cover_image_url : undefined}
                            onChange={setCoverFile}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                        <label className="text-sm text-gray-700 dark:text-text-primary">Active (visible on the site)</label>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-text-primary rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {isSubmitting ? 'Saving...' : (initialData ? 'Save changes' : 'Create book')}
                    </button>
                </div>
            </form>
        </Modal2>
    );
};

export default BookFormModal;
