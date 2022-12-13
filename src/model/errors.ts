import { CanceledError } from 'axios';

export function isAbortError(err: unknown) {
  return err instanceof CanceledError || (err instanceof DOMException && err.name === 'AbortError');
}
