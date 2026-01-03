"use client";
import React from 'react';
import { IconAlertTriangle, IconRefresh, IconHome } from '@tabler/icons-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorCount: 0 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Log to external service (optional)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('last_error', JSON.stringify({
          error: error.toString(),
          stack: error.stack,
          time: new Date().toISOString()
        }));
      } catch (e) {
        console.error('Failed to log error:', e);
      }
    }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[var(--bg-main)] p-6">
          <div className="max-w-2xl w-full">
            {/* Error Card */}
            <div className="bg-[var(--bg-card)] border border-red-500/20 rounded-3xl p-8 shadow-2xl">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center">
                  <IconAlertTriangle size={40} className="text-red-500" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-black text-center text-[var(--text-main)] mb-3">
                System Error Detected
              </h1>
              
              <p className="text-center text-[var(--text-muted)] mb-6 font-mono text-sm">
                ERROR CODE: {this.state.errorCount > 3 ? 'CRITICAL_LOOP' : 'RUNTIME_EXCEPTION'}
              </p>

              {/* Error Message */}
              <div className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-4 mb-6">
                <div className="text-sm font-mono text-red-400 mb-2">
                  {this.state.error?.toString()}
                </div>
                
                {isDevelopment && this.state.error?.stack && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] mb-2">
                      View Stack Trace
                    </summary>
                    <pre className="text-xs text-[var(--text-muted)] overflow-x-auto p-3 bg-black/20 rounded border border-[var(--border-color)] max-h-60 overflow-y-auto">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>

              {/* Warning for repeated errors */}
              {this.state.errorCount > 3 && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <IconAlertTriangle size={20} className="text-yellow-500 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold text-yellow-500 text-sm mb-1">Critical Loop Detected</div>
                      <div className="text-xs text-[var(--text-muted)]">
                        This error has occurred {this.state.errorCount} times. Consider clearing your browser cache or contacting support.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent-primary)] text-white rounded-xl hover:opacity-90 transition-all font-bold"
                >
                  <IconRefresh size={18} />
                  Try Again
                </button>
                
                <button
                  onClick={this.handleReload}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-main)] rounded-xl hover:bg-[var(--bg-hover)] transition-all font-bold"
                >
                  <IconRefresh size={18} />
                  Reload Page
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-main)] rounded-xl hover:bg-[var(--bg-hover)] transition-all font-bold"
                >
                  <IconHome size={18} />
                  Go Home
                </button>
              </div>

              {/* Help Text */}
              <div className="mt-6 pt-6 border-t border-[var(--border-color)]">
                <p className="text-xs text-center text-[var(--text-muted)]">
                  If this error persists, try clearing your browser cache or contact support.
                </p>
              </div>
            </div>

            {/* Debug Info (Development Only) */}
            {isDevelopment && this.state.errorInfo && (
              <details className="mt-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4">
                <summary className="cursor-pointer text-sm font-bold text-[var(--text-main)] mb-2">
                  Component Stack (Development Only)
                </summary>
                <pre className="text-xs text-[var(--text-muted)] overflow-x-auto p-3 bg-black/20 rounded border border-[var(--border-color)] max-h-60 overflow-y-auto">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
