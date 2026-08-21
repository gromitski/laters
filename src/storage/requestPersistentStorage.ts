export type PersistenceRequestResult =
  | "already-persistent"
  | "granted"
  | "not-granted"
  | "unavailable"
  | "failed";

interface PersistenceManager {
  persisted?: () => Promise<boolean>;
  persist?: () => Promise<boolean>;
}

export async function requestPersistentStorage(
  storage: PersistenceManager | undefined = navigator.storage,
): Promise<PersistenceRequestResult> {
  if (!storage?.persist) {
    return "unavailable";
  }

  try {
    if (storage.persisted && (await storage.persisted())) {
      return "already-persistent";
    }

    return (await storage.persist()) ? "granted" : "not-granted";
  } catch {
    return "failed";
  }
}
