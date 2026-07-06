import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.senguntharinbusiness.app',
  appName: 'SIBapp',
  webDir: 'dist',
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    CapacitorCookies: {
      enabled: true,
    },
    FirebaseMessaging: {
      // Show push notification banners on iOS even when app is open
      presentationOptions: ["badge", "sound", "alert"],
    },
  }
};

export default config;