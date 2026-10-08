const SAFE_REASONS = new Set([
  "authError", "forbidden", "insufficientPermissions", "insufficientFilePermissions",
  "appNotAuthorizedToFile", "rateLimitExceeded", "userRateLimitExceeded",
  "dailyLimitExceeded", "quotaExceeded", "storageQuotaExceeded", "downloadQuotaExceeded",
  "accessNotConfigured", "backendError", "notFound",
]);
const MAX_ERROR_BYTES = 16 * 1024;

export function safeGoogleDriveErrorReason(value: unknown): string | undefined {
  return typeof value === "string" && SAFE_REASONS.has(value) ? value : undefined;
}

// Retain only a known reason, never Google's free-text message or response body.
export async function readGoogleDriveErrorReason(response: Response): Promise<string | undefined> {
  const reader = response.body?.getReader();
  if (!reader) return undefined;
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      length += chunk.value.byteLength;
      if (length > MAX_ERROR_BYTES) {
        await reader.cancel();
        return undefined;
      }
      chunks.push(chunk.value);
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const value = JSON.parse(new TextDecoder().decode(bytes));
    const errors: unknown = value?.error?.errors;
    if (!Array.isArray(errors)) return undefined;
    for (const error of errors) {
      const reason = safeGoogleDriveErrorReason(error?.reason);
      if (reason) return reason;
    }
  } catch {
    // Diagnostic parsing must never replace the original request failure.
  } finally {
    reader.releaseLock();
  }
  return undefined;
}
