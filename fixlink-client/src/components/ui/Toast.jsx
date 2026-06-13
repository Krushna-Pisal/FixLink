import { useState, useEffect, createContext, useContext, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const icons = { success: '✓', error: '✕', info: 'i', warn: '!' };

  const colors = {
    success: 'bg-fl-success/10 border-fl-success/30 text-fl-success',
    error:   'bg-fl-danger/10  border-fl-danger/30  text-fl-danger',
    info:    'bg-fl-accent/10  border-fl-accent/30  text-fl-accent',
    warn:    'bg-fl-warn/10    border-fl-warn/30    text-fl-warn',
  };

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-lg border text-sm font-medium
              shadow-lg pointer-events-auto ${colors[t.type] || colors.info}`}
          >
            <span className="shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold">
              {icons[t.type] || icons.info}
            </span>
            <span className="text-fl-primary">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside a ToastProvider');
  return ctx;
}
