import { useSelect } from "@wordpress/data";
import { SYSTEM_POST_TYPES } from "../lib/constants";
import type {
  CoreStoreSelectors,
  SelectOption,
  WPPostRecord,
} from "../../types/wordpress";

/**
 * The author-facing, viewable post types as `{ label, value }` options for a
 * `SelectControl`. Internal WP types (templates, fonts, etc.) are filtered out.
 * Falls back to a single "Pages" option while the query resolves.
 */
export function usePostTypeOptions(): SelectOption[] {
  return useSelect((select) => {
    const core = select("core") as unknown as CoreStoreSelectors;
    const types = core.getPostTypes({ per_page: -1 });
    if (!types) return [{ label: "Pages", value: "page" }];
    return types
      .filter((pt) => pt.viewable && !SYSTEM_POST_TYPES.includes(pt.slug))
      .map((pt) => ({ label: pt.labels?.name || pt.slug, value: pt.slug }));
  }, []);
}

/**
 * The 20 most recent published records of `postType` (id/title/link/slug only).
 * `null` while loading; `[]` when none are found.
 */
export function usePublishedPosts(postType: string): WPPostRecord[] | null {
  return useSelect(
    (select) =>
      (select("core") as unknown as CoreStoreSelectors).getEntityRecords(
        "postType",
        postType,
        {
          per_page: 20,
          status: "publish",
          _fields: "id,title,link,slug",
        },
      ),
    [postType],
  );
}
