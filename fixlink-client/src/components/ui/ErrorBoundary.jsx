import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // Log to console so we have a trace during debugging
  componentDidCatch(error, info) {
    console.error('[FixLink ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-fl-bg p-4">
          <div className="max-w-md w-full text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-fl-danger/10 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-fl-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-fl-primary">Something went wrong</h2>
              <p className="text-sm text-fl-muted mt-1">
                An unexpected error occurred. Please refresh and try again.
              </p>
              {this.state.error && (
                <p className="text-xs font-mono text-fl-muted mt-2 px-3 py-2 bg-fl-surface rounded border border-fl-border">
                  {this.state.error.message}
                </p>
              )}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 bg-fl-accent text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors"
            >
              Refresh page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
