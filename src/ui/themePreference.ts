export const THEME_PREFERENCE_STORAGE_KEY = "laters-theme-preference";

export type ThemePreference = "system" | "light" | "dark";
export type EffectiveTheme = "light" | "dark";

interface ThemePreferenceControllerOptions {
  controls: readonly HTMLInputElement[];
  documentElement: HTMLElement;
  themeColorMeta: HTMLMetaElement;
  systemPreference: MediaQueryList;
  storage: Pick<Storage, "getItem" | "setItem">;
}

const THEME_COLOURS: Record<EffectiveTheme, string> = {
  light: "#ffffff",
  dark: "#101014",
};

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

export function readThemePreference(
  storage: Pick<Storage, "getItem">,
): ThemePreference {
  try {
    const storedPreference = storage.getItem(THEME_PREFERENCE_STORAGE_KEY);
    return isThemePreference(storedPreference) ? storedPreference : "system";
  } catch {
    return "system";
  }
}

export function resolveTheme(
  preference: ThemePreference,
  systemPrefersDark: boolean,
): EffectiveTheme {
  if (preference === "system") {
    return systemPrefersDark ? "dark" : "light";
  }

  return preference;
}

export function applyTheme(
  preference: ThemePreference,
  systemPrefersDark: boolean,
  documentElement: HTMLElement,
  themeColorMeta: HTMLMetaElement,
): EffectiveTheme {
  const theme = resolveTheme(preference, systemPrefersDark);
  documentElement.dataset.theme = theme;
  documentElement.style.colorScheme = theme;
  themeColorMeta.content = THEME_COLOURS[theme];
  return theme;
}

export function installThemePreferenceController({
  controls,
  documentElement,
  themeColorMeta,
  systemPreference,
  storage,
}: ThemePreferenceControllerOptions): () => void {
  let preference = readThemePreference(storage);

  const updateTheme = () => {
    applyTheme(
      preference,
      systemPreference.matches,
      documentElement,
      themeColorMeta,
    );
  };

  for (const control of controls) {
    control.checked = control.value === preference;
    control.addEventListener("change", handleControlChange);
  }

  systemPreference.addEventListener("change", updateTheme);
  updateTheme();

  function handleControlChange(event: Event): void {
    const control = event.currentTarget as HTMLInputElement;
    if (!control.checked || !isThemePreference(control.value)) {
      return;
    }

    preference = control.value;
    try {
      storage.setItem(THEME_PREFERENCE_STORAGE_KEY, preference);
    } catch {
      // The choice still applies for this session when browser storage is unavailable.
    }
    updateTheme();
  }

  return () => {
    for (const control of controls) {
      control.removeEventListener("change", handleControlChange);
    }
    systemPreference.removeEventListener("change", updateTheme);
  };
}
