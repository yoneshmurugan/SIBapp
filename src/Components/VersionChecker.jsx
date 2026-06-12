import React, { useEffect, useState } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { AlertTriangle } from 'lucide-react';

const VersionChecker = ({ children }) => {
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [appStoreUrl, setAppStoreUrl] = useState("https://apps.apple.com/app/sib/id__YOUR_APP_ID__");

  useEffect(() => {
    const checkVersion = async () => {
      if (!Capacitor.isNativePlatform()) return; // Only block on native apps
      
      try {
        const info = await CapacitorApp.getInfo();
        const currentBuild = parseInt(info.build || "0", 10);
        
        const res = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/public/app-version`);
        if (!res.ok) return;
        const data = await res.json();
        
        // Determine platform and apply respective limits
        const platform = Capacitor.getPlatform(); // 'ios', 'android', or 'web'
        let requiredBuild = data.minRequiredBuild || 0; // fallback to legacy

        if (platform === 'ios') {
          if (data.appstoreUrl) setAppStoreUrl(data.appstoreUrl);
          requiredBuild = data.iosMinRequiredBuild || requiredBuild;
        } else if (platform === 'android') {
          if (data.playstoreUrl) setAppStoreUrl(data.playstoreUrl);
          requiredBuild = data.androidMinRequiredBuild || requiredBuild;
        } else {
           // web fallback
           if (data.appstoreUrl) setAppStoreUrl(data.appstoreUrl);
           else if (data.playstoreUrl) setAppStoreUrl(data.playstoreUrl);
        }
        
        if (currentBuild < requiredBuild) {
          setNeedsUpdate(true);
        }
      } catch (err) {
        console.error("Failed to check app version", err);
      }
    };
    checkVersion();
  }, []);

  if (needsUpdate) {
    return (
      <div className="fixed inset-0 z-[99999] bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-6 animate-in fade-in">
        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 text-amber-500 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle size={40} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">Update Required</h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-xs leading-relaxed">
          A new version of the Sengunthar In Business app is available! Please update from the App Store to continue.
        </p>
        <button 
          onClick={async () => {
             // Use Capacitor App to open native App Store URL
             await CapacitorApp.openUrl({ url: appStoreUrl }).catch(err => {
                // Fallback to window.location if native opening fails
                window.location.href = appStoreUrl;
             });
          }}
          className="w-full max-w-xs bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-3.5 px-4 rounded-xl transition-all active:scale-95 shadow-lg"
        >
          Update Now
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default VersionChecker;
