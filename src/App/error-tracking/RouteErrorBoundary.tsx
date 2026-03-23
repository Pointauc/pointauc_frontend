import { useEffect } from 'react';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

import { ErrorTrackingContext } from '@shared/lib/error-tracking/types';
import { captureError } from '@shared/lib/error-tracking/service';

import { GlobalErrorFallback } from './GlobalErrorFallback';

/**
 * Captures router-level failures that are handled by React Router before the
 * app-level React error boundary can see them.
 */
export function RouteErrorBoundary() {
  const error = useRouteError();

  useEffect(() => {
    const context: ErrorTrackingContext = {
      tags: {
        error_boundary: 'router-root',
      },
    };

    if (isRouteErrorResponse(error)) {
      context.tags = {
        ...context.tags,
        route_status: String(error.status),
      };
      context.extra = {
        routeStatusText: error.statusText,
        routeErrorData: error.data,
      };
    }

    captureError(error, context);
  }, [error]);

  return <GlobalErrorFallback />;
}
