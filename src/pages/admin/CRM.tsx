import { useState, useEffect, useRef } from 'react';
import {
    ChatBubbleLeftRightIcon,
    PaperAirplaneIcon,
    MagnifyingGlassIcon,
    EllipsisVerticalIcon,
    CheckIcon,
    LinkIcon,
    XMarkIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    PhoneIcon
} from '@heroicons/react/24/outline';
import { useLoadUserQuery } from '../../services/api';
import axiosClient from '../../services/axiosClient';
import toast from 'react-hot-toast';
import { useSocket, setCurrentUserId } from '../../contexts/SocketContext';
import { useLocation, useParams } from 'react-router-dom';
import { VoiceRoom } from '../../components/VoiceRoom';

const getAuthHeader = () => {
    const token = localStorage.getItem('accessToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const transformMessage = (msg: any): Message => ({
    id: msg.id,
    content: msg.content,
    user: msg.user,
    roomId: msg.roomId,
    createdAt: msg.createdAt || msg.created_at,
    seenAt: msg.seenAt || msg.seenAt,
    deliveredAt: msg.deliveredAt || msg.deliveredAt,
    attachments: msg.attachments || []
});

interface Room {
    id: number;
    name: string;
    isDirect: boolean;
    users: any[];
    messages: Message[];
    createdAt: string;
}

interface Attachment {
    id?: number;
    filename: string;
    path: string;
    mimetype: string;
}

interface Message {
    id: number;
    content: string;
    user: {
        id: number;
        firstname: string;
        lastname: string;
        picture?: string;
    };
    roomId: number;
    createdAt: string;
    seenAt?: string;
    deliveredAt?: string;
    attachments?: Attachment[];
}

function getInitialsStyle(name: string): string {
    const hash = name.charCodeAt(0) + name.charCodeAt(name.length - 1);
    return hash % 2 === 0 ? 'bg-black' : 'bg-gray-800';
}

function formatMessageTime(date: string): string {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
        return messageDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
        return 'Hier';
    } else {
        return messageDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
}

