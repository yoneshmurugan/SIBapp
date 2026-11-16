import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const usePushNotifications = () => {
    const [fcmToken, setFcmToken] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;
        let appStateHandle = null;

        const initNativePush = async () => {
            try {
                // Dynamically import Capacitor packages to ensure safe execution on web
                const capPkg = '@capacitor/core';
                const msgPkg = '@capacitor-firebase/messaging';
                const appPkg = '@capacitor/app';

                const capModule = await import(/* @vite-ignore */ capPkg).catch(() => null);
                if (!capModule || !capModule.Capacitor || !capModule.Capacitor.isNativePlatform()) {
                    return;
                }

                const messagingModule = await import(/* @vite-ignore */ msgPkg).catch(() => null);
                if (!messagingModule || !messagingModule.FirebaseMessaging) {
                    return;
                }

                const { FirebaseMessaging } = messagingModule;

                // 1. Check current push notification permission status
                let permStatus = await FirebaseMessaging.checkPermissions().catch(() => null);

                // If not yet decided, prompt user for permission
                if (!permStatus || permStatus.receive === 'prompt' || permStatus.receive === 'prompt-with-rationale') {
                    permStatus = await FirebaseMessaging.requestPermissions().catch(() => null);
                }

                if (!permStatus || permStatus.receive !== 'granted') {
                    console.log('Push notification permissions not granted:', permStatus?.receive);
                    return;
                }

                // 2. Retrieve device FCM token
                const { token } = await FirebaseMessaging.getToken();
                if (!isMounted || !token) return;

                setFcmToken(token);
                localStorage.setItem('fcmToken', token);

                // 3. Register token with backend
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

                // 4. Clear any previous listeners before attaching fresh ones
                await FirebaseMessaging.removeAllListeners();

                // Foreground push received listener
                await FirebaseMessaging.addListener('notificationReceived', (event) => {
                    console.log('Push received: ', JSON.stringify(event.notification));
                });

                // Deep-link routing on notification tap
                await FirebaseMessaging.addListener('notificationActionPerformed', (event) => {
                    console.log('Push action performed: ', JSON.stringify(event.notification));
                    const notif = event.notification || {};
                    const data = notif.data || notif.additionalData || {};
                    const action = data.action;
                    const title = (notif.title || '').toLowerCase();
                    const body = (notif.body || '').toLowerCase();

                    // If referral push or action is OPEN_TYB -> Route straight to TYB Slip with details prefilled!
                    const isReferralPush =
                        action === 'OPEN_TYB' ||
                        event.actionId === 'punch_tyb' ||
                        title.includes('referral') ||
                        body.includes('referral');

                    if (isReferralPush) {
                        const comments = data.referralDetails
                            ? `Regarding referral: ${data.referralDetails}`
                            : (data.referrerName ? `Business from referral by ${data.referrerName}` : '');

                        navigate('/slips', {
                            state: {
                                action: 'OPEN_TYB',
                                referrerName: data.referrerName || '',
                                prefillComments: comments,
                                crossChapter: data.crossChapter === 'true' || data.crossChapter === true,
                                chapterId: data.chapterId || null
                            }
                        });
                    } else if (action === 'OPEN_M2M' || title.includes('m2m')) {
                        navigate('/slips', {
                            state: {
                                action: 'OPEN_M2M',
                                partnerName: data.partnerName || ''
                            }
                        });
                    } else if (action === 'VIEW_ACTIVITY') {
                        navigate('/myactivity');
                    } else if (action === 'OPEN_MEETINGS' || title.includes('meeting')) {
                        navigate('/meetings');
                    } else if (action === 'OPEN_WALL_OF_WISHES') {
                        navigate('/wall-of-wishes');
                    } else if (
                        action === 'OPEN_PROFILE_BADGES' ||
                        action === 'MEMBERSHIP_RENEWAL' ||
                        title.includes('renewal') ||
                        body.includes('renewal')
                    ) {
                        navigate('/profile');
                    } else {
                        navigate('/allnotifications');
                    }
                });

                // 5. Listen to App state changes (resume) so if user enables notifications in Settings, token registers immediately
                const appModule = await import(/* @vite-ignore */ appPkg).catch(() => null);
                if (appModule && appModule.App && !appStateHandle) {
                    appStateHandle = await appModule.App.addListener('appStateChange', (state) => {
                        if (state.isActive && isMounted) {
                            initNativePush();
                        }
                    });
                }
            } catch (error) {
                console.log('Push notifications registration bypassed:', error?.message);
            }
        };

        initNativePush();

        return () => {
            isMounted = false;
            if (appStateHandle && typeof appStateHandle.remove === 'function') {
                appStateHandle.remove();
            }
        };
    }, [navigate]);

    return { fcmToken };
};

export default usePushNotifications;
