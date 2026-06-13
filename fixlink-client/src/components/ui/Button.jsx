export function Button({ children, variant = 'primary', size = 'md', disabled, onClick, className = '', type = 'button' }) {
  const base = 'inline-flex items-center justify-center font-medium transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-fl-accent text-white hover:bg-blue-500 active:bg-blue-600',
    danger: 'bg-fl-danger/10 text-fl-danger border border-fl-danger/30 hover:bg-fl-danger/20',
    ghost: 'text-fl-muted hover:text-fl-primary hover:bg-fl-border/30',
    outline: 'border border-fl-border text-fl-primary hover:border-fl-accent/50',
  };
  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}
