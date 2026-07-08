import { useParams, useNavigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { VideoGrid } from '../components/session/VideoGrid';
import { ControlBar } from '../components/session/ControlBar';
import { ChatPanel } from '../components/chat/ChatPanel';
import { SummaryModal } from '../components/insights/SummaryModal';
import { TimelineViewer } from '../components/timeline/TimelineViewer';
import { SessionBadge } from '../components/session/SessionBadge';
import { ReconnectBanner } from '../components/ui/ReconnectBanner';
import { useLiveKit } from '../hooks/useLiveKit';
import { useStompChat } from '../hooks/useStompChat';
import { useTimeline } from '../hooks/useTimeline';
import { useSession } from '../hooks/useSession';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../components/ui/Toast';
import { FullPageSpinner } from '../components/ui/Spinner';
import client from '../api/client';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';

export default function SessionRoomPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { session, loading } = useSession(sessionId);
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState(null);
  const [ending, setEnding] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const toast = useToast();

  const participantName = user?.displayName || user?.name || 'Agent';
  const isAgent = user?.role === 'AGENT';

  const liveKit = useLiveKit(sessionId, session?.livekitRoomName, participantName);
  const chat = useStompChat(sessionId, participantName, user?.role || 'AGENT');
  const { events } = useTimeline(sessionId);

  const handleEndSession = useCallback(async () => {
    if (!window.confirm('End this support session?')) return;
    setEnding(true);
    try {
      await client.post(`/sessions/${sessionId}/end`);
      if (liveKit.room) {
        try { liveKit.room.disconnect(); } catch (_) {}
      }
      const { data } = await client.post(`/insights/${sessionId}/generate`);
      const raw = data?.data || data;

      // Backend returns a raw JSON string (not an object) — parse it.
      // Also strip markdown fences (```json ... ```) that Groq sometimes adds
      // despite being told not to.
      let parsed;
      try {
        const str = typeof raw === 'string' ? raw : JSON.stringify(raw);
        const cleaned = str
          .replace(/^```(?:json)?\s*/i, '')
          .replace(/\s*```$/, '')
          .trim();
        parsed = JSON.parse(cleaned);
      } catch (_) {
        // If it's somehow already an object (shouldn't happen), use it as-is
        parsed = typeof raw === 'object' ? raw : {};
      }

      setSummary(parsed);
      setShowSummary(true);
    } catch (e) {
      toast(e.response?.data?.message || 'Failed to end session — please try again', 'error');
    } finally {
      setEnding(false);
    }
  }, [sessionId, toast, liveKit.room]);

  const handleCancelSession = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) return;
    setCancelling(true);
    try {
      if (liveKit.room) {
        try { liveKit.room.disconnect(); } catch (_) {}
      }
      await client.post(`/sessions/${sessionId}/cancel`, { reason: cancelReason.trim() });
      toast('Session cancelled successfully', 'info');
      setShowCancelModal(false);
      navigate('/');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to cancel session', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const handleSummaryClose = () => {
    setShowSummary(false);
    navigate('/');
  };

  if (loading || !session) return <FullPageSpinner />;

  return (
    <div className="h-screen flex flex-col bg-fl-bg overflow-hidden">
      {/* Shows a banner at the top if the user loses internet mid-session */}
      <ReconnectBanner />
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-fl-border bg-fl-surface flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-mono text-xs text-fl-muted flex-shrink-0">{session.sessionCode}</span>
          <span className="text-fl-primary font-medium truncate">{session.issueTitle}</span>
          <SessionBadge session={session} />
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setShowTimeline(s => !s)}
            className="btn-ghost flex items-center gap-1 text-xs"
          >
            <Clock size={13} />
            Timeline
            {showTimeline ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {isAgent && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowCancelModal(true)}
                disabled={ending || cancelling || session.status === 'ENDED'}
                className="btn-ghost text-fl-danger border border-fl-danger/20 hover:bg-fl-danger/10 text-xs px-3 py-1.5 rounded-lg"
              >
                Cancel Session
              </button>
              <button
                id="endSessionBtn"
                onClick={handleEndSession}
                disabled={ending || cancelling || session.status === 'ENDED'}
                className="btn-danger text-xs px-3 py-1.5 rounded-lg"
              >
                {ending ? 'Ending…' : 'End Session'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Timeline drawer (collapsible) */}
      {showTimeline && (
        <div className="border-b border-fl-border bg-fl-surface px-5 py-3 max-h-44 overflow-y-auto">
          <TimelineViewer events={events} />
        </div>
      )}

      {/* Main room layout */}
      <div className="flex flex-1 min-h-0 flex-col md:flex-row">
        {/* Video + controls */}
        <div className="flex-1 flex flex-col min-h-0">
          <VideoGrid liveKit={liveKit} session={session} participantName={participantName} />
          <ControlBar
            liveKit={liveKit}
            isAgent={isAgent}
            onEndSession={handleEndSession}
            isEnding={ending}
          />
        </div>

        {/* Chat panel */}
        <ChatPanel
          sessionId={sessionId}
          chat={chat}
          participantName={participantName}
        />
      </div>

      {/* AI Summary modal */}
      {showSummary && (
        <SummaryModal
          summary={summary}
          sessionCode={session.sessionCode}
          onClose={handleSummaryClose}
        />
      )}

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-fl-surface border border-fl-border rounded-xl w-full max-w-md animate-fade-in p-6">
            <h2 className="text-lg font-semibold text-fl-danger mb-2">Cancel Support Session</h2>
            <p className="text-xs text-fl-muted mb-4">Please provide a reason for cancelling this session. The customer will see this message.</p>
            <form onSubmit={handleCancelSession} className="space-y-4">
              <div>
                <label className="block text-xs text-fl-muted mb-1">Reason for cancellation</label>
                <input
                  id="cancelReasonInput"
                  className="input-base"
                  placeholder='e.g. "Scheduled by mistake" or "Customer did not join"'
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowCancelModal(false)} className="btn-ghost flex-1">Keep Session</button>
                <button type="submit" disabled={cancelling} className="btn-primary bg-fl-danger border-fl-danger hover:bg-red-600 flex-1">
                  {cancelling ? 'Cancelling…' : 'Cancel Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
