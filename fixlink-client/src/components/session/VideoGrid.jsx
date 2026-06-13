import { VideoTile } from './VideoTile';
import { useAuthStore } from '../../store/authStore';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';

export function VideoGrid({ liveKit, session, participantName }) {
  const { user } = useAuthStore();
  const { localParticipant, participants, connected, muted, videoOff, error, localTracks } = liveKit;

  const localName = participantName || user?.displayName || user?.name || 'You';

  return (
    <div className="flex-1 p-4 overflow-auto bg-fl-bg flex flex-col gap-3">
      {/* Status bar */}
      <div className="flex items-center gap-2 text-xs px-1">
        {error ? (
          <div className="flex items-center gap-1.5 text-fl-warn">
            <AlertTriangle size={13} />
            <span>Video unavailable: {error}</span>
          </div>
        ) : connected ? (
          <div className="flex items-center gap-1.5 text-fl-success">
            <Wifi size={13} />
            <span>Video connected</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-fl-muted">
            <WifiOff size={13} />
            <span>Connecting to video… (allow camera/mic if prompted)</span>
          </div>
        )}
      </div>

      {/* Video grid */}
      <div className={`grid gap-3 flex-1 ${
        participants.length === 0
          ? 'grid-cols-1'
          : participants.length === 1
            ? 'grid-cols-2'
            : 'grid-cols-2 grid-rows-2'
      }`}>
        {/* Local video — always render, even while connecting */}
        <VideoTile
          isLocal
          localParticipant={localParticipant}
          localTracks={localTracks}
          isMuted={muted}
          isVideoOff={videoOff}
          label={localName}
        />

        {/* Remote participants */}
        {participants.map((participant) => (
          <VideoTile
            key={participant.identity}
            participant={participant}
            label={participant.name || participant.identity}
          />
        ))}
      </div>
    </div>
  );
}
