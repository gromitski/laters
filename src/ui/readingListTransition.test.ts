import { afterEach, describe, expect, it, vi } from "vitest";
import { createReadingListTransition } from "./readingListTransition";

afterEach(() => vi.unstubAllGlobals());

function setup(reducedMotion: boolean, startViewTransition?: unknown) {
  vi.stubGlobal("window", { matchMedia: () => ({ matches: reducedMotion }) });
  vi.stubGlobal("document", { startViewTransition });
  const animation = { cancel: vi.fn() };
  const list = Object.assign(new EventTarget(), { animate: vi.fn(() => animation) });
  return { animation, list, controller: createReadingListTransition(list as unknown as HTMLElement) };
}

function nativeTransition() {
  let finish!: () => void;
  return {
    ready: Promise.resolve(),
    finished: new Promise<void>((resolve) => { finish = resolve; }),
    finish: () => finish(),
    skipTransition: vi.fn(),
  };
}

describe("reading-list view transitions", () => {
  it("updates immediately with no snapshot or motion for reduced motion", () => {
    const start = vi.fn();
    const { controller, list } = setup(true, start);
    const update = vi.fn();
    controller.run(update);
    expect(update).toHaveBeenCalledOnce();
    expect(start).not.toHaveBeenCalled();
    expect(list.animate).not.toHaveBeenCalled();
  });

  it("commits through the native snapshot callback and can end it on focus", () => {
    const transition = nativeTransition();
    let commit!: () => void;
    const { controller, list } = setup(false, (update: () => void) => {
      commit = update;
      return transition;
    });
    const update = vi.fn();
    controller.run(update);
    expect(update).not.toHaveBeenCalled();
    commit();
    expect(update).toHaveBeenCalledOnce();
    list.dispatchEvent(new Event("focusin"));
    expect(transition.skipTransition).toHaveBeenCalledOnce();
  });

  it("skips superseded snapshots without an older completion clearing the newer one", async () => {
    const first = nativeTransition();
    const second = nativeTransition();
    const start = vi.fn().mockReturnValueOnce(first).mockReturnValueOnce(second);
    const { controller } = setup(false, start);
    controller.run(() => {});
    controller.run(() => {});
    expect(first.skipTransition).toHaveBeenCalledOnce();
    first.finish();
    await Promise.resolve();
    controller.cancel();
    expect(second.skipTransition).toHaveBeenCalledOnce();
    second.finish();
  });

  it("falls back to an interruptible 500ms entrance without deferring data updates", () => {
    const { controller, list, animation } = setup(false);
    const update = vi.fn();
    controller.run(update);
    expect(update).toHaveBeenCalledOnce();
    expect(list.animate).toHaveBeenCalledWith(expect.any(Array), expect.objectContaining({ duration: 500 }));
    controller.cancel();
    expect(animation.cancel).toHaveBeenCalledOnce();
  });
});
