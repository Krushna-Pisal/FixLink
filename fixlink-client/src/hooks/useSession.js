import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';

export function useSession(sessionId) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!sessionId) return;
    try {
      const { data } = await client.get(`/sessions/${sessionId}`);
      setSession(data.data || data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => { refresh(); }, [refresh]);

  return { session, loading, error, refresh };
}
