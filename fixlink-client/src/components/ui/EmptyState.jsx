export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-fl-border/50 flex items-center justify-center mb-4">
          <Icon size={22} className="text-fl-muted" />
        </div>
      )}
      <p className="text-fl-primary font-medium mb-1">{title}</p>
      {description && <p className="text-fl-muted text-sm max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
