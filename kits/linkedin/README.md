# LinkedIn kits — Fixed Layer

Visual recipes for Remotion `ProjectRoomIso*` cuts. Copy lives in **auvy-movie-studio** `content/social/linkedin/`.

## Aspects

| Aspect | Size | Use |
|--------|------|-----|
| 1:1 | 1080×1080 | Primary feed video |
| 9:16 | 1080×1920 | Instant vertical |
| 1.91:1 | 1200×628 | Link preview crop (optional) |

## Plates

| Recipe | Composition | Motif |
|--------|-------------|-------|
| Launch | `ProjectRoomIsoLinkedIn` | Room lattice → loop → CTA (~28s) |
| Instant | `ProjectRoomIsoInstant` (+ Vertical) | Session steps as iso blocks (~14s) |
| Loop | `ProjectRoomIsoLoop` | Capture · Sync · Act pads (~14s) |
| Limits | `ProjectRoomIsoCta` | Scope + CTA still-capable (~7s) |

Machine-readable: `@auvy-marketing/linkedin-kit` `PLATE_RECIPES`.

## Render (movie-studio)

```bash
cd /srv/auvy/workspace/auvy-movie-studio/films/project-room
bun run render:iso-linkedin
bun run render:iso-instant
bun run render:iso-loop
bun run render:iso-cta
```
