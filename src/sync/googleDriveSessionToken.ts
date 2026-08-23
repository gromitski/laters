const GOOGLE_DRIVE_CREDENTIAL_KEY = "laters-google-drive-credential";
const EXPIRY_SAFETY_MARGIN_MS = 60_000;

export function calculateGoogleDriveCredentialExpiry(
  expiresInSeconds: number,
  now: () => number = Date.now,
): number | undefined {
  if (!Number.isFinite(expiresInSeconds) || expiresInSeconds <= 0) {
    return undefined;
  }

  const expiresAt = now() + expiresInSeconds * 1_000 - EXPIRY_SAFETY_MARGIN_MS;

  return expiresAt > now() ? expiresAt : undefined;
}

export function removeLegacyGoogleDriveCredential(storage: Storage): void {
  storage.removeItem(GOOGLE_DRIVE_CREDENTIAL_KEY);
}
