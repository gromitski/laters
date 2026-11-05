import type { ReadingListOrder } from "./readingListPresentation";

export function installArticleViewMenu(
  trigger: HTMLButtonElement,
  label: HTMLSpanElement,
  menu: HTMLDivElement,
  onSelect: (order: ReadingListOrder) => void,
): (order: ReadingListOrder) => void {
  const options = [...menu.querySelectorAll<HTMLButtonElement>("[data-view]")];
  let current: ReadingListOrder = "newest";
  let openAt: "first" | "last" | undefined;
  const isOpen = () => menu.matches(":popover-open");
  const position = () => {
    const rect = trigger.getBoundingClientRect();
    const width = parseFloat(getComputedStyle(menu).width);
    const left = Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8));
    menu.style.left = `${left}px`;
    menu.style.top = `${rect.bottom + 6}px`;
  };
  menu.addEventListener("beforetoggle", (event) => {
    const opening = (event as ToggleEvent).newState === "open";
    trigger.setAttribute("aria-expanded", String(opening));
    if (opening) position();
  });
  menu.addEventListener("toggle", () => {
    if (!isOpen()) return;
    const rect = menu.getBoundingClientRect();
    if (rect.bottom > window.innerHeight - 8) {
      menu.style.top = `${Math.max(8, trigger.getBoundingClientRect().top - rect.height - 6)}px`;
    }
    const selected = options.find((option) => option.dataset.view === current)!;
    (openAt === "first" ? options[0] : openAt === "last" ? options.at(-1) : selected)
      ?.focus({ preventScroll: true });
    openAt = undefined;
  });
  trigger.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    openAt = event.key === "ArrowDown" ? "first" : "last";
    if (!isOpen()) menu.showPopover();
    else (openAt === "first" ? options[0] : options.at(-1))?.focus();
  });
  menu.addEventListener("keydown", (event) => {
    const index = options.indexOf(document.activeElement as HTMLButtonElement);
    const next = event.key === "Home" ? 0
      : event.key === "End" ? options.length - 1
      : event.key === "ArrowDown" ? (index + 1) % options.length
      : event.key === "ArrowUp" ? (index + options.length - 1) % options.length
      : undefined;
    if (next !== undefined) {
      event.preventDefault();
      options[next]?.focus();
    } else if (event.key === "Escape") {
      event.preventDefault();
      menu.hidePopover();
      trigger.focus({ preventScroll: true });
    } else if (event.key === "Tab") {
      // Allow the browser to advance focus, then close without returning to the trigger.
      window.setTimeout(() => { if (isOpen()) menu.hidePopover(); }, 0);
    }
  });
  for (const option of options) {
    option.addEventListener("click", () => {
      menu.hidePopover();
      trigger.focus({ preventScroll: true });
      onSelect(option.dataset.view === "publisher" ? "publisher" : "newest");
    });
  }
  const close = () => { if (isOpen()) menu.hidePopover(); };
  window.addEventListener("resize", close);
  document.addEventListener("scroll", close, true);
  return (order) => {
    current = order;
    const text = order === "publisher" ? "Publisher groups" : "Newest first";
    label.textContent = text;
    trigger.setAttribute("aria-label", `Article view: ${text}`);
    for (const option of options) {
      option.setAttribute("aria-checked", String(option.dataset.view === order));
    }
  };
}
