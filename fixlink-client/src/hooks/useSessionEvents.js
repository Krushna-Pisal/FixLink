import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

/**
 * Subscribes to /topic/session.{sessionId}.events over STOMP.
 * Returns a list of events and triggers onSessionEnded callback
 * the instant the agent ends the session.
 */
export function useSessionEvents(sessionId, { onSessionEnded, onCustomerJoined } = {}) {
  const stompRef = useRef(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!sessionId) return;

    const wsBase = (import.meta.env.VITE_API_URL || '/api').replace('/api', '');
    const wsUrl = wsBase.startsWith('http')
      ? wsBase + '/ws'
      : window.location.origin + '/ws';

    const stomp = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 3000,
      onConnect: () => {
        stomp.subscribe(`/topic/session.${sessionId}.events`, (frame) => {
          try {
            const event = JSON.parse(frame.body);
            setEvents(prev => [...prev, event]);

            if (event.type === 'SESSION_ENDED') {
              onSessionEnded?.();
            }
            if (event.type === 'CUSTOMER_JOINED') {
              onCustomerJoined?.(event.customerName);
            }
          } catch (_) {}
        });
      },
      onStompError: (frame) => console.warn('[SessionEvents] STOMP error:', frame),
    });

    stomp.activate();
    stompRef.current = stomp;

    return () => stomp.deactivate();
  }, [sessionId, onSessionEnded, onCustomerJoined]);

  return { events };
}
