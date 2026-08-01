/**
 * True 30° isometric projection helpers.
 *
 * Every visual on the site is plotted from a lattice coordinate rather than
 * drawn by hand, so parallel edges stay parallel and every scene shares one
 * projection. Values are rounded to two decimals: the same string renders on
 * the server and the client, so there is no hydration drift.
 */

const COS30 = Math.cos(Math.PI / 6);
const SIN30 = 0.5;

/** `1` = default hand (x east-south); `-1` = opposite corner. */
export type IsoHand = 1 | -1;

/**
 * Camera stance on the same lattice:
 * - `iso` — classic 30° consulting plate
 * - `birdseye` — high survey (ground dominates; height compresses)
 * - `low` — dramatic low rake (towers punch)
 */
export type IsoPerspective = "iso" | "birdseye" | "low";

let isoHand: IsoHand = 1;
let isoPerspective: IsoPerspective = "iso";

/** Current projection hand — set via `withIsoHand` while building paths. */
export function getIsoHand(): IsoHand {
  return isoHand;
}

export function getIsoPerspective(): IsoPerspective {
  return isoPerspective;
}

/**
 * Evaluate lattice→path geometry under a given isometric hand.
 * Call from the same synchronous render that builds path `d` attributes
 * (including helper components that wrap themselves in this).
 */
export function withIsoHand<T>(hand: IsoHand, run: () => T): T {
  const prev = isoHand;
  isoHand = hand;
  try {
    return run();
  } finally {
    isoHand = prev;
  }
}

/** Nest with `withIsoHand` — order does not matter. */
export function withIsoPerspective<T>(perspective: IsoPerspective, run: () => T): T {
  const prev = isoPerspective;
  isoPerspective = perspective;
  try {
    return run();
  } finally {
    isoPerspective = prev;
  }
}

function perspectiveFactors(perspective: IsoPerspective): { ground: number; rise: number; spread: number } {
  switch (perspective) {
    case "birdseye":
      return { ground: 0.22, rise: 0.72, spread: COS30 * 1.05 };
    case "low":
      return { ground: 0.62, rise: 1.18, spread: COS30 * 0.92 };
    case "iso":
      return { ground: SIN30, rise: 1, spread: COS30 };
    default: {
      const _exhaustive: never = perspective;
      return _exhaustive;
    }
  }
}

export interface Pt {
  x: number;
  y: number;
}

const round = (value: number) => Math.round(value * 100) / 100;

/**
 * Project a lattice point onto the picture plane.
 * `x` runs east-south, `y` runs west-south, `z` is height.
 * Hand `-1` mirrors screen-x so the scene reads from the other corner.
 * Perspective shifts ground foreshortening and rise without changing the lattice.
 */
export function iso(x: number, y: number, z = 0): Pt {
  const { ground, rise, spread } = perspectiveFactors(isoPerspective);
  return {
    x: round(isoHand * (x - y) * spread),
    y: round((x + y) * ground - z * rise),
  };
}

export function move(point: Pt, dx: number, dy: number): Pt {
  return { x: round(point.x + dx), y: round(point.y + dy) };
}

