import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Zap, PhoneOff, CheckCircle2, XCircle, Star } from 'lucide-react';
import client from '../api/client';
import { useStompChat } from '../hooks/useStompChat';
import { useLiveKit } from '../hooks/useLiveKit';
import { useSessionEvents } from '../hooks/useSessionEvents';
import { ChatPanel } from '../components/chat/ChatPanel';
import { VideoGrid } from '../components/session/VideoGrid';
import { ControlBar } from '../components/session/ControlBar';
import { Spinner } from '../components/ui/Spinner';

function FeedbackModal({ onClose, onConfirm }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating');
      return;
    }
    setLoading(true);
    try {
      await onConfirm({ rating, feedback: feedback.trim() });
      onClose();
    } catch (err) {
      setError('Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-fl-surface border border-fl-border rounded-xl w-full max-w-md animate-fade-in p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-fl-primary mb-2">End Support Session</h2>
        <p className="text-xs text-fl-muted mb-4">We value your feedback. Please rate your session and let us know how it went.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center py-2">
            <label className="block text-xs text-fl-muted mb-2">Your Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = hoverRating ? star <= hoverRating : star <= rating;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      setRating(star);
                      setError('');
                    }}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 hover:scale-110 transition-transform duration-150"
                  >
                    <Star
                      size={32}
                      className={isFilled ? "text-amber-400 fill-amber-400" : "text-fl-muted"}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs text-fl-muted mb-1">Feedback / Reason for ending</label>
            <textarea
              className="w-full bg-fl-bg border border-fl-border rounded-lg p-2.5 text-sm text-fl-primary focus:outline-none focus:border-fl-accent min-h-[80px]"
              placeholder="Tell us what went well or what we can improve..."
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
            />
          </div>

          {error && <p className="text-fl-danger text-xs text-center bg-fl-danger/10 border border-fl-danger/20 rounded py-1">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Back to Session</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 bg-fl-danger border-fl-danger hover:bg-red-600">
              {loading ? 'Submitting…' : 'Submit & End'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Shown when the invite link is bad or the session is gone
function InvalidInviteState({ onRetry }) {
  return (
    <div className="bg-fl-surface border border-fl-border rounded-xl p-8 text-center space-y-4">
      <div className="w-12 h-12 rounded-full bg-fl-danger/10 flex items-center justify-center mx-auto">
        <svg className="w-6 h-6 text-fl-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-fl-primary">Session unavailable</h2>
        <p className="text-sm text-fl-muted mt-1">
          This support session may have expired or the invite link is invalid.
        </p>
      </div>
      <div className="flex gap-3 justify-center pt-2">
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm border border-fl-border text-fl-muted rounded-lg hover:border-fl-accent hover:text-fl-accent transition-colors"
        >
          Try again
        </button>
        <a
          href="/"
          className="px-4 py-2 text-sm bg-fl-accent text-white rounded-lg hover:bg-blue-500 transition-colors"
        >
          Go home
        </a>
      </div>
    </div>
  );
}

// ── Session Ended Screen ─────────────────────────────────────────────────────
function SessionEndedScreen({ sessionCode, submittedRating, submittedFeedback, onSubmitFeedback }) {
  const [localRating, setLocalRating] = useState(0);
  const [localHover, setLocalHover] = useState(0);
  const [localFeedback, setLocalFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLocalSubmit = async (e) => {
    e.preventDefault();
    if (localRating === 0) return;
    setLoading(true);
    try {
      await onSubmitFeedback({ rating: localRating, feedback: localFeedback.trim() });
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-fl-bg p-4">
      <div className="text-center max-w-sm w-full animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-fl-success/15 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={32} className="text-fl-success" />
        </div>
        <h1 className="text-xl font-semibold text-fl-primary">Session Ended</h1>
        {sessionCode && (
          <p className="font-mono text-xs text-fl-muted mt-1">{sessionCode}</p>
        )}
        <p className="text-fl-muted text-sm mt-3 leading-relaxed">
          The support session has ended. <br />
          Thank you for using FixLink!
        </p>

        {submittedRating > 0 ? (
          <div className="mt-5 p-4 bg-fl-success/5 border border-fl-success/10 rounded-xl space-y-2">
            <p className="text-xs text-fl-muted font-medium">Your Feedback</p>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={18}
                  className={star <= submittedRating ? "text-amber-400 fill-amber-400" : "text-fl-muted"}
                />
              ))}
            </div>
            {submittedFeedback && (
              <p className="text-sm text-fl-primary italic">"{submittedFeedback}"</p>
            )}
          </div>
        ) : (
          <form onSubmit={handleLocalSubmit} className="mt-5 p-4 bg-fl-surface border border-fl-border rounded-xl space-y-3 text-left">
            <p className="text-xs text-fl-muted font-medium text-center">Rate this session</p>
            <div className="flex justify-center gap-1.5 py-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = localHover ? star <= localHover : star <= localRating;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setLocalRating(star)}
                    onMouseEnter={() => setLocalHover(star)}
                    onMouseLeave={() => setLocalHover(0)}
                    className="p-0.5 hover:scale-110 transition-transform"
                  >
                    <Star
                      size={24}
                      className={isFilled ? "text-amber-400 fill-amber-400" : "text-fl-muted"}
                    />
                  </button>
                );
              })}
            </div>
            <div>
              <label className="block text-[10px] text-fl-muted mb-0.5">Comments / Cancellation reason</label>
              <textarea
                className="w-full bg-fl-bg border border-fl-border rounded-lg p-2 text-xs text-fl-primary focus:outline-none focus:border-fl-accent min-h-[60px]"
                placeholder="How was the call? Or reason for ending..."
                value={localFeedback}
                onChange={e => setLocalFeedback(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={localRating === 0 || loading}
              className="w-full btn-primary py-1.5 text-xs font-semibold"
            >
              {loading ? 'Submitting…' : 'Submit Feedback'}
            </button>
          </form>
        )}

        <div className="mt-6 flex items-center justify-center gap-2 text-fl-muted text-xs">
          <PhoneOff size={14} />
          <span>You may close this window.</span>
        </div>
      </div>
    </div>
  );
}

