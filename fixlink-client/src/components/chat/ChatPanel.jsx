import { useRef, useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { MessageBubble } from './MessageBubble';

export function ChatPanel({ sessionId, chat, participantName }) {
  const { messages, sendMessage, connected } = chat;
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(text);
    setText('');
  };

  return (
    <div className="w-80 flex-shrink-0 flex flex-col border-l border-fl-border bg-fl-surface">
      {/* Header */}
      <div className="px-4 py-3 border-b border-fl-border flex items-center justify-between">
        <p className="text-sm font-medium text-fl-primary">Chat</p>
        <span className={`w-2 h-2 rounded-full ${connected ? 'bg-fl-success' : 'bg-fl-warn'}`}
          title={connected ? 'Connected' : 'Connecting...'} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <div className="text-center py-8 text-fl-muted text-xs">
            No messages yet. Say hello!
          </div>
        )}
        {messages.map((msg, i) => (
          <MessageBubble key={msg.id || i} message={msg} currentName={participantName} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-fl-border">
        <div className="flex gap-2">
          <input
            className="flex-1 input-base text-xs py-1.5"
            placeholder="Type a message…"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-fl-accent text-white hover:bg-blue-500 transition-colors disabled:opacity-40"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
