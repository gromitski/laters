const GOOGLE_DRIVE_CREDENTIAL_KEY = "laters-google-drive-credential";
const EXPIRY_SAFETY_MARGIN_MS = 60_000;

export interface StoredGoogleDriveCredential {
  accessToken: string;
  expiresAt: number;
}

export function storeGoogleDriveCredential(
  storage: Storage,
  accessToken: string,
  expiresInSeconds: number,
  now: () => number = Date.now,
): StoredGoogleDriveCredential | undefined {
  if (!accessToken || !Number.isFinite(expiresInSeconds) || expiresInSeconds <= 0) {
    return undefined;
  }

  const credential = {
    accessToken,
    expiresAt: now() + expiresInSeconds * 1_000 - EXPIRY_SAFETY_MARGIN_MS,
  };

  if (credential.expiresAt <= now()) {
    return undefined;
  }

  storage.setItem(GOOGLE_DRIVE_CREDENTIAL_KEY, JSON.stringify(credential));
  return credential;
}

export function readGoogleDriveCredential(
  storage: Storage,
  now: () => number = Date.now,
): StoredGoogleDriveCredential | undefined {
  const stored = storage.getItem(GOOGLE_DRIVE_CREDENTIAL_KEY);

  if (!stored) {
    return undefined;
  }

  try {
    const value = JSON.parse(stored) as Partial<StoredGoogleDriveCredential>;

    if (
      typeof value.accessToken !== "string" ||
      value.accessToken.length === 0 ||
      value.accessToken.length > 16_384 ||
      typeof value.expiresAt !== "number" ||
      !Number.isFinite(value.expiresAt) ||
      value.expiresAt <= now()
    ) {
      forgetGoogleDriveCredential(storage);
      return undefined;
    }

    return { accessToken: value.accessToken, expiresAt: value.expiresAt };
  } catch {
    forgetGoogleDriveCredential(storage);
    return undefined;
  }
}

export function forgetGoogleDriveCredential(storage: Storage): void {
  storage.removeItem(GOOGLE_DRIVE_CREDENTIAL_KEY);
}
