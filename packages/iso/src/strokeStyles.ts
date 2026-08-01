/** Inline SVG style helpers for Remotion (no CSS module required). */

export const stroke = {
  lattice: {
    fill: "none",
    stroke: "var(--iso-border-strong, #c5cad3)",
    strokeWidth: 0.03,
    opacity: 0.42,
  },
  latticeEdge: {
    fill: "none",
    stroke: "var(--iso-border-ink, #1a1d24)",
    strokeWidth: 0.065,
  },
  structure: {
    fill: "none",
    stroke: "var(--iso-border-ink, #1a1d24)",
    strokeWidth: 0.07,
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
  },
  emphasis: {
    fill: "none",
    stroke: "var(--iso-border-ink, #1a1d24)",
    strokeWidth: 0.11,
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
  },
  filament: {
    fill: "none",
    stroke: "var(--iso-accent, #d7025c)",
    strokeWidth: 0.13,
    strokeLinecap: "round" as const,
  },
  traceInk: {
    fill: "none",
    stroke: "var(--iso-border-ink, #1a1d24)",
    strokeWidth: 0.09,
  },
  faceCommitted: {
    fill: "var(--iso-face-committed, #ffffff)",
    stroke: "none",
  },
  faceGlass: {
    fill: "var(--iso-face-glass, rgba(255,255,255,0.55))",
    stroke: "none",
  },
  faceStage: {
    fill: "var(--iso-face-stage, #eef0f3)",
    stroke: "none",
  },
  node: {
    fill: "var(--iso-face-committed, #ffffff)",
    stroke: "var(--iso-border-ink, #1a1d24)",
    strokeWidth: 0.06,
  },
  nodeAccent: {
    fill: "var(--iso-accent, #d7025c)",
    stroke: "none",
  },
} as const;
