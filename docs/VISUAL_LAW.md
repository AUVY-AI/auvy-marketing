# Visual law — marketing iso

Binding for `@auvy-marketing/iso` and LinkedIn plates.

## Projection

- True **30°** isometric lattice (`iso.ts`). Every path is plotted from lattice coords — never freehand SVG.
- Values rounded to **two decimals** (SSR / Remotion frame stability).
- Hands: `1` default, `-1` opposite corner. Perspectives: `iso` | `birdseye` | `low`.

## Light craft

- Cool stage (not warm paper). Clear-white committed faces. Glass = staged.
- **Crimson at most once** per plate (live / CTA / approval filament).
- No purple, no neon washes, no invented logos / testimonials / metrics.

## Stroke hierarchy

| Role | Intent |
|------|--------|
| Lattice | Soft ground mesh |
| Structure | Primary edges |
| Emphasis | Featured block |
| Trace ink | Cool connections |
| Filament | Single hot accent path |

CSS: `packages/iso/src/iso.css` + `tokens.css`. Remotion: `stroke` helpers from the package.

## Filament alignment

Accent `#d7025c` matches Filament ribbon crimson. Import Filament tokens in product chrome; do **not** reimplement Filament React widgets here.
