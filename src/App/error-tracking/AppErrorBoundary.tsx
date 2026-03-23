import { Component, ErrorInfo, ReactNode } from 'react';

import { captureError } from '@shared/lib/error-tracking/service';

import { GlobalErrorFallback } from './GlobalErrorFallback';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    captureError(error, {
      tags: {
        error_boundary: 'app-root',
      },
      extra: {
        componentStack: errorInfo.componentStack,
      },
    });
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return <GlobalErrorFallback onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}
