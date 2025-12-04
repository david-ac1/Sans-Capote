"use client";

import React from "react";

interface State {
  hasError: boolean;
  error?: Error | null;
}

export default class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    // Could send to telemetry here
    // console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-yellow-700 bg-yellow-950 p-4 text-yellow-200 text-sm">
          <p className="font-semibold">An error occurred while rendering this component.</p>
          <pre className="whitespace-pre-wrap mt-2 text-xs">{String(this.state.error)}</pre>
          <p className="mt-2 text-[11px] text-yellow-300">Please copy the error and share it so I can fix it.</p>
        </div>
      );
    }
    return this.props.children as React.ReactElement;
  }
}
