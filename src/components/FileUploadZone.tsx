import React, { useRef, useState } from 'react';
import { Upload, X, Play, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploadZoneProps {
    accept: string;
    onChange: (file: File | undefined) => void;
    selectedFile?: File;
    preview?: string;
    label: string;
    isRequired?: boolean;
    type: 'video' | 'image';
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
    accept,
    onChange,
    selectedFile,
    preview,
    label,
    isRequired = false,
    type,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [previewData, setPreviewData] = useState<string | null>(preview || null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleFile = (file: File) => {
        onChange(file);
        
        if (type === 'video') {
            const url = URL.createObjectURL(file);
            setPreviewData(url);
        } else if (type === 'image') {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewData(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    };

    const handleRemove = () => {
        onChange(undefined);
        setPreviewData(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-text-primary mb-2">
                {label} {isRequired && <span className="text-red-500 dark:text-red-400">*</span>}
            </label>

            <motion.div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer ${
                    isDragging
                        ? 'border-amber-500 dark:border-amber-400 bg-amber-50 dark:bg-amber-900/10'
                        : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-bg-secondary hover:border-amber-400 dark:hover:border-amber-500'
                }`}
                onClick={() => !selectedFile && !previewData && inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    onChange={handleInputChange}
                    className="hidden"
                />

                <AnimatePresence mode="wait">
                    {selectedFile || previewData ? (
                        <motion.div
                            key="preview"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="space-y-4"
                        >
                            {type === 'video' ? (
                                <div className="relative rounded-lg overflow-hidden bg-black">
                                    <video
                                        src={previewData || undefined}
                                        className="w-full h-40 object-cover"
                                        controls
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition">
                                        <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100" />
                                    </div>
                                </div>
                            ) : (
                                <img
                                    src={previewData || undefined}
                                    alt="preview"
                                    className="w-full h-40 object-cover rounded-lg"
                                />
                            )}

                            <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                                <div className="flex items-center gap-2 min-w-0">
                                    {type === 'video' ? (
                                        <Play className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                                    ) : (
                                        <ImageIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                                    )}
                                    <span className="text-sm text-gray-700 dark:text-text-primary truncate font-medium">
                                        {selectedFile?.name || 'Previewed file'}
                                    </span>
                                </div>
                                <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemove();
                                    }}
                                    className="ml-2 p-1 hover:bg-amber-200 dark:hover:bg-amber-900/40 rounded-lg transition-colors flex-shrink-0"
                                >
                                    <X className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                </motion.button>
                            </div>

                            <motion.button
                                type="button"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    inputRef.current?.click();
                                }}
                                className="w-full py-2 px-4 text-sm text-amber-700 dark:text-amber-400 bg-white dark:bg-bg-tertiary border border-amber-300 dark:border-amber-700 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors font-medium"
                            >
                                Replace file
                            </motion.button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center text-center"
                        >
                            <motion.div
                                animate={{ y: [0, -4, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="mb-4"
                            >
                                <Upload className="w-12 h-12 text-amber-600 dark:text-amber-400 mx-auto" />
                            </motion.div>
                            <p className="text-sm font-semibold text-gray-700 dark:text-text-primary mb-1">
                                Drag and drop your file
                            </p>
                            <p className="text-xs text-gray-500 dark:text-text-tertiary">
                                or click to browse
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default FileUploadZone;
