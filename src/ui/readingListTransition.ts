// Native paint snapshots avoid duplicating article DOM, IDs or interactive controls.
export function createReadingListTransition(list: HTMLElement): {
  run(update: () => void): void;
  cancel(): void;
} {
  let transition: ViewTransition | undefined;
  let entrance: Animation | undefined;
  const cancel = () => {
    transition?.skipTransition();
    transition = undefined;
    entrance?.cancel();
    entrance = undefined;
  };
  list.addEventListener("focusin", cancel);
  return {
    cancel,
    run(update) {
      cancel();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        update();
      } else if (typeof document.startViewTransition === "function") {
        const active = document.startViewTransition(update);
        transition = active;
        // Rapid choices and ordinary result updates may skip an in-flight snapshot.
        void active.ready.catch(() => {});
        void active.finished.finally(() => {
          if (transition === active) transition = undefined;
        }).catch(() => {});
      } else {
        update();
        entrance = list.animate([
          { opacity: 0, transform: "translateY(4px)" },
          { opacity: 1, transform: "translateY(0)" },
        ], { duration: 500, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" });
      }
    },
  };
}
