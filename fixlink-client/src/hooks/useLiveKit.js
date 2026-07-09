import { useEffect, useRef, useState, useCallback } from 'react';
import { Room, RoomEvent, Track } from 'livekit-client';
import client from '../api/client';

export function useLiveKit(sessionId, roomName, participantName) {
  const roomRef = useRef(null);
  const [participants, setParticipants] = useState([]);
  const [localTracks, setLocalTracks] = useState([]);
  const [connected, setConnected] = useState(false);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [error, setError] = useState(null);

  const refreshParticipants = useCallback((room) => {
    setParticipants([...room.remoteParticipants.values()]);
  }, []);

  useEffect(() => {
    if (!roomName || !participantName) return;

    let cancelled = false;

    const connect = async () => {
      try {
        // Fetch LiveKit token from backend (public endpoint, no JWT needed for customers)
        const { data } = await client.post('/livekit/token', {
          roomName,
          participantName,
          sessionId,
        });

        const token = data?.data?.token || data?.token;
        if (!token) throw new Error('No LiveKit token received from server');

        let livekitUrl = data?.data?.livekitUrl || data?.livekitUrl;
        if (!livekitUrl) {
          livekitUrl = import.meta.env.VITE_LIVEKIT_URL || 'ws://localhost:7880';
        }

        const room = new Room({
          adaptiveStream: true,
          dynacast: true,
          // Request camera/mic permissions on connect
          videoCaptureDefaults: { resolution: { width: 1280, height: 720 } },
        });
        roomRef.current = room;

        room.on(RoomEvent.ParticipantConnected, () => refreshParticipants(room));
        room.on(RoomEvent.ParticipantDisconnected, () => refreshParticipants(room));
        room.on(RoomEvent.TrackSubscribed, () => refreshParticipants(room));
        room.on(RoomEvent.TrackUnsubscribed, () => refreshParticipants(room));
        room.on(RoomEvent.Disconnected, () => setConnected(false));
        room.on(RoomEvent.LocalTrackPublished, () => {
          const tracks = [];
          room.localParticipant.trackPublications.forEach(pub => {
            if (pub.track) tracks.push(pub.track);
          });
          setLocalTracks(tracks);
        });

        console.log('[LiveKit] Connecting to', livekitUrl, 'room:', roomName);

        // Connect with camera + mic enabled automatically
        await room.connect(livekitUrl, token, {
          autoSubscribe: true,
        });

        if (cancelled) { room.disconnect(); return; }

        console.log('[LiveKit] Connected. Publishing camera + mic...');

        // Enable camera and microphone through the room API (LiveKit v2 style)
        await room.localParticipant.enableCameraAndMicrophone();

        if (cancelled) { room.disconnect(); return; }

        // Collect published local tracks
        const publishedTracks = [];
        room.localParticipant.trackPublications.forEach(pub => {
          if (pub.track) publishedTracks.push(pub.track);
        });
        setLocalTracks(publishedTracks);
        refreshParticipants(room);
        setConnected(true);
        console.log('[LiveKit] Ready. Tracks:', publishedTracks.length);
      } catch (err) {
        console.error('[LiveKit] Connection failed:', err);
        setError(err.message);
      }
    };

    connect();
    return () => {
      cancelled = true;
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
    };
  }, [roomName, participantName, sessionId, refreshParticipants]);

  const toggleMute = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    try {
      // LiveKit v2: use setMicrophoneEnabled
      await room.localParticipant.setMicrophoneEnabled(muted); // muted=true means currently muted → enable
      setMuted(m => !m);
    } catch (e) {
      console.warn('[LiveKit] toggleMute error:', e);
    }
  }, [muted]);

  const toggleVideo = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    try {
      await room.localParticipant.setCameraEnabled(videoOff); // videoOff=true means currently off → enable
      setVideoOff(v => !v);
    } catch (e) {
      console.warn('[LiveKit] toggleVideo error:', e);
    }
  }, [videoOff]);

  return {
    room: roomRef.current,
    localParticipant: roomRef.current?.localParticipant,
    participants,
    localTracks,
    connected,
    muted,
    videoOff,
    error,
    toggleMute,
    toggleVideo,
  };
}
