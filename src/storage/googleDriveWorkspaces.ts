import { IndexedDbReadingListStore } from "./indexedDbReadingListStore";

interface AccountWorkspace { key: string; database: string; remembered: boolean }
export interface WorkspaceState {
  revision: number;
  active: string;
  local: string;
  accounts: AccountWorkspace[];
}

// Separate databases preserve both articles and their pending operations together.
// Keys are private Drive connection-file IDs, never email addresses or credentials.
export class GoogleDriveWorkspaces {
  constructor(private readonly registryName = "laters-workspaces") {}

  read(): Promise<WorkspaceState> {
    return this.update((state) => state);
  }

  account(key: string, expectedRevision?: number): Promise<WorkspaceState> {
    if (!key || key.length > 256) return Promise.reject(new Error("Invalid Drive workspace."));
    return this.update((state) => {
      if (expectedRevision !== undefined && state.revision !== expectedRevision) {
        throw new Error("The active list changed in another window. Please try again.");
      }
      const existing = state.accounts.find((account) => account.key === key);
      if (existing) return state;
      const database = `laters-list-${crypto.randomUUID()}`;
      state.accounts.push({ key, database, remembered: false });
      state.revision++;
      return state;
    });
  }

  activate(database: string, expectedRevision: number, remember = false): Promise<WorkspaceState> {
    return this.update((state) => {
      if (state.revision !== expectedRevision) {
        throw new Error("The active list changed in another window. Please try again.");
      }
      if (database !== state.local && !state.accounts.some((account) => account.database === database)) {
        throw new Error("This reading list is unavailable.");
      }
      state.active = database;
      const account = state.accounts.find((account) => account.database === database);
      if (account && remember) account.remembered = true;
      state.revision++;
      return state;
    });
  }

  disconnect(database: string): Promise<WorkspaceState> {
    return this.update((state) => {
      const account = state.accounts.find((account) => account.database === database);
      if (account) { account.remembered = false; state.revision++; }
      return state;
    });
  }

  private async update(change: (state: WorkspaceState) => WorkspaceState): Promise<WorkspaceState> {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(this.registryName, 1);
      request.onupgradeneeded = () => request.result.createObjectStore("workspace");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error("Close other Laters windows and try again."));
    });
    try {
      return await new Promise<WorkspaceState>((resolve, reject) => {
        const transaction = database.transaction("workspace", "readwrite");
        const store = transaction.objectStore("workspace");
        const request = store.get("state");
        let result: WorkspaceState;
        let failure: unknown;
        request.onsuccess = () => {
          try {
            const state: WorkspaceState = request.result ?? { revision: 0, active: "laters", local: "laters", accounts: [] };
            validateState(state);
            result = change(state);
            validateState(result);
            store.put(result, "state");
          } catch (error) {
            failure = error;
            transaction.abort();
          }
        };
        transaction.oncomplete = () => resolve(result!);
        transaction.onabort = transaction.onerror = () => reject(failure ?? transaction.error ?? new Error("Could not save the active reading list."));
      });
    } finally { database.close(); }
  }
}

function validateState(state: WorkspaceState): void {
  const validDatabase = (name: unknown) => typeof name === "string" &&
    (name === "laters" || /^laters-(list|local)-[0-9a-f-]{36}$/.test(name));
  if (!state || !Number.isSafeInteger(state.revision) || state.revision < 0 ||
      !validDatabase(state.active) || !validDatabase(state.local) || !Array.isArray(state.accounts) ||
      !state.accounts.every((account) => account && typeof account.key === "string" &&
        account.key.length > 0 && account.key.length <= 256 && validDatabase(account.database) &&
        typeof account.remembered === "boolean") ||
      new Set(state.accounts.map((account) => account.key)).size !== state.accounts.length ||
      new Set(state.accounts.map((account) => account.database)).size !== state.accounts.length ||
      state.accounts.some((account) => account.database === state.local) ||
      (state.active !== state.local && !state.accounts.some((account) => account.database === state.active))) {
    throw new Error("Laters could not validate its saved lists. No list was replaced.");
  }
}

export async function openActiveReadingList(): Promise<IndexedDbReadingListStore> {
  const state = await new GoogleDriveWorkspaces().read();
  return new IndexedDbReadingListStore(state.active);
}
