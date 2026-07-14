import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, HelpCircle, ShieldAlert } from 'lucide-react';
import { Button } from './button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error inside POS runtime:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 font-sans select-none">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-xl p-8 space-y-6 text-center animate-fadeIn">
            <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">POS Runtime Exception</h2>
              <p className="text-xs text-gray-400">An unexpected renderer error occurred in the React application thread.</p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-gray-100 dark:border-gray-850 text-left">
                <span className="block text-[10px] text-gray-400 uppercase tracking-wider font-extrabold mb-1">Error Message</span>
                <code className="block text-xs font-mono text-rose-600 dark:text-rose-400 break-words leading-tight">
                  {this.state.error.message || this.state.error.toString()}
                </code>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="h-10 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reload App
              </Button>
              <Button
                onClick={this.handleReset}
                className="h-10 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
              >
                Go to Dashboard
              </Button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 border-t pt-4 border-gray-100 dark:border-gray-850">
              <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
              <span>Contact system administrator if this persists.</span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
