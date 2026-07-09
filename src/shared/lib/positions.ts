import type { CSSProperties } from "react";
import type { BoxSides } from "../../types/wordpress";

/** The nine content-placement anchors, row-major (matches the 3×3 picker). */
export const POSITIONS = [
  "top-left",
  "top-center",
  "top-right",
  "middle-left",
  "middle-center",
  "middle-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
] as const;

export type Position = (typeof POSITIONS)[number];

type Side = "top" | "right" | "bottom" | "left";

/** Flexbox alignment for a `"<v>-<h>"` position string. */
export function getFlexValues(position: string): {
  alignItems: CSSProperties["alignItems"];
  justifyContent: CSSProperties["justifyContent"];
} {
  const [v, h] = position.split("-");
  return {
    alignItems:
      v === "top" ? "flex-start" : v === "bottom" ? "flex-end" : "center",
    justifyContent:
      h === "left" ? "flex-start" : h === "right" ? "flex-end" : "center",
  };
}

/** The offset sides that are meaningful for a given position (centers omitted). */
export function getRelevantSides(position: string): Side[] {
  const [v, h] = position.split("-");
  const sides: Side[] = [];
  if (v === "top") sides.push("top");
  else if (v === "bottom") sides.push("bottom");
  if (h === "left") sides.push("left");
  else if (h === "right") sides.push("right");
  return sides;
}

/** Absolute-position inline style for an item at `position` with `offset`. */
export function getPositionStyle(
  position: string,
  offset: BoxSides = {},
): CSSProperties {
  const [v, h] = position.split("-");
  const style: CSSProperties = { position: "absolute" };
  if (v === "top") style.top = offset.top ?? "1rem";
  else if (v === "bottom") style.bottom = offset.bottom ?? "1rem";
  else {
    style.top = "50%";
    style.transform = "translateY(-50%)";
  }
  if (h === "left") style.left = offset.left ?? "1rem";
  else if (h === "right") style.right = offset.right ?? "1rem";
  else {
    style.left = "50%";
    style.transform = style.transform
      ? "translate(-50%, -50%)"
      : "translateX(-50%)";
  }
  return style;
}
