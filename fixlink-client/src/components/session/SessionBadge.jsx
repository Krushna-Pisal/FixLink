import { Badge } from '../ui/Badge';

const statusVariant = { WAITING: 'warn', ACTIVE: 'success', ENDED: 'muted' };
const severityVariant = { LOW: 'success', MEDIUM: 'accent', HIGH: 'warn', CRITICAL: 'danger' };

export function SessionBadge({ session }) {
  return (
    <div className="flex items-center gap-2">
      <Badge variant={statusVariant[session.status] || 'default'}>
        {session.status}
      </Badge>
      {session.severity && (
        <Badge variant={severityVariant[session.severity] || 'accent'}>
          {session.severity}
        </Badge>
      )}
    </div>
  );
}
