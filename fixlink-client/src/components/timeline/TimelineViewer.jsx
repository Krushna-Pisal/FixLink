import {
  UserPlus, UserMinus, MicOff, Mic, Video, VideoOff,
  MessageSquare, XCircle, PlayCircle
} from 'lucide-react';

const eventConfig = {
  JOINED: { icon: UserPlus, color: 'text-fl-success', label: 'Joined' },
  LEFT: { icon: UserMinus, color: 'text-fl-danger', label: 'Left' },
  MUTED: { icon: MicOff, color: 'text-fl-warn', label: 'Muted' },
  UNMUTED: { icon: Mic, color: 'text-fl-success', label: 'Unmuted' },
  VIDEO_ON: { icon: Video, color: 'text-fl-success', label: 'Camera on' },
  VIDEO_OFF: { icon: VideoOff, color: 'text-fl-warn', label: 'Camera off' },
  MESSAGE_SENT: { icon: MessageSquare, color: 'text-fl-muted', label: 'Message sent' },
  SESSION_ENDED: { icon: XCircle, color: 'text-fl-danger', label: 'Session ended' },
  SESSION_STARTED: { icon: PlayCircle, color: 'text-fl-accent', label: 'Session started' },
};

function formatTime(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function TimelineViewer({ events }) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-6 text-fl-muted text-xs">
        No events yet in this session.
      </div>
    );
  }

  return (
    <div className="relative pl-4">
      {/* Vertical line */}
      <div className="absolute left-4 top-2 bottom-2 w-px bg-fl-border" />

      <div className="space-y-3">
        {events.map((event, i) => {
          const config = eventConfig[event.type] || eventConfig.MESSAGE_SENT;
          const Icon = config.icon;

          return (
            <div key={event.id || i} className="relative flex items-start gap-3 pl-4">
              {/* Node dot */}
              <div className={`absolute -left-2.5 top-1 w-5 h-5 rounded-full bg-fl-surface border border-fl-border flex items-center justify-center ${config.color}`}>
                <Icon size={10} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs text-fl-primary">
                  <span className="font-medium">{event.actorName}</span>
                  {' '}
                  <span className="text-fl-muted">{config.label}</span>
                </p>
                {event.detail && (
                  <p className="text-xs text-fl-muted mt-0.5">{event.detail}</p>
                )}
                <p className="text-xs text-fl-muted/60 mt-0.5 font-mono">
                  {formatTime(event.occurredAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
