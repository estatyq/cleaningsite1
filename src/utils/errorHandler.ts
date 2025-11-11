import { toast } from 'sonner@2.0.3';

/**
 * Handle API errors with special handling for 401 Unauthorized
 */
export function handleApiError(error: unknown, defaultMessage: string = 'Помилка виконання операції') {
  if (error instanceof Error && error.name === 'UnauthorizedError') {
    // Don't show toast here - it will be shown by the unauthorized event handler
    // Just trigger logout event
    window.dispatchEvent(new Event('unauthorized'));
  } else {
    const message = error instanceof Error ? error.message : defaultMessage;
    toast.error(message);
  }
}
