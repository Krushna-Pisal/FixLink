import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-fl-bg p-4">
      <div className="text-center">
        <p className="text-7xl font-bold text-fl-border mb-4">404</p>
        <h1 className="text-xl font-semibold text-fl-primary mb-2">Page not found</h1>
        <p className="text-fl-muted text-sm mb-6">The page you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Go home
        </button>
      </div>
    </div>
  );
}
