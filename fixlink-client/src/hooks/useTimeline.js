import { useEffect, useState, useCallback } from 'react';
import client from '../api/client';

export function useTimeline(sessionId) {
  const [events, setEvents] = useState([]);

  const refresh = useCallback(() => {
    if (!sessionId) return;
    client.get(`/sessions/${sessionId}/timeline`)
      .then(({ data }) => setEvents(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [sessionId]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { events, refresh };
}
