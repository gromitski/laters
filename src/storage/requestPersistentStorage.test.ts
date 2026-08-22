import { describe, expect, it, vi } from "vitest";
import { requestPersistentStorage } from "./requestPersistentStorage";

describe("requestPersistentStorage", () => {
  it("reports unavailable support without failing", async () => {
    await expect(requestPersistentStorage(undefined)).resolves.toBe("unavailable");
  });

  it("does not request persistence twice", async () => {
    const persist = vi.fn(async () => true);

    await expect(
      requestPersistentStorage({ persisted: async () => true, persist }),
    ).resolves.toBe("already-persistent");
    expect(persist).not.toHaveBeenCalled();
  });

  it("reports whether a persistence request is granted", async () => {
    await expect(
      requestPersistentStorage({ persisted: async () => false, persist: async () => true }),
    ).resolves.toBe("granted");
    await expect(
      requestPersistentStorage({ persisted: async () => false, persist: async () => false }),
    ).resolves.toBe("not-granted");
  });

  it("keeps browser failures non-fatal", async () => {
    await expect(
      requestPersistentStorage({
        persist: async () => {
          throw new Error("Storage API unavailable");
        },
      }),
    ).resolves.toBe("failed");
  });
});