export default function CRMPage() {
    const location = useLocation();
    const { roomId } = useParams<{ roomId: string }>();
    const { data: userResponse } = useLoadUserQuery({});
    const currentUser = userResponse?.payload;
    const { socket } = useSocket();
    
    const [rooms, setRooms] = useState<Room[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [mediaPreviewOpen, setMediaPreviewOpen] = useState(false);
    const [previewedAttachment, setPreviewedAttachment] = useState<Attachment | null>(null);
    const [previewedMessageAttachments, setPreviewedMessageAttachments] = useState<Attachment[]>([]);
    const [previewedAttachmentIndex, setPreviewedAttachmentIndex] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
    const selectedRoomRef = useRef<Room | null>(null);
    const currentUserRef = useRef(currentUser);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const [isVoiceRoomActive, setIsVoiceRoomActive] = useState(false);

    // Mettre à jour le user ID global pour les notifications
    useEffect(() => {
        if (currentUser?.id) {
            setCurrentUserId(currentUser.id);
        }
    }, [currentUser?.id]);

    // Garder les refs à jour
    useEffect(() => {
        selectedRoomRef.current = selectedRoom;
        currentUserRef.current = currentUser;
    }, [selectedRoom, currentUser]);

    // Listener: Nouveau message reçu - TEMPS RÉEL (mise à jour UI seulement)
    useEffect(() => {
        if (!socket) return;

        const handleMessageReceived = (data: any) => {
            const transformedData = transformMessage(data);
            console.log('📨 [CRM] Message reçu:', transformedData.id, 'attachments:', transformedData.attachments?.length);
            
            // Mettre à jour la liste des messages si on est dans la room
            if (selectedRoomRef.current?.id === transformedData.roomId) {
                setMessages(prev => {
                    // Chercher et remplacer le message temporaire par le vrai
                    const tempMsgIndex = prev.findIndex(m => 
                        m.user.id === transformedData.user.id && 
                        m.id > 1000000000000 // IDs temporaires = timestamp
                    );

                    if (tempMsgIndex !== -1) {
                        const updated = [...prev];
                        updated[tempMsgIndex] = transformedData;
                        console.log('🔄 Message temporaire remplacé');
                        return updated;
                    }

                    // Vérifier si le message existe déjà (éviter doublons)
                    if (prev.some(m => m.id === transformedData.id)) {
                        console.log('⚠️ Message existe déjà');
                        return prev;
                    }

                    console.log('✅ Nouveau message ajouté');
                    return [...prev, transformedData];
                });

                // Scroll automatique seulement si nécessaire
                if (shouldAutoScroll) {
                    setTimeout(scrollToBottom, 100);
                }
            }

            // Mettre à jour le dernier message dans la liste des rooms
            setRooms(prev => prev.map(room => {
                if (room.id === data.roomId) {
                    const lastMsg = room.messages?.[room.messages.length - 1];
                    // Ne pas ajouter si c'est déjà le dernier message
                    if (lastMsg?.id === data.id) return room;
                    
                    return {
                        ...room,
                        messages: [...(room.messages || []).filter(m => m.id !== data.id), transformMessage(data)]
                    };
                }
                return room;
            }));
        };

        socket.on('message:received', handleMessageReceived);

        return () => {
            socket.off('message:received', handleMessageReceived);
        };
    }, [socket, shouldAutoScroll]);

    // Listener: Nouvelle room créée
    useEffect(() => {
        if (!socket) return;

        const handleRoomCreated = (room: Room) => {
            setRooms(prev => {
                // Vérifier si la room existe déjà
                if (prev.some(r => r.id === room.id)) return prev;
                const transformedRoom = {
                    ...room,
                    messages: (room.messages || []).map(transformMessage)
                };
                return [transformedRoom, ...prev];
            });
        };

        socket.on('room:created', handleRoomCreated);

        return () => {
            socket.off('room:created', handleRoomCreated);
        };
    }, [socket]);

    // Listener: Statut en ligne
    useEffect(() => {
        if (!socket) return;

        const handleUserStatus = (data: { userId: number; status: string }) => {
            if (data.status === 'online') {
                console.log('🟢 User online:', data.userId);
                setOnlineUsers(prev => new Set(prev).add(data.userId));
            } else if (data.status === 'offline') {
                console.log('🔴 User offline:', data.userId);
                setOnlineUsers(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(data.userId);
                    return newSet;
                });
            }
        };

        socket.on('user:status', handleUserStatus);

        return () => {
            socket.off('user:status', handleUserStatus);
        };
    }, [socket]);

    // Listener: Message délivré
    useEffect(() => {
        if (!socket) return;

        const handleMessageDelivered = ({ messageId, deliveredAt }: any) => {
            setMessages(prev => prev.map(msg => 
                msg.id === messageId ? { ...msg, deliveredAt } : msg
            ));
        };

        socket.on('message:delivered', handleMessageDelivered);

        return () => {
            socket.off('message:delivered', handleMessageDelivered);
        };
    }, [socket]);

    // Listener: Message vu
    useEffect(() => {
        if (!socket) return;

        const handleMessageSeen = ({ messageId, seenAt }: any) => {
            setMessages(prev => prev.map(msg =>
                msg.id === messageId ? { ...msg, seenAt } : msg
            ));

            setRooms(prev => prev.map(room => ({
                ...room,
                messages: room.messages?.map(msg =>
                    msg.id === messageId ? { ...msg, seenAt } : msg
                ) || []
            })));
        };

        socket.on('message:seen', handleMessageSeen);

        return () => {
            socket.off('message:seen', handleMessageSeen);
        };
    }, [socket]);

    // Listener: Salon vocal démarré
    useEffect(() => {
        if (!socket) return;

        const handleVoiceRoomStarted = (data: { roomId: number }) => {
            console.log('🎙️ Voice room started:', data.roomId);
            if (selectedRoomRef.current?.id === data.roomId) {
                setIsVoiceRoomActive(true);
            }
        };

        const handleVoiceRoomEnded = (data: { roomId: number }) => {
            console.log('🔇 Voice room ended:', data.roomId);
            if (selectedRoomRef.current?.id === data.roomId) {
                setIsVoiceRoomActive(false);
            }
        };

        socket.on('voice_room:started', handleVoiceRoomStarted);
        socket.on('voice_room:ended', handleVoiceRoomEnded);

        return () => {
            socket.off('voice_room:started', handleVoiceRoomStarted);
            socket.off('voice_room:ended', handleVoiceRoomEnded);
        };
    }, [socket]);

    // Rejoindre la room sélectionnée
    useEffect(() => {
        if (selectedRoom && socket?.connected) {
            console.log('👥 Joining room:', selectedRoom.id);
            socket.emit('join:room', { roomId: selectedRoom.id });
            
            // Marquer les messages comme vus
            socket.emit('messages:mark-seen', {
                roomId: selectedRoom.id
            });
        }
    }, [selectedRoom, socket]);

    useEffect(() => {
        fetchRooms();
    }, []);

    // Sélectionner la room si passée en state (depuis la page Users)
    useEffect(() => {
        if ((location.state as any)?.selectedRoomId) {
            const selectedRoomId = (location.state as any).selectedRoomId;
            const room = rooms.find(r => r.id === selectedRoomId);
            if (room) {
                setSelectedRoom(room);
            }
        }
    }, [rooms, location.state]);

    // Sélectionner la room si passée via paramètre d'URL (depuis une notification)
    useEffect(() => {
        if (roomId) {
            const parsedRoomId = parseInt(roomId, 10);
            const room = rooms.find(r => r.id === parsedRoomId);
            if (room) {
                setSelectedRoom(room);
            }
        }
    }, [roomId, rooms]);

    useEffect(() => {
        if (selectedRoom) {
            fetchMessages(selectedRoom.id);
            setShouldAutoScroll(true);
        }
    }, [selectedRoom]);

    // Auto-scroll uniquement lors du chargement initial des messages
    useEffect(() => {
        if (messages.length > 0 && shouldAutoScroll) {
            // Utiliser un délai pour s'assurer que le DOM est rendu
            setTimeout(() => {
                scrollToBottom();
                setShouldAutoScroll(false);
            }, 100);
        }
    }, [messages.length]);

    // Gérer le scroll manuel
    useEffect(() => {
        if (!messagesContainerRef.current) return;

        const handleScroll = (e: Event) => {
            const container = e.target as HTMLDivElement;
            
            // Charger les anciens messages si on scroll vers le haut
            if (container.scrollTop < 100 && !isLoadingOlderMessages && selectedRoom) {
                fetchOlderMessages(selectedRoom.id);
            }

            // Déterminer si on est proche du bas pour réactiver l'auto-scroll
            const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
            setShouldAutoScroll(isNearBottom);
        };

        const container = messagesContainerRef.current;
        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [selectedRoom, isLoadingOlderMessages, messages]);

    const fetchRooms = async () => {
        try {
            setIsLoading(true);
            const response = await axiosClient.get(
                `${import.meta.env.VITE_BASE_URL}/app/rooms?type=direct`,
                { headers: getAuthHeader() }
            );
            const roomsData = (response.data.payload || []).map((room: any) => ({
                ...room,
                messages: (room.messages || []).map(transformMessage)
            }));
            setRooms(roomsData);
        } catch (error) {
            console.error('Error fetching rooms:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMessages = async (roomId: number) => {
        try {
            setIsLoading(true);
            const response = await axiosClient.get(
                `${import.meta.env.VITE_BASE_URL}/app/rooms/messages?roomId=${roomId}&limit=50`,
                { 
                    headers: getAuthHeader()
                }
            );
            const messagesData = response.data.payload || [];
            setMessages(messagesData.map(transformMessage));
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchOlderMessages = async (roomId: number) => {
        if (messages.length === 0 || isLoadingOlderMessages) return;

        try {
            setIsLoadingOlderMessages(true);
            const oldestMessageId = messages[0].id;
            const response = await axiosClient.get(
                `${import.meta.env.VITE_BASE_URL}/app/rooms/messages?roomId=${roomId}&limit=50&beforeId=${oldestMessageId}`,
                { 
                    headers: getAuthHeader()
                }
            );
            
            const olderMessages = response.data.payload || [];
            if (olderMessages.length > 0) {
                setMessages(prev => [...olderMessages.map(transformMessage), ...prev]);
            }
        } catch (error) {
            console.error('Error fetching older messages:', error);
        } finally {
            setIsLoadingOlderMessages(false);
        }
    };

    // Créer ou récupérer une room directe unique
    const getOrCreateDirectRoom = async (otherUserId: number): Promise<Room | null> => {
        try {
            // Vérifier si une room directe existe déjà avec cet utilisateur
            const existingRoom = rooms.find(room => 
                room.isDirect && room.users.some(u => u.id === otherUserId)
            );

            if (existingRoom) {
                return existingRoom;
            }

            // Créer une nouvelle room directe
            const response = await axiosClient.post(
                `${import.meta.env.VITE_BASE_URL}/app/rooms/direct`,
                { userId: otherUserId },
                { headers: getAuthHeader() }
            );

            if (response.data.success) {
                const newRoom = response.data.payload;
                const transformedRoom = {
                    ...newRoom,
                    messages: (newRoom.messages || []).map(transformMessage)
                };
                setRooms(prev => [transformedRoom, ...prev]);
                return transformedRoom;
            }

            return null;
        } catch (error) {
            console.error('Error creating/getting direct room:', error);
            return null;
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!messageInput.trim() && selectedFiles.length === 0) || !selectedRoom) return;

        if (!socket?.connected) {
            console.error('Socket not connected');
            return;
        }

        const messageContent = messageInput;
        const filesToSend = [...selectedFiles];

        setMessageInput('');
        setSelectedFiles([]);
        setShouldAutoScroll(true);

        const tempMessage: Message = {
            id: Date.now(),
            content: messageContent,
            user: currentUser!,
            roomId: selectedRoom.id,
            createdAt: new Date().toISOString(),
            attachments: filesToSend.map(f => ({
                filename: f.name,
                path: f.name,
                mimetype: f.type
            }))
        };

        setMessages(prev => [...prev, tempMessage]);
        scrollToBottom();

        try {
            setIsSending(true);

            if (filesToSend.length > 0) {
                const formData = new FormData();
                formData.append('content', messageContent || '');
                filesToSend.forEach(file => {
                    formData.append('files', file);
                });

                console.log('📤 Uploading files');
                
                await axiosClient.post(
                    `${import.meta.env.VITE_BASE_URL}/app/rooms/${selectedRoom.id}/messages`,
                    formData,
                    {
                        headers: {
                            ...getAuthHeader()
                        }
                    }
                );

                console.log('✅ Upload successful');
            } else if (messageContent.trim()) {
                socket.emit('message:send', {
                    roomId: selectedRoom.id,
                    content: messageContent
                });
            }
        } catch (error) {
            console.error('❌ Error sending message:', error);
            setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
            toast.error('Error while sending the message', { duration: 8000 });
        } finally {
            setIsSending(false);
        }
    };

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validMimeTypes = [
            'image/png', 'image/jpeg', 'image/gif', 'image/webp',
            'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm',
            'video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'
        ];
        
        const validFiles = files.filter(f => validMimeTypes.includes(f.type));
        setSelectedFiles(prev => [...prev, ...validFiles]);
        
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeSelectedFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const getFilePreviewUrl = (file: File): string => {
        return URL.createObjectURL(file);
    };

    const openMediaPreview = (attachment: Attachment, allAttachments: Attachment[]) => {
        setPreviewedAttachment(attachment);
        setPreviewedMessageAttachments(allAttachments);
        setPreviewedAttachmentIndex(allAttachments.findIndex(a => a.path === attachment.path));
        setMediaPreviewOpen(true);
    };

    const goToPreviousAttachment = () => {
        if (previewedAttachmentIndex > 0) {
            const newIndex = previewedAttachmentIndex - 1;
            setPreviewedAttachmentIndex(newIndex);
            setPreviewedAttachment(previewedMessageAttachments[newIndex]);
        }
    };

    const goToNextAttachment = () => {
        if (previewedAttachmentIndex < previewedMessageAttachments.length - 1) {
            const newIndex = previewedAttachmentIndex + 1;
            setPreviewedAttachmentIndex(newIndex);
            setPreviewedAttachment(previewedMessageAttachments[newIndex]);
        }
    };

    // Obtenir le nom d'affichage de la room
    const getRoomDisplayName = (room: Room): string => {
        if (room.isDirect) {
            const otherU = room.users.find(u => u.id !== currentUser?.id);
            return otherU ? `${otherU.firstname} ${otherU.lastname}` : 'Unknown user';
        }
        return room.name;
    };

    const filteredRooms = rooms.filter(room =>
        getRoomDisplayName(room).toLowerCase().includes(searchQuery.toLowerCase())
    );

    const otherUser = selectedRoom
        ? selectedRoom.users.find(u => u.id !== currentUser?.id)
        : null;
    
    const isOtherUserOnline = otherUser ? onlineUsers.has(otherUser.id) : false;

    return (
        <div className="flex h-screen bg-white dark:bg-bg-primary overflow-hidden">
            {/* SIDEBAR */}
            <div className="w-80 bg-white dark:bg-bg-tertiary border-r border-gray-200 dark:border-gray-800 flex flex-col flex-shrink-0">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] rounded-xl">
                            <ChatBubbleLeftRightIcon className="w-5 h-5 text-black" />
                        </div>
                        <div>
                            <h1 className="text-base font-semibold text-black dark:text-text-primary">Messages</h1>
                            <p className="text-xs text-gray-500 dark:text-text-tertiary">
                                {filteredRooms.length} conversation{filteredRooms.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-600" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-bg-secondary border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
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
                            <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-3" />
                            <p className="font-medium text-gray-600 dark:text-text-secondary text-sm">No conversation</p>
                            <p className="text-xs text-gray-400 dark:text-text-tertiary mt-1">Start a new discussion</p>
                        </div>
                    ) : (
                        <div className="p-2">
                            {filteredRooms.map(room => {
                                const displayName = getRoomDisplayName(room);
                                const otherU = room.users.find(u => u.id !== currentUser?.id);
                                const lastMessage = room.messages && room.messages.length > 0
                                    ? room.messages.reduce((prev, current) =>
                                        (new Date(current.createdAt || 0) > new Date(prev.createdAt || 0)) ? current : prev
                                      )
                                    : null;
                                const isSelected = selectedRoom?.id === room.id;
                                const bgStyle = getInitialsStyle(otherU?.firstname || displayName);
                                const isOnline = otherU ? onlineUsers.has(otherU.id) : false;
                                const unreadCount = room.messages?.filter(m => !m.seenAt).length || 0;

                                return (
                                    <button
                                        key={room.id}
                                        onClick={() => setSelectedRoom(room)}
                                        className={`w-full p-3 rounded-lg mb-1 transition-colors text-left ${
                                            isSelected ? 'bg-gradient-to-r from-[#D4AF37]/10 to-[#FFD700]/10 dark:from-[#D4AF37]/20 dark:to-[#FFD700]/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                    >
                                        <div className="flex mx-4 items-center gap-3">
                                            {/* Avatar */}
                                            <div className="relative flex-shrink-0">
                                                <div className={`w-10 h-10 rounded-full ${bgStyle} flex items-center justify-center text-white font-medium text-xs`}>
                                                    {otherU?.firstname?.[0] || displayName[0]}
                                                    {otherU?.lastname?.[0] || displayName[1] || ''}
                                                </div>
                                                {isOnline && (
                                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-bg-tertiary"></div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="font-medium text-sm text-black dark:text-text-primary truncate">
                                                        {displayName}
                                                    </h3>
                                                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                                                        {lastMessage && (
                                                            <span className="text-xs text-gray-400 dark:text-text-tertiary">
                                                                {formatMessageTime(lastMessage.createdAt)}
                                                            </span>
                                                        )}
                                                        {unreadCount > 0 && (
                                                            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-black bg-gradient-to-r from-[#D4AF37] to-[#FFD700] rounded-full flex-shrink-0">
                                                                {unreadCount > 99 ? '99+' : unreadCount}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className={`text-xs truncate ${
                                                    unreadCount > 0 ? 'text-gray-700 dark:text-text-secondary font-medium' : 'text-gray-500 dark:text-text-tertiary'
                                                }`}>
                                                    {lastMessage ? (
                                                        lastMessage.user.id === currentUser?.id
                                                            ? `Vous: ${lastMessage.content}`
                                                            : lastMessage.content
                                                    ) : 'No message'}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* CHAT AREA */}
            {selectedRoom ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="h-16 px-6 bg-white dark:bg-bg-tertiary border-b border-gray-200 dark:border-gray-800 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full ${getInitialsStyle(otherUser?.firstname || '')} flex items-center justify-center text-white font-medium text-sm`}>
                                {otherUser?.firstname[0]}{otherUser?.lastname[0]}
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold text-black dark:text-text-primary">
                                    {otherUser?.firstname} {otherUser?.lastname}
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-text-tertiary flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full ${isOtherUserOnline ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></span>
                                    {isOtherUserOnline ? 'En ligne' : 'Hors ligne'}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setIsVoiceRoomActive(!isVoiceRoomActive)}
                                className={`p-2 rounded-lg transition-colors ${
                                    isVoiceRoomActive
                                        ? 'bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-text-secondary'
                                }`}
                                title={isVoiceRoomActive ? 'Hang up' : 'Start a voice call'}
                            >
                                <PhoneIcon className="w-5 h-5" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <LinkIcon className="w-5 h-5 text-gray-600 dark:text-text-secondary" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <EllipsisVerticalIcon className="w-5 h-5 text-gray-600 dark:text-text-secondary" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-bg-primary">
                        {isLoadingOlderMessages && (
                            <div className="flex justify-center py-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 dark:border-gray-700 border-t-amber-600 dark:border-t-amber-400"></div>
                            </div>
                        )}
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full">
                                <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-200 dark:text-gray-700 mb-4" />
                                <p className="font-medium text-gray-600 dark:text-text-secondary">Start of the conversation</p>
                                <p className="text-sm text-gray-400 dark:text-text-tertiary mt-1">Send a message to get started</p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => {
                                const isCurrentUser = msg.user.id === currentUser?.id;
                                const showAvatar = idx === 0 || messages[idx - 1]?.user.id !== msg.user.id;
                                const showTime = idx === messages.length - 1 || messages[idx + 1]?.user.id !== msg.user.id;
                                const bgStyle = getInitialsStyle(msg.user.firstname);

                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} gap-2`}
                                    >
                                        {/* Avatar gauche */}
                                        {!isCurrentUser && (
                                            showAvatar ? (
                                                <div className={`w-8 h-8 rounded-full ${bgStyle} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                                                    {msg.user.firstname[0]}
                                                </div>
                                            ) : (
                                                <div className="w-8 flex-shrink-0"></div>
                                            )
                                        )}

                                        <div className="max-w-md">
                                            {/* Voice Room Invitation */}
                                            {(msg as any).metadata?.type === 'voice_room_invitation' && (
                                                <div className="mb-2 p-4 border-2 border-green-200 bg-green-50 rounded-lg">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                                                            <PhoneIcon className="w-5 h-5 text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-green-900">
                                                                Invitation au salon vocal
                                                            </p>
                                                            <p className="text-sm text-green-700">
                                                                {(msg as any).metadata?.voiceRoomName}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => window.location.href = '/admin/voice-rooms'}
                                                        className="w-full mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                                    >
                                                        View room
                                                    </button>
                                                </div>
                                            )}

                                            {/* Message bubble */}
                                            <div
                                                className={`px-4 py-2 rounded-2xl ${
                                                    isCurrentUser
                                                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black'
                                                        : 'bg-white dark:bg-bg-secondary text-black dark:text-text-primary border border-gray-200 dark:border-gray-700'
                                                }`}
                                            >
                                                {msg.attachments && msg.attachments.length > 0 && (
                                                    <div className="mb-2 flex flex-wrap gap-2">
                                                        {msg.attachments.map((att, attIdx) => {
                                                            const isImage = att.mimetype.startsWith('image/');
                                                            const isVideo = att.mimetype.startsWith('video/');
                                                            const isAudio = att.mimetype.startsWith('audio/');
                                                            const baseUrl = import.meta.env.VITE_BASE_URL;
                                                            const fullPath = att.path.startsWith('http') ? att.path : `${baseUrl}/${att.path}`;
                                                            
                                                            if (isImage) {
                                                                return (
                                                                    <div key={attIdx} className="rounded-lg overflow-hidden max-w-xs cursor-pointer hover:opacity-90 transition-opacity" onClick={() => openMediaPreview(att, msg.attachments || [])}>
                                                                        <img 
                                                                            src={fullPath} 
                                                                            alt={att.filename}
                                                                            className="max-h-52 w-auto"
                                                                            onError={(e) => {
                                                                                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23ddd%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22 font-family=%22sans-serif%22 font-size=%2214%22%3EImage Error%3C/text%3E%3C/svg%3E';
                                                                            }}
                                                                        />
                                                                    </div>
                                                                );
                                                            } else if (isVideo) {
                                                                return (
                                                                    <div key={attIdx} className="text-xs flex items-center gap-1 cursor-pointer hover:opacity-70 transition-opacity" onClick={() => openMediaPreview(att, msg.attachments || [])}>
                                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm4 2v4m4-4v4m4-4v4" />
                                                                        </svg>
                                                                        <span className="truncate">{att.filename}</span>
                                                                    </div>
                                                                );
                                                            } else if (isAudio) {
                                                                return (
                                                                    <div key={attIdx} className="text-xs flex items-center gap-1 cursor-pointer hover:opacity-70 transition-opacity" onClick={() => openMediaPreview(att, msg.attachments || [])}>
                                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path d="M9 4a2 2 0 11-4 0 2 2 0 014 0zm0 10a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 11-4 0 2 2 0 014 0zm-1 6a1 1 0 100-2 1 1 0 000 2zm0-10a1 1 0 100-2 1 1 0 000 2z" />
                                                                        </svg>
                                                                        <span className="truncate">{att.filename}</span>
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        })}
                                                    </div>
                                                )}
                                                {msg.content && (
                                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                                )}
                                            </div>

                                            {/* Time & status */}
                                            {showTime && (
                                                <div className={`flex items-center gap-1 mt-1 text-xs text-gray-400 ${
                                                    isCurrentUser ? 'justify-end' : 'justify-start'
                                                }`}>
                                                    {isCurrentUser && msg.seenAt && (
                                                        <div className="flex items-center">
                                                            <CheckIcon className="w-3 h-3" />
                                                            <CheckIcon className="w-3 h-3 -ml-1.5" />
                                                        </div>
                                                    )}
                                                    <span>{formatMessageTime(msg.createdAt)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white dark:bg-bg-tertiary border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
                        {selectedFiles.length > 0 && (
                            <div className="mb-3 flex gap-2 overflow-x-auto pb-2">
                                {selectedFiles.map((file, idx) => {
                                    const isImage = file.type.startsWith('image/');
                                    return (
                                        <div key={idx} className="relative flex-shrink-0">
                                            {isImage ? (
                                                <img
                                                    src={getFilePreviewUrl(file)}
                                                    alt={file.name}
                                                    className="h-20 w-20 object-cover rounded border border-gray-200 dark:border-gray-700"
                                                />
                                            ) : (
                                                <div className="h-20 w-20 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center border border-gray-200 dark:border-gray-700">
                                                    <span className="text-xs text-center px-1 font-medium text-gray-600 dark:text-text-secondary truncate">
                                                        {file.name.substring(0, 10)}
                                                    </span>
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeSelectedFile(idx)}
                                                className="absolute -top-2 -right-2 bg-red-500 dark:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 dark:hover:bg-red-700"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        <form onSubmit={sendMessage} className="flex gap-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                onChange={handleFileSelect}
                                multiple
                                accept="image/*,audio/*,video/*"
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isSending}
                                className="px-3 py-2 text-gray-600 dark:text-text-secondary hover:text-gray-800 dark:hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Add a file"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </button>
                            <input
                                type="text"
                                placeholder="Write a message..."
                                className="flex-1 px-4 py-2 bg-gray-50 dark:bg-bg-secondary border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent"
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                disabled={isSending}
                            />
                            <button
                                type="submit"
                                disabled={isSending || (!messageInput.trim() && selectedFiles.length === 0)}
                                className="px-5 py-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black rounded-lg font-medium text-sm hover:from-[#B8860B] hover:to-[#D4AF37] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                            >
                                {isSending ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                                ) : (
                                    <>
                                        <PaperAirplaneIcon className="w-4 h-4" />
                                        <span>Send</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Voice Room Widget */}
                    {isVoiceRoomActive && (
                        <VoiceRoom
                            roomId={selectedRoom.id}
                            onClose={() => setIsVoiceRoomActive(false)}
                        />
                    )}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-bg-primary w-full">
                    <div className="p-6 rounded-full bg-gradient-to-br from-[#D4AF37]/10 to-[#FFD700]/10 dark:from-[#D4AF37]/20 dark:to-[#FFD700]/20 mb-4">
                        <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300 dark:text-gray-700" />
                    </div>
                    <p className="text-lg font-semibold text-black dark:text-text-primary mb-2">No conversation selected</p>
                    <p className="text-sm text-gray-500 dark:text-text-tertiary">Choose a conversation to get started</p>
                </div>
            )}

            {mediaPreviewOpen && previewedAttachment && (
                <div className="fixed inset-0 bg-black z-50 flex items-center justify-center" onClick={() => setMediaPreviewOpen(false)}>
                    <div className="relative w-full h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 z-10">
                            <div className="flex-1"></div>
                            <div className="text-white text-sm">
                                {previewedAttachmentIndex + 1} / {previewedMessageAttachments.length}
                            </div>
                            <button
                                onClick={() => setMediaPreviewOpen(false)}
                                className="ml-4 p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <XMarkIcon className="w-6 h-6 text-white" />
                            </button>
                        </div>

                        <div className="flex-1 flex items-center justify-center relative">
                            {previewedAttachment.mimetype.startsWith('image/') && (
                                <img 
                                    src={previewedAttachment.path.startsWith('http') ? previewedAttachment.path : `${import.meta.env.VITE_BASE_URL}/${previewedAttachment.path}`}
                                    alt={previewedAttachment.filename}
                                    className="max-w-full max-h-full object-contain"
                                />
                            )}
                            {previewedAttachment.mimetype.startsWith('video/') && (
                                <video
                                    src={previewedAttachment.path.startsWith('http') ? previewedAttachment.path : `${import.meta.env.VITE_BASE_URL}/${previewedAttachment.path}`}
                                    controls
                                    className="max-w-full max-h-full"
                                    autoPlay
                                />
                            )}
                            {previewedAttachment.mimetype.startsWith('audio/') && (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9 4a2 2 0 11-4 0 2 2 0 014 0zm0 10a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 11-4 0 2 2 0 014 0zm-1 6a1 1 0 100-2 1 1 0 000 2zm0-10a1 1 0 100-2 1 1 0 000 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-white text-sm text-center px-4">{previewedAttachment.filename}</p>
                                    <audio
                                        src={previewedAttachment.path.startsWith('http') ? previewedAttachment.path : `${import.meta.env.VITE_BASE_URL}/${previewedAttachment.path}`}
                                        controls
                                        className="w-80"
                                        autoPlay
                                    />
                                </div>
                            )}

                            {previewedMessageAttachments.length > 1 && (
                                <>
                                    {previewedAttachmentIndex > 0 && (
                                        <button
                                            onClick={goToPreviousAttachment}
                                            className="absolute left-4 p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                        >
                                            <ChevronLeftIcon className="w-6 h-6 text-white" />
                                        </button>
                                    )}
                                    {previewedAttachmentIndex < previewedMessageAttachments.length - 1 && (
                                        <button
                                            onClick={goToNextAttachment}
                                            className="absolute right-4 p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                        >
                                            <ChevronRightIcon className="w-6 h-6 text-white" />
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
