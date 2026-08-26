(() => {
  const storageKey = "laters-theme-preference";
  const systemPreference = window.matchMedia("(prefers-color-scheme: dark)");

  const readPreference = () => {
    try {
      const storedPreference = window.localStorage.getItem(storageKey);
      if (
        storedPreference === "system" ||
        storedPreference === "light" ||
        storedPreference === "dark"
      ) {
        return storedPreference;
      }
    } catch {
      // System remains the safe default when browser storage is unavailable.
    }
    return "system";
  };

  const applyPreference = (preference) => {
    const theme = preference === "system"
      ? systemPreference.matches ? "dark" : "light"
      : preference;

    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;

    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.content = theme === "dark" ? "#101014" : "#ffffff";
    }
  };

  applyPreference(readPreference());
  systemPreference.addEventListener("change", () => {
    const preference = readPreference();
    if (preference === "system") {
      applyPreference(preference);
    }
  });
})();