// ── Session Cancelled Screen ─────────────────────────────────────────────────
function SessionCancelledScreen({ sessionCode, reason }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-fl-bg p-4">
      <div className="text-center max-w-sm animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-fl-danger/15 flex items-center justify-center mx-auto mb-5">
          <XCircle size={32} className="text-fl-danger" />
        </div>
        <h1 className="text-xl font-semibold text-fl-primary">Session Cancelled</h1>
        {sessionCode && (
          <p className="font-mono text-xs text-fl-muted mt-1">{sessionCode}</p>
        )}
        <p className="text-fl-muted text-sm mt-3 leading-relaxed">
          The support agent has cancelled this session.
        </p>
        {reason && (
          <div className="mt-4 bg-fl-danger/5 border border-fl-danger/10 rounded-lg p-3">
            <p className="text-xs text-fl-muted mb-0.5">Reason</p>
            <p className="text-sm text-fl-primary italic">{reason}</p>
          </div>
        )}
        <div className="mt-6 flex items-center justify-center gap-2 text-fl-muted text-xs">
          <PhoneOff size={14} />
          <span>You may close this window.</span>
        </div>
      </div>
    </div>
  );
}


// ── Main JoinPage ────────────────────────────────────────────────────────────
export default function JoinPage() {
  const { token } = useParams();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false); // true after a failed join attempt
  const [session, setSession] = useState(null);
  const [joined, setJoined] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [sessionCancelled, setSessionCancelled] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [submittedRating, setSubmittedRating] = useState(0);
  const [submittedFeedback, setSubmittedFeedback] = useState('');

  // Called by useSessionEvents when backend broadcasts SESSION_ENDED
  const handleSessionEnded = useCallback(() => {
    setSessionEnded(true);
    // Disconnect LiveKit immediately so camera/mic are released
    if (liveKit.room) {
      try { liveKit.room.disconnect(); } catch (_) {}
    }
  }, []);

  // Called by useSessionEvents when backend broadcasts SESSION_CANCELLED
  const handleSessionCancelled = useCallback((reason) => {
    setSessionCancelled(true);
    setCancellationReason(reason || '');
    if (liveKit.room) {
      try { liveKit.room.disconnect(); } catch (_) {}
    }
  }, []);

  const chat = useStompChat(session?.id, name, 'CUSTOMER');
  const liveKit = useLiveKit(session?.id, session?.livekitRoomName, name);

  const handleSubmitFeedback = async ({ rating, feedback }) => {
    try {
      await client.post(`/sessions/join/${token}/end`, { rating, feedback });
      setSubmittedRating(rating);
      setSubmittedFeedback(feedback);
      setSessionEnded(true);
      if (liveKit.room) {
        try { liveKit.room.disconnect(); } catch (_) {}
      }
    } catch (e) {
      console.error('Failed to submit feedback', e);
      throw e;
    }
  };

  // Subscribe to session system events (only once we've joined)
  useSessionEvents(joined ? session?.id : null, {
    onSessionEnded: handleSessionEnded,
    onSessionCancelled: handleSessionCancelled,
  });

  // Check session validity on load
  useEffect(() => {
    client.get(`/sessions/join/${token}`)
      .then(({ data }) => {
        const s = data?.data || data;
        if (s?.status === 'ENDED') setSessionEnded(true);
        if (s?.status === 'CANCELLED') {
          setSessionCancelled(true);
          setCancellationReason(s.cancellationReason || '');
        }
      })
      .catch(() => setError('Invalid or expired invite link'));
  }, [token]);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('Please enter your name');

    // Don't let someone open the same invite in two tabs at once
    const existing = sessionStorage.getItem('fl_customer');
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        if (parsed.inviteToken === token) {
          setError('duplicate_tab');
          return;
        }
      } catch (_) {}
    }

    setLoading(true);
    setError('');
    try {
      const { data } = await client.post(`/sessions/join/${token}`, { customerName: name.trim() });
      const sessionData = data.data || data;
      // Remember this session so duplicate tabs can be caught
      sessionStorage.setItem('fl_customer', JSON.stringify({
        name,
        role: 'CUSTOMER',
        sessionId: sessionData.id,
        inviteToken: token,
      }));
      setSession(sessionData);
      setJoined(true);
    } catch (e) {
      setError(e.response?.data?.message || 'Invalid or expired invite link');
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  // ── Session cancelled (real-time notification or on load) ──
  if (sessionCancelled) {
    return <SessionCancelledScreen sessionCode={session?.sessionCode} reason={cancellationReason} />;
  }

  // ── Session ended (real-time notification) ──
  if (sessionEnded) {
    return (
      <SessionEndedScreen
        sessionCode={session?.sessionCode}
        submittedRating={submittedRating}
        submittedFeedback={submittedFeedback}
        onSubmitFeedback={handleSubmitFeedback}
      />
    );
  }

  // ── In-session room view ──
  if (joined && session) {
    return (
      <div className="h-screen flex flex-col bg-fl-bg overflow-hidden">
        {/* Customer top bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-fl-border bg-fl-surface">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-fl-accent rounded flex items-center justify-center">
              <Zap size={11} className="text-white" fill="white" />
            </div>
            <span className="font-mono text-xs text-fl-muted">{session.sessionCode}</span>
            <span className="text-fl-primary text-sm font-medium">{session.issueTitle}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-fl-muted">
              Joined as <span className="text-fl-primary font-medium">{name}</span>
            </span>
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="px-3 py-1 text-xs font-semibold text-white bg-fl-danger hover:bg-red-600 rounded-md transition-colors"
            >
              End Session
            </button>
          </div>
        </div>

        <div className="flex flex-1 min-h-0 flex-col md:flex-row">
          <div className="flex-1 flex flex-col min-h-0">
            <VideoGrid
              liveKit={liveKit}
              session={session}
              participantName={name}
            />
            <ControlBar liveKit={liveKit} isAgent={false} />
          </div>
          <ChatPanel
            sessionId={session.id}
            chat={chat}
            participantName={name}
          />
        </div>

        {showFeedbackModal && (
          <FeedbackModal
            onClose={() => setShowFeedbackModal(false)}
            onConfirm={handleSubmitFeedback}
          />
        )}
      </div>
    );
  }

  // After a failed join attempt, show the premium error screen instead of the form
  if (submitted && error && error !== 'duplicate_tab') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fl-bg p-4">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(#3B82F6 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-fl-accent rounded-xl mb-4 shadow-lg shadow-fl-accent/20">
              <Zap size={22} className="text-white" fill="white" />
            </div>
            <h1 className="text-2xl font-bold text-fl-primary">FixLink</h1>
          </div>
          <InvalidInviteState onRetry={() => { setError(''); setSubmitted(false); }} />
        </div>
      </div>
    );
  }

  // ── Join form ──
  return (
    <div className="min-h-screen flex items-center justify-center bg-fl-bg p-4">
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'radial-gradient(#3B82F6 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-fl-accent rounded-xl mb-4 shadow-lg shadow-fl-accent/20">
            <Zap size={22} className="text-white" fill="white" />
          </div>
          <h1 className="text-2xl font-bold text-fl-primary">FixLink</h1>
          <p className="text-fl-muted text-sm mt-1">You've been invited to a support session</p>
        </div>

        <div className="bg-fl-surface border border-fl-border rounded-xl p-6 shadow-xl">
          {/* Duplicate tab warning — separate from generic errors */}
          {error === 'duplicate_tab' && (
            <div className="mb-4 p-4 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-400 text-sm text-center">
              You are already connected from another tab. Please use your existing session window.
            </div>
          )}
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-xs text-fl-muted mb-1">Your name</label>
              <input
                id="customerName"
                className="input-base"
                placeholder="e.g. John Smith"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
              />
              {error && error !== 'duplicate_tab' && (
                <p className="text-fl-danger text-xs mt-1.5 bg-fl-danger/10 border border-fl-danger/20 rounded px-2 py-1.5">
                  {error}
                </p>
              )}
            </div>
            <button
              id="joinBtn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? <><Spinner size="sm" className="inline mr-2" />Joining…</> : 'Join session'}
            </button>
          </form>
          <p className="text-xs text-fl-muted text-center mt-4">
            No account needed. Just enter your name to get started.
          </p>
        </div>
      </div>
    </div>
  );
}
