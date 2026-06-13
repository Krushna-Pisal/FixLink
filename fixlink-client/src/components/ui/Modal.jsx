import { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({ children, onClose, title, maxWidth = 'max-w-2xl' }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-fl-surface border border-fl-border rounded-xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto animate-fade-in`}>
        {title && (
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-fl-border">
            <h2 className="text-lg font-semibold text-fl-primary">{title}</h2>
            <button onClick={onClose} className="text-fl-muted hover:text-fl-primary transition-colors">
              <X size={18} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
