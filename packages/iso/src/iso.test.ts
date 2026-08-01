import { describe, expect, test } from "bun:test";
import {
  frame,
  iso,
  plane,
  withIsoHand,
  withIsoPerspective,
} from "./iso";

describe("iso lattice", () => {
  test("rounds to two decimals (SSR-stable)", () => {
    const p = iso(1, 0, 0);
    expect(String(p.x)).toMatch(/^-?\d+(\.\d{1,2})?$/);
    expect(String(p.y)).toMatch(/^-?\d+(\.\d{1,2})?$/);
  });

  test("hand flip mirrors screen-x", () => {
    const a = withIsoHand(1, () => iso(2, 0, 0));
    const b = withIsoHand(-1, () => iso(2, 0, 0));
    expect(b.x).toBe(-a.x);
    expect(b.y).toBe(a.y);
  });

  test("birdseye compresses rise relative to iso", () => {
    const classic = withIsoPerspective("iso", () => iso(0, 0, 2));
    const bird = withIsoPerspective("birdseye", () => iso(0, 0, 2));
    expect(Math.abs(bird.y)).toBeLessThan(Math.abs(classic.y));
  });

  test("plane returns closed path", () => {
    const d = plane({ x: 0, y: 0, w: 2, h: 2 }, 0);
    expect(d.startsWith("M")).toBe(true);
    expect(d.trim().endsWith("Z")).toBe(true);
  });

  test("frame pads bounding box", () => {
    const v = withIsoHand(1, () =>
      frame(
        [
          iso(0, 0, 0),
          iso(4, 0, 0),
          iso(4, 4, 0),
          iso(0, 4, 0),
        ],
        1,
      ),
    );
    expect(v.w).toBeGreaterThan(0);
    expect(v.h).toBeGreaterThan(0);
  });
});
