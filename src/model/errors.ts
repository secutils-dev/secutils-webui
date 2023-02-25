import type { AxiosError } from 'axios';
import { CanceledError } from 'axios';

export function isAbortError(err: unknown) {
  return err instanceof CanceledError || (err instanceof DOMException && err.name === 'AbortError');
}

export function getErrorMessage(err: Error) {
  return (isApplicationError(err) ? err.response?.data.message : undefined) ?? err.message;
}

export function isClientError(err: Error) {
  const forceCastedError = err as AxiosError<{ message: string }>;
  if (!forceCastedError.isAxiosError || !forceCastedError.response) {
    return false;
  }
  return forceCastedError.response.status >= 400 && forceCastedError.response.status < 500;
}

function isApplicationError(err: Error): err is AxiosError<{ message: string }> {
  const forceCastedError = err as AxiosError<{ message: string }>;
  return forceCastedError.isAxiosError && !!forceCastedError.response?.data?.message;
}
