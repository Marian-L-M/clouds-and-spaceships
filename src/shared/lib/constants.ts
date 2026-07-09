import type { BoxSides } from "../../types/wordpress";

/**
 * Internal WordPress post types that should never appear in author-facing
 * post-type pickers (templates, reusable blocks, fonts, etc.).
 */
export const SYSTEM_POST_TYPES = [
  "attachment",
  "wp_template",
  "wp_template_part",
  "wp_navigation",
  "wp_global_styles",
  "wp_block",
  "wp_font_family",
  "wp_font_face",
];

/** CSS length units offered by `UnitControl` inputs. */
export const UNIT_OPTIONS = [
  { value: "px", label: "px", default: 0 },
  { value: "%", label: "%", default: 0 },
  { value: "vw", label: "vw", default: 0 },
  { value: "em", label: "em", default: 0 },
  { value: "rem", label: "rem", default: 0 },
];

/** Default 1rem inset applied to positioned overlay items. */
export const DEFAULT_OFFSET: BoxSides = {
  top: "1rem",
  right: "1rem",
  bottom: "1rem",
  left: "1rem",
};
