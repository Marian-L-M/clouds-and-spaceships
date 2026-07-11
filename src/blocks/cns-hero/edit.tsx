import { __ } from "@wordpress/i18n";
import { useSelect } from "@wordpress/data";
import { useState } from "@wordpress/element";
import { decodeEntities } from "@wordpress/html-entities";
import {
  BlockControls,
  InspectorControls,
  useBlockProps,
  useInnerBlocksProps,
} from "@wordpress/block-editor";
import type { BlockEditProps } from "@wordpress/blocks";
import {
  Modal,
  PanelBody,
  Button,
  RangeControl,
  TextControl,
  ToolbarGroup,
  ToolbarButton,
} from "@wordpress/components";

// Types
import type { CSSProperties, ReactNode } from "react";
import {
  ColorPicker,
  BoxControl,
  BorderBoxControl,
  SelectControl,
  UnitControl,
  URLInput,
} from "../../types/wp-components";
import type {
  BorderBoxValue,
  BorderValue,
  SplitBorderValue,
} from "../../types/wp-components";
import type { BoxSides, WPPostRecord } from "../../types/wordpress";

// Shared
import { MediaPicker } from "../../shared/components/MediaPicker";
import { PositionPicker } from "../../shared/components/PositionPicker";
import { PostQuickSelect } from "../../shared/components/PostQuickSelect";
import {
  usePostTypeOptions,
  usePublishedPosts,
} from "../../shared/hooks/usePostPicker";
import { DEFAULT_OFFSET, UNIT_OPTIONS } from "../../shared/lib/constants";
import {
  getFlexValues,
  getPositionStyle,
  getRelevantSides,
} from "../../shared/lib/positions";
import { CnsRenderIcon } from "../../shared/functions/renderIcons";

export interface HeroCreditItem {
  id: string;
  url: string;
  text: string;
  position: string;
  offset: BoxSides;
  color: string;
  icon: string;
  order?: number;
  parentId?: string | null;
}

type HeroDraft = Omit<HeroCreditItem, "order" | "parentId"> & {
  order?: number;
};

export type HeroAttributes = {
  mode: string;
  bannerHeight?: number;
  align: string;
  bgImageID?: number;
  bgImageURL: string;
  bgColor: string;
  overlayMaxWidth: string;
  contentGap: string;
  overlayBorder?: BorderBoxValue;
  contentPosition: string;
  slidePadding: BoxSides;
  overlayPadding: BoxSides;
  creditItems: HeroCreditItem[];
};

const BORDER_SIDES = ["top", "right", "bottom", "left"] as const;

/** Width/style/color declarations for one border side (or all sides). */
function singleBorderCss(
  prefix: string,
  border?: BorderValue,
): Record<string, string> {
  const css: Record<string, string> = {};
  if (!border) return css;
  if (border.width) css[`${prefix}Width`] = border.width;
  // A width with no explicit style still needs one to render.
  if (border.style || border.width)
    css[`${prefix}Style`] = border.style || "solid";
  if (border.color) css[`${prefix}Color`] = border.color;
  return css;
}

/** Convert a BorderBoxControl value (flat or per-side) into inline CSS. */
function borderToCss(border?: BorderBoxValue): CSSProperties {
  if (!border) return {};
  const isSplit = BORDER_SIDES.some((side) => side in border);
  if (!isSplit) {
    return singleBorderCss("border", border as BorderValue) as CSSProperties;
  }
  const split = border as SplitBorderValue;
  return {
    ...singleBorderCss("borderTop", split.top),
    ...singleBorderCss("borderRight", split.right),
    ...singleBorderCss("borderBottom", split.bottom),
    ...singleBorderCss("borderLeft", split.left),
  } as CSSProperties;
}

const DRAFT_DEFAULTS: HeroDraft = {
  id: "",
  url: "",
  text: "",
  position: "bottom-left",
  offset: DEFAULT_OFFSET,
  color: "#ffffff",
  icon: "marker",
};

