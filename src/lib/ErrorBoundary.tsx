"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { trackError } from '../lib/telemetry';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    
    // Track to telemetry
    trackError(error, {
      context: 'error_boundary',
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div 
          role="alert"
          aria-live="assertive"
          className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4"
        >
          <div className="max-w-md text-center">
            <div className="text-6xl mb-4" aria-hidden="true">⚠️</div>
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-slate-300 mb-6">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              aria-label="Refresh page"
            >
              Refresh Page
            </button>
            {this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-slate-400 hover:text-slate-300">
                  Technical details
                </summary>
                <pre className="mt-2 p-3 bg-slate-950 rounded text-xs overflow-auto">
                  {this.state.error.toString()}
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
