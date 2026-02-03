import React, { useState, useEffect } from 'react';
import { Toast } from './UI';

const NetworkStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000); // Hide "Back Online" after 3s
        };

        const handleOffline = () => {
            setIsOnline(false);
            setShowToast(true);
            // Don't auto-hide "Offline" message, or maybe hide after a while but keep a small indicator?
            // For now, let's auto-hide to avoid annoyance, or keep it.
            // Let's keep it visible for 5s.
            setTimeout(() => setShowToast(false), 5000);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!showToast) return null;

    return (
        <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999 }}>
            <div style={{
                padding: '10px 20px',
                borderRadius: '8px',
                background: isOnline ? '#10b981' : '#ef4444',
                color: 'white',
                fontWeight: 'bold',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                display: 'flex', alignItems: 'center', gap: '10px'
            }}>
                <span style={{ fontSize: '1.2rem' }}>{isOnline ? 'wifi' : 'wifi_off'}</span>
                {isOnline ? 'You are back online' : 'You are offline. Showing cached data.'}
            </div>
        </div>
    );
};

export default NetworkStatus;
