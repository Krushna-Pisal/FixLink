import { Mic, MicOff, Video, VideoOff, Phone } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';

export function ControlBar({ liveKit, onEndSession, isAgent, isEnding }) {
  const { muted, videoOff, toggleMute, toggleVideo } = liveKit;

  return (
    <div className="flex items-center justify-center gap-3 py-4 px-6 bg-fl-surface border-t border-fl-border">
      <Tooltip content={muted ? 'Unmute' : 'Mute'}>
        <button
          onClick={toggleMute}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            muted
              ? 'bg-fl-danger text-white hover:bg-fl-danger/80'
              : 'bg-fl-border text-fl-muted hover:bg-fl-border/70 hover:text-fl-primary'
          }`}
        >
          {muted ? <MicOff size={17} /> : <Mic size={17} />}
        </button>
      </Tooltip>

      <Tooltip content={videoOff ? 'Turn on camera' : 'Turn off camera'}>
        <button
          onClick={toggleVideo}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            videoOff
              ? 'bg-fl-danger text-white hover:bg-fl-danger/80'
              : 'bg-fl-border text-fl-muted hover:bg-fl-border/70 hover:text-fl-primary'
          }`}
        >
          {videoOff ? <VideoOff size={17} /> : <Video size={17} />}
        </button>
      </Tooltip>

      {isAgent && (
        <Tooltip content="End session">
          <button
            onClick={onEndSession}
            disabled={isEnding}
            className="w-10 h-10 rounded-full bg-fl-danger flex items-center justify-center text-white hover:bg-red-600 transition-colors disabled:opacity-50 ml-2"
          >
            <Phone size={17} className="rotate-[135deg]" />
          </button>
        </Tooltip>
      )}
    </div>
  );
}
