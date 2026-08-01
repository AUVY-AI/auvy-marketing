/** LinkedIn publish aspects (px). */
export const ASPECTS = {
  square: { id: "1:1", width: 1080, height: 1080 },
  vertical: { id: "9:16", width: 1080, height: 1920 },
  linkPreview: { id: "1.91:1", width: 1200, height: 628 },
} as const;

export type PlateRecipeId = "launch" | "instant" | "loop" | "limits";

export type PlateRecipe = {
  id: PlateRecipeId;
  compositionId: string;
  aspect: keyof typeof ASPECTS;
  durationSeconds: { min: number; max: number };
  motif: string;
  socialPost: string;
  stillOk: boolean;
};

/** Aligns with movie-studio content/social/linkedin posts. */
export const PLATE_RECIPES: PlateRecipe[] = [
  {
    id: "launch",
    compositionId: "ProjectRoomIsoLinkedIn",
    aspect: "square",
    durationSeconds: { min: 25, max: 30 },
    motif: "Project room hero lattice → Capture · Sync · Act → CTA",
    socialPost: "content/social/linkedin/posts/01-launch-en.md",
    stillOk: false,
  },
  {
    id: "instant",
    compositionId: "ProjectRoomIsoInstant",
    aspect: "square",
    durationSeconds: { min: 12, max: 15 },
    motif: "First-session filmstrip as iso blocks lighting in sequence",
    socialPost: "content/social/linkedin/posts/02-instant-feel-en.md",
    stillOk: false,
  },
  {
    id: "loop",
    compositionId: "ProjectRoomIsoLoop",
    aspect: "square",
    durationSeconds: { min: 12, max: 15 },
    motif: "Three iso pads — Capture · Sync · Act — filament on the active pad",
    socialPost: "content/social/linkedin/posts/03-loop-vignette-en.md",
    stillOk: false,
  },
  {
    id: "limits",
    compositionId: "ProjectRoomIsoCta",
    aspect: "square",
    durationSeconds: { min: 6, max: 8 },
    motif: "Scope band + primary CTA; end frame usable as still",
    socialPost: "content/social/linkedin/posts/04-limits-as-trust-en.md",
    stillOk: true,
  },
];

export const VERTICAL_INSTANT = {
  compositionId: "ProjectRoomIsoInstantVertical",
  aspect: "vertical" as const,
  pairsWith: "instant" as PlateRecipeId,
};
