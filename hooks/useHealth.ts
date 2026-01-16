import { useState, useEffect } from 'react';

export type HealthStatus = 'connected' | 'degraded' | 'error' | 'loading';

export function useHealth() {
  const [status, setStatus] = useState<HealthStatus>('loading');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkHealth = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${apiUrl}/health`);
      if (!res.ok) throw new Error('Health check failed');
      
      const data = await res.json();
      if (data.status === 'ok') {
        setStatus('connected');
      } else {
        setStatus('degraded');
      }
    } catch (err) {
      setStatus('error');
    } finally {
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  return { status, lastChecked, checkHealth };
}
