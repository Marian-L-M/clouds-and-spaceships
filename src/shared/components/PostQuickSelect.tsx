import { __ } from "@wordpress/i18n";
import { decodeEntities } from "@wordpress/html-entities";
import { SelectControl } from "../../types/wp-components";
import type { SelectOption, WPPostRecord } from "../../types/wordpress";

interface PostQuickSelectProps {
  /** Optional heading rendered above the post-type select. */
  heading?: string;
  /** Optional label on the post-type `SelectControl`. */
  label?: string;
  postType: string;
  postTypeOptions: SelectOption[];
  onPostTypeChange: (value: string) => void;
  /** `null` while loading; `[]` when none found. */
  posts: WPPostRecord[] | null;
  onPick: (post: WPPostRecord) => void;
}

/**
 * A post-type selector plus a scrollable list of that type's published posts.
 * Clicking a post calls `onPick` — callers decide what to do with it (set a
 * URL, a label, etc.).
 */
export function PostQuickSelect({
  heading,
  label,
  postType,
  postTypeOptions,
  onPostTypeChange,
  posts,
  onPick,
}: PostQuickSelectProps) {
  return (
    <div className="cns-picker">
      {heading && <p className="cns-picker__heading">{heading}</p>}
      <SelectControl
        label={label}
        value={postType}
        options={postTypeOptions}
        onChange={onPostTypeChange}
        __next40pxDefaultSize
      />
      <div className="cns-picker__list">
        {posts === null && (
          <p className="cns-picker__status">{__("Loading…", "cns-theme")}</p>
        )}
        {posts?.length === 0 && (
          <p className="cns-picker__status">
            {__("No published items found.", "cns-theme")}
          </p>
        )}
        {posts?.map((post) => (
          <button
            key={post.id}
            type="button"
            className="cns-picker__item"
            onClick={() => onPick(post)}
          >
            {decodeEntities(post.title?.rendered || post.slug)}
          </button>
        ))}
      </div>
    </div>
  );
}
