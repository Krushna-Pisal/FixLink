import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { Link2, Check } from 'lucide-react';

const statusVariant = { WAITING: 'warn', ACTIVE: 'success', ENDED: 'muted' };
const severityVariant = { LOW: 'success', MEDIUM: 'accent', HIGH: 'warn', CRITICAL: 'danger' };

export function SessionCard({ session, onClick }) {
  const navigate = useNavigate();
  const isLive = session.status === 'ACTIVE';
  const isEnded = session.status === 'ENDED';
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

      {/* Share link row — only visible on non-ended sessions */}
      {!isEnded && (
        <div className="mt-3 pt-3 border-t border-fl-border/60 flex items-center justify-between">
          <p className="text-xs text-fl-muted font-mono truncate pr-2 max-w-[200px]">
            /join/{session.inviteToken}
          </p>
          <button
            onClick={handleShare}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all duration-200 flex-shrink-0
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
      )}
    </div>
  );
}
