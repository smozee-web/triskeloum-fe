import { useState, useEffect, useRef } from 'react';
import {
    MicrophoneIcon,
    PlusIcon,
    UsersIcon,
    XMarkIcon,
    PhoneIcon,
    MagnifyingGlassIcon,
    ClockIcon,
    DocumentIcon,
    ChatBubbleLeftIcon,
    PaperAirplaneIcon,
    StopIcon,
    ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import { useLoadUserQuery } from '../../services/api';
import axiosClient from '../../services/axiosClient';
import toast from 'react-hot-toast';
import { useSocket } from '../../contexts/SocketContext';
import AgoraService from '../../services/AgoraService';

const getAuthHeader = () => {
    const token = localStorage.getItem('accessToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

interface VoiceRoomData {
    id: number;
    name: string;
    description: string;
    channelName: string;
    isActive: boolean;
    maxParticipants: number | null;
    creator: {
        id: number;
        firstname: string;
        lastname: string;
    };
    participants: Array<{
        id: number;
        firstname: string;
        lastname: string;
    }>;
    activeParticipantIds: number[];
    createdAt?: string;
    created_at?: string;
    endedAt?: string;
    ended_at?: string;
}

interface VoiceRoomComment {
    id: number;
    content: string;
    user: {
        id: number;
        firstname: string;
        lastname: string;
    };
    createdAt: string;
}

interface VoiceRoomFile {
    id: number;
    filename: string;
    path: string;
    mimetype: string;
    size: number;
    uploadedBy: {
        id: number;
        firstname: string;
        lastname: string;
    };
    createdAt: string;
}

export default function VoiceRoomsPage() {
    const { data: userResponse } = useLoadUserQuery({});
    const currentUser = userResponse?.payload;
    const { socket } = useSocket();

    const [voiceRooms, setVoiceRooms] = useState<VoiceRoomData[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<VoiceRoomData | null>(null);
    const [roomComments, setRoomComments] = useState<VoiceRoomComment[]>([]);
    const [roomFiles, setRoomFiles] = useState<VoiceRoomFile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'finished'>('all');

    // Voice room state
    const [isJoined, setIsJoined] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const commentsEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchVoiceRooms();
    }, [filterStatus]);

    // Auto-select first room on load
    useEffect(() => {
        if (voiceRooms.length > 0 && !selectedRoom) {
            handleSelectRoom(voiceRooms[0]);
        }
    }, [voiceRooms]);

    // Écouter les événements Socket.IO
    useEffect(() => {
        if (!socket) return;

        const handleVoiceRoomCreated = (data: { voiceRoom: VoiceRoomData }) => {
            console.log('🎙️ Voice room created:', data.voiceRoom);
            setVoiceRooms(prev => [data.voiceRoom, ...prev]);
            toast.success(`New voice room: ${data.voiceRoom.name}`);
        };

        const handleUserJoined = (data: { voiceRoomId: number; userId: number; activeParticipantIds: number[] }) => {
            console.log('👤 User joined voice room:', data);
            setVoiceRooms(prev => prev.map(room =>
                room.id === data.voiceRoomId
                    ? { ...room, activeParticipantIds: data.activeParticipantIds }
                    : room
            ));
            if (selectedRoom?.id === data.voiceRoomId) {
                setSelectedRoom(prev => prev ? { ...prev, activeParticipantIds: data.activeParticipantIds } : null);
            }
        };

        const handleUserLeft = (data: { voiceRoomId: number; userId: number; activeParticipantIds: number[] }) => {
            console.log('👋 User left voice room:', data);
            setVoiceRooms(prev => prev.map(room =>
                room.id === data.voiceRoomId
                    ? { ...room, activeParticipantIds: data.activeParticipantIds }
                    : room
            ));
            if (selectedRoom?.id === data.voiceRoomId) {
                setSelectedRoom(prev => prev ? { ...prev, activeParticipantIds: data.activeParticipantIds } : null);
            }
        };

        const handleVoiceRoomEnded = (data: { voiceRoomId: number }) => {
            console.log('🔇 Voice room ended:', data.voiceRoomId);
            setVoiceRooms(prev => prev.map(room =>
                room.id === data.voiceRoomId
                    ? { ...room, isActive: false, activeParticipantIds: [], endedAt: new Date().toISOString() }
                    : room
            ));
            if (selectedRoom?.id === data.voiceRoomId) {
                setSelectedRoom(prev => prev ? { ...prev, isActive: false, activeParticipantIds: [] } : null);
                handleLeaveRoom();
            }
            toast('Voice room ended', { icon: '🔇' });
        };

        const handleCommentAdded = (data: { voiceRoomId: number; comment: VoiceRoomComment }) => {
            if (data.voiceRoomId === selectedRoom?.id) {
                setRoomComments(prev => [...prev, data.comment]);
            }
        };

        const handleFileUploaded = (data: { voiceRoomId: number; file: VoiceRoomFile }) => {
            if (data.voiceRoomId === selectedRoom?.id) {
                setRoomFiles(prev => [...prev, data.file]);
            }
        };

        socket.on('voice_room:created', handleVoiceRoomCreated);
        socket.on('voice_room:user_joined', handleUserJoined);
        socket.on('voice_room:user_left', handleUserLeft);
        socket.on('voice_room:ended', handleVoiceRoomEnded);
        socket.on('voice_room:comment_added', handleCommentAdded);
        socket.on('voice_room:file_uploaded', handleFileUploaded);

        return () => {
            socket.off('voice_room:created', handleVoiceRoomCreated);
            socket.off('voice_room:user_joined', handleUserJoined);
            socket.off('voice_room:user_left', handleUserLeft);
            socket.off('voice_room:ended', handleVoiceRoomEnded);
            socket.off('voice_room:comment_added', handleCommentAdded);
            socket.off('voice_room:file_uploaded', handleFileUploaded);
        };
    }, [socket, selectedRoom]);

    // Auto-scroll to bottom when new comments arrive
    useEffect(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [roomComments]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (isJoined) {
                handleLeaveRoom();
            }
        };
    }, []);

    const fetchVoiceRooms = async () => {
        try {
            setIsLoading(true);

            // Map frontend filter to backend status query parameter
            const statusParam = filterStatus === 'finished' ? 'finished' : filterStatus === 'active' ? 'active' : 'all';

            const response = await axiosClient.get(
                `${import.meta.env.VITE_BASE_URL}/app/voice-rooms?status=${statusParam}`,
                {
                    headers: getAuthHeader()
                }
            );
            console.log('Voice rooms response:', response.data);

            setVoiceRooms(response.data.payload || []);
        } catch (error: any) {
            console.error('Error fetching voice rooms:', error);
            toast.error(error.response?.data?.message || 'Error while loading voice rooms');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectRoom = async (room: VoiceRoomData) => {
        setSelectedRoom(room);

        // Fetch room details (comments and files) for both active and finished rooms
        try {
            setIsLoadingDetails(true);

            // Fetch comments
            const commentsResponse = await axiosClient.get(
                `${import.meta.env.VITE_BASE_URL}/app/voice-rooms/${room.id}/comments`,
                { headers: getAuthHeader() }
            );
            setRoomComments(commentsResponse.data.payload || []);

            // Fetch files
            const filesResponse = await axiosClient.get(
                `${import.meta.env.VITE_BASE_URL}/app/voice-rooms/${room.id}/files`,
                { headers: getAuthHeader() }
            );
            setRoomFiles(filesResponse.data.payload || []);
        } catch (error: any) {
            console.error('Error fetching room details:', error);
            // Don't show error toast - this is optional data
            setRoomComments([]);
            setRoomFiles([]);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    // Voice room functions
    const handleJoinRoom = async () => {
        if (!selectedRoom) return;

        try {
            setIsConnecting(true);

            // Join voice room and get Agora credentials from backend
            const response = await axiosClient.post(
                `${import.meta.env.VITE_BASE_URL}/app/voice-rooms/${selectedRoom.id}/join`,
                {},
                { headers: getAuthHeader() }
            );

            const { appId, token, channelName, uid } = response.data.payload;

            // Initialize Agora
            AgoraService.initialize();

            // Join Agora channel with backend-generated token
            await AgoraService.join(appId, channelName, token, uid);

            setIsJoined(true);
            toast.success('Connected to the voice room');
        } catch (error: any) {
            console.error('Error joining voice room:', error);
            toast.error(error.response?.data?.message || 'Unable to join the voice room');
        } finally {
            setIsConnecting(false);
        }
    };

    const handleLeaveRoom = async () => {
        try {
            await AgoraService.leave();
            setIsJoined(false);
            setIsMuted(false);
            toast('Disconnected from the voice room', { icon: '👋' });
        } catch (error) {
            console.error('Error leaving voice room:', error);
        }
    };

    const toggleMute = async () => {
        try {
            await AgoraService.toggleMute();
            setIsMuted(!isMuted);
        } catch (error) {
            console.error('Error toggling mute:', error);
            toast.error('Error while changing microphone');
        }
    };

    const handleSendComment = async () => {
        if (!newComment.trim() || !selectedRoom || isSubmitting) return;

        try {
            setIsSubmitting(true);
            await axiosClient.post(
                `${import.meta.env.VITE_BASE_URL}/app/voice-rooms/${selectedRoom.id}/comments`,
                { content: newComment.trim() },
                { headers: getAuthHeader() }
            );
            setNewComment('');
        } catch (error: any) {
            console.error('Error sending comment:', error);
            toast.error('Error while sending the comment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !selectedRoom) return;

        try {
            setUploadingFile(true);
            const formData = new FormData();
            formData.append('file', file);

            await axiosClient.post(
                `${import.meta.env.VITE_BASE_URL}/app/voice-rooms/${selectedRoom.id}/files`,
                formData,
                {
                    headers: {
                        ...getAuthHeader(),
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            // Refresh files
            const filesResponse = await axiosClient.get(
                `${import.meta.env.VITE_BASE_URL}/app/voice-rooms/${selectedRoom.id}/files`,
                { headers: getAuthHeader() }
            );
            setRoomFiles(filesResponse.data.payload || []);

            toast.success('File shared successfully');
        } catch (error: any) {
            console.error('Error uploading file:', error);
            toast.error('Error while sharing the file');
        } finally {
            setUploadingFile(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const filteredRooms = voiceRooms.filter(room =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Hier';
        } else {
            return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="flex h-screen bg-white dark:bg-bg-primary overflow-hidden">
            {/* SIDEBAR */}
            <div className="w-80 bg-white dark:bg-bg-tertiary border-r border-gray-200 dark:border-gray-800 flex flex-col flex-shrink-0">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] rounded-xl">
                            <MicrophoneIcon className="w-5 h-5 text-black" />
                        </div>
                        <div>
                            <h1 className="text-base font-semibold text-black dark:text-text-primary">Salons Vocaux</h1>
                            <p className="text-xs text-gray-500 dark:text-text-tertiary">
                                {filteredRooms.length} salon{filteredRooms.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>

                    {/* Create Button */}
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black rounded-lg hover:from-[#B8860B] hover:to-[#D4AF37] transition-colors font-medium text-sm mb-3"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Create a room
                    </button>

                    {/* Search */}
                    <div className="relative mb-3">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-600" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-bg-secondary border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-1 bg-gray-100 dark:bg-bg-secondary p-1 rounded-lg">
                        <button
                            onClick={() => setFilterStatus('all')}
                            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                filterStatus === 'all'
                                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-text-primary shadow-sm'
                                    : 'text-gray-600 dark:text-text-tertiary hover:text-gray-900 dark:hover:text-text-primary'
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilterStatus('active')}
                            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                filterStatus === 'active'
                                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-text-primary shadow-sm'
                                    : 'text-gray-600 dark:text-text-tertiary hover:text-gray-900 dark:hover:text-text-primary'
                            }`}
                        >
                            Active
                        </button>
                        <button
                            onClick={() => setFilterStatus('finished')}
                            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                filterStatus === 'finished'
                                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-text-primary shadow-sm'
                                    : 'text-gray-600 dark:text-text-tertiary hover:text-gray-900 dark:hover:text-text-primary'
                            }`}
                        >
                            Finished
                        </button>
                    </div>
                </div>

                {/* Rooms List */}
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 dark:border-gray-700 border-t-amber-600 dark:border-t-amber-400"></div>
                        </div>
                    ) : filteredRooms.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full px-4 text-center">
                            <MicrophoneIcon className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-3" />
                            <p className="font-medium text-gray-600 dark:text-text-secondary text-sm">No room</p>
                            <p className="text-xs text-gray-400 dark:text-text-tertiary mt-1">Create a new voice room</p>
                        </div>
                    ) : (
                        <div className="p-2">
                            {filteredRooms.map(room => (
                                <button
                                    key={room.id}
                                    onClick={() => handleSelectRoom(room)}
                                    className={`w-full p-3 rounded-lg mb-2 text-left transition-colors ${
                                        selectedRoom?.id === room.id
                                            ? 'bg-gradient-to-r from-[#D4AF37]/10 to-[#FFD700]/10 dark:from-[#D4AF37]/20 dark:to-[#FFD700]/20 border border-[#D4AF37]/30 dark:border-[#D4AF37]/50'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent'
                                    }`}
                                >
                                    <div className="flex items-start justify-between mb-1">
                                        <h3 className="font-medium text-sm text-gray-900 dark:text-text-primary truncate flex-1">
                                            {room.name}
                                        </h3>
                                        {room.isActive && (
                                            <div className="flex items-center gap-1 ml-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            </div>
                                        )}
                                    </div>
                                    {room.description && (
                                        <p className="text-xs text-gray-500 dark:text-text-tertiary line-clamp-1 mb-1">
                                            {room.description}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500 dark:text-text-tertiary flex items-center gap-1">
                                            <UsersIcon className="w-3 h-3" />
                                            {room.activeParticipantIds?.length || 0}/{room.participants?.length || 0}
                                        </span>
                                        <span className="text-gray-400 dark:text-text-tertiary">
                                            {formatDate(room.createdAt || (room as any).created_at)}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {!selectedRoom ? (
                    <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-bg-primary">
                        <div className="text-center">
                            <div className="p-6 bg-gradient-to-br from-[#D4AF37]/10 to-[#FFD700]/10 dark:from-[#D4AF37]/20 dark:to-[#FFD700]/20 rounded-full inline-block mb-4 border border-[#D4AF37]/30 dark:border-[#D4AF37]/50">
                                <MicrophoneIcon className="w-12 h-12 text-amber-600 dark:text-amber-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-text-primary mb-2">
                                Select a voice room
                            </h3>
                            <p className="text-gray-500 dark:text-text-tertiary text-sm">
                                Choose a room from the list to see the details
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Room Header */}
                        <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-bg-tertiary">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-text-primary">
                                            {selectedRoom.name}
                                        </h2>
                                        {selectedRoom.isActive && (
                                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full text-xs font-medium border border-green-200 dark:border-green-700">
                                                <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full animate-pulse"></div>
                                                In progress
                                            </div>
                                        )}
                                        {!selectedRoom.isActive && (
                                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-xs font-medium border border-gray-200 dark:border-gray-700">
                                                Finished
                                            </div>
                                        )}
                                    </div>
                                    {selectedRoom.description && (
                                        <p className="text-gray-600 dark:text-text-secondary text-sm">
                                            {selectedRoom.description}
                                        </p>
                                    )}
                                </div>
                                {selectedRoom.isActive && (
                                    <>
                                        {!isJoined ? (
                                            <button
                                                onClick={handleJoinRoom}
                                                disabled={isConnecting}
                                                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black rounded-lg hover:from-[#B8860B] hover:to-[#D4AF37] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                                            >
                                                {isConnecting ? (
                                                    <>
                                                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                                        Connecting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <PhoneIcon className="w-5 h-5" />
                                                        Join
                                                    </>
                                                )}
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={toggleMute}
                                                    className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                                    title={isMuted ? "Turn on the mic" : "Mute the mic"}
                                                >
                                                    {isMuted ? (
                                                        <FaMicrophoneSlash className="w-5 h-5 text-red-600" />
                                                    ) : (
                                                        <FaMicrophone className="w-5 h-5 text-green-600" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={handleLeaveRoom}
                                                    className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                                >
                                                    <StopIcon className="w-5 h-5" />
                                                    Leave
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Room Info */}
                            <div className="flex items-center gap-6 text-sm">
                                <div className="flex items-center gap-2 text-gray-600 dark:text-text-secondary">
                                    <UsersIcon className="w-4 h-4" />
                                    <span>
                                        By {selectedRoom.creator.firstname} {selectedRoom.creator.lastname}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 dark:text-text-secondary">
                                    <ClockIcon className="w-4 h-4" />
                                    <span>
                                        Created on {new Date(selectedRoom.createdAt || (selectedRoom as any).created_at).toLocaleDateString('en-US', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                                {!selectedRoom.isActive && selectedRoom.endedAt && (
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-text-secondary">
                                        <span>
                                            Ended on {new Date(selectedRoom.endedAt).toLocaleDateString('en-US', {
                                                day: 'numeric',
                                                month: 'long',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Participants */}
                            <div className="mt-4">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-text-primary mb-3">
                                    Participants ({selectedRoom.participants?.length || 0})
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedRoom.participants?.map(participant => {
                                        const isActive = selectedRoom.activeParticipantIds?.includes(participant.id);
                                        return (
                                            <div
                                                key={participant.id}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                                                    isActive
                                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                                                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                                }`}
                                            >
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#FFD700] flex items-center justify-center text-black text-xs font-medium shadow-sm">
                                                    {participant.firstname[0]}{participant.lastname[0]}
                                                </div>
                                                <span className="text-sm text-gray-900 dark:text-text-primary">
                                                    {participant.firstname} {participant.lastname}
                                                </span>
                                                {isActive && (
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Room Content (for both active and finished rooms) */}
                        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-bg-primary">
                            {isLoadingDetails ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 dark:border-gray-700 border-t-amber-600 dark:border-t-amber-400"></div>
                                </div>
                            ) : (
                                <>
                                    {/* Scrollable Content */}
                                    <div className="flex-1 overflow-y-auto p-6">
                                        <div className="max-w-4xl mx-auto space-y-6">
                                            {/* Comments Section */}
                                            <div className="bg-white dark:bg-bg-tertiary rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <ChatBubbleLeftIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-text-primary">
                                                        Comments ({roomComments.length})
                                                    </h3>
                                                </div>
                                                {roomComments.length === 0 ? (
                                                    <p className="text-gray-500 dark:text-text-tertiary text-sm">
                                                        {selectedRoom.isActive
                                                            ? "No comments yet"
                                                            : "No comments were posted during this voice room"}
                                                    </p>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {roomComments.map(comment => (
                                                            <div
                                                                key={comment.id}
                                                                className="flex gap-3 p-3 bg-gray-50 dark:bg-bg-secondary rounded-lg border border-gray-200 dark:border-gray-700"
                                                            >
                                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#FFD700] flex items-center justify-center text-black text-xs font-medium shadow-sm flex-shrink-0">
                                                                    {comment.user.firstname[0]}{comment.user.lastname[0]}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="font-medium text-sm text-gray-900 dark:text-text-primary">
                                                                            {comment.user.firstname} {comment.user.lastname}
                                                                        </span>
                                                                        <span className="text-xs text-gray-500 dark:text-text-tertiary">
                                                                            {formatDate(comment.createdAt)}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-sm text-gray-700 dark:text-text-secondary">
                                                                        {comment.content}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <div ref={commentsEndRef} />
                                                    </div>
                                                )}
                                            </div>

                                    {/* Files Section */}
                                    <div className="bg-white dark:bg-bg-tertiary rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <DocumentIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-text-primary">
                                                Shared files ({roomFiles.length})
                                            </h3>
                                        </div>
                                        {roomFiles.length === 0 ? (
                                            <p className="text-gray-500 dark:text-text-tertiary text-sm">
                                                {selectedRoom.isActive
                                                    ? "No files shared yet"
                                                    : "No files were shared during this voice room"}
                                            </p>
                                        ) : (
                                            <div className="space-y-2">
                                                {roomFiles.map(file => (
                                                    <a
                                                        key={file.id}
                                                        href={file.path}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-bg-secondary rounded-lg border border-gray-200 dark:border-gray-700 hover:border-amber-500 dark:hover:border-amber-500 transition-colors group"
                                                    >
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#D4AF37]/10 to-[#FFD700]/10 dark:from-[#D4AF37]/20 dark:to-[#FFD700]/20 flex items-center justify-center border border-[#D4AF37]/30 dark:border-[#D4AF37]/50 flex-shrink-0">
                                                                <DocumentIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 dark:text-text-primary truncate group-hover:text-amber-600 dark:group-hover:text-amber-400">
                                                                    {file.filename}
                                                                </p>
                                                                <p className="text-xs text-gray-500 dark:text-text-tertiary">
                                                                    Par {file.uploadedBy.firstname} {file.uploadedBy.lastname} • {formatFileSize(file.size)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span className="text-xs text-gray-400 dark:text-text-tertiary flex-shrink-0 ml-2">
                                                            {formatDate(file.createdAt)}
                                                        </span>
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                        </div>
                                    </div>

                                    {/* Chat Input (only for active rooms) */}
                                    {selectedRoom.isActive && (
                                        <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-bg-tertiary p-4">
                                            <div className="max-w-4xl mx-auto flex gap-3">
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleFileUpload}
                                                    className="hidden"
                                                />
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    disabled={uploadingFile || !selectedRoom}
                                                    className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    title="Share a file"
                                                >
                                                    {uploadingFile ? (
                                                        <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                                                    ) : (
                                                        <ArrowUpTrayIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                                    )}
                                                </button>
                                                <input
                                                    type="text"
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendComment()}
                                                    placeholder="Write a message..."
                                                    disabled={isSubmitting || !selectedRoom}
                                                    className="flex-1 px-4 py-3 bg-gray-50 dark:bg-bg-secondary border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-text-primary placeholder-gray-400 dark:placeholder-gray-600 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                />
                                                <button
                                                    onClick={handleSendComment}
                                                    disabled={isSubmitting || !newComment.trim() || !selectedRoom}
                                                    className="p-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black rounded-lg hover:from-[#B8860B] hover:to-[#D4AF37] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    title="Send"
                                                >
                                                    {isSubmitting ? (
                                                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                                    ) : (
                                                        <PaperAirplaneIcon className="w-5 h-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Create Voice Room Modal */}
            {showCreateModal && (
                <CreateVoiceRoomModal
                    onClose={() => setShowCreateModal(false)}
                    onCreated={fetchVoiceRooms}
                />
            )}
        </div>
    );
}

// Create Voice Room Modal Component (kept the same as before)
function CreateVoiceRoomModal({ onClose, onCreated }: {
    onClose: () => void;
    onCreated: () => void;
}) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [maxParticipants, setMaxParticipants] = useState('');
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axiosClient.get(
                `${import.meta.env.VITE_BASE_URL}/admin/users`,
                { headers: getAuthHeader() }
            );
            console.log('Users response:', response.data);
            const usersData =
                response.data?.payload?.users ||
                response.data?.payload ||
                response.data?.data ||
                [];

            setUsers(Array.isArray(usersData) ? usersData : []);
        } catch (error: any) {
            console.error('Error fetching users:', error);
            toast.error('Error while loading users');
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error('The room name is required');
            return;
        }

        try {
            setIsLoading(true);

            await axiosClient.post(
                `${import.meta.env.VITE_BASE_URL}/app/voice-rooms`,
                {
                    name: name.trim(),
                    description: description.trim() || null,
                    participantIds: selectedUserIds,
                    maxParticipants: maxParticipants ? parseInt(maxParticipants) : null
                },
                { headers: getAuthHeader() }
            );

            toast.success('Voice room created successfully');
            onCreated();
            onClose();
        } catch (error) {
            console.error('Error creating voice room:', error);
            toast.error('Error while creating the room');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleUser = (userId: number) => {
        setSelectedUserIds(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const filteredUsers = users.filter(user =>
        `${user.firstname} ${user.lastname}`.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const selectedUsers = users.filter((u) => selectedUserIds.includes(u.id));

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-bg-tertiary rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-800 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-text-primary">Create a voice room</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <XMarkIcon className="w-6 h-6 text-gray-600 dark:text-text-secondary" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleCreate} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                            Room name *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-bg-secondary border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                            placeholder="Ex: Team discussion"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                            Description (optional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-bg-secondary border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent resize-none transition-all"
                            placeholder="Describe the room topic..."
                            rows={3}
                        />
                    </div>

                    {/* Max Participants */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                            Max number of participants (optional)
                        </label>
                        <input
                            type="number"
                            value={maxParticipants}
                            onChange={(e) => setMaxParticipants(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-bg-secondary border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                            placeholder="Unlimited"
                            min="2"
                        />
                    </div>

                    {/* Participants */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                            Invite participants
                        </label>

                        {selectedUsers.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {selectedUsers.map((user) => (
                                    <span
                                        key={user.id}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#D4AF37]/10 to-[#FFD700]/10 dark:from-[#D4AF37]/20 dark:to-[#FFD700]/20 border border-[#D4AF37]/30 dark:border-[#D4AF37]/50 text-sm"
                                    >
                                        <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#FFD700] text-black flex items-center justify-center text-xs font-semibold shadow-sm">
                                            {user.firstname[0]}{user.lastname[0]}
                                        </span>
                                        <span className="text-gray-900 dark:text-text-primary">{user.firstname} {user.lastname}</span>
                                        <button
                                            type="button"
                                            onClick={() => toggleUser(user.id)}
                                            className="text-gray-500 dark:text-text-tertiary hover:text-amber-600 dark:hover:text-amber-400"
                                        >
                                            <XMarkIcon className="w-4 h-4" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setIsDropdownOpen(true);
                                }}
                                onFocus={() => setIsDropdownOpen(true)}
                                onBlur={() => setTimeout(() => setIsDropdownOpen(false), 150)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-bg-secondary border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all mb-2"
                                placeholder="Search for a user..."
                            />

                            {isDropdownOpen && (
                                <div className="absolute z-10 w-full bg-white dark:bg-bg-secondary border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {filteredUsers.length === 0 && (
                                        <div className="px-4 py-3 text-sm text-gray-500 dark:text-text-tertiary">
                                            No user found
                                        </div>
                                    )}
                                    {filteredUsers.map(user => (
                                        <label
                                            key={user.id}
                                            className="flex items-center gap-3 p-3 hover:bg-amber-50 dark:hover:bg-amber-900/20 cursor-pointer transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedUserIds.includes(user.id)}
                                                onChange={() => toggleUser(user.id)}
                                                className="w-4 h-4 text-amber-600 dark:text-amber-500 border-gray-300 dark:border-gray-700 rounded focus:ring-amber-500"
                                            />
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#FFD700] flex items-center justify-center text-black text-xs font-medium shadow-sm">
                                                {user.firstname[0]}{user.lastname[0]}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm text-gray-900 dark:text-text-primary">
                                                    {user.firstname} {user.lastname}
                                                </span>
                                                {user.email && (
                                                    <span className="text-xs text-gray-500 dark:text-text-tertiary">{user.email}</span>
                                                )}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                        {selectedUserIds.length > 0 && (
                            <p className="text-sm text-gray-600 dark:text-text-secondary mt-2">
                                {selectedUserIds.length} participant{selectedUserIds.length > 1 ? 's' : ''} selected
                            </p>
                        )}
                    </div>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-text-primary bg-white dark:bg-bg-secondary rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={isLoading || !name.trim()}
                        className="px-6 py-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black rounded-lg hover:from-[#B8860B] hover:to-[#D4AF37] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                                Creating...
                            </>
                        ) : (
                            <>
                                <PlusIcon className="w-5 h-5" />
                                Create room
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
