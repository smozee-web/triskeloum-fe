// src/pages/courses/Reels.tsx
import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, PlayIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Film, CheckCircle, PauseCircle, Heart, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import SearchBar from '../../components/SearchBar';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import Pagination from '../../components/Pagination';
import Modal2 from '../../components/Modal2';
import FileUploadZone from '../../components/FileUploadZone';
import { useGetAdminReelsQuery, useDeleteReelMutation, useToggleActiveReelMutation, useGetAdminLevelsQuery } from '../../services/api';
import { reelService } from '../../services/reels';

interface ReelFormData {
    title: string;
    description: string;
    duration: number;
    levelId: number;
    videoFile?: File;
    thumbnailFile?: File;
}

const Reels: React.FC = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedReel, setSelectedReel] = useState<any | null>(null);
    const [formData, setFormData] = useState<ReelFormData>({
        title: '',
        description: '',
        duration: 0,
        levelId: 0,
    });
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
    const [selectedVideoTitle, setSelectedVideoTitle] = useState<string | null>(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data: reelsData, isLoading, refetch } = useGetAdminReelsQuery({
        page,
        limit: 5,
        search: debouncedSearch,
    });

    const { data: levelsData } = useGetAdminLevelsQuery({
        page: 1,
        limit: 100,
        search: '',
    });

    const [deleteReel, { isLoading: isDeleting }] = useDeleteReelMutation();
    const [toggleActive, { isLoading: isToggling }] = useToggleActiveReelMutation();

    // Get levels for form
    const levels = levelsData?.payload?.data || [];

    const reels = reelsData?.payload?.data || [];
    const totalPages = reelsData?.payload?.pagination?.totalPages || 1;

    const stats = {
        total: reelsData?.payload?.pagination?.total || reels?.length,
        active: reels?.filter((r: any) => r.isActive).length,
        inactive: reels?.filter((r: any) => !r.isActive).length,
    };

    const handleCreate = () => {
        setSelectedReel(null);
        setFormData({
            title: '',
            description: '',
            duration: 0,
            levelId: 0,
        });
        setIsFormModalOpen(true);
    };

    const handleEdit = (reel: any) => {
        setSelectedReel(reel);
        setFormData({
            title: reel.title,
            description: reel.description,
            duration: reel.duration,
            levelId: reel.level?.id,
        });
        setIsFormModalOpen(true);
    };

    const handleDelete = async (reelId: number) => {
        if (!window.confirm('Are you sure you want to delete this reel?')) {
            return;
        }
        try {
            await deleteReel(reelId).unwrap();
            toast.success('Reel deleted');
            refetch();
        } catch (error: any) {
            toast.error(error?.data?.message || 'Error while deleting');
        }
    };

    const handleToggleActive = async (reel: any) => {
        try {
            await toggleActive(reel.id).unwrap();
            toast.success(reel.isActive ? 'Reel deactivated' : 'Reel activated');
            refetch();
        } catch (error: any) {
            toast.error(error?.data?.message || 'Error');
        }
    };

    const handleViewVideo = (reel: any) => {
        if (reel.videoUrl) {
            setSelectedVideoUrl(reel.videoUrl);
            setSelectedVideoTitle(reel.title);
            setIsVideoModalOpen(true);
        } else {
            toast.error('No video file available');
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.title || !formData.duration || !formData.levelId) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (!selectedReel && !formData.videoFile) {
            toast.error('Please add a video file');
            return;
        }

        try {
            setIsUploading(true);

            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('duration', formData.duration.toString());
            formDataToSend.append('levelId', formData.levelId.toString());

            if (formData.videoFile) {
                formDataToSend.append('video', formData.videoFile);
            }
            if (formData.thumbnailFile) {
                formDataToSend.append('thumbnail', formData.thumbnailFile);
            }

            if (selectedReel) {
                await reelService.updateReel(selectedReel.id, formDataToSend, setUploadProgress);
                toast.success('Reel updated');
            } else {
                await reelService.createReel(formDataToSend, setUploadProgress);
                toast.success('Reel created');
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
        <div className="max-w-8xl mx-2 px-6 py-8 bg-gray-50 dark:bg-bg-primary min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-1"
                        style={{
                            background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                        Reels
                    </h1>
                    <p className="text-gray-600 dark:text-text-tertiary mt-1">Manage all your video reels</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black rounded-lg hover:from-[#B8860B] hover:to-[#D4AF37] transition-colors shadow-md font-medium"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    New reel
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="relative bg-gradient-to-br from-amber-50/30 to-white dark:from-transparent dark:to-transparent dark:bg-bg-tertiary rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-300 group overflow-hidden shadow-sm hover:shadow-md">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent dark:from-amber-500/5 dark:to-transparent" />
                    <div className="relative">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-text-tertiary">Total</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-text-primary mt-2">{stats.total}</p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Film className="w-6 h-6 text-black" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative bg-gradient-to-br from-green-50/30 to-white dark:from-transparent dark:to-transparent dark:bg-bg-tertiary rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-green-500 dark:hover:border-green-500 transition-all duration-300 group overflow-hidden shadow-sm hover:shadow-md">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent dark:from-green-500/5 dark:to-transparent" />
                    <div className="relative">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-text-tertiary">Active</p>
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{stats.active}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative bg-gradient-to-br from-gray-50/30 to-white dark:from-transparent dark:to-transparent dark:bg-bg-tertiary rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-gray-500 dark:hover:border-gray-500 transition-all duration-300 group overflow-hidden shadow-sm hover:shadow-md">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-transparent dark:from-gray-500/5 dark:to-transparent" />
                    <div className="relative">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-text-tertiary">Inactive</p>
                                <p className="text-3xl font-bold text-gray-600 dark:text-text-secondary mt-2">{stats.inactive}</p>
                            </div>
                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <PauseCircle className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-bg-tertiary rounded-lg shadow-md p-4 mb-6 border border-gray-200 dark:border-gray-800">
                <SearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Search for a reel..."
                />
            </div>

            {/* Content */}
            {isLoading ? (
                <LoadingSkeleton />
            ) : reels.length === 0 ? (
                <div className="bg-white dark:bg-bg-tertiary rounded-lg shadow-md p-12 text-center border border-gray-200 dark:border-gray-800">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#D4AF37]/10 to-[#FFD700]/10 dark:from-[#D4AF37]/20 dark:to-[#FFD700]/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#D4AF37]/30 dark:border-[#D4AF37]/50">
                        <Film className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-text-primary mb-2">No reel</h3>
                    <p className="text-gray-600 dark:text-text-tertiary mb-6">Start by creating your first reel</p>
                    <button
                        onClick={handleCreate}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black rounded-lg hover:from-[#B8860B] hover:to-[#D4AF37] transition-colors font-medium"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Create a reel
                    </button>
                </div>
            ) : (
                <>
                    {/* Table */}
                    <div className="bg-white dark:bg-bg-tertiary rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-800">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-[#D4AF37]/10 to-[#FFD700]/10 dark:from-[#D4AF37]/20 dark:to-[#FFD700]/20 border-b border-gray-200 dark:border-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-text-primary uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-text-primary uppercase tracking-wider">Duration</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-text-primary uppercase tracking-wider">Level</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-text-primary uppercase tracking-wider">Views</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-text-primary uppercase tracking-wider">Likes</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-text-primary uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-text-primary uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reels.map((reel: any) => (
                                    <tr key={reel.id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-text-primary font-medium">{reel.title}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-text-secondary">{reel.duration}s</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-text-secondary">{reel.level?.name}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-text-secondary">
                                                <Eye className="w-4 h-4" />
                                                <span>{reel.viewsCount}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-text-secondary">
                                                <Heart className="w-4 h-4" />
                                                <span>{reel.likesCount}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleToggleActive(reel)}
                                                disabled={isToggling}
                                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                                    reel.isActive
                                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 border border-green-200 dark:border-green-700'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                                                }`}
                                            >
                                                {reel.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleViewVideo(reel)}
                                                    title="Watch the video"
                                                    className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                                                >
                                                    <PlayIcon className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(reel)}
                                                    title="Edit"
                                                    className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                                                >
                                                    <PencilIcon className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(reel.id)}
                                                    disabled={isDeleting}
                                                    title="Delete"
                                                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
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
                onClose={() => setIsFormModalOpen(false)}
                size="lg"
            >
                <div className="p-6 sm:p-8">
                    {/* Header with gradient accent */}
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#FFD700] flex items-center justify-center shadow-md">
                            {selectedReel ? (
                                <PencilIcon className="w-6 h-6 text-black" />
                            ) : (
                                <PlusIcon className="w-6 h-6 text-black" />
                            )}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-text-primary">
                            {selectedReel ? 'Edit reel' : 'Create a new reel'}
                        </h2>
                    </div>

                    <form onSubmit={handleFormSubmit} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-text-primary mb-2">
                                Title *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-bg-secondary border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-text-primary focus:bg-white dark:focus:bg-bg-secondary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                                placeholder="Reel title"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-text-primary mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-bg-secondary border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-text-primary focus:bg-white dark:focus:bg-bg-secondary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent resize-none transition-all"
                                placeholder="Reel description"
                            />
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-text-primary mb-2">
                                Duration (seconds) *
                            </label>
                            <input
                                type="number"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-bg-secondary border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-text-primary focus:bg-white dark:focus:bg-bg-secondary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                                placeholder="Duration in seconds"
                                min="1"
                                required
                            />
                        </div>

                        {/* Level */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-text-primary mb-2">
                                Level *
                            </label>
                            <select
                                value={formData.levelId}
                                onChange={(e) => setFormData({ ...formData, levelId: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-bg-secondary border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-text-primary focus:bg-white dark:focus:bg-bg-secondary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all appearance-none cursor-pointer"
                                required
                            >
                                <option value="0">Select a level</option>
                                {levels.map((level: any) => (
                                    <option key={level.id} value={level.id}>
                                        {level.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Video File */}
                        <FileUploadZone
                            type="video"
                            accept="video/*"
                            label="Video file"
                            isRequired={!selectedReel}
                            selectedFile={formData.videoFile}
                            onChange={(file) => setFormData({ ...formData, videoFile: file })}
                        />
                        {uploadProgress > 0 && uploadProgress < 100 && (
                            <div className="bg-gradient-to-r from-[#D4AF37]/10 to-[#FFD700]/10 dark:from-[#D4AF37]/20 dark:to-[#FFD700]/20 rounded-lg p-4 border border-[#D4AF37]/30 dark:border-[#D4AF37]/50">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-gray-900 dark:text-text-primary">Upload in progress...</p>
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

                        {/* Thumbnail File */}
                        <FileUploadZone
                            type="image"
                            accept="image/*"
                            label="Thumbnail (image)"
                            isRequired={false}
                            selectedFile={formData.thumbnailFile}
                            onChange={(file) => setFormData({ ...formData, thumbnailFile: file })}
                        />

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
                                disabled={isUploading}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isUploading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                        Processing...
                                    </>
                                ) : selectedReel ? (
                                    <>
                                        <PencilIcon className="w-4 h-4" />
                                        Update reel
                                    </>
                                ) : (
                                    <>
                                        <PlusIcon className="w-4 h-4" />
                                        Create reel
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal2>

            {/* Video Viewer Modal */}
            <Modal2
                isOpen={isVideoModalOpen}
                onClose={() => setIsVideoModalOpen(false)}
                title={selectedVideoTitle || 'Video'}
                size="xl"
            >
                <div className="space-y-4">
                    {/* Video Player */}
                    <div className="bg-black rounded-lg overflow-hidden">
                        <video
                            width="100%"
                            height="auto"
                            controls
                            controlsList="nodownload"
                            className="w-full"
                        >
                            <source src={selectedVideoUrl || ''} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            onClick={() => setIsVideoModalOpen(false)}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-text-primary border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </Modal2>
        </div>
    );
};

export default Reels;