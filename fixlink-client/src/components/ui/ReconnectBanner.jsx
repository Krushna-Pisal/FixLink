import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export function ReconnectBanner() {
  const { online, reconnecting } = useNetworkStatus();

  // Don't render anything while we're online
  if (online) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 px-4 py-2.5 text-sm text-center font-medium transition-all
      ${reconnecting
        ? 'bg-amber-400/90 text-black'
        : 'bg-fl-danger/90 text-white'}`}
    >
      {reconnecting
        ? '⟳ Connection lost — attempting to reconnect...'
        : '✕ Unable to reconnect. Please refresh the page.'}
    </div>
  );
}
