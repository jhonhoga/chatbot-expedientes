import { useState, useEffect } from 'react';
import { API_CONFIG } from '../config';

export function useServerStatus() {
  const [isServerOnline, setIsServerOnline] = useState(false);

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await fetch(`${API_CONFIG.baseURL}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        setIsServerOnline(response.ok);
      } catch (error) {
        console.error('Server health check failed:', error);
        setIsServerOnline(false);
      }
    };

    checkServerStatus();
    const interval = setInterval(checkServerStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return isServerOnline;
}