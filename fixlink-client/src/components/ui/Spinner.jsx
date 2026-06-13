export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4 border', md: 'w-7 h-7 border-2', lg: 'w-12 h-12 border-2' };
  return (
    <div className={`${sizes[size]} border-fl-accent border-t-transparent rounded-full animate-spin ${className}`} />
  );
}

export function FullPageSpinner() {
  return (
    <div className="flex items-center justify-center h-screen bg-fl-bg">
      <Spinner size="lg" />
    </div>
  );
}
