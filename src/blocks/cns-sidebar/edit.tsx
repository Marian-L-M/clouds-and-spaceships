import { __ } from "@wordpress/i18n";
import { useState } from "@wordpress/element";
import { useSelect } from "@wordpress/data";
import { decodeEntities } from "@wordpress/html-entities";
import {
  useBlockProps,
  InspectorControls,
  BlockControls,
} from "@wordpress/block-editor";
import {
  Button,
  Modal,
  PanelBody,
  PanelRow,
  TextControl,
  ToggleControl,
  ToolbarGroup,
  ToolbarButton,
} from "@wordpress/components";
import {
  SelectControl,
  URLInput,
  RangeControl,
} from "../../types/wp-components";
import type { BlockEditProps } from "@wordpress/blocks";
import type { CSSProperties, ReactElement } from "react";
import type {
  CoreStoreSelectors,
  SelectOption,
  WPPostRecord,
} from "../../types/wordpress";
import "./editor.scss";

type SidebarItemType = "link" | "group";

/** A sidebar navigation item (link or group header). */
export interface SidebarItem {
  id: string;
  label: string;
  url: string;
  linkNewTab: boolean;
  order: number;
  parentId: string | null;
  itemType: SidebarItemType;
  groupDefaultOpen?: boolean;
}

/** The in-progress item being added or edited in the modal. */
type SidebarDraft = Omit<SidebarItem, "id" | "groupDefaultOpen"> & {
  groupDefaultOpen: boolean;
};

export type SidebarAttributes = {
  placement: string;
  mode: string;
  maxWidth?: string;
  items: SidebarItem[];
  // Added implicitly by the block's color support (block.json `supports.color`)
  backgroundColor?: string;
  textColor?: string;
  style?: {
    color?: {
      background?: string;
      text?: string;
    };
  };
};

const SYSTEM_POST_TYPES = [
  "attachment",
  "wp_template",
  "wp_template_part",
  "wp_navigation",
  "wp_global_styles",
  "wp_block",
  "wp_font_family",
  "wp_font_face",
];

// Max-width slider bounds (px). Mirrors the cns-hero height control.
const MAX_WIDTH_MIN = 240;
const MAX_WIDTH_MAX = 1280;
const MAX_WIDTH_STEP = 10;

/** Pull the numeric (px) part out of a stored length like "640px". */
function parseMaxWidthPx(value: string | undefined): number | undefined {
  const match = (value ?? "").match(/^(\d*\.?\d+)/);
  return match ? parseFloat(match[1]) : undefined;
}

const EMPTY_DRAFT: SidebarDraft = {
  label: "",
  url: "",
  linkNewTab: false,
  order: 0,
  parentId: null,
  itemType: "link",
  groupDefaultOpen: true,
};

