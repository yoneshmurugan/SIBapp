import { useEffect, useState } from 'react';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';

const usePushNotifications = () => {
    const [fcmToken, setFcmToken] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (Capacitor.isNativePlatform()) {
            registerPushNotifications();
        }

        return () => {
            if (Capacitor.isNativePlatform()) {
                FirebaseMessaging.removeAllListeners();
            }
        };
    }, []);

    const registerPushNotifications = async () => {
        try {
            // Request permissions
            const permStatus = await FirebaseMessaging.requestPermissions();
            if (permStatus.receive !== 'granted') {
                console.log('User denied push notification permissions');
                return;
            }

            // Get the unified FCM token
            const { token } = await FirebaseMessaging.getToken();
            console.log("Unified FCM Token:", token);
            setFcmToken(token);
            localStorage.setItem('fcmToken', token);
            
            // Register token with backend
            try {
                await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/auth/register-fcm-token`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ fcmToken: token })
                });
            } catch (err) {
                console.error('Failed to register FCM token with backend:', err);
            }

            // Setup listeners for receiving notifications
            await FirebaseMessaging.addListener('notificationReceived', (event) => {
                console.log('Push received: ', JSON.stringify(event.notification));
            });

            await FirebaseMessaging.addListener('notificationActionPerformed', (event) => {
                console.log('Push action performed: ', JSON.stringify(event.notification));
                const data = event.notification?.data;
                if (data && data.action === 'OPEN_TYB') {
                    navigate('/slips', { state: { action: 'OPEN_TYB', referrerName: data.referrerName } });
                } else if (data && data.action === 'OPEN_WALL_OF_WISHES') {
                    navigate('/wall-of-wishes');
                } else if (data && data.action === 'OPEN_PROFILE_BADGES') {
                    navigate('/profile');
                } else {
                    navigate('/allnotifications');
                }
            });

        } catch (error) {
            console.error('Error registering push notifications:', error);
        }
    };

    return { fcmToken };
};

export default usePushNotifications;
