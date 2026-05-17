import { __ } from "@wordpress/i18n";
import { useSelect } from "@wordpress/data";
import { useState } from "@wordpress/element";
import { decodeEntities } from "@wordpress/html-entities";
import {
  BlockControls,
  InnerBlocks,
  InspectorControls,
  MediaUpload,
  MediaUploadCheck,
  URLInput,
  useBlockProps,
} from "@wordpress/block-editor";
import {
  Modal,
  PanelBody,
  SelectControl,
  ColorPicker,
  Button,
  BoxControl,
  RangeControl,
  TextControl,
  ToolbarGroup,
  ToolbarButton,
} from "@wordpress/components";

const POSITIONS = [
  "top-left",
  "top-center",
  "top-right",
  "middle-left",
  "middle-center",
  "middle-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];
const DEFAULT_OFFSET = {
  top: "1rem",
  right: "1rem",
  bottom: "1rem",
  left: "1rem",
};
const DRAFT_DEFAULTS = {
  id: "",
  type: "post",
  url: "",
  text: "",
  position: "bottom-left",
  offset: DEFAULT_OFFSET,
  color: "#ffffff",
  icon: "marker",
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

function getFlexValues(position) {
  const [v, h] = position.split("-");
  return {
    alignItems:
      v === "top" ? "flex-start" : v === "bottom" ? "flex-end" : "center",
    justifyContent:
      h === "left" ? "flex-start" : h === "right" ? "flex-end" : "center",
  };
}

function getRelevantSides(position) {
  const [v, h] = position.split("-");
  const sides = [];
  if (v === "top") sides.push("top");
  else if (v === "bottom") sides.push("bottom");
  if (h === "left") sides.push("left");
  else if (h === "right") sides.push("right");
  return sides;
}

function getPositionStyle(position, offset = {}) {
  const [v, h] = position.split("-");
  const style = { position: "absolute" };
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

function PositionPicker({ value, onChange }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "4px",
        maxWidth: "120px",
        margin: "8px auto",
      }}
    >
      {POSITIONS.map((pos) => {
        const { alignItems: ai, justifyContent: jc } = getFlexValues(pos);
        const isActive = value === pos;
        return (
          <button
            key={pos}
            type="button"
            onClick={() => onChange(pos)}
            title={pos}
            style={{
              height: "36px",
              border: isActive ? "2px solid #007cba" : "1px solid #ddd",
              borderRadius: "2px",
              background: isActive ? "#007cba22" : "#f0f0f0",
              cursor: "pointer",
              display: "flex",
              alignItems: ai,
              justifyContent: jc,
              padding: "4px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: isActive ? "#007cba" : "#bbb",
                display: "block",
                flexShrink: 0,
              }}
            />
          </button>
        );
      })}
    </div>
  );
}

