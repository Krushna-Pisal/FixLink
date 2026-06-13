import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Zap } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register, loading, error } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', displayName: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = mode === 'login'
      ? await login(form.email, form.password)
      : await register(form.email, form.password, form.displayName);
    if (success) navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'var(--fl-bg)' }}>

      {/* iOS-style blurred orbs in the background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, #3B82F6, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #8B5CF6, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #22C55E, transparent 70%)', filter: 'blur(50px)' }} />
      </div>

      <div className="relative w-full max-w-sm animate-fade-in">

        {/* Logo mark */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 relative"
            style={{
              background: 'linear-gradient(140deg, #4F94FF, #2563EB)',
              boxShadow: '0 0 0 1px rgba(59,130,246,0.5), 0 8px 32px rgba(59,130,246,0.35)',
            }}>
            <Zap size={24} className="text-white" fill="white" />
            {/* Subtle inner highlight */}
            <div className="absolute inset-0 rounded-2xl"
              style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.2) 0%, transparent 60%)' }} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--fl-text-primary)' }}>FixLink</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--fl-text-muted)' }}>See the problem. Fix it faster.</p>
        </div>

        {/* Glass card */}
        <div className="rounded-2xl p-6 animate-scale-in"
          style={{
            background: 'rgba(18,22,32,0.75)',
            backdropFilter: 'blur(32px) saturate(180%)',
            WebkitBackdropFilter: 'blur(32px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: '0 1px 0 rgba(255,255,255,0.08) inset, 0 24px 48px rgba(0,0,0,0.4)',
          }}>

          {/* iOS-style segment switcher */}
          <div className="flex p-1 rounded-xl mb-5 gap-1"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="flex-1 py-1.5 text-sm rounded-lg font-medium transition-all duration-200"
                style={mode === m ? {
                  background: 'rgba(255,255,255,0.10)',
                  color: 'var(--fl-text-primary)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                } : {
                  color: 'var(--fl-text-muted)',
                }}
              >
                {m === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <div className="animate-fade-in">
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--fl-text-muted)' }}>
                  Display name
                </label>
                <input id="displayName" className="input-base" placeholder="e.g. Alex Chen"
                  value={form.displayName}
                  onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                  required />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--fl-text-muted)' }}>Email</label>
              <input id="email" type="email" className="input-base" placeholder="agent@fixlink.dev"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--fl-text-muted)' }}>Password</label>
              <input id="password" type="password" className="input-base" placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required />
            </div>

            {error && (
              <div className="animate-fade-in px-3 py-2.5 rounded-xl text-xs"
                style={{
                  background: 'rgba(239,68,68,0.10)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  color: 'var(--fl-danger)',
                }}>
                {error}
              </div>
            )}

            <button id="submitBtn" type="submit" disabled={loading} className="btn-primary w-full mt-1">
              {loading
                ? (mode === 'login' ? 'Signing in…' : 'Creating account…')
                : (mode === 'login' ? 'Sign in' : 'Create account')}
            </button>
          </form>

          <div className="ios-separator mt-4 mb-3" />
          <p className="text-center text-xs" style={{ color: 'var(--fl-text-muted)' }}>
            Demo: <span className="font-mono" style={{ color: 'var(--fl-accent)' }}>agent@fixlink.dev / fix1234</span>
          </p>
        </div>
      </div>
    </div>
  );
}
