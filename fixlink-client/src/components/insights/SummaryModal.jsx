const STATUS_CONFIG = {
  RESOLVED:             { color: 'text-fl-success', bg: 'bg-fl-success/10', border: 'border-fl-success/30', label: 'Resolved' },
  PARTIALLY_RESOLVED:   { color: 'text-fl-warn',    bg: 'bg-fl-warn/10',    border: 'border-fl-warn/30',    label: 'Partially Resolved' },
  UNRESOLVED:           { color: 'text-fl-danger',  bg: 'bg-fl-danger/10',  border: 'border-fl-danger/30',  label: 'Unresolved' },
  ESCALATION_REQUIRED:  { color: 'text-fl-danger',  bg: 'bg-fl-danger/10',  border: 'border-fl-danger/30',  label: 'Escalation Required' },
};

const SEVERITY_CONFIG = {
  LOW:      'text-fl-success',
  MEDIUM:   'text-fl-warn',
  HIGH:     'text-fl-danger',
  CRITICAL: 'text-fl-danger',
};

// Small card used for each section in the report body
function ReportCard({ title, children }) {
  return (
    <div className="bg-fl-bg border border-fl-border rounded-lg p-4 space-y-2">
      <p className="text-xs font-medium text-fl-muted uppercase tracking-widest">{title}</p>
      {children}
    </div>
  );
}

// Thin animated bar showing how confident the AI is in its analysis
function ConfidenceBar({ score }) {
  const pct = Math.round((score || 0) * 100);
  const color = pct >= 75 ? 'bg-fl-success' : pct >= 50 ? 'bg-fl-warn' : 'bg-fl-danger';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-fl-muted">
        <span>Analysis confidence</span>
        <span className="font-mono font-medium text-fl-primary">{pct}%</span>
      </div>
      <div className="h-1.5 w-full bg-fl-border rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function SummaryModal({ summary, sessionCode, onClose }) {
  const status = STATUS_CONFIG[summary.resolutionStatus] || STATUS_CONFIG.UNRESOLVED;

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-fl-surface border border-fl-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Sticky header so the close button is always reachable */}
        <div className="sticky top-0 bg-fl-surface border-b border-fl-border px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs text-fl-muted">{sessionCode}</span>
              <span className={`text-xs px-2 py-0.5 rounded border font-medium ${status.color} ${status.bg} ${status.border}`}>
                {status.label}
              </span>
              {summary.severityClassification && (
                <span className={`text-xs font-mono font-semibold ${SEVERITY_CONFIG[summary.severityClassification] || 'text-fl-muted'}`}>
                  {summary.severityClassification}
                </span>
              )}
            </div>
            <h2 className="text-lg font-semibold text-fl-primary mt-0.5">Resolution Intelligence Report</h2>
          </div>
          <button onClick={onClose} className="text-fl-muted hover:text-fl-primary text-2xl leading-none ml-4">×</button>
        </div>

        {/* Report body */}
        <div className="p-6 space-y-4">
          {/* One-liner summary at the top — most important thing to read */}
          {summary.resolutionSummary && (
            <div className="p-4 rounded-lg bg-fl-accent-soft border border-fl-accent/20">
              <p className="text-sm text-fl-primary leading-relaxed">{summary.resolutionSummary}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ReportCard title="Customer Issue">
              <p className="text-sm text-fl-primary">{summary.customerIssue}</p>
            </ReportCard>
            <ReportCard title="Likely Root Cause">
              <p className="text-sm text-fl-primary">{summary.likelyRootCause || summary.likelyResolution}</p>
            </ReportCard>
          </div>

          <ReportCard title="Troubleshooting Steps Taken">
            <ol className="space-y-1.5">
              {/* backward-compatible: new field name or old one from previous sessions */}
              {(summary.troubleshootingStepsTaken || summary.troubleshootingActions || []).map((step, i) => (
                <li key={i} className="text-sm text-fl-primary flex gap-2.5">
                  <span className="font-mono text-xs text-fl-accent mt-0.5 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </ReportCard>

          <ReportCard title="Recommended Next Actions">
            <ul className="space-y-1.5">
              {/* backward-compatible: new field name or old one */}
              {(summary.recommendedNextActions || summary.nextSteps || []).map((action, i) => (
                <li key={i} className="text-sm text-fl-primary flex gap-2">
                  <span className="text-fl-accent shrink-0 mt-0.5">→</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </ReportCard>

          {/* Only show if the AI returned a confidence value */}
          {typeof summary.confidenceScore === 'number' && (
            <ConfidenceBar score={summary.confidenceScore} />
          )}
        </div>

        <div className="border-t border-fl-border px-6 py-4">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-fl-accent text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
