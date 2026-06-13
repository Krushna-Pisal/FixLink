function formatTime(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function MessageBubble({ message, currentName }) {
  const isOwn = message.senderName === currentName;
  const isAgent = message.role === 'AGENT';

  return (
    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} gap-0.5`}>
      {!isOwn && (
        <span className="text-xs text-fl-muted px-1">
          {message.senderName}
          {' '}
          <span className={`${isAgent ? 'text-fl-accent' : 'text-fl-success'} font-medium`}>
            {isAgent ? '(Agent)' : '(Customer)'}
          </span>
        </span>
      )}
      <div
        className={`max-w-[85%] px-3 py-2 rounded-lg text-sm leading-relaxed ${
          isOwn
            ? 'bg-fl-accent text-white rounded-tr-sm'
            : 'bg-fl-border/60 text-fl-primary rounded-tl-sm'
        }`}
      >
        {message.content}
      </div>
      <span className="text-xs text-fl-muted px-1">{formatTime(message.sentAt)}</span>
    </div>
  );
}