const d = (points: Pt[], close: boolean) =>
  points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`).join(" ") +
  (close ? " Z" : "");

/** Open polyline through projected points. */
export function polyline(points: Pt[]): string {
  return d(points, false);
}

/** Closed polygon through projected points. */
export function polygon(points: Pt[]): string {
  return d(points, true);
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A horizontal plane (a floor tile) at height `z`. */
export function plane(rect: Rect, z = 0): string {
  const { x, y, w, h } = rect;
  return polygon([iso(x, y, z), iso(x + w, y, z), iso(x + w, y + h, z), iso(x, y + h, z)]);
}

/** Inner grid lines of a plane — the lattice that makes a surface read as a surface. */
export function planeGrid(rect: Rect, z = 0, step = 1): string {
  const { x, y, w, h } = rect;
  const parts: string[] = [];
  for (let offset = step; offset < w; offset += step) {
    parts.push(polyline([iso(x + offset, y, z), iso(x + offset, y + h, z)]));
  }
  for (let offset = step; offset < h; offset += step) {
    parts.push(polyline([iso(x, y + offset, z), iso(x + w, y + offset, z)]));
  }
  return parts.join(" ");
}

/** Stable hash for SSR-safe circuit patterning (no Math.random). */
function circuitHash(n: number): number {
  const v = Math.sin(n * 12.9898) * 43758.5453;
  return v - Math.floor(v);
}

function overlapsKeepout(px: number, py: number, keepouts: Rect[], pad = 0.35): boolean {
  for (const k of keepouts) {
    if (
      px >= k.x - pad &&
      px <= k.x + k.w + pad &&
      py >= k.y - pad &&
      py <= k.y + k.h + pad
    ) {
      return true;
    }
  }
  return false;
}

/**
 * PCB-style mesh — broken traces, jogs, stubs, and T-junctions instead of a
 * continuous lattice. Optional keepouts leave clearance around footprints.
 */
export function planeCircuit(
  rect: Rect,
  z = 0,
  options?: { pitch?: number; keepouts?: Rect[] },
): string {
  const pitch = options?.pitch ?? 0.85;
  const keepouts = options?.keepouts ?? [];
  const { x, y, w, h } = rect;
  const parts: string[] = [];
  const margin = 0.4;
  const x0 = x + margin;
  const y0 = y + margin;
  const x1 = x + w - margin;
  const y1 = y + h - margin;

  // Vertical net runs — segmented with gaps + occasional L-jogs
  for (let col = 0, cx = x0 + pitch; cx < x1; cx += pitch, col++) {
    let runStart: number | null = null;
    const flush = (end: number) => {
      if (runStart === null || end - runStart < 0.45) {
        runStart = null;
        return;
      }
      const pattern = circuitHash(col * 17 + Math.round(runStart * 10));
      if (pattern < 0.12) {
        // Drop this segment — open copper gap
        runStart = null;
        return;
      }
      if (pattern > 0.72 && end - runStart > 1.4) {
        // Jog: vertical → short horizontal → continue
        const mid = runStart + (end - runStart) * (0.35 + pattern * 0.25);
        const jog = (pattern > 0.86 ? 1 : -1) * pitch * 0.55;
        const jx = Math.min(x1, Math.max(x0, cx + jog));
        parts.push(polyline([iso(cx, runStart, z), iso(cx, mid, z)]));
        parts.push(polyline([iso(cx, mid, z), iso(jx, mid, z)]));
        parts.push(polyline([iso(jx, mid, z), iso(jx, end, z)]));
      } else {
        parts.push(polyline([iso(cx, runStart, z), iso(cx, end, z)]));
      }
      // Stub tee
      if (pattern > 0.55 && pattern < 0.7) {
        const sy = runStart + (end - runStart) * 0.5;
        const sx = Math.min(x1, Math.max(x0, cx + pitch * 0.4));
        parts.push(polyline([iso(cx, sy, z), iso(sx, sy, z)]));
      }
      runStart = null;
    };

    for (let py = y0; py <= y1 + 0.001; py += pitch * 0.5) {
      const blocked = overlapsKeepout(cx, py, keepouts);
      if (!blocked && runStart === null) runStart = py;
      if (blocked && runStart !== null) flush(py - pitch * 0.25);
    }
    if (runStart !== null) flush(y1);
  }

  // Horizontal net runs
  for (let row = 0, cy = y0 + pitch; cy < y1; cy += pitch, row++) {
    let runStart: number | null = null;
    const flush = (end: number) => {
      if (runStart === null || end - runStart < 0.45) {
        runStart = null;
        return;
      }
      const pattern = circuitHash(row * 31 + Math.round(runStart * 10) + 3);
      if (pattern < 0.14) {
        runStart = null;
        return;
      }
      if (pattern > 0.78 && end - runStart > 1.6) {
        const mid = runStart + (end - runStart) * (0.3 + pattern * 0.3);
        const jog = (pattern > 0.9 ? 1 : -1) * pitch * 0.5;
        const jy = Math.min(y1, Math.max(y0, cy + jog));
        parts.push(polyline([iso(runStart, cy, z), iso(mid, cy, z)]));
        parts.push(polyline([iso(mid, cy, z), iso(mid, jy, z)]));
        parts.push(polyline([iso(mid, jy, z), iso(end, jy, z)]));
      } else {
        parts.push(polyline([iso(runStart, cy, z), iso(end, cy, z)]));
      }
      runStart = null;
    };

    for (let px = x0; px <= x1 + 0.001; px += pitch * 0.5) {
      const blocked = overlapsKeepout(px, cy, keepouts);
      if (!blocked && runStart === null) runStart = px;
      if (blocked && runStart !== null) flush(px - pitch * 0.25);
    }
    if (runStart !== null) flush(x1);
  }

  // Corner dogbones / fan-outs near keepout edges (reads as pad exits)
  for (let i = 0; i < keepouts.length; i++) {
    const k = keepouts[i]!;
    const exits: Array<[number, number, number, number]> = [
      [k.x - 0.15, k.y + k.h * 0.35, k.x - 0.9, k.y + k.h * 0.35],
      [k.x + k.w + 0.15, k.y + k.h * 0.65, k.x + k.w + 0.9, k.y + k.h * 0.65],
      [k.x + k.w * 0.4, k.y - 0.15, k.x + k.w * 0.4, k.y - 0.85],
      [k.x + k.w * 0.6, k.y + k.h + 0.15, k.x + k.w * 0.6, k.y + k.h + 0.85],
    ];
    for (const [ax, ay, bx, by] of exits) {
      if (ax < x0 || bx > x1 || ay < y0 || by > y1) continue;
      if (circuitHash(i * 9 + ax * 3 + ay) < 0.35) continue;
      parts.push(polyline([iso(ax, ay, z), iso(bx, by, z)]));
    }
  }

  return parts.join(" ");
}

/**
 * Dense IC-face circuit: edge pin row + internal jogged nets + die outline.
 * Returns path `d` for the trace layer (pins drawn separately as nodes).
 */
export function chipCircuitTraces(
  rect: Rect,
  z: number,
  density: "low" | "med" | "high" = "med",
): string {
  const { x, y, w, h } = rect;
  const parts: string[] = [];
  const inset = 0.32;
  const die: Rect = {
    x: x + w * 0.28,
    y: y + h * 0.28,
    w: w * 0.44,
    h: h * 0.44,
  };
  // Die outline
  parts.push(
    polyline([
      iso(die.x, die.y, z),
      iso(die.x + die.w, die.y, z),
      iso(die.x + die.w, die.y + die.h, z),
      iso(die.x, die.y + die.h, z),
      iso(die.x, die.y, z),
    ]),
  );
  // Crosshair / metal layer inside die
  parts.push(
    polyline([
      iso(die.x + 0.15, die.y + die.h * 0.5, z),
      iso(die.x + die.w - 0.15, die.y + die.h * 0.5, z),
    ]),
  );
  parts.push(
    polyline([
      iso(die.x + die.w * 0.5, die.y + 0.15, z),
      iso(die.x + die.w * 0.5, die.y + die.h - 0.15, z),
    ]),
  );

  const pinCount =
    density === "high" ? Math.max(6, Math.floor(w * 2.2)) :
    density === "low" ? Math.max(3, Math.floor(w * 1.2)) :
    Math.max(4, Math.floor(w * 1.7));

  // Bond wires / fan-in from long edges into die
  for (let i = 0; i < pinCount; i++) {
    const t = (i + 0.5) / pinCount;
    const px = x + inset + t * (w - inset * 2);
    const topY = y + inset;
    const botY = y + h - inset;
    const dieTop = die.y;
    const dieBot = die.y + die.h;
    const dieX = die.x + 0.2 + ((i % 3) / 3) * (die.w - 0.4);
    // Top edge → die (jogged)
    parts.push(
      polyline([
        iso(px, topY, z),
        iso(px, topY + (dieTop - topY) * 0.45, z),
        iso(dieX, topY + (dieTop - topY) * 0.45, z),
        iso(dieX, dieTop, z),
      ]),
    );
    // Bottom edge → die
    const px2 = x + inset + ((pinCount - 1 - i + 0.5) / pinCount) * (w - inset * 2);
    const dieX2 = die.x + die.w - 0.2 - ((i % 3) / 3) * (die.w - 0.4);
    parts.push(
      polyline([
        iso(px2, botY, z),
        iso(px2, botY - (botY - dieBot) * 0.45, z),
        iso(dieX2, botY - (botY - dieBot) * 0.45, z),
        iso(dieX2, dieBot, z),
      ]),
    );
  }

  // Side pin stubs on taller chips
  if (h > 2.4) {
    const sidePins = density === "high" ? 4 : 3;
    for (let i = 0; i < sidePins; i++) {
      const t = (i + 0.5) / sidePins;
      const py = y + inset + t * (h - inset * 2);
      parts.push(
        polyline([
          iso(x + inset, py, z),
          iso(die.x, py, z),
        ]),
      );
      parts.push(
        polyline([
          iso(x + w - inset, py, z),
          iso(die.x + die.w, py, z),
        ]),
      );
    }
  }

  return parts.join(" ");
}

/**
 * An extruded box drawn as three faces: top + two near walls.
 * Default hand shows +x / +y walls; opposite hand shows −x / −y walls
 * so the extrusion still reads as solid from the other corner.
 */
export function box(rect: Rect, z: number, height: number) {
  const { x, y, w, h } = rect;
  const top = z + height;
  const topFace = polygon([
    iso(x, y, top),
    iso(x + w, y, top),
    iso(x + w, y + h, top),
    iso(x, y + h, top),
  ]);
  if (isoHand < 0) {
    return {
      top: topFace,
      right: polygon([
        iso(x, y, top),
        iso(x, y + h, top),
        iso(x, y + h, z),
        iso(x, y, z),
      ]),
      left: polygon([
        iso(x, y, top),
        iso(x + w, y, top),
        iso(x + w, y, z),
        iso(x, y, z),
      ]),
    };
  }
  return {
    top: topFace,
    right: polygon([
      iso(x + w, y, top),
      iso(x + w, y + h, top),
      iso(x + w, y + h, z),
      iso(x + w, y, z),
    ]),
    left: polygon([
      iso(x, y + h, top),
      iso(x + w, y + h, top),
      iso(x + w, y + h, z),
      iso(x, y + h, z),
    ]),
  };
}

/** Vertical strut from a lattice point up to `z`. */
export function riser(x: number, y: number, from: number, to: number): string {
  return polyline([iso(x, y, from), iso(x, y, to)]);
}

/**
 * A route between two lattice points that travels along the lattice rather
 * than cutting across it: out along x, along y, then up. Reads as a circuit
 * trace instead of a random diagonal.
 */
export function route(
  a: { x: number; y: number; z?: number },
  b: { x: number; y: number; z?: number },
): string {
  const az = a.z ?? 0;
  const bz = b.z ?? 0;
  return polyline([
    iso(a.x, a.y, az),
    iso(b.x, a.y, az),
    iso(b.x, b.y, az),
    iso(b.x, b.y, bz),
  ]);
}

/**
 * Same as `route`, but advances along y first — the natural long axis when
 * the camera is on the opposite isometric hand (horizontal flip).
 */
export function routeY(
  a: { x: number; y: number; z?: number },
  b: { x: number; y: number; z?: number },
): string {
  const az = a.z ?? 0;
  const bz = b.z ?? 0;
  return polyline([
    iso(a.x, a.y, az),
    iso(a.x, b.y, az),
    iso(b.x, b.y, az),
    iso(b.x, b.y, bz),
  ]);
}

/** A small diamond marker sitting flat on the lattice — the site's only "icon". */
export function node(x: number, y: number, z = 0, radius = 0.22): string {
  return polygon([
    iso(x - radius, y, z),
    iso(x, y - radius, z),
    iso(x + radius, y, z),
    iso(x, y + radius, z),
  ]);
}

export interface View {
  minX: number;
  minY: number;
  w: number;
  h: number;
}

/** Bounding view for a set of projected points, with padding. */
export function frame(points: Pt[], padding = 2): View {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = round(Math.min(...xs) - padding);
  const minY = round(Math.min(...ys) - padding);
  return {
    minX,
    minY,
    w: round(Math.max(...xs) + padding - minX),
    h: round(Math.max(...ys) + padding - minY),
  };
}

/** All four projected corners of a lattice plane — the usual input to `frame`. */
export function corners(rect: Rect, z = 0): Pt[] {
  return [
    iso(rect.x, rect.y, z),
    iso(rect.x + rect.w, rect.y, z),
    iso(rect.x + rect.w, rect.y + rect.h, z),
    iso(rect.x, rect.y + rect.h, z),
  ];
}

/**
 * Position of a projected point inside a view, in percent — so a callout can
 * be real HTML text laid over the drawing instead of scaled SVG glyphs.
 */
export function anchor(point: Pt, view: View): { left: string; top: string } {
  return {
    left: `${round(((point.x - view.minX) / view.w) * 100)}%`,
    top: `${round(((point.y - view.minY) / view.h) * 100)}%`,
  };
}
