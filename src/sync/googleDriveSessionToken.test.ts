import { describe, expect, it } from "vitest";
import {
  forgetGoogleDriveCredential,
  readGoogleDriveCredential,
  storeGoogleDriveCredential,
} from "./googleDriveSessionToken";

describe("Google Drive short-lived credential", () => {
  it("stores only until Google's expiry with a safety margin", () => {
    const storage = createStorage();
    expect(storeGoogleDriveCredential(storage, "temporary-token", 3_600, () => 1_000)).toEqual({
      accessToken: "temporary-token",
      expiresAt: 3_541_000,
    });
    expect(readGoogleDriveCredential(storage, () => 3_540_999)).toEqual({
      accessToken: "temporary-token",
      expiresAt: 3_541_000,
    });
  });

  it("removes expired or malformed credentials", () => {
    const storage = createStorage();
    storeGoogleDriveCredential(storage, "temporary-token", 120, () => 1_000);
    expect(readGoogleDriveCredential(storage, () => 61_000)).toBeUndefined();
    expect(storage.getItem("laters-google-drive-credential")).toBeNull();

    storage.setItem("laters-google-drive-credential", "not-json");
    expect(readGoogleDriveCredential(storage)).toBeUndefined();
  });

  it("forgets a live credential deliberately", () => {
    const storage = createStorage();
    storeGoogleDriveCredential(storage, "temporary-token", 3_600, () => 1_000);
    forgetGoogleDriveCredential(storage);
    expect(readGoogleDriveCredential(storage, () => 2_000)).toBeUndefined();
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
