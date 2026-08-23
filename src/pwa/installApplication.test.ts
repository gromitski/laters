import { describe, expect, it, vi } from "vitest";
import {
  requestApplicationInstall,
  type ApplicationInstallPrompt,
} from "./installApplication";

describe("requestApplicationInstall", () => {
  it.each(["accepted", "dismissed"] as const)(
    "returns the browser's %s choice after opening its prompt",
    async (outcome) => {
      const prompt = vi.fn(async () => undefined);
      const installPrompt = {
        prompt,
        userChoice: Promise.resolve({ outcome }),
      } as unknown as ApplicationInstallPrompt;

      await expect(requestApplicationInstall(installPrompt)).resolves.toBe(outcome);
      expect(prompt).toHaveBeenCalledOnce();
    },
  );
});
