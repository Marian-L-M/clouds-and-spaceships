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
import { SelectControl, URLInput } from "../../types/wp-components";
import type { BlockEditProps } from "@wordpress/blocks";
import type { ReactElement } from "react";
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
  items: SidebarItem[];
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
  const { items, placement, mode } = attributes;

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
    { label: __("None (top level)", "cns-theme"), value: "" },
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

  // ── Render helpers ──────────────────────────────────────────────────────────

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
        <Button variant="tertiary" onClick={() => openEditModal(originalIndex)}>
          {isGroup ? "▸ " : ""}
          {item.label || __("(untitled)", "cns-theme")}
          {isGroup && (
            <span className="cns-sidebar__group-state">
              {item.groupDefaultOpen
                ? __(" [open]", "cns-theme")
                : __(" [closed]", "cns-theme")}
            </span>
          )}
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
      })}
    >
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
        </PanelBody>
      </InspectorControls>

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

      {isModalOpen && (
        <Modal
          title={
            editingIndex !== null
              ? __("Edit Link", "cns-theme")
              : __("Add Link", "cns-theme")
          }
          onRequestClose={closeModal}
          className="cns-sidebar__modal"
        >
          {/* Type selector */}
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
              <div className="cns-sidebar__url-field">
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
                <p className="cns-sidebar__quick-select-heading">
                  {__("Or pick from:", "cns-theme")}
                </p>
                <SelectControl
                  value={quickSelectType}
                  options={
                    postTypeOptions ?? [{ label: "Pages", value: "page" }]
                  }
                  onChange={setQuickSelectType}
                  __next40pxDefaultSize
                />
                <div className="cns-sidebar__quick-select-list">
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
                help={
                  draft.parentId
                    ? __("Nested under the selected parent.", "cns-theme")
                    : __("Top-level link.", "cns-theme")
                }
                __next40pxDefaultSize
              />
            </>
          )}

          {/* Group options */}
          {draft.itemType === "group" && (
            <ToggleControl
              label={__("Default state", "cns-theme")}
              help={
                draft.groupDefaultOpen
                  ? __("Group starts expanded.", "cns-theme")
                  : __("Group starts collapsed.", "cns-theme")
              }
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

          <div className="cns-sidebar__modal-actions">
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
        </Modal>
      )}

      {mode === "toggle" && (
        <div
          className="cns-sidebar__toggle-btn"
          role="button"
          aria-label={__("Toggle sidebar", "cns-theme")}
        >
          <span />
          <span />
          <span />
        </div>
      )}

      <div className="cns-sidebar__panel">
        {mode === "fixed" && (
          <button className="cns-sidebar__mobile-toggle" type="button">
            {__("Navigation", "cns-theme")}
            <span className="cns-sidebar__mobile-arrow">▼</span>
          </button>
        )}
        <nav className="cns-sidebar__nav">
          <ul className="cns-sidebar__links">
            {topLevelItems.length === 0 && (
              <li className="cns-sidebar__empty">
                {__(
                  'No links yet — use "Add link" in the toolbar.',
                  "cns-theme",
                )}
              </li>
            )}
            {topLevelItems.map(renderNavItem)}
          </ul>
        </nav>
      </div>
    </div>
  );
}