export default function Edit({ attributes, setAttributes }) {
  const {
    mode,
    bannerHeight,
    bgImageID,
    bgImageURL,
    bgColor,
    contentPosition,
    slidePadding,
    overlayPadding,
    creditItems,
  } = attributes;
  // console.log("author credit");
  // console.log(authorCredit);

  const blockProps = useBlockProps();

  // Content & container Styles
  const { alignItems, justifyContent } = getFlexValues(contentPosition);
  const containerStyle = {
    alignItems,
    justifyContent,
    paddingTop: slidePadding?.top ?? "0px",
    paddingRight: slidePadding?.right ?? "0px",
    paddingBottom: slidePadding?.bottom ?? "0px",
    paddingLeft: slidePadding?.left ?? "0px",
    backgroundImage: `url(${bgImageURL})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
  const overlayStyle = {
    paddingTop: overlayPadding?.top ?? "0px",
    paddingRight: overlayPadding?.right ?? "0px",
    paddingBottom: overlayPadding?.bottom ?? "0px",
    paddingLeft: overlayPadding?.left ?? "0px",
    backgroundColor: bgColor ?? "",
  };

  // Credit Items setup
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [draft, setDraft] = useState(DRAFT_DEFAULTS);
  const [quickSelectType, setQuickSelectType] = useState("page");

  // ── Derived data ─────────────────────────────────────────────────────────────

  const sortedItems = [...creditItems].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

  // const editingItem = editingIndex !== null ? credits[editingIndex] : null;

  const topLevelItems = sortedItems.filter((i) => !i.parentId);

  // ── Data fetching ─────────────────────────────────────────────────────────────
  const postTypeOptions = useSelect((select) => {
    const types = select("core").getPostTypes({ per_page: -1 });
    if (!types) return [{ label: "Pages", value: "page" }];
    return types
      .filter((pt) => pt.viewable && !SYSTEM_POST_TYPES.includes(pt.slug))
      .map((pt) => ({ label: pt.labels?.name || pt.slug, value: pt.slug }));
  });

  const quickSelectPosts = useSelect(
    (select) =>
      select("core").getEntityRecords("postType", quickSelectType, {
        per_page: 20,
        status: "publish",
        _fields: "id,title,link,slug",
      }),
    [quickSelectType],
  );

  // ── Modal handlers ────────────────────────────────────────────────────────────
  function openAddModal() {
    setDraft({ ...DRAFT_DEFAULTS, order: creditItems.length });
    setEditingIndex(null);
    setIsModalOpen(true);
  }

  function openEditModal(index) {
    const item = creditItems[index];
    setDraft({
      id: item.id || String(Date.now()),
      type: item.type,
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
    const newItem = {
      id: draft.id || String(Date.now()),
      type: draft.type,
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

  function removeItem(index) {
    setAttributes({ creditItems: creditItems.filter((_, i) => i !== index) });
    setEditingIndex(null);
    setIsModalOpen(false);
  }

  console.log(creditItems);

  // ── Render helpers ────────────────────────────────────────────────────────────

  function renderCreditItem(item) {
    // Credit items need id
    const originalIndex = creditItems.findIndex((i) => i.id === item.id);

    return (
      <Button
        key={item.id}
        variant="link"
        className="hero__credits"
        style={getPositionStyle(item.position || "bottom-left", item.offset)}
        onClick={() => openEditModal(originalIndex)}
      >
        <span style={{ color: item.color }}>{item.text}</span>
      </Button>
    );
  }

  return (
    <>
      <InspectorControls>
        <PanelBody title="Background">
          <MediaUploadCheck>
            <MediaUpload
              onSelect={(media) =>
                setAttributes({ bgImageID: media.id, bgImageURL: media.url })
              }
              allowedTypes={["image"]}
              value={bgImageID}
              render={({ open }) => (
                <div style={{ marginTop: "8px" }}>
                  {bgImageURL ? (
                    <img
                      src={bgImageURL}
                      alt=""
                      style={{
                        width: "100%",
                        display: "block",
                        borderRadius: "2px",
                        marginBottom: "8px",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        border: "1px dashed #999",
                        borderRadius: "2px",
                        padding: "16px",
                        textAlign: "center",
                        marginBottom: "8px",
                        color: "#999",
                        fontSize: "12px",
                      }}
                    >
                      No image selected
                    </div>
                  )}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Button onClick={open} variant="secondary" size="small">
                      {bgImageURL ? "Replace" : "Upload Image"}
                    </Button>
                    {bgImageURL && (
                      <Button
                        onClick={() =>
                          setAttributes({
                            bgImageID: undefined,
                            bgImageURL: "",
                          })
                        }
                        variant="link"
                        isDestructive
                        size="small"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              )}
            />
          </MediaUploadCheck>
        </PanelBody>
        <PanelBody title="Display mode">
          <SelectControl
            label="Mode"
            value={mode}
            options={[
              { label: "Unconstrained", value: "unconstrained" },
              { label: "Constrained", value: "constrained" },
              { label: "Fixed Height", value: "fixed" },
            ]}
            onChange={(value) => setAttributes({ mode: value })}
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
            label={__("Add Credit Items", "cns-theme")}
            onClick={openAddModal}
          >
            {__("Add Credit Item", "cns-theme")}
          </ToolbarButton>
        </ToolbarGroup>
      </BlockControls>

      {isModalOpen && (
        <Modal
          title={
            editingIndex !== null
              ? __("Edit Credit item", "cns-theme")
              : __("Add Credit Item", "cns-theme")
          }
          onRequestClose={closeModal}
          className="cns-hero__credits-modal"
        >
          {/* Type selector */}
          <SelectControl
            label={__("Type", "cns-theme")}
            value={draft.type}
            options={[
              { label: __("Post", "cns-theme"), value: "post" },
              { label: __("Author", "cns-theme"), value: "author" },
              { label: __("External", "cns-theme"), value: "external" },
              { label: __("No link", "cns-theme"), value: "no-link" },
            ]}
            onChange={(value) =>
              setDraft((prev) => ({
                ...prev,
                type: value,
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

          <div className="cns-hero__quick-select">
            <p className="cns-hero__quick-select-heading">
              {__("Or pick from:", "cns-theme")}
            </p>
            <SelectControl
              value={quickSelectType}
              options={postTypeOptions ?? [{ label: "Pages", value: "page" }]}
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

      <div {...blockProps}>
        <div className="hero__container" style={containerStyle}>
          <div className="hero__editor-overlay">
            <div className="hero__overlay" style={overlayStyle}>
              <InnerBlocks />
            </div>
            {topLevelItems.map(renderCreditItem)}
          </div>
        </div>
      </div>
    </>
  );
}
