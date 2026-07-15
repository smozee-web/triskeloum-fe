import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import axios from 'axios';
import logger from './logger';

/**
 * Firebase Configuration
 * Replace with your actual Firebase config from Firebase Console
 */
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export class FirebaseNotificationService {
    private static instance: FirebaseNotificationService;
    private messaging: Messaging | null = null;
    private isInitialized = false;

    private constructor() {
        this.initialize();
    }

    static getInstance(): FirebaseNotificationService {
        if (!FirebaseNotificationService.instance) {
            FirebaseNotificationService.instance = new FirebaseNotificationService();
        }
        return FirebaseNotificationService.instance;
    }

    /**
     * Initialize Firebase and setup messaging
     */
    private initialize(): void {
        try {
            // Validate config
            if (!firebaseConfig.projectId || !firebaseConfig.messagingSenderId) {
                logger.warn('Firebase config is incomplete');
                return;
            }

            // Initialize Firebase
            const app = initializeApp(firebaseConfig);

            // Get messaging service
            if ('serviceWorker' in navigator) {
                this.messaging = getMessaging(app);
                this.isInitialized = true;
                logger.info('Firebase Cloud Messaging initialized');

                // Listen for foreground messages
                this.listenForForegroundMessages();
            } else {
                logger.warn('Service Workers not supported');
            }
        } catch (error) {
            logger.error('Failed to initialize Firebase:', error);
        }
    }

    /**
     * Request notification permission and get FCM token
     */
    async registerForNotifications(): Promise<string | null> {
        try {
            if (!this.messaging) {
                logger.warn('Firebase Cloud Messaging not initialized');
                return null;
            }

            // Request permission
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                logger.info('Notification permission denied');
                return null;
            }

            // Get FCM token
            const token = await getToken(this.messaging, {
                vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
            });

            if (!token) {
                logger.warn('Failed to get FCM token');
                return null;
            }

            logger.info('FCM token obtained successfully');

            // Register token with backend
            await this.registerTokenWithBackend(token);

            return token;
        } catch (error) {
            logger.error('Error registering for notifications:', error);
            return null;
        }
    }

    /**
     * Register FCM token with backend
     */
    private async registerTokenWithBackend(token: string): Promise<void> {
        try {
            await axios.post('/api/v1/notifications/fcm/register', { fcmToken: token });
            logger.info('FCM token registered with backend');
        } catch (error) {
            logger.error('Error registering FCM token with backend:', error);
        }
    }

    /**
     * Listen for foreground push notifications
     */
    private listenForForegroundMessages(): void {
        if (!this.messaging) return;

        onMessage(this.messaging, (payload: any) => {
            logger.info('Foreground message received:', payload);

            const notification = payload.notification;
            const data = payload.data;

            if (notification) {
                // Show browser notification or trigger app notification
                this.handleNotification({
                    title: notification.title || 'Notification',
                    body: notification.body || '',
                    icon: notification.icon,
                    image: notification.imageUrl,
                    data: data as Record<string, string>
                });
            }
        });
    }

    /**
     * Handle incoming notification
     */
    private handleNotification(notification: {
        title: string;
        body: string;
        icon?: string;
        image?: string;
        data?: Record<string, string>;
    }): void {
        // Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            const notificationOptions: any = {
                body: notification.body,
                icon: notification.icon || '/icons/notification-icon.png',
                tag: 'usratul-azkaar-notification',
                badge: '/icons/badge-icon.png'
            };
            
            // Add image if available (non-standard but supported by some browsers)
            if (notification.image) {
                notificationOptions.image = notification.image;
            }
            
            const notif = new Notification(notification.title, notificationOptions);
            
            notif.onclick = () => {
                notif.close();
                const deeplink = notification.data?.deeplink;
                if (deeplink) {
                    window.dispatchEvent(new CustomEvent('notification:deeplink', {
                        detail: { deeplink }
                    }));
                    window.focus();
                }
            };
        }

        window.dispatchEvent(new CustomEvent('notification:received', {
            detail: notification
        }));
    }

    /**
     * Check if notifications are supported
     */
    isSupported(): boolean {
        return this.isInitialized && 'serviceWorker' in navigator;
    }

    /**
     * Check notification permission status
     */
    getPermissionStatus(): NotificationPermission {
        return Notification.permission;
    }

    /**
     * Unregister notifications (opt-out)
     */
    async unregisterNotifications(): Promise<void> {
        try {
            if (!this.messaging) return;

            // Get current token and delete it
            const token = await getToken(this.messaging, {
                vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
            });

            if (token) {
                // Optionally notify backend to remove token
                await axios.post('/api/v1/notifications/fcm/unregister', { fcmToken: token });
            }

            logger.info('Notifications unregistered');
        } catch (error) {
            logger.error('Error unregistering notifications:', error);
        }
    }
}

// Export singleton instance
export const firebaseNotificationService = FirebaseNotificationService.getInstance();

// Export interface for types
export interface NotificationPayload {
    title: string;
    body: string;
    icon?: string;
    image?: string;
    data?: Record<string, string>;
}