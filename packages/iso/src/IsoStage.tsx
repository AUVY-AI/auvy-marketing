import type { CSSProperties, ReactNode } from "react";

import { IsoHandProvider } from "./IsoHandContext";
import { type IsoHand, type IsoPerspective, type View } from "./iso";

export interface IsoStageProps {
  view: View;
  label: string;
  children: ReactNode;
  /** `-1` = opposite isometric corner. */
  hand?: IsoHand;
  perspective?: IsoPerspective;
  /** Transparent stage — Remotion / hero overlays. */
  clean?: boolean;
  width?: number | string;
  height?: number | string;
  style?: CSSProperties;
  className?: string;
}

/**
 * Remotion-safe isometric SVG stage (no GSAP / Next).
 * Site choreography stays in auvy-home `IsoScene`.
 */
export function IsoStage({
  view,
  label,
  children,
  hand = 1,
  perspective = "iso",
  clean = true,
  width = "100%",
  height = "100%",
  style,
  className,
}: IsoStageProps) {
  return (
    <IsoHandProvider hand={hand} perspective={perspective}>
      <div
        className={className}
        style={{
          position: "relative",
          width,
          height,
          margin: 0,
          padding: clean ? 0 : 12,
          background: clean ? "transparent" : "var(--iso-bg-page, #f7f8fa)",
          border: clean ? 0 : "1px solid var(--iso-border-subtle, #e2e5ea)",
          boxSizing: "border-box",
          ...style,
        }}
      >
        <svg
          viewBox={`${view.minX} ${view.minY} ${view.w} ${view.h}`}
          role="img"
          aria-label={label}
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: "100%", overflow: "visible", display: "block" }}
          preserveAspectRatio="xMidYMid meet"
        >
          {children}
        </svg>
      </div>
    </IsoHandProvider>
  );
}
