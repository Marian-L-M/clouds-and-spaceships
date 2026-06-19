// Shared domain types for the WordPress data the blocks consume. The
// DefinitelyTyped @wordpress packages type most of the editor API surface, but
// the shapes of media attachments and REST entity records that these blocks
// actually read are loosely typed upstream, so we narrow them here.

/** A single registered image size on a media attachment. */
export interface WPMediaSize {
  url?: string;
  source_url?: string;
  width?: number;
  height?: number;
}

/** The media object passed to `MediaUpload`'s `onSelect` callback. */
export interface WPMedia {
  id: number;
  url?: string;
  alt?: string;
  sizes?: Record<string, WPMediaSize>;
  media_details?: {
    sizes?: Record<string, WPMediaSize>;
  };
}

/** A post-type record from `select('core').getPostTypes()`. */
export interface WPPostType {
  slug: string;
  viewable?: boolean;
  labels?: { name?: string };
}

/** A post record from `select('core').getEntityRecords('postType', ...)`. */
export interface WPPostRecord {
  id: number;
  slug: string;
  link: string;
  title?: { rendered?: string };
}

/**
 * The subset of the `core` data store's selectors these blocks use. The
 * `@wordpress/core-data` store types aren't installed (it's a webpack
 * external), so `select('core')` is cast to this shape at the call site.
 */
export interface CoreStoreSelectors {
  getPostTypes(query?: Record<string, unknown>): WPPostType[] | null;
  getEntityRecords(
    kind: "postType",
    name: string,
    query?: Record<string, unknown>,
  ): WPPostRecord[] | null;
}

/** Box spacing values shared by `BoxControl` (padding/offset). */
export interface BoxSides {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
}

/** A `{ label, value }` pair for `SelectControl`. */
export interface SelectOption {
  label: string;
  value: string;
}

/**
 * An `InnerBlocks`/`useInnerBlocksProps` template entry:
 * `[ blockName, attributes?, innerTemplate? ]`. Assignable to the readonly
 * `TemplateArray` the editor expects.
 */
export type BlockTemplate = [
  string,
  Record<string, unknown>?,
  BlockTemplate[]?,
];
