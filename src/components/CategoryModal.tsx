// src/components/admin/categories/CategoryModal.tsx
import React, { useState, useEffect } from 'react';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { Category } from '../utils/typeDef';

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: FormData) => void;
    category?: Category | null;
    isLoading?: boolean;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    category,
    isLoading = false
}) => {
    const [title, setTitle] = useState('');
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [errors, setErrors] = useState<{ title?: string; cover?: string }>({});

    useEffect(() => {
        if (category) {
            setTitle(category.title);
            if (category.cover) {
                setPreviewUrl(category.cover);
            } else {
                setPreviewUrl('');
            }
            setCoverFile(null);
        } else {
            setTitle('');
            setPreviewUrl('');
            setCoverFile(null);
        }
        setErrors({});
    }, [category, isOpen]);

    // Nettoyer l'URL de prévisualisation quand le composant est démonté
    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const validate = (): boolean => {
        const newErrors: { title?: string; cover?: string } = {};

        if (!title.trim()) {
            newErrors.title = 'Title is required';
        } else if (title.length < 3) {
            newErrors.title = 'Title must contain at least 3 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        
        if (file) {
            // Vérifier le type de fichier
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                setErrors(prev => ({
                    ...prev,
                    cover: 'The file must be an image (JPEG, PNG, WEBP)'
                }));
                return;
            }

            // Check size (e.g. max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                setErrors(prev => ({
                    ...prev,
                    cover: 'The file size must not exceed 5MB'
                }));
                return;
            }

            // Nettoyer l'ancienne URL si elle existe
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }

            setCoverFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setErrors(prev => ({ ...prev, cover: undefined }));
        }
    };

    const handleRemoveCover = () => {
        if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }
        setCoverFile(null);
        setPreviewUrl('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (validate()) {
            const formData = new FormData();
            formData.append('title', title.trim());
            
            if (coverFile) {
                formData.append('cover', coverFile);
            }

            onSubmit(formData);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Overlay */}
            <div 
                className="fixed inset-0 inset-0 bg-black/40 backdrop-blur-sm transition-all duration-300 bg-opacity-50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full transform transition-all">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-900">
                            {category ? 'Edit category' : 'New category'}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500 transition-colors"
                            disabled={isLoading}
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                    if (errors.title) {
                                        setErrors(prev => ({ ...prev, title: undefined }));
                                    }
                                }}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                    errors.title ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Ex: Web Development"
                                disabled={isLoading}
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                            )}
                        </div>

                        {/* Cover Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cover image
                            </label>
                            
                            {/* Upload Area */}
                            {!previewUrl ? (
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="cover-upload"
                                        disabled={isLoading}
                                    />
                                    <label
                                        htmlFor="cover-upload"
                                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                                            errors.cover 
                                                ? 'border-red-500 bg-red-50' 
                                                : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <PhotoIcon className="w-10 h-10 text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-600">
                                            Click to choose an image
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            JPEG, PNG, WEBP (max 5MB)
                                        </p>
                                    </label>
                                </div>
                            ) : (
                                /* Preview */
                                <div className="relative">
                                    <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRemoveCover}
                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                        disabled={isLoading}
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            
                            {errors.cover && (
                                <p className="mt-1 text-sm text-red-600">{errors.cover}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                Optional - A default image will be used if no image is provided
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Processing...
                                    </span>
                                ) : (
                                    category ? 'Update' : 'Create'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CategoryModal;