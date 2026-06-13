import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import client from '../api/client';

export function useStompChat(sessionId, senderName, senderRole) {
  const stompRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    // Load history first
    client.get(`/sessions/${sessionId}/chat`)
      .then(({ data }) => setMessages(Array.isArray(data) ? data : []))
      .catch(() => {});

    const wsBase = (import.meta.env.VITE_API_URL || '/api').replace('/api', '');
    const wsUrl = wsBase.startsWith('http')
      ? wsBase + '/ws'
      : window.location.origin + '/ws';

    const stomp = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 3000,
      onConnect: () => {
        setConnected(true);
        stomp.subscribe(`/topic/session.${sessionId}.chat`, (frame) => {
          const msg = JSON.parse(frame.body);
          setMessages(prev => [...prev, msg]);
        });
      },
      onDisconnect: () => setConnected(false),
      onStompError: (frame) => console.warn('STOMP error:', frame),
    });

    stomp.activate();
    stompRef.current = stomp;

    return () => stomp.deactivate();
  }, [sessionId]);

  const sendMessage = useCallback((content) => {
    if (!stompRef.current?.connected || !content.trim()) return;
    stompRef.current.publish({
      destination: `/app/session.${sessionId}.chat`,
      body: JSON.stringify({
        senderName,
        role: senderRole,
        content: content.trim(),
      }),
    });
  }, [sessionId, senderName, senderRole]);

  return { messages, sendMessage, connected };
}
