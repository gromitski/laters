import { describe, expect, it } from "vitest";
import {
  calculateGoogleDriveCredentialExpiry,
  removeLegacyGoogleDriveCredential,
} from "./googleDriveSessionToken";

describe("Google Drive in-memory credential", () => {
  it("calculates Google's expiry with a safety margin without accepting the token", () => {
    expect(calculateGoogleDriveCredentialExpiry(3_600, () => 1_000)).toBe(3_541_000);
  });

  it("rejects invalid or already-expired lifetimes", () => {
    expect(calculateGoogleDriveCredentialExpiry(0)).toBeUndefined();
    expect(calculateGoogleDriveCredentialExpiry(Number.NaN)).toBeUndefined();
    expect(calculateGoogleDriveCredentialExpiry(30, () => 1_000)).toBeUndefined();
  });

  it("removes credentials persisted by an earlier Laters version", () => {
    const storage = createStorage();
    storage.setItem("laters-google-drive-credential", "legacy-token-record");
    storage.setItem("unrelated", "preserved");

    removeLegacyGoogleDriveCredential(storage);

    expect(storage.getItem("laters-google-drive-credential")).toBeNull();
    expect(storage.getItem("unrelated")).toBe("preserved");
  });
});

function createStorage(): Storage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => {
      values.delete(key);
    },
    setItem: (key, value) => {
      values.set(key, value);
    },
  };
}
