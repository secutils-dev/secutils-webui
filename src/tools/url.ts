// Verifies that the `next` URL is safe to redirect to (doesn't trick user into being redirected to a malicious site).
export function isSafeNextUrl(urlString: string) {
  const origin = window.location.origin;
  try {
    return new URL(urlString, origin).origin === origin;
  } catch {
    return false;
  }
}
