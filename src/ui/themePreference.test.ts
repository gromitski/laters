import { describe, expect, it, vi } from "vitest";
import {
  applyTheme,
  installThemePreferenceController,
  readThemePreference,
  resolveTheme,
  THEME_PREFERENCE_STORAGE_KEY,
} from "./themePreference";

describe("theme preference", () => {
  it("uses System for missing, unsupported or unreadable preferences", () => {
    expect(readThemePreference(createStorage())).toBe("system");
    expect(readThemePreference(createStorage("contrast"))).toBe("system");
    expect(
      readThemePreference({
        getItem: () => {
          throw new Error("storage unavailable");
        },
      }),
    ).toBe("system");
  });

  it("resolves System from the operating-system preference", () => {
    expect(resolveTheme("system", false)).toBe("light");
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("applies the effective theme and browser colour", () => {
    const documentElement = createDocumentElement();
    const themeColorMeta = { content: "" } as HTMLMetaElement;

    expect(applyTheme("dark", false, documentElement, themeColorMeta)).toBe("dark");
    expect(documentElement.dataset.theme).toBe("dark");
    expect(documentElement.style.colorScheme).toBe("dark");
    expect(themeColorMeta.content).toBe("#101014");

    applyTheme("light", true, documentElement, themeColorMeta);
    expect(themeColorMeta.content).toBe("#ffffff");
  });

  it("initialises the controls, persists a manual choice and applies it immediately", () => {
    const controls = createControls();
    const storage = createStorage("system");
    const documentElement = createDocumentElement();
    const themeColorMeta = { content: "" } as HTMLMetaElement;
    const systemPreference = createSystemPreference(true);

    const uninstall = installThemePreferenceController({
      controls,
      documentElement,
      themeColorMeta,
      systemPreference,
      storage,
    });

    expect(controls[0]?.checked).toBe(true);
    expect(documentElement.dataset.theme).toBe("dark");

    const lightControl = controls[1];
    if (!lightControl) {
      throw new Error("Missing light control");
    }
    lightControl.checked = true;
    lightControl.dispatchEvent(new Event("change"));

    expect(storage.setItem).toHaveBeenCalledWith(
      THEME_PREFERENCE_STORAGE_KEY,
      "light",
    );
    expect(documentElement.dataset.theme).toBe("light");
    expect(themeColorMeta.content).toBe("#ffffff");
    uninstall();
  });

  it("tracks system changes only while System remains selected", () => {
    const controls = createControls();
    const systemPreference = createSystemPreference(false);
    const documentElement = createDocumentElement();

    installThemePreferenceController({
      controls,
      documentElement,
      themeColorMeta: { content: "" } as HTMLMetaElement,
      systemPreference,
      storage: createStorage("system"),
    });

    systemPreference.setMatches(true);
    expect(documentElement.dataset.theme).toBe("dark");

    const lightControl = controls[1];
    if (!lightControl) {
      throw new Error("Missing light control");
    }
    lightControl.checked = true;
    lightControl.dispatchEvent(new Event("change"));
    systemPreference.setMatches(false);
    systemPreference.setMatches(true);
    expect(documentElement.dataset.theme).toBe("light");
  });

  it("keeps a selection active for the session when storage cannot be written", () => {
    const controls = createControls();
    const documentElement = createDocumentElement();

    installThemePreferenceController({
      controls,
      documentElement,
      themeColorMeta: { content: "" } as HTMLMetaElement,
      systemPreference: createSystemPreference(false),
      storage: {
        getItem: () => null,
        setItem: () => {
          throw new Error("storage unavailable");
        },
      },
    });

    const darkControl = controls[2];
    if (!darkControl) {
      throw new Error("Missing dark control");
    }
    darkControl.checked = true;
    darkControl.dispatchEvent(new Event("change"));
    expect(documentElement.dataset.theme).toBe("dark");
  });
});

function createControls(): HTMLInputElement[] {
  return ["system", "light", "dark"].map((value) =>
    Object.assign(new EventTarget(), {
      value,
      checked: false,
    }),
  ) as HTMLInputElement[];
}

function createDocumentElement(): HTMLElement {
  return {
    dataset: {},
    style: { colorScheme: "" },
  } as unknown as HTMLElement;
}

function createStorage(initialValue: string | null = null): Pick<
  Storage,
  "getItem" | "setItem"
> & { setItem: ReturnType<typeof vi.fn> } {
  let value = initialValue;
  return {
    getItem: () => value,
    setItem: vi.fn((_key: string, nextValue: string) => {
      value = nextValue;
    }),
  };
}

function createSystemPreference(initialMatches: boolean): MediaQueryList & {
  setMatches(matches: boolean): void;
} {
  const target = new EventTarget();
  let matches = initialMatches;

  const systemPreference = Object.assign(target, {
    media: "(prefers-color-scheme: dark)",
    onchange: null,
    setMatches(nextMatches: boolean) {
      matches = nextMatches;
      target.dispatchEvent(new Event("change"));
    },
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: target.dispatchEvent.bind(target),
    addEventListener: target.addEventListener.bind(target),
    removeEventListener: target.removeEventListener.bind(target),
  }) as unknown as MediaQueryList & { setMatches(matches: boolean): void };

  Object.defineProperty(systemPreference, "matches", {
    get: () => matches,
  });
  return systemPreference;
}
