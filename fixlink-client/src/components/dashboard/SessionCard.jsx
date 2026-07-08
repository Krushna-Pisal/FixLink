import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { Link2, Check } from 'lucide-react';

const statusVariant = { WAITING: 'warn', ACTIVE: 'success', ENDED: 'muted', CANCELLED: 'danger' };
const severityVariant = { LOW: 'success', MEDIUM: 'accent', HIGH: 'warn', CRITICAL: 'danger' };

export function SessionCard({ session, onClick, onCancel }) {
  const navigate = useNavigate();
  const isLive = session.status === 'ACTIVE';
  const isEnded = session.status === 'ENDED' || session.status === 'CANCELLED';
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    if (onClick) { onClick(session); return; }
    if (!isEnded) navigate(`/session/${session.id}`);
  };

  // Copy invite link — stops event from bubbling to the card's navigate handler
  const handleShare = (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/join/${session.inviteToken}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      onClick={handleClick}
      className={`group p-4 rounded-xl border bg-fl-surface/80 backdrop-blur-md transition-all duration-200 animate-fade-in
        ${!isEnded ? 'cursor-pointer' : 'cursor-default opacity-70'}
        ${isLive
          ? 'border-fl-success/30 shadow-glow-success hover:border-fl-success/50 hover:shadow-[0_0_20px_#22C55E18]'
          : isEnded
            ? 'border-fl-border'
            : 'border-fl-border hover:border-fl-accent/40 hover:shadow-[0_0_20px_#3B82F612]'
        }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs text-fl-muted">{session.sessionCode}</p>
          <p className="font-medium text-fl-primary mt-0.5 truncate">{session.issueTitle}</p>
          <p className="text-sm text-fl-muted mt-1">
            <span>{session.agentName}</span>
            {session.customerName && (
              <span className="text-fl-muted"> · {session.customerName}</span>
            )}
          </p>
          {session.status === 'CANCELLED' && session.cancellationReason && (
            <p className="text-xs text-fl-danger mt-2 italic bg-fl-danger/5 border border-fl-danger/10 rounded-lg p-2">
              Reason: {session.cancellationReason}
            </p>
          )}
          {session.status === 'ENDED' && session.rating && (
            <div className="mt-2.5 flex flex-col gap-1 bg-fl-success/5 border border-fl-success/10 rounded-lg p-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-3.5 h-3.5 ${star <= session.rating ? 'text-amber-400 fill-amber-400' : 'text-fl-muted'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              {session.customerFeedback && (
                <p className="text-xs text-fl-muted italic mt-0.5">
                  "{session.customerFeedback}"
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          {isLive ? (
            <div className="live-badge">
              <div className="pulse-dot">
                <div className="pulse-dot-core" />
              </div>
              <Badge variant="success">LIVE</Badge>
            </div>
          ) : (
            <Badge variant={statusVariant[session.status] || 'default'}>
              {session.status}
            </Badge>
          )}
          {session.severity && (
            <Badge variant={severityVariant[session.severity] || 'accent'}>
              {session.severity}
            </Badge>
          )}
        </div>
      </div>

      {/* Share link / Cancel row — only visible on non-ended/non-cancelled sessions */}
      {!isEnded && (
        <div className="mt-3 pt-3 border-t border-fl-border/60 flex items-center justify-between gap-2">
          <p className="text-xs text-fl-muted font-mono truncate pr-2 max-w-[120px] sm:max-w-[200px]">
            /join/{session.inviteToken}
          </p>
          <div className="flex gap-1.5 flex-shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onCancel?.(session); }}
              className="text-xs px-2.5 py-1 border border-fl-danger/30 text-fl-danger bg-fl-danger/10 hover:bg-fl-danger/20 hover:border-fl-danger/50 rounded-lg transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleShare}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all duration-200
                ${copied
                  ? 'border-fl-success/40 text-fl-success bg-fl-success/10'
                  : 'border-fl-accent/30 text-fl-accent bg-fl-accent/10 hover:bg-fl-accent/20 hover:border-fl-accent/50'
                }`}
            >
              {copied
                ? <><Check size={11} /> Copied!</>
                : <><Link2 size={11} /> Share link</>
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