export default function Edit({
  attributes,
  setAttributes,
}: BlockEditProps<SidebarAttributes>) {
  const {
    items,
    placement,
    mode,
    maxWidth,
    backgroundColor,
    textColor,
    style,
  } = attributes;

  // Mirror render.php: expose the chosen colors and max width as scoped custom
  // properties so the editor preview matches the front end. Preset colors map to
  // theme CSS variables; custom colors pass through as raw values.
  const bgValue = backgroundColor
    ? `var(--wp--preset--color--${backgroundColor})`
    : style?.color?.background;
  const textValue = textColor
    ? `var(--wp--preset--color--${textColor})`
    : style?.color?.text;
  const styleVars = {
    ...(bgValue ? { "--cns-sb-bg": bgValue } : {}),
    ...(textValue ? { "--cns-sb-text": textValue } : {}),
    ...(maxWidth ? { "--cns-sb-max-width": maxWidth } : {}),
  } as CSSProperties;

  // Drive the slider from the numeric (px) part of the stored maxWidth.
  const maxWidthAmount = parseMaxWidthPx(maxWidth);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<SidebarDraft>(EMPTY_DRAFT);
  const [quickSelectType, setQuickSelectType] = useState("page");

  // ── Derived data ───────────────────────────────────────────────────────────

  const sortedItems = [...items].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

  const editingItem = editingIndex !== null ? items[editingIndex] : null;

  // Siblings share the same parentId level as the draft
  const siblings = sortedItems.filter(
    (i) => (i.parentId || null) === (draft.parentId || null),
  );
  const currentSiblingIndex = editingItem
    ? siblings.findIndex((i) => i.id === editingItem.id)
    : -1;

  // Valid parents: top-level items + links that are direct children of a group.
  // Indented label shows when an option is itself nested under a group.
  const groupIds = new Set(
    items.filter((i) => i.itemType === "group").map((i) => i.id),
  );
  const parentOptions: SelectOption[] = [
    { label: __("---", "cns-theme"), value: "" },
    ...sortedItems
      .filter((i) => {
        if (i.id === editingItem?.id) return false; // can't parent itself
        if (!i.parentId) return true; // top-level always valid
        return groupIds.has(i.parentId); // child-of-group is valid
      })
      .map((i) => ({
        label: i.parentId
          ? `  ↳ ${i.label || __("(untitled)", "cns-theme")}`
          : i.label || __("(untitled)", "cns-theme"),
        value: i.id,
      })),
  ];

  const topLevelItems = sortedItems.filter((i) => !i.parentId);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const postTypeOptions = useSelect((select) => {
    const core = select("core") as unknown as CoreStoreSelectors;
    const types = core.getPostTypes({ per_page: -1 });
    if (!types) return [{ label: "Pages", value: "page" }];
    return types
      .filter((pt) => pt.viewable && !SYSTEM_POST_TYPES.includes(pt.slug))
      .map((pt) => ({ label: pt.labels?.name || pt.slug, value: pt.slug }));
  }, []);

  const quickSelectPosts = useSelect(
    (select) =>
      (select("core") as unknown as CoreStoreSelectors).getEntityRecords(
        "postType",
        quickSelectType,
        {
          per_page: 20,
          status: "publish",
          _fields: "id,title,link,slug",
        },
      ),
    [quickSelectType],
  );

  // ── Modal handlers ──────────────────────────────────────────────────────────

  function openAddModal() {
    const topLevelCount = items.filter((i) => !i.parentId).length;
    setDraft({ ...EMPTY_DRAFT, order: topLevelCount });
    setEditingIndex(null);
    setIsModalOpen(true);
  }

  function openEditModal(index: number) {
    const item = items[index];
    setDraft({
      label: item.label,
      url: item.url || "",
      linkNewTab: item.linkNewTab || false,
      order: item.order ?? 0,
      parentId: item.parentId || null,
      itemType: item.itemType || "link",
      groupDefaultOpen: item.groupDefaultOpen ?? true,
    });
    setEditingIndex(index);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  function saveItem() {
    const isGroup = draft.itemType === "group";
    const newItem: SidebarItem = {
      id: editingItem ? editingItem.id : String(Date.now()),
      label: draft.label,
      url: isGroup ? "" : draft.url,
      linkNewTab: isGroup ? false : draft.linkNewTab,
      order: draft.order,
      parentId: isGroup ? null : draft.parentId || null,
      itemType: draft.itemType,
      groupDefaultOpen: isGroup ? draft.groupDefaultOpen : undefined,
    };
    if (editingIndex !== null) {
      setAttributes({
        items: items.map((item, i) => (i === editingIndex ? newItem : item)),
      });
    } else {
      setAttributes({ items: [...items, newItem] });
    }
    closeModal();
  }

  function removeItem(index: number) {
    const removedId = items[index].id;
    const updated = items
      .filter((_, i) => i !== index)
      .map((item) =>
        item.parentId === removedId ? { ...item, parentId: null } : item,
      );
    setAttributes({ items: updated });
    setEditingIndex(null);
    setIsModalOpen(false);
  }

  function moveItem(direction: "up" | "down") {
    if (editingIndex === null) return;
    const swapIdx =
      direction === "up" ? currentSiblingIndex - 1 : currentSiblingIndex + 1;
    if (swapIdx < 0 || swapIdx >= siblings.length) return;

    const currentOrder =
      siblings[currentSiblingIndex].order ?? currentSiblingIndex;
    const swapOrder = siblings[swapIdx].order ?? swapIdx;
    const currentId = items[editingIndex].id;

    setAttributes({
      items: items.map((item) => {
        if (item.id === currentId) return { ...item, order: swapOrder };
        if (item.id === siblings[swapIdx].id)
          return { ...item, order: currentOrder };
        return item;
      }),
    });
    setDraft((prev) => ({ ...prev, order: swapOrder }));
  }

  function setParent(parentId: string) {
    const newParentId = parentId || null;
    const siblingCount = items.filter(
      (i) => (i.parentId || null) === newParentId && i.id !== editingItem?.id,
    ).length;
    setDraft((prev) => ({
      ...prev,
      parentId: newParentId,
      order: siblingCount,
    }));
  }

  function applyQuickSelect(post: WPPostRecord) {
    setDraft((prev) => ({
      ...prev,
      label: prev.label || decodeEntities(post.title?.rendered || post.slug),
      url: post.link,
    }));
  }

  // Render helpers
  // Render links either as solitary link or as nested group
  function renderNavItem(item: SidebarItem): ReactElement {
    const originalIndex = items.findIndex((i) => i.id === item.id);
    const children = sortedItems.filter((i) => i.parentId === item.id);
    const isGroup = item.itemType === "group";

    return (
      <li
        key={item.id}
        className={`cns-sidebar__item${
          isGroup ? " cns-sidebar__item--group" : ""
        }`}
      >
        <Button
          className="cns-elements__btn cns-elements__edit-btn"
          onClick={() => openEditModal(originalIndex)}
        >
          {isGroup ? "▼" : ""}
          {item.label || __("(untitled)", "cns-theme")}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
            <path d="m15 5 4 4" />
          </svg>
        </Button>
        {children.length > 0 && (
          <ul className="cns-sidebar__sub-links">
            {children.map((child) => {
              const childIndex = items.findIndex((i) => i.id === child.id);
              return (
                <li
                  key={child.id}
                  className="cns-sidebar__item cns-sidebar__item--child"
                >
                  <Button
                    variant="tertiary"
                    onClick={() => openEditModal(childIndex)}
                  >
                    {child.label || __("(untitled)", "cns-theme")}
                    Click to edit child
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </li>
    );
  }

  // ── JSX ──────────────────────────────────────────────────────────────────────

  return (
    <div
      {...useBlockProps({
        className: `cns-sidebar cns-sidebar--${placement} cns-sidebar--${mode}`,
        style: styleVars,
      })}
    >
      {/* Mode settings */}
      <InspectorControls>
        <PanelBody title={__("Sidebar Settings", "cns-theme")}>
          <PanelRow>
            <SelectControl
              label={__("Placement", "cns-theme")}
              value={placement}
              options={[
                { label: "Left (default)", value: "left" },
                { label: "Right", value: "right" },
              ]}
              onChange={(value) => setAttributes({ placement: value })}
              __next40pxDefaultSize
            />
          </PanelRow>
          <PanelRow>
            <SelectControl
              label={__("Display mode", "cns-theme")}
              value={mode}
              options={[
                { label: "Fixed (always visible)", value: "fixed" },
                { label: "Toggle (overlay)", value: "toggle" },
              ]}
              onChange={(value) => setAttributes({ mode: value })}
              __next40pxDefaultSize
            />
          </PanelRow>
          <RangeControl
            label={__("Max width (px)", "cns-theme")}
            value={maxWidthAmount}
            min={MAX_WIDTH_MIN}
            max={MAX_WIDTH_MAX}
            step={MAX_WIDTH_STEP}
            onChange={(value) =>
              setAttributes({
                maxWidth: value === undefined ? "" : `${value}px`,
              })
            }
            __next40pxDefaultSize
          />
        </PanelBody>
      </InspectorControls>

      {/* Toolbar settings */}
      <BlockControls>
        <ToolbarGroup>
          <ToolbarButton
            label={__("Add link", "cns-theme")}
            onClick={openAddModal}
          >
            {__("Add link", "cns-theme")}
          </ToolbarButton>
        </ToolbarGroup>
      </BlockControls>

      {/* Modal settings */}
      {isModalOpen && (
        <Modal
          title={
            editingIndex !== null
              ? __("Edit Link", "cns-theme")
              : __("Add Link", "cns-theme")
          }
          onRequestClose={closeModal}
          className="cns-elements__modal cns-sidebar__modal"
        >
          <div className="cns-elements__modal-contents cns-sidebar__modal-contents">
            <SelectControl
              label={__("Type", "cns-theme")}
              value={draft.itemType}
              options={[
                { label: __("Link", "cns-theme"), value: "link" },
                { label: __("Group header", "cns-theme"), value: "group" },
              ]}
              onChange={(value) =>
                setDraft((prev) => ({
                  ...prev,
                  itemType: value as SidebarItemType,
                  parentId: value === "group" ? null : prev.parentId,
                }))
              }
              __next40pxDefaultSize
            />

            <TextControl
              label={__("Label", "cns-theme")}
              value={draft.label}
              onChange={(value) =>
                setDraft((prev) => ({ ...prev, label: value }))
              }
              __next40pxDefaultSize
            />

            {/* URL — only for links */}
            {draft.itemType === "link" && (
              <>
                <div className="cns-elements__input-group cns-sidebar__url-field">
                  <label className="components-base-control__label">
                    {__("URL", "cns-theme")}
                  </label>
                  <URLInput
                    value={draft.url}
                    onChange={(url) => setDraft((prev) => ({ ...prev, url }))}
                    placeholder={__("Paste URL or search…", "cns-theme")}
                  />
                </div>

                <div className="cns-sidebar__quick-select">
                  <div className="cns-elements__input-group">
                    <SelectControl
                      label={__("Quickselect from", "cns-theme")}
                      value={quickSelectType}
                      options={
                        postTypeOptions ?? [{ label: "Pages", value: "page" }]
                      }
                      onChange={setQuickSelectType}
                      __next40pxDefaultSize
                    />
                  </div>
                  <div className="cns-elements__modal-actions cns-sidebar__quick-select-list">
                    {quickSelectPosts === null && (
                      <p className="cns-sidebar__quick-select-status">
                        {__("Loading…", "cns-theme")}
                      </p>
                    )}
                    {quickSelectPosts?.length === 0 && (
                      <p className="cns-sidebar__quick-select-status">
                        {__("No published items found.", "cns-theme")}
                      </p>
                    )}
                    {quickSelectPosts?.map((post) => (
                      <button
                        key={post.id}
                        type="button"
                        className="cns-sidebar__quick-select-item"
                        onClick={() => applyQuickSelect(post)}
                      >
                        {decodeEntities(post.title?.rendered || post.slug)}
                      </button>
                    ))}
                  </div>
                </div>

                <SelectControl
                  label={__("Parent", "cns-theme")}
                  value={draft.parentId || ""}
                  options={parentOptions}
                  onChange={setParent}
                  __next40pxDefaultSize
                />
              </>
            )}

            {/* Group options */}
            {draft.itemType === "group" && (
              <ToggleControl
                label={__(
                  draft.groupDefaultOpen
                    ? __("Expanded.", "cns-theme")
                    : __("Collapsed", "cns-theme"),
                  "cns-theme",
                )}
                help={"Default state"}
                checked={draft.groupDefaultOpen}
                onChange={(value) =>
                  setDraft((prev) => ({ ...prev, groupDefaultOpen: value }))
                }
              />
            )}

            {/* Order controls */}
            {editingIndex !== null && (
              <div className="cns-sidebar__order-controls">
                <span className="cns-sidebar__order-label">
                  {__("Position", "cns-theme")} {currentSiblingIndex + 1} /{" "}
                  {siblings.length}
                </span>
                <div className="cns-sidebar__order-buttons">
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => moveItem("up")}
                    disabled={currentSiblingIndex === 0}
                  >
                    ▲
                  </Button>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => moveItem("down")}
                    disabled={currentSiblingIndex === siblings.length - 1}
                  >
                    ▼
                  </Button>
                </div>
              </div>
            )}

            <div className="cns-elements__modal-actions cns-sidebar__modal-actions">
              <Button variant="primary" onClick={saveItem}>
                {" "}
                {__("Save", "cns-theme")}
              </Button>
              <Button variant="secondary" onClick={closeModal}>
                {__("Cancel", "cns-theme")}
              </Button>
              {editingIndex !== null && (
                <Button
                  variant="tertiary"
                  isDestructive
                  onClick={() => removeItem(editingIndex)}
                >
                  {__("Remove", "cns-theme")}
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {mode === "toggle" && (
        <div
          className="cns-sidebar__float-toggle-btn"
          role="button"
          aria-label={__("Toggle sidebar", "cns-theme")}
        >
          <span />
          <span />
          <span />
        </div>
      )}

      {/* Sidebar contents */}
      <div className="cns-sidebar__panel">
        {mode === "fixed" && (
          <button
            className="cns-elements__btn-ghost cns-sidebar__mobile-toggle"
            type="button"
          >
            {__("Navigation", "cns-theme")}
            <span className="cns-sidebar__mobile-arrow">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </span>
          </button>
        )}
        <nav className="cns-sidebar__nav">
          <ul className="cns-sidebar__links">
            {topLevelItems.length === 0 && (
              <li className="cns-sidebar__empty">
                {__("Add links in the toolbar.", "cns-theme")}
              </li>
            )}
            {topLevelItems.map(renderNavItem)}
          </ul>
        </nav>
      </div>
    </div>
  );
}
