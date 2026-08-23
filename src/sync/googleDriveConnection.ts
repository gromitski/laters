export const GOOGLE_DRIVE_CLIENT_ID =
  "66695716751-088llrf3kineuva2mq1tf7dujd47b2is.apps.googleusercontent.com";
export const GOOGLE_DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.appdata";

const GOOGLE_IDENTITY_SCRIPT_ID = "google-identity-services";
const GOOGLE_IDENTITY_SCRIPT_URL = "https://accounts.google.com/gsi/client";
const DRIVE_FILES_URL = "https://www.googleapis.com/drive/v3/files";
const DRIVE_UPLOAD_FILES_URL = "https://www.googleapis.com/upload/drive/v3/files";
const CONNECTION_FILE_NAME = "laters-connection.json";
let identityServicesLoad: Promise<GoogleIdentityServices> | undefined;

interface GoogleTokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
}

interface GoogleTokenClient {
  requestAccessToken(): void;
}

interface GoogleIdentityServices {
  accounts: {
    oauth2: {
      initTokenClient(configuration: {
        client_id: string;
        scope: string;
        prompt?: string;
        callback(response: GoogleTokenResponse): void;
        error_callback(error: { type?: string }): void;
      }): GoogleTokenClient;
      revoke(
        accessToken: string,
        callback: (response: { successful?: boolean; error?: string }) => void,
      ): void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleIdentityServices;
  }
}

export interface GoogleDriveConnection {
  accessToken: string;
  expiresInSeconds: number;
}

export interface GoogleDriveConnectionProbe {
  fileId: string;
  lastConnectedAt: string;
}

export class GoogleDriveConnectionRequestError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "GoogleDriveConnectionRequestError";
  }
}

export async function connectGoogleDrive(
  clientId: string,
  targetWindow: Window = window,
  targetDocument: Document = document,
): Promise<GoogleDriveConnection> {
  const identity = await loadGoogleIdentityServices(targetWindow, targetDocument);

  return new Promise((resolve, reject) => {
    const client = identity.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: GOOGLE_DRIVE_SCOPE,
      prompt: "",
      callback: (response) => {
        if (!response.access_token) {
          reject(new Error(response.error || "google-connection-failed"));
          return;
        }

        resolve({
          accessToken: response.access_token,
          expiresInSeconds:
            typeof response.expires_in === "number" ? response.expires_in : 0,
        });
      },
      error_callback: (error) => {
        if (error.type === "popup_failed_to_open") {
          reject(new Error("google-popup-failed"));
          return;
        }

        if (error.type === "popup_closed") {
          reject(new Error("google-popup-closed"));
          return;
        }

        reject(new Error("google-connection-failed"));
      },
    });

    client.requestAccessToken();
  });
}

export async function revokeGoogleDriveAccess(
  accessToken: string,
  targetWindow: Window = window,
  targetDocument: Document = document,
): Promise<void> {
  if (!accessToken) {
    throw new Error("google-revocation-failed");
  }

  const identity = await loadGoogleIdentityServices(targetWindow, targetDocument);

  return new Promise((resolve, reject) => {
    identity.accounts.oauth2.revoke(accessToken, (response) => {
      if (response.successful) {
        resolve();
        return;
      }

      reject(new Error(response.error || "google-revocation-failed"));
    });
  });
}

export async function runGoogleDriveConnectionProbe(
  request: typeof fetch,
  accessToken: string,
  now: () => Date = () => new Date(),
): Promise<GoogleDriveConnectionProbe> {
  const fileId = await findOrCreateConnectionFile(request, accessToken);
  const probe = {
    schemaVersion: 1,
    lastConnectedAt: now().toISOString(),
  };

  await writeConnectionFile(request, accessToken, fileId, probe);
  const confirmedProbe = await readConnectionFile(request, accessToken, fileId);

  if (
    confirmedProbe.schemaVersion !== probe.schemaVersion ||
    confirmedProbe.lastConnectedAt !== probe.lastConnectedAt
  ) {
    throw new Error("Google Drive returned unexpected connection data.");
  }

  return { fileId, lastConnectedAt: confirmedProbe.lastConnectedAt };
}

