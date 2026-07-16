import { useState, useRef, useEffect } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import { decodeEntities } from "@wordpress/html-entities";
import { ComboboxControl, SelectControl } from "../../types/wp-components";
import { usePublishedPosts } from "../hooks/usePostPicker";
import type { SelectOption, WPPostRecord } from "../../types/wordpress";

interface PostQuickSelectProps {
  /** Optional heading rendered above the post-type select. */
  heading?: string;
  /** Optional label on the post-type `SelectControl`. */
  label?: string;
  postType: string;
  postTypeOptions: SelectOption[];
  onPostTypeChange: (value: string) => void;
  onPick: (post: WPPostRecord) => void;
}

/**
 * A post-type selector plus a searchable ComboboxControl over that type's
 * published posts (fetched via the core-data store; typing narrows the query
 * server-side). Picking a post calls `onPick` — callers decide what to do
 * with it (set a URL, a label, etc.).
 */
export function PostQuickSelect({
  heading,
  label,
  postType,
  postTypeOptions,
  onPostTypeChange,
  onPick,
}: PostQuickSelectProps) {
  const [search, setSearch] = useState("");
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const posts = usePublishedPosts(postType, search);

  const options = (posts ?? []).map((post) => ({
    value: String(post.id),
    label: decodeEntities(post.title?.rendered || post.slug),
  }));

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
      <ComboboxControl
        label={__("Post", "cns-theme")}
        placeholder={
          posts === null
            ? __("Loading…", "cns-theme")
            : __("Search or browse…", "cns-theme")
        }
        value={null}
        options={options}
        onFilterValueChange={(input) => {
          if (timer.current) window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => setSearch(input), 300);
        }}
        onChange={(value) => {
          const post = (posts ?? []).find((p) => String(p.id) === value);
          if (post) onPick(post);
        }}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
      />
    </div>
  );
}
