import { describe, expect, it } from "vitest";
import {
  hasMovedBeyondLongPressTolerance,
  shouldStartLongPress,
} from "./mobileArticleGesturePolicy";

describe("mobile article shell gesture policy", () => {
  it("starts long press only for primary touch or pen contact away from controls", () => {
    expect(shouldStartLongPress("touch", 0, false)).toBe(true);
    expect(shouldStartLongPress("pen", 0, false)).toBe(true);
    expect(shouldStartLongPress("mouse", 0, false)).toBe(false);
    expect(shouldStartLongPress("touch", 1, false)).toBe(false);
    expect(shouldStartLongPress("touch", 0, true)).toBe(false);
  });

  it("allows small contact movement but yields once movement exceeds twelve pixels", () => {
    expect(hasMovedBeyondLongPressTolerance({ x: 10, y: 10 }, { x: 18, y: 18 })).toBe(false);
    expect(hasMovedBeyondLongPressTolerance({ x: 10, y: 10 }, { x: 23, y: 10 })).toBe(true);
  });
});