export default function Edit({
  attributes,
  setAttributes,
}: BlockEditProps<HeroAttributes>) {
  const {
    mode,
    bannerHeight,
    bgImageID,
    bgImageURL,
    bgColor,
    overlayMaxWidth,
    contentGap,
    overlayBorder,
    contentPosition,
    slidePadding,
    overlayPadding,
    creditItems,
  } = attributes;

  // Theme palette for the border colour picker (stable across WP versions).
  const themeColors = useSelect(
    (select) =>
      (
        select("core/block-editor") as unknown as {
          getSettings: () => {
            colors?: Array<{ name: string; color: string; slug?: string }>;
          };
        }
      ).getSettings().colors ?? [],
    [],
  );

  const blockProps = useBlockProps();

  // Content & container Styles
  const { alignItems, justifyContent } = getFlexValues(contentPosition);
  const containerStyle: CSSProperties = {
    alignItems,
    justifyContent,
    paddingTop: slidePadding?.top ?? "0px",
    paddingRight: slidePadding?.right ?? "0px",
    paddingBottom: slidePadding?.bottom ?? "0px",
    paddingLeft: slidePadding?.left ?? "0px",
    backgroundImage: `url(${bgImageURL})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    maxHeight:
      mode === "constrained" || mode === "fixed" ? bannerHeight : "100vh",
  };
  const overlayStyle: CSSProperties = {
    paddingTop: overlayPadding?.top ?? "0px",
    paddingRight: overlayPadding?.right ?? "0px",
    paddingBottom: overlayPadding?.bottom ?? "0px",
    paddingLeft: overlayPadding?.left ?? "0px",
    backgroundColor: bgColor ?? "",
    gap: contentGap || "0px",
    ...borderToCss(overlayBorder),
  };

  const overlayWrapperStyle: CSSProperties = {
    maxWidth: overlayMaxWidth || undefined,
  };

  const overlayInnerBlocksProps = useInnerBlocksProps(
    { className: "hero__overlay", style: overlayStyle },
    {},
  );

  // Credit Items setup
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<HeroDraft>(DRAFT_DEFAULTS);
  const [quickSelectType, setQuickSelectType] = useState("page");

  // ── Derived data ───────────────────────────────────────────────────────────

  const sortedItems = [...creditItems].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

  const topLevelItems = sortedItems.filter((i) => !i.parentId);

  // ── Data fetching ──────────────────────────────────────────────────────────
  const postTypeOptions = usePostTypeOptions();
  const quickSelectPosts = usePublishedPosts(quickSelectType);

  // ── Modal handlers ──────────────────────────────────────────────────────────
  function openAddModal() {
    setDraft({ ...DRAFT_DEFAULTS, order: creditItems.length });
    setEditingIndex(null);
    setIsModalOpen(true);
  }

  function openEditModal(index: number) {
    const item = creditItems[index];
    setDraft({
      id: item.id || String(Date.now()),
      url: item.url || "",
      text: item.text || "",
      position: item.position || "bottom-left",
      offset: item.offset || DEFAULT_OFFSET,
      color: item.color || "#ffffff",
      icon: item.icon || "marker",
    });
    setEditingIndex(index);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  function saveItem() {
    const newItem: HeroCreditItem = {
      id: draft.id || String(Date.now()),
      url: draft.url || "",
      text: draft.text || "",
      position: draft.position || "bottom-left",
      offset: draft.offset || DEFAULT_OFFSET,
      color: draft.color || "#ffffff",
      icon: draft.icon || "marker",
    };

    if (editingIndex !== null) {
      setAttributes({
        creditItems: creditItems.map((item, i) =>
          i === editingIndex ? newItem : item,
        ),
      });
    } else {
      setAttributes({ creditItems: [...creditItems, newItem] });
    }

    closeModal();
  }

  function removeItem(index: number) {
    setAttributes({ creditItems: creditItems.filter((_, i) => i !== index) });
    setEditingIndex(null);
    setIsModalOpen(false);
  }

  function applyQuickSelect(post: WPPostRecord) {
    setDraft((prev) => ({
      ...prev,
      text: prev.text || decodeEntities(post.title?.rendered || post.slug),
      url: post.link,
    }));
  }

  // ── Render helpers ──────────────────────────────────────────────────────────

  function renderCreditItem(item: HeroCreditItem) {
    const originalIndex = creditItems.findIndex((i) => i.id === item.id);

    return (
      <Button
        key={item.id}
        variant="link"
        className="hero__credits"
        style={getPositionStyle(item.position || "bottom-left", item.offset)}
        onClick={() => openEditModal(originalIndex)}
      >
        <div className="cns-hero__credit-item" style={{ color: item.color }}>
          {CnsRenderIcon(item.icon)}
          <span className="cns-elements__btn">
            <span>{item.text}</span>
            {CnsRenderIcon("edit")}
          </span>
        </div>
      </Button>
    );
  }

  return (
    <>
      {/* Modals */}
      <InspectorControls>
        <PanelBody title="Background">
          <MediaPicker
            value={bgImageID}
            url={bgImageURL}
            onSelect={(media) =>
              setAttributes({
                bgImageID: media.id,
                bgImageURL: media.url ?? "",
              })
            }
            onRemove={() =>
              setAttributes({ bgImageID: undefined, bgImageURL: "" })
            }
          />
        </PanelBody>
        <PanelBody title="Display mode">
          <SelectControl
            label="Mode"
            value={mode}
            options={[
              { label: "Fullscreen Unconstrained", value: "unconstrained" },
              { label: "Fullscreen Constrained", value: "constrained" },
              { label: "Fixed Height", value: "fixed" },
            ]}
            onChange={(value) => setAttributes({ mode: value })}
            __next40pxDefaultSize
          />
          {(mode === "constrained" || mode === "fixed") && (
            <RangeControl
              label={
                mode == "constrained" ? "Max Height (px)" : "Fixed Height (px)"
              }
              value={bannerHeight}
              min={100}
              max={2560}
              step={10}
              onChange={(value) => setAttributes({ bannerHeight: value })}
              __next40pxDefaultSize
            />
          )}
        </PanelBody>
        <PanelBody title="Backdrop">
          <ColorPicker
            color={bgColor}
            onChange={(value) => setAttributes({ bgColor: value })}
            enableAlpha
            defaultValue=""
          />
        </PanelBody>

        <PanelBody title="Content Position">
          <PositionPicker
            value={contentPosition}
            onChange={(pos) => setAttributes({ contentPosition: pos })}
          />
        </PanelBody>

        <PanelBody title="Content Layout">
          <UnitControl
            label="Overlay Max Width"
            value={overlayMaxWidth}
            units={UNIT_OPTIONS}
            min={0}
            placeholder="Full width"
            onChange={(value) =>
              setAttributes({ overlayMaxWidth: value ?? "" })
            }
            __next40pxDefaultSize
          />
          <UnitControl
            label="Content Gap"
            value={contentGap}
            units={UNIT_OPTIONS}
            min={0}
            onChange={(value) => setAttributes({ contentGap: value ?? "" })}
            __next40pxDefaultSize
          />

          <BorderBoxControl
            label="Overlay Border"
            value={overlayBorder}
            colors={themeColors}
            enableAlpha
            enableStyle
            onChange={(value) => setAttributes({ overlayBorder: value })}
            __next40pxDefaultSize
          />
        </PanelBody>

        <PanelBody title="Container Padding">
          <BoxControl
            label="Padding"
            values={slidePadding}
            onChange={(value) => setAttributes({ slidePadding: value })}
          />
        </PanelBody>
        <PanelBody title="Overlay Padding">
          <BoxControl
            label="Padding"
            values={overlayPadding}
            onChange={(value) => setAttributes({ overlayPadding: value })}
          />
        </PanelBody>
      </InspectorControls>
      <BlockControls>
        <ToolbarGroup>
          <ToolbarButton
            label={__("Add Credit Links", "cns-theme")}
            onClick={openAddModal}
          >
            {__("Add Credit Link", "cns-theme")}
          </ToolbarButton>
        </ToolbarGroup>
      </BlockControls>

      {isModalOpen && (
        <Modal
          title={
            editingIndex !== null
              ? __("Edit Credit Link", "cns-theme")
              : __("Add Credit Link", "cns-theme")
          }
          onRequestClose={closeModal}
          className="cns-hero__credits-modal"
        >
          {/* Type selector */}
          <SelectControl
            label={__("Icon", "cns-theme")}
            value={draft.icon}
            options={[
              { label: __("None", "cns-theme"), value: "" },
              { label: __("Marker", "cns-theme"), value: "marker" },
              { label: __("Book", "cns-theme"), value: "book" },
              { label: __("Edit", "cns-theme"), value: "edit" },
              { label: __("User", "cns-theme"), value: "User" },
              { label: __("External", "cns-theme"), value: "external" },
            ]}
            onChange={(value) =>
              setDraft((prev) => ({
                ...prev,
                icon: value,
              }))
            }
            __next40pxDefaultSize
          />

          {/* Credit text */}
          <TextControl
            label={__("Text", "cns-theme")}
            value={draft.text}
            onChange={(value) => setDraft((prev) => ({ ...prev, text: value }))}
            __next40pxDefaultSize
          />

          {/* URL input */}
          <div className="cns-hero__url-field">
            <label className="components-base-control__label">
              {__("URL", "cns-theme")}
            </label>
            <URLInput
              value={draft.url}
              onChange={(url) => setDraft((prev) => ({ ...prev, url }))}
              placeholder={__("Paste URL or search…", "cns-theme")}
            />
          </div>

          <PostQuickSelect
            heading={__("Or pick from:", "cns-theme")}
            postType={quickSelectType}
            postTypeOptions={postTypeOptions}
            onPostTypeChange={setQuickSelectType}
            posts={quickSelectPosts}
            onPick={applyQuickSelect}
          />

          {/* Position */}
          <p style={{ margin: "16px 0 4px", fontWeight: 500 }}>
            {__("Position", "cns-theme")}
          </p>
          <PositionPicker
            value={draft.position}
            onChange={(pos) => setDraft((prev) => ({ ...prev, position: pos }))}
          />

          {/* Offset — only show sides that apply to the chosen position */}
          {getRelevantSides(draft.position).length > 0 && (
            <BoxControl
              label={__("Offset", "cns-theme")}
              values={draft.offset}
              sides={getRelevantSides(draft.position)}
              onChange={(value) =>
                setDraft((prev) => ({
                  ...prev,
                  offset: { ...prev.offset, ...value },
                }))
              }
              __next40pxDefaultSize
            />
          )}

          <div className="cns-elements__modal-actions cns-hero__modal-actions">
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

      {/* Editor */}
      <div {...blockProps}>
        <div className="hero__container" style={containerStyle}>
          <div className="hero__editor-overlay" style={overlayWrapperStyle}>
            <div {...overlayInnerBlocksProps} />
            {topLevelItems.map(renderCreditItem)}
          </div>
        </div>
      </div>
    </>
  );
}
