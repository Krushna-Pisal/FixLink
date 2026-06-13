import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export default function SessionEndedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-fl-bg p-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-fl-success/15 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={32} className="text-fl-success" />
        </div>
        <h1 className="text-xl font-semibold text-fl-primary">Session Ended</h1>
        <p className="text-fl-muted text-sm mt-2 leading-relaxed">
          This support session has concluded. Thank you for using FixLink.
        </p>
        <button onClick={() => navigate('/')} className="btn-primary mt-6">
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
