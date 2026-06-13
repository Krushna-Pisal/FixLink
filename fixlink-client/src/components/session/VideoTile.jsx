import { useEffect, useRef } from 'react';
import { Track } from 'livekit-client';

export function VideoTile({ participant, isLocal, localParticipant, localTracks, isMuted, isVideoOff, label }) {
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const target = isLocal ? localParticipant : participant;
    if (!target) return;

    // Keep a live list of what we've attached so we can clean up properly
    const attached = [];

    const attach = () => {
      // Detach anything from a previous run before re-attaching
      attached.forEach(({ track, el }) => { try { track.detach(el); } catch (_) {} });
      attached.length = 0;

      target.trackPublications.forEach(pub => {
        if (!pub.track) return;

        if (pub.track.kind === Track.Kind.Video && videoRef.current) {
          pub.track.attach(videoRef.current);
          attached.push({ track: pub.track, el: videoRef.current });
        }
        if (pub.track.kind === Track.Kind.Audio && audioRef.current && !isLocal) {
          pub.track.attach(audioRef.current);
          attached.push({ track: pub.track, el: audioRef.current });
        }
      });
    };

    // Initial attach attempt (may be empty if tracks not yet subscribed)
    attach();

    // For remote participants: re-attach whenever a new track arrives or disappears.
    // This is the fix — trackSubscribed fires after the initial effect, so without
    // this listener the agent's video never appears on the customer side.
    if (!isLocal && target.on) {
      target.on('trackSubscribed',   attach);
      target.on('trackUnsubscribed', attach);
    }

    return () => {
      if (!isLocal && target.off) {
        target.off('trackSubscribed',   attach);
        target.off('trackUnsubscribed', attach);
      }
      attached.forEach(({ track, el }) => { try { track.detach(el); } catch (_) {} });
    };

  // localTracks triggers re-run for local video (same-ref problem as above but local)
  }, [participant, isLocal, localParticipant, localTracks]);


  const displayName = label || (isLocal ? 'You' : participant?.name || participant?.identity || '?');
  const showAvatar = isLocal ? isVideoOff : false;

  return (
    <div className="relative rounded-lg overflow-hidden bg-fl-surface border border-fl-border aspect-video flex items-center justify-center">
      <video
        ref={videoRef}
        autoPlay
        muted={isLocal}
        playsInline
        className={`w-full h-full object-cover ${showAvatar ? 'opacity-0' : 'opacity-100'} transition-opacity`}
      />
      {!isLocal && <audio ref={audioRef} autoPlay />}

      {/* Avatar fallback when video is off or not connected */}
      {showAvatar && (
        <div className="absolute inset-0 flex items-center justify-center bg-fl-surface">
          <div className="w-16 h-16 rounded-full bg-fl-border flex items-center justify-center text-3xl font-bold text-fl-muted">
            {displayName[0]?.toUpperCase() || '?'}
          </div>
        </div>
      )}

      {/* Name label */}
      <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
        <span className="bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded font-medium">
          {displayName}{isLocal ? ' (You)' : ''}
        </span>
        {isLocal && isMuted && (
          <span className="bg-fl-danger/80 text-white text-xs px-1.5 py-0.5 rounded">🔇</span>
        )}
      </div>
    </div>
  );
}
