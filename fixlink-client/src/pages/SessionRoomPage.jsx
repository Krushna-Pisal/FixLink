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
  }, [sessionId, toast]);

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
            <button
              id="endSessionBtn"
              onClick={handleEndSession}
              disabled={ending || session.status === 'ENDED'}
              className="btn-danger"
            >
              {ending ? 'Ending…' : 'End Session'}
            </button>
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
    </div>
  );
}
