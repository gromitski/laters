const LONG_PRESS_MOVE_TOLERANCE_PX = 12;

export interface GesturePoint {
  x: number;
  y: number;
}

export function shouldStartLongPress(
  pointerType: string,
  button: number,
  startedOnControl: boolean,
): boolean {
  return (pointerType === "touch" || pointerType === "pen") && button === 0 && !startedOnControl;
}

export function hasMovedBeyondLongPressTolerance(
  start: GesturePoint,
  current: GesturePoint,
): boolean {
  return Math.hypot(current.x - start.x, current.y - start.y) > LONG_PRESS_MOVE_TOLERANCE_PX;
}
