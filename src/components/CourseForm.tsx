// src/components/CourseForm.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useCourseDraft } from '../hooks/useCourseDraft';
import { useAutoSave } from '../hooks/useAutoSave';
import { useEditCourseInitialization } from '../hooks/useEditCourseInitialization';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import Sections from './Sections';
import BasicInfo from './BasicInfo';

interface CourseFormProps {
    initialData?: any;
    onSubmit: (data: FormData) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
}

const CourseForm: React.FC<CourseFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    isSubmitting
}) => {
    const { hasDraft, loadDraft, saveDraft, clearDraft, isSaving } = useCourseDraft();
    const [showDraftPrompt, setShowDraftPrompt] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [sections, setSections] = useState<any[]>([]);
    const [sectionCoverPreviews, setSectionCoverPreviews] = useState<{ [key: number]: string }>({});
    const [sectionCoverFiles, setSectionCoverFiles] = useState<{ [key: number]: File }>({});
    const [mainCoverFile, setMainCoverFile] = useState<File | null>(null);
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [contentType, setContentType] = useState<'sections' | 'media'>('sections');

    const methods = useForm({
        defaultValues: {
            title: initialData?.title || '',
            legend: initialData?.legend || '',
            est_time_min: initialData?.est_time_min || 60,
            levels: initialData?.levels?.map((l: any) => l.id) || (initialData?.level ? [initialData.level.id] : []),
            category: initialData?.category?.id || '',
            published: initialData?.published || false,
            contentType: initialData?.hasMediaContent ? 'media' : 'sections',
            mediaFile: null
        }
    });

    // Initialize the form with the existing course data (edit mode)
    useEditCourseInitialization({
        initialData,
        setValue: methods.setValue,
        setCoverPreview,
        setSections,
        setSectionCoverPreviews
    });

    // Check for draft on mount
    useEffect(() => {
        if (!initialData && hasDraft) {
            setShowDraftPrompt(true);
        }
    }, []);

    // Restore draft
    const handleRestoreDraft = async () => {
        const draft = await loadDraft();
        if (draft) {
            const { data, files } = draft;

            // Restore form
            Object.keys(data).forEach(key => {
                if (key !== 'sections' && key !== 'coverPreview' && key !== 'sectionCoverPreviews' && key !== 'timestamp') {
                    methods.setValue(key as any, data[key]);
                }
            });

            setSections(data.sections || []);
            setCoverPreview(data.coverPreview || null);
            setSectionCoverPreviews(data.sectionCoverPreviews || {});

            // Restore files
            if (files['mainCover']) {
                setMainCoverFile(files['mainCover']);
            }

            const sectionFiles: { [key: number]: File } = {};
            Object.entries(files).forEach(([key, file]) => {
                if (key.startsWith('section_cover_')) {
                    const index = parseInt(key.replace('section_cover_', ''));
                    sectionFiles[index] = file;
                }
            });
            setSectionCoverFiles(sectionFiles);

            toast.success('Draft restored');
        }
        setShowDraftPrompt(false);
    };

    const handleDiscardDraft = async () => {
        await clearDraft();
        setShowDraftPrompt(false);
    };

    // Prepare data for auto-save
    const formValues = methods.watch();

    const draftData = useMemo(() => ({
        ...formValues,
        sections,
        coverPreview,
        sectionCoverPreviews
    }), [formValues, sections, coverPreview, sectionCoverPreviews]);

    const allFiles = useMemo(() => ({
        ...(mainCoverFile && { mainCover: mainCoverFile }),
        ...Object.entries(sectionCoverFiles).reduce((acc, [index, file]) => ({
            ...acc,
            [`section_cover_${index}`]: file
        }), {})
    }), [mainCoverFile, sectionCoverFiles]);

    // Auto-save (disabled in edit mode)
    const { isSaving: isAutoSaving } = useAutoSave(
        draftData,
        allFiles,
        {
            onSave: saveDraft,
            delay: 3000,
            enabled: !initialData // Only in creation mode
        }
    );

    const onFormSubmit = async (data: any) => {
        try {
            const formData = new FormData();

            formData.append('title', data.title);
            formData.append('legend', data.legend);
            formData.append('est_time_min', data.est_time_min.toString());
            formData.append('levels', JSON.stringify(data.levels || []));
            formData.append('category', data.category.toString());
            formData.append('published', data.published ? 'true' : 'false');

            // Add the main cover file only if there is a new file
            if (mainCoverFile) {
                formData.append('file', mainCoverFile);
            }

            // Handle content: either sections or media
            if (contentType === 'media' && mediaFile) {
                formData.append('courseMedia', mediaFile);
            } else if (contentType === 'sections') {
                // Add the section cover files
                Object.entries(sectionCoverFiles).forEach(([index, file]) => {
                    formData.append(`section_cover_${index}`, file);
                });

                if (sections.length > 0) {
                    formData.append('sections', JSON.stringify(sections));
                }
            }

            // Single API call via onSubmit (handled by the parent page)
            await onSubmit(formData);
            await clearDraft();
            onCancel();
        } catch (error: any) {
            console.error('Error:', error);
            toast.error(error?.response?.data?.message || 'Error while saving');
        } finally {
            setUploadProgress(0);
        }
    };

    const handleCancel = async () => {
        if (!initialData && (formValues.title || sections.length > 0)) {
            const shouldSave = window.confirm('Do you want to save a draft before leaving?');
            if (shouldSave) {
                await saveDraft(draftData, allFiles);
                toast.success('Draft saved');
            }
        }
        onCancel();
    };

    return (
        <>
            {/* Draft restore prompt */}
            {showDraftPrompt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm">
                    <div className="bg-white dark:bg-bg-tertiary rounded-lg p-6 max-w-md mx-4 shadow-xl border border-gray-200 dark:border-gray-800">
                        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-text-primary">Draft detected</h3>
                        <p className="text-gray-600 dark:text-text-secondary mb-4">
                            A course draft was found. Do you want to restore it?
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleRestoreDraft}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-black font-medium rounded-md hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] transition-colors"
                            >
                                Restore
                            </button>
                            <button
                                onClick={handleDiscardDraft}
                                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-text-primary rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                            >
                                Discard
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onFormSubmit)} className="space-y-8">
                    {/* Save indicator */}
                    {!initialData && (isAutoSaving || isSaving) && (
                        <div className="flex items-center justify-end space-x-2 text-sm text-amber-700 dark:text-amber-400">
                            <CloudArrowUpIcon className="w-4 h-4 animate-pulse" />
                            <span>Auto-saving...</span>
                        </div>
                    )}

                    {/* Upload progress bar */}
                    {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-primary-light)]/10 dark:from-[var(--color-primary)]/20 dark:to-[var(--color-primary-light)]/20 rounded-lg p-4 border border-[var(--color-primary)]/30 dark:border-[var(--color-primary)]/50">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900 dark:text-text-primary">
                                    Upload in progress...
                                </span>
                                <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                                    {uploadProgress}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    <BasicInfo
                        register={methods.register}
                        errors={methods.formState.errors}
                        coverPreview={coverPreview}
                        setCoverPreview={setCoverPreview}
                        setMainCoverFile={setMainCoverFile}
                    />

                    {/* Content Type Toggle */}
                    <div className="bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-primary-light)]/5 dark:from-[var(--color-primary)]/10 dark:to-[var(--color-primary-light)]/10 rounded-lg p-4 space-y-4 border border-[var(--color-primary)]/20 dark:border-[var(--color-primary)]/30">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-text-primary">Content type</h3>
                        <div className="flex gap-4">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    value="sections"
                                    checked={contentType === 'sections'}
                                    onChange={(e) => setContentType(e.target.value as 'sections' | 'media')}
                                    className="h-4 w-4 text-amber-600 dark:text-amber-500 focus:ring-amber-500"
                                />
                                <span className="ml-2 text-gray-700 dark:text-text-secondary">Structured sections</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    value="media"
                                    checked={contentType === 'media'}
                                    onChange={(e) => setContentType(e.target.value as 'sections' | 'media')}
                                    className="h-4 w-4 text-amber-600 dark:text-amber-500 focus:ring-amber-500"
                                />
                                <span className="ml-2 text-gray-700 dark:text-text-secondary">Direct Audio/Video</span>
                            </label>
                        </div>

                        {/* Media upload (only for media content type) */}
                        {contentType === 'media' && (
                            <div className="border-t border-[var(--color-primary)]/20 dark:border-[var(--color-primary)]/30 pt-4 mt-4">
                                <label htmlFor="courseMedia" className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                                    Upload Audio or Video
                                </label>
                                <div className="flex items-center space-x-4">
                                    <input
                                        id="courseMedia"
                                        type="file"
                                        accept="audio/*,video/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
                                                    setMediaFile(file);
                                                    setMediaPreview(`${file.type.split('/')[0]}: ${file.name}`);
                                                } else {
                                                    toast.error('Please select an audio or video file');
                                                }
                                            }
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary rounded-md focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400"
                                    />
                                    {mediaPreview && (
                                        <div className="flex-1 text-sm text-gray-600 dark:text-text-secondary truncate">
                                            {mediaPreview}
                                        </div>
                                    )}
                                </div>
                                {!mediaFile && <p className="text-xs text-red-600 dark:text-red-400 mt-1">An audio or video file is required</p>}
                            </div>
                        )}
                    </div>

                    {/* Sections (only for sections content type) */}
                    {contentType === 'sections' && (
                        <Sections
                            sections={sections}
                            setSections={setSections}
                            sectionCoverPreviews={sectionCoverPreviews}
                            setSectionCoverPreviews={setSectionCoverPreviews}
                            sectionCoverFiles={sectionCoverFiles}
                            setSectionCoverFiles={setSectionCoverFiles}
                        />
                    )}

                    {/* Actions */}
                    <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-6 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-text-primary bg-white dark:bg-bg-secondary rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-black font-medium rounded-md hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting || uploadProgress > 0}
                        >
                            {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Create course'}
                        </button>
                    </div>
                </form>
            </FormProvider>
        </>
    );
};

export default CourseForm;