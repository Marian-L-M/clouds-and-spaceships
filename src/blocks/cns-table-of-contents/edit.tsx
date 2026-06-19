import { __ } from "@wordpress/i18n";
import { useSelect, useDispatch } from "@wordpress/data";
import { useEffect, useRef } from "@wordpress/element";
import {
  InspectorControls,
  RichText,
  useBlockProps,
  store as blockEditorStore,
} from "@wordpress/block-editor";
import { PanelBody, Button, TextControl } from "@wordpress/components";
import type { BlockEditProps } from "@wordpress/blocks";

/** Minimal shape of an editor block as read from the block-editor store. */
interface EditorBlock {
  clientId: string;
  name: string;
  attributes: Record<string, unknown>;
  innerBlocks: EditorBlock[];
}

/** A single entry in the table of contents. */
export interface TocItem {
  clientId: string | null;
  label: string;
  anchor: string;
  labelOverride: boolean;
  anchorOverride: boolean;
}

export type TocAttributes = {
  title: string;
  items: TocItem[];
  removedIds: string[];
};

/** The attributes the TOC reads off source blocks (sections and headings). */
interface SourceAttributes {
  title?: string;
  content?: string;
  anchor?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function slugify(str: string): string {
  return (str || "")
    .replace(/<[^>]+>/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stripHtml(str: string): string {
  return (str || "").replace(/<[^>]+>/g, "").trim();
}

function flattenBlocks(blocks: EditorBlock[]): EditorBlock[] {
  return blocks.reduce<EditorBlock[]>((acc, block) => {
    acc.push(block);
    if (block.innerBlocks?.length)
      acc.push(...flattenBlocks(block.innerBlocks));
    return acc;
  }, []);
}

function sourceAttrs(block: EditorBlock): SourceAttributes {
  return block.attributes as SourceAttributes;
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function Edit({
  clientId: tocClientId,
  attributes,
  setAttributes,
}: BlockEditProps<TocAttributes>) {
  const { title, items, removedIds } = attributes;

  const { updateBlockAttributes } = useDispatch(blockEditorStore);

  const allBlocks = useSelect(
    (select) =>
      flattenBlocks(
        select(blockEditorStore).getBlocks() as unknown as EditorBlock[],
      ),
    [],
  );

  const sourceBlocks = allBlocks.filter(
    (b) =>
      b.clientId !== tocClientId &&
      (b.name === "cns-theme/cns-section" || b.name === "core/heading"),
  );

  // Stable dependency key — only changes when source block data relevant to the
  // TOC changes (title/content or anchor), not on every render.
  const sourceKey = sourceBlocks
    .map((b) =>
      [
        b.clientId,
        b.name === "cns-theme/cns-section"
          ? sourceAttrs(b).title
          : sourceAttrs(b).content,
        sourceAttrs(b).anchor ?? "",
      ].join(":"),
    )
    .join("|");

  // Avoid stale closure for items / removedIds inside the effect
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const removedIdsRef = useRef(removedIds);
  removedIdsRef.current = removedIds;

  useEffect(() => {
    const currentItems = itemsRef.current;
    const currentRemovedIds = removedIdsRef.current;

    // Auto-set missing anchors on core/heading blocks so their links work
    sourceBlocks.forEach((b) => {
      if (b.name === "core/heading" && !sourceAttrs(b).anchor) {
        const slug = slugify(stripHtml(sourceAttrs(b).content ?? ""));
        if (slug) updateBlockAttributes(b.clientId, { anchor: slug });
      }
    });

    // Build merged items list
    const nextItems: TocItem[] = [];

    sourceBlocks
      .filter((b) => !currentRemovedIds.includes(b.clientId))
      .forEach((b) => {
        const existing = currentItems.find((i) => i.clientId === b.clientId);
        const rawLabel =
          b.name === "cns-theme/cns-section"
            ? stripHtml(sourceAttrs(b).title || "")
            : stripHtml(sourceAttrs(b).content || "");
        const rawAnchor = sourceAttrs(b).anchor || slugify(rawLabel);

        nextItems.push(
          existing
            ? {
                ...existing,
                // Respect label/anchor overrides; otherwise follow the source block
                label: existing.labelOverride ? existing.label : rawLabel,
                anchor: existing.anchorOverride ? existing.anchor : rawAnchor,
              }
            : {
                clientId: b.clientId,
                label: rawLabel,
                anchor: rawAnchor,
                labelOverride: false,
                anchorOverride: false,
              },
        );
      });

    // Append manual items (no source block)
    currentItems
      .filter((i) => i.clientId === null)
      .forEach((i) => nextItems.push(i));

    if (JSON.stringify(nextItems) !== JSON.stringify(currentItems)) {
      setAttributes({ items: nextItems });
    }
  }, [sourceKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Item actions ────────────────────────────────────────────────────────────

  function updateItem(index: number, patch: Partial<TocItem>) {
    setAttributes({
      items: items.map((item, i) =>
        i === index ? { ...item, ...patch } : item,
      ),
    });
  }

  function removeItem(index: number) {
    const item = items[index];
    setAttributes({
      items: items.filter((_, i) => i !== index),
      removedIds: item.clientId
        ? [...removedIds, item.clientId]
        : removedIds,
    });
  }

  function resetItem(index: number) {
    const item = items[index];
    const src = sourceBlocks.find((b) => b.clientId === item.clientId);
    if (!src) return;
    const rawLabel =
      src.name === "cns-theme/cns-section"
        ? stripHtml(sourceAttrs(src).title || "")
        : stripHtml(sourceAttrs(src).content || "");
    const rawAnchor = sourceAttrs(src).anchor || slugify(rawLabel);
    updateItem(index, {
      label: rawLabel,
      anchor: rawAnchor,
      labelOverride: false,
      anchorOverride: false,
    });
  }

  function addManualItem() {
    setAttributes({
      items: [
        ...items,
        {
          clientId: null,
          label: __("New Item", "cns-theme"),
          anchor: "",
          labelOverride: true,
          anchorOverride: true,
        },
      ],
    });
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const blockProps = useBlockProps({ className: "cns-toc" });

  return (
    <>
      <InspectorControls>
        <PanelBody title={__("Table of Contents", "cns-theme")}>
          <p style={{ fontSize: "12px", color: "#757575", margin: "0 0 8px" }}>
            {__(
              "Items are auto-synced from CNS Section blocks and headings on the page. Edit labels and anchors inline to override them.",
              "cns-theme",
            )}
          </p>
          <Button
            variant="secondary"
            size="small"
            onClick={() => setAttributes({ removedIds: [] })}
          >
            {__("Restore removed items", "cns-theme")}
          </Button>
        </PanelBody>
      </InspectorControls>

      <div {...blockProps}>
        <RichText
          tagName="p"
          className="cns-toc__title"
          value={title}
          onChange={(value: string) => setAttributes({ title: value })}
          placeholder={__("Table of Contents", "cns-theme")}
          allowedFormats={[]}
        />

        {items.length === 0 ? (
          <p className="cns-toc__empty">
            {__(
              "Add CNS Section blocks or headings to the page to generate a table of contents.",
              "cns-theme",
            )}
          </p>
        ) : (
          <ol className="cns-toc__list cns-toc__list--editing">
            {items.map((item, i) => (
              <li
                key={item.clientId ?? `manual-${i}`}
                className="cns-toc__editor-item"
              >
                <div className="cns-toc__editor-main">
                  <span
                    className={`cns-toc__badge cns-toc__badge--${
                      item.clientId ? "auto" : "manual"
                    }`}
                  >
                    {item.clientId
                      ? __("auto", "cns-theme")
                      : __("manual", "cns-theme")}
                  </span>
                  <TextControl
                    value={item.label}
                    onChange={(v) =>
                      updateItem(i, { label: v, labelOverride: true })
                    }
                    placeholder={__("Label", "cns-theme")}
                    __nextHasNoMarginBottom
                    __next40pxDefaultSize
                  />
                  <Button
                    icon="no-alt"
                    label={__("Remove item", "cns-theme")}
                    size="small"
                    isDestructive
                    onClick={() => removeItem(i)}
                  />
                </div>

                <div className="cns-toc__editor-anchor">
                  <span className="cns-toc__anchor-prefix">#</span>
                  <TextControl
                    value={item.anchor}
                    onChange={(v) =>
                      updateItem(i, { anchor: v, anchorOverride: true })
                    }
                    placeholder={__("anchor-id", "cns-theme")}
                    __nextHasNoMarginBottom
                    __next40pxDefaultSize
                  />
                  {(item.labelOverride || item.anchorOverride) &&
                    item.clientId && (
                      <Button
                        variant="link"
                        size="small"
                        onClick={() => resetItem(i)}
                      >
                        {__("↺ Reset", "cns-theme")}
                      </Button>
                    )}
                </div>
              </li>
            ))}
          </ol>
        )}

        <Button
          variant="secondary"
          className="cns-toc__add-btn"
          onClick={addManualItem}
        >
          {__("+ Add item", "cns-theme")}
        </Button>
      </div>
    </>
  );
}
