import { useEffect, useState, useCallback } from 'react';
import { SessionCard } from '../components/dashboard/SessionCard';
import { StatsRow } from '../components/dashboard/StatsRow';
import { SeverityChart } from '../components/dashboard/SeverityChart';
import { Spinner } from '../components/ui/Spinner';
import { useToast } from '../components/ui/Toast';
import { LayoutGrid, Plus, RefreshCw } from 'lucide-react';
import client from '../api/client';

const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

function CreateSessionModal({ onClose, onCreate }) {
  const [issueTitle, setIssueTitle] = useState('');
  const [severity, setSeverity] = useState('MEDIUM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!issueTitle.trim()) return setError('Please describe the issue');
    setLoading(true);
    try {
      const { data } = await client.post('/sessions/create', { issueTitle: issueTitle.trim(), severity });
      onCreate(data.data || data);
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-fl-surface border border-fl-border rounded-xl w-full max-w-md animate-fade-in p-6">
        <h2 className="text-lg font-semibold text-fl-primary mb-5">New Support Session</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs text-fl-muted mb-1">Issue description</label>
            <input
              id="issueTitle"
              className="input-base"
              placeholder='e.g. "Washing machine not draining"'
              value={issueTitle}
              onChange={e => setIssueTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs text-fl-muted mb-1">Severity</label>
            <div className="flex gap-2">
              {SEVERITIES.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSeverity(s)}
                  className={`flex-1 py-1.5 text-xs rounded-lg border font-medium transition-colors ${
                    severity === s
                      ? s === 'LOW' ? 'border-fl-success bg-fl-success/10 text-fl-success'
                        : s === 'HIGH' ? 'border-fl-warn bg-fl-warn/10 text-fl-warn'
                        : s === 'CRITICAL' ? 'border-fl-danger bg-fl-danger/10 text-fl-danger'
                        : 'border-fl-accent bg-fl-accent-soft text-fl-accent'
                      : 'border-fl-border text-fl-muted hover:border-fl-accent/30'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-fl-danger text-xs">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Creating…' : 'Create session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InviteBanner({ session, onDismiss }) {
  const inviteUrl = `${window.location.origin}/join/${session.inviteToken}`;
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-fl-accent-soft border border-fl-accent/30 rounded-lg p-4 flex items-start justify-between gap-3 animate-fade-in">
      <div className="min-w-0">
        <p className="text-sm font-medium text-fl-accent mb-1">Session created — share this link</p>
        <p className="font-mono text-xs text-fl-primary/80 truncate">{inviteUrl}</p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button onClick={copy} className="text-xs px-3 py-1.5 border border-fl-accent/40 text-fl-accent rounded-lg hover:bg-fl-accent/10 transition-colors">
          {copied ? 'Copied!' : 'Copy link'}
        </button>
        <button onClick={onDismiss} className="text-fl-muted hover:text-fl-primary text-sm">✕</button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [overview, setOverview] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashError, setDashError] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newSession, setNewSession] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const toast = useToast();

  const load = useCallback(async () => {
    try {
      const [ov, ss] = await Promise.all([
        client.get('/dashboard/overview'),
        client.get('/dashboard/sessions'),
      ]);
      setOverview(ov.data.data || ov.data);
      setSessions(ss.data.data || ss.data);
      setDashError(false);
    } catch (e) {
      setDashError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);

  const handleCreated = (session) => {
    setNewSession(session);
    setSessions(prev => [session, ...prev]);
    toast('Session created — share the invite link with your customer', 'success');
    load();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Spinner size="lg" />
    </div>
  );

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-fl-primary">Support Operations</h1>
          <p className="text-fl-muted text-sm mt-0.5">Real-time session overview</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setRefreshing(true); load(); }}
            disabled={refreshing}
            className="btn-ghost flex items-center gap-1.5 text-xs"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            id="newSessionBtn"
            onClick={() => setShowCreate(true)}
            className="btn-primary flex items-center gap-1.5"
          >
            <Plus size={15} />
            New session
          </button>
        </div>
      </div>

      {/* API load failure — shown just below the header */}
      {dashError && (
        <div className="p-4 rounded-lg bg-fl-danger/10 border border-fl-danger/30 text-sm text-fl-danger flex items-center gap-2">
          <span>⚠</span>
          <span>
            Failed to load dashboard data.{' '}
            <button onClick={() => { setRefreshing(true); load(); }} className="underline hover:no-underline">
              Retry
            </button>
          </span>
        </div>
      )}
      {newSession && (
        <InviteBanner session={newSession} onDismiss={() => setNewSession(null)} />
      )}

      {/* Stats */}
      {overview && <StatsRow data={overview} />}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sessions list */}
        <div className="lg:col-span-2 space-y-2.5">
          <p className="text-xs text-fl-muted uppercase tracking-wider font-medium">All Sessions</p>
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-fl-border rounded-xl">
              <div className="w-14 h-14 rounded-full bg-fl-accent/10 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-fl-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                </svg>
              </div>
              <p className="text-fl-primary font-medium">No support sessions yet</p>
              <p className="text-sm text-fl-muted mt-1 max-w-xs">
                Create a session and share the invite link with your customer to get started.
              </p>
            </div>
          ) : (
            sessions.map(s => <SessionCard key={s.id} session={s} />)
          )}
        </div>

        {/* Sidebar charts */}
        <div className="space-y-4">
          {overview && <SeverityChart data={overview.severityBreakdown} />}
        </div>
      </div>

      {/* Create modal */}
      {showCreate && (
        <CreateSessionModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreated}
        />
      )}
    </div>
  );
}
