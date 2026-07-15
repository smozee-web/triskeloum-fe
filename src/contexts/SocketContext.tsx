import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

// Helpers pour notifications
const playNotificationSound = () => {
    try {
        const audio = new Audio('/sounds/acknowledgment.mp3');
        audio.volume = 0.5;
        audio.play().catch(err => console.warn('Sound not played:', err.message));
    } catch (error) {
        console.warn('Error playing sound:', error);
    }
};

const showNotificationToast = (userName: string, message: string) => {
    toast.success(
        (t) => (
            <div>
                <div className="font-semibold">💬 {userName}</div>
                <div className="text-sm text-gray-600 mt-1">{message}</div>
            </div>
        ),
        {
            duration: 4000,
            position: 'top-right'
        }
    );
};

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
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
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false
});

let currentUserId: number | null = null;
let lastMessageId: number | null = null; // Tracker pour éviter les doublons

export const setCurrentUserId = (userId: number) => {
    currentUserId = userId;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const messageHandlerRef = useRef<Set<number>>(new Set()); // Tracking des IDs traités

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token || socketRef.current) {
            return; // Déjà connecté ou pas de token
        }

        console.log('🌍 Creating global socket connection...');
        
        socketRef.current = io(import.meta.env.VITE_BASE_WITHOUT_ORIGIN, {
            auth: { token },
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        socketRef.current.on('connect', () => {
            console.log('✅ Global socket connected');
            setIsConnected(true);
        });

        socketRef.current.on('disconnect', () => {
            console.log('🔴 Global socket disconnected');
            setIsConnected(false);
        });

        socketRef.current.on('connect_error', (error: any) => {
            console.error('❌ Socket connection error:', error);
        });

        // Listener GLOBAL: Nouveau message reçu
        socketRef.current.on('message:received', (data: Message) => {
            console.log('🌍 [GLOBAL] Message reçu:', data.id);

            // Éviter les doublons avec un timeout
            if (messageHandlerRef.current.has(data.id)) {
                console.log('⚠️ Message déjà traité globalement, ignoré');
                return;
            }

            messageHandlerRef.current.add(data.id);
            setTimeout(() => messageHandlerRef.current.delete(data.id), 5000); // Oublier après 5s

            // Notifier SEULEMENT si c'est d'un autre utilisateur
            if (data.user.id !== currentUserId) {
                console.log('🔔 Notification GLOBALE déclenchée:', data.user.firstname);
                playNotificationSound();
                showNotificationToast(
                    `${data.user.firstname} ${data.user.lastname}`,
                    data.content
                );
            }
        });

        return () => {
            // NE PAS déconnecter ici - garder la connexion active
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within SocketProvider');
    }
    return context;
};