async function loadGoogleIdentityServices(
  targetWindow: Window,
  targetDocument: Document,
): Promise<GoogleIdentityServices> {
  if (targetWindow.google) {
    return targetWindow.google;
  }

  identityServicesLoad ??= createIdentityServicesLoad(targetWindow, targetDocument);

  try {
    return await identityServicesLoad;
  } catch (error) {
    identityServicesLoad = undefined;
    throw error;
  }
}

function createIdentityServicesLoad(
  targetWindow: Window,
  targetDocument: Document,
): Promise<GoogleIdentityServices> {
  const staleScript = targetDocument.getElementById(GOOGLE_IDENTITY_SCRIPT_ID);
  staleScript?.remove();

  const script = targetDocument.createElement("script");
  script.id = GOOGLE_IDENTITY_SCRIPT_ID;
  script.src = GOOGLE_IDENTITY_SCRIPT_URL;
  script.async = true;
  script.defer = true;
  script.referrerPolicy = "no-referrer";

  return new Promise((resolve, reject) => {
    script.addEventListener(
      "load",
      () => {
        if (!targetWindow.google) {
          reject(new Error("Google’s permission service did not become available."));
          return;
        }

        resolve(targetWindow.google);
      },
      { once: true },
    );
    script.addEventListener(
      "error",
      () => reject(new Error("Google’s permission service could not be loaded.")),
      { once: true },
    );
    targetDocument.head.append(script);
  });
}

async function findOrCreateConnectionFile(
  request: typeof fetch,
  accessToken: string,
): Promise<string> {
  const listUrl = new URL(DRIVE_FILES_URL);
  listUrl.searchParams.set("spaces", "appDataFolder");
  listUrl.searchParams.set(
    "q",
    `name = '${CONNECTION_FILE_NAME}' and 'appDataFolder' in parents and trashed = false`,
  );
  listUrl.searchParams.set("fields", "files(id)");
  listUrl.searchParams.set("pageSize", "1");

  const listResponse = await request(listUrl, {
    headers: authorisationHeaders(accessToken),
  });
  const listResult = await readJson<{ files?: Array<{ id?: string }> }>(listResponse);
  const existingId = listResult.files?.[0]?.id;

  if (existingId) {
    return existingId;
  }

  const createResponse = await request(`${DRIVE_FILES_URL}?fields=id`, {
    method: "POST",
    headers: {
      ...authorisationHeaders(accessToken),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: CONNECTION_FILE_NAME,
      parents: ["appDataFolder"],
      mimeType: "application/json",
    }),
  });
  const created = await readJson<{ id?: string }>(createResponse);

  if (!created.id) {
    throw new Error("Google Drive did not return a connection-file identifier.");
  }

  return created.id;
}

async function writeConnectionFile(
  request: typeof fetch,
  accessToken: string,
  fileId: string,
  probe: { schemaVersion: number; lastConnectedAt: string },
): Promise<void> {
  const response = await request(
    `${DRIVE_UPLOAD_FILES_URL}/${encodeURIComponent(fileId)}?uploadType=media`,
    {
      method: "PATCH",
      headers: {
        ...authorisationHeaders(accessToken),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(probe),
    },
  );

  if (!response.ok) {
    throw new GoogleDriveConnectionRequestError(
      `Google Drive connection write failed (${response.status}).`,
      response.status,
    );
  }
}

async function readConnectionFile(
  request: typeof fetch,
  accessToken: string,
  fileId: string,
): Promise<{ schemaVersion?: number; lastConnectedAt?: string }> {
  const response = await request(
    `${DRIVE_FILES_URL}/${encodeURIComponent(fileId)}?alt=media`,
    { headers: authorisationHeaders(accessToken) },
  );

  return readJson(response);
}

function authorisationHeaders(accessToken: string): Record<string, string> {
  return { Authorization: `Bearer ${accessToken}` };
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new GoogleDriveConnectionRequestError(
      `Google Drive connection request failed (${response.status}).`,
      response.status,
    );
  }

  return response.json() as Promise<T>;
}
