import { HttpErrorResponse } from '@angular/common/http';

interface BackendErrorBody {
  readonly error?: {
    readonly message?: string;
    readonly requestId?: string;
  };
}

export function apiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (!(error instanceof HttpErrorResponse)) return fallback;
  if (error.status === 0) {
    return 'The Kawama API could not be reached. Start the backend service and try again.';
  }
  if (error.status === 401) {
    return 'The email or password is incorrect.';
  }
  if (error.status === 429) {
    return 'Too many sign-in attempts. Wait a few minutes and try again.';
  }
  const body = error.error as BackendErrorBody | undefined;
  const message = body?.error?.message || fallback;
  return body?.error?.requestId ? `${message} Reference: ${body.error.requestId}` : message;
}
