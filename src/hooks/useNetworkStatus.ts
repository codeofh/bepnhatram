import { useState, useEffect } from 'react';
import { networkStatus } from '@/lib/firebase';

interface NetworkStatusHook {
  isOnline: boolean;
  wasEverOffline: boolean;
}

export function useNetworkStatus(): NetworkStatusHook {
  const [status, setStatus] = useState({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    wasEverOffline: networkStatus.wasEverOffline
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setStatus(prev => ({ 
        isOnline: false, 
        wasEverOffline: true 
      }));
      networkStatus.wasEverOffline = true;
    };

    // Update from global state on mount
    setStatus({
      isOnline: networkStatus.isOnline,
      wasEverOffline: networkStatus.wasEverOffline
    });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return status;
}