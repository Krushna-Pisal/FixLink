import { useState, useEffect } from 'react';

export function useNetworkStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    let timer;

    const handleOffline = () => {
      setOnline(false);
      setReconnecting(true);
      // Give it 10 seconds to come back — after that, stop saying "reconnecting"
      timer = setTimeout(() => setReconnecting(false), 10000);
    };

    const handleOnline = () => {
      setOnline(true);
      setReconnecting(false);
      clearTimeout(timer);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      clearTimeout(timer);
    };
  }, []);

  return { online, reconnecting };
}
