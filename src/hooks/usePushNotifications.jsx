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

                const capModule = await import(/* @vite-ignore */ capPkg).catch(() => null);
                if (!capModule || !capModule.Capacitor || !capModule.Capacitor.isNativePlatform()) {
                    return;
                }

                const messagingModule = await import(/* @vite-ignore */ msgPkg).catch(() => null);
                if (!messagingModule || !messagingModule.FirebaseMessaging) {
                    return;
                }

                const { FirebaseMessaging } = messagingModule;

                // 1. Create High-Priority Notification Channel on Android (API 26+)
                // This ensures notifications bypass OEM battery/silent restrictions (e.g. MIUI/HyperOS, ColorOS)
                if (capModule.Capacitor.getPlatform() === 'android') {
                    await FirebaseMessaging.createChannel({
                        id: 'sib_notifications',
                        name: 'SIB Notifications',
                        description: 'General notifications, announcements, referrals and alerts for SIB members',
                        importance: 5, // 5 = IMPORTANCE_HIGH (makes sound, vibrates, and displays heads-up banner)
                        visibility: 1, // 1 = VISIBILITY_PUBLIC (shows on lockscreen)
                        sound: 'default',
                        vibration: true,
                        lights: true,
                        lightColor: '#d97706'
                    }).catch(err => console.log('Channel creation log:', err));
                }

                // 2. Check and Request Push Permissions
                let permStatus = await FirebaseMessaging.checkPermissions().catch(() => null);

                // Always request if not yet granted (never skip when cached state is 'denied' from older build without POST_NOTIFICATIONS)
                if (!permStatus || permStatus.receive !== 'granted') {
                    permStatus = await FirebaseMessaging.requestPermissions().catch(() => null);
                }

                // 3. Always Retrieve Device FCM Token (Tokens are generated independently of notification permission)
                try {
                    const { token } = await FirebaseMessaging.getToken();
                    if (isMounted && token) {
                        setFcmToken(token);
                        localStorage.setItem('fcmToken', token);

                        // Register token with backend
                        await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/auth/register-fcm-token`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ fcmToken: token })
                        });
                        console.log('FCM token successfully registered with backend');
                    }
                } catch (tokenErr) {
                    console.error('Failed to get or register FCM token:', tokenErr);
                }

                // 4. Attach Listeners (clear any previous first)
                await FirebaseMessaging.removeAllListeners().catch(() => null);

                // Foreground push received listener
                await FirebaseMessaging.addListener('notificationReceived', (event) => {
                    console.log('Push received in foreground:', JSON.stringify(event.notification));
                    const notif = event.notification || {};
                    const title = notif.title || 'New Announcement';
                    const body = notif.body || 'You have a new update in SIB.';

                    // Display a sleek in-app banner when push arrives while user has the app open
                    try {
                        const existingToast = document.getElementById('sib-foreground-push-toast');
                        if (existingToast) existingToast.remove();

                        const toast = document.createElement('div');
                        toast.id = 'sib-foreground-push-toast';
                        toast.style.cssText = `
                            position: fixed;
                            top: calc(env(safe-area-inset-top, 0px) + 16px);
                            left: 16px;
                            right: 16px;
                            z-index: 99999;
                            background: #0a2342;
                            color: #ffffff;
                            border: 1px solid #d4b896;
                            border-radius: 14px;
                            padding: 12px 16px;
                            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
                            display: flex;
                            align-items: flex-start;
                            gap: 12px;
                            cursor: pointer;
                            animation: sibToastSlideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1);
                            font-family: inherit;
                        `;

                        // Add keyframes if not present
                        if (!document.getElementById('sib-toast-style')) {
                            const styleEl = document.createElement('style');
                            styleEl.id = 'sib-toast-style';
                            styleEl.textContent = `
                                @keyframes sibToastSlideDown {
                                    from { opacity: 0; transform: translateY(-24px) scale(0.96); }
                                    to { opacity: 1; transform: translateY(0) scale(1); }
                                }
                            `;
                            document.head.appendChild(styleEl);
                        }

                        toast.innerHTML = `
                            <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(212, 184, 150, 0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px;">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d4b896" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                                </svg>
                            </div>
                            <div style="flex: 1; min-width: 0;">
                                <div style="font-size: 0.92rem; font-weight: 700; color: #ffffff; margin-bottom: 2px; line-height: 1.3;">
                                    ${title}
                                </div>
                                <div style="font-size: 0.8rem; color: #d1d5db; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                                    ${body}
                                </div>
                            </div>
                        `;

                        toast.onclick = () => {
                            toast.remove();
                            const data = notif.data || notif.additionalData || {};
                            const action = data.action;
                            const t = title.toLowerCase();
                            const b = body.toLowerCase();
                            if (action === 'OPEN_TYB' || t.includes('referral') || b.includes('referral')) {
                                navigate('/slips');
                            } else if (action === 'OPEN_M2M' || t.includes('m2m')) {
                                navigate('/slips');
                            } else if (action === 'MEMBERSHIP_RENEWAL' || t.includes('renewal') || b.includes('renewal')) {
                                navigate('/profile');
                            } else {
                                navigate('/allnotifications');
                            }
                        };

                        document.body.appendChild(toast);
                        setTimeout(() => {
                            if (document.body.contains(toast)) {
                                toast.style.transition = 'all 0.3s ease-out';
                                toast.style.opacity = '0';
                                toast.style.transform = 'translateY(-16px)';
                                setTimeout(() => toast.remove(), 300);
                            }
                        }, 5000);
                    } catch (e) {
                        console.log('Error showing foreground toast:', e);
                    }

                    // Dispatch a custom window event so in-app bell / list can update
                    window.dispatchEvent(new CustomEvent('sib-push-received', { detail: notif }));
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

            } catch (error) {
                console.log('Push notifications registration bypassed:', error?.message);
            }
        };

        // Initialize immediately on mount
        initNativePush();

        // 5. Unconditionally attach App state change listener so returning from Android Settings triggers instant token & permission refresh
        (async () => {
            try {
                const appPkg = '@capacitor/app';
                const appModule = await import(/* @vite-ignore */ appPkg).catch(() => null);
                if (appModule && appModule.App && isMounted && !appStateHandle) {
                    appStateHandle = await appModule.App.addListener('appStateChange', (state) => {
                        if (state.isActive && isMounted) {
                            console.log('App resumed, refreshing push notification state');
                            initNativePush();
                        }
                    });
                }
            } catch (e) {
                // Ignore
            }
        })();

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
