# AUVY Marketing

Public marketing visual kit for AUVY Fixed Layer storytelling.

## Packages

| Package | Role |
|---------|------|
| [`@auvy-marketing/iso`](packages/iso) | 30° isometric lattice math, Remotion-safe `IsoStage`, stroke law CSS |
| [`@auvy-marketing/linkedin-kit`](packages/linkedin-kit) | Aspect presets + plate recipes for LinkedIn cuts |

## Consumers

- **auvy-home** — site iso boards import `@auvy-marketing/iso` for lattice + hand context
- **auvy-movie-studio** — Remotion `ProjectRoomIso*` compositions compose iso plates

## Not this repo

| Concern | Lives in |
|---------|----------|
| Product UI / Filament | `auvy-filament` |
| Remotion harness / film CLI | `auvy-movie-studio` |
| Site sections / GSAP choreography | `auvy-home` |
| GTM essays / company SSOT | `auvy-company` |

## Visual law

See [docs/VISUAL_LAW.md](docs/VISUAL_LAW.md). Light default, hairline iso, Filament crimson at most once per plate.

## LinkedIn kits

Human recipes: [kits/linkedin/](kits/linkedin/). Remotion render commands live in movie-studio `films/project-room`.
