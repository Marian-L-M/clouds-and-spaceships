import { __ } from "@wordpress/i18n";
import { useSelect } from "@wordpress/data";
import { useState, useEffect, useRef } from "@wordpress/element";
import {
  InspectorControls,
  RichText,
  useBlockProps,
  useInnerBlocksProps,
  store as blockEditorStore,
} from "@wordpress/block-editor";
import { PanelBody, SelectControl, ToggleControl } from "@wordpress/components";
import type { BlockEditProps } from "@wordpress/blocks";

type TitleLevel = "h1" | "h2" | "h3";

export type SectionAttributes = {
  title: string;
  titleLevel: TitleLevel;
  showUnderline: boolean;
  // Declared in block.json (and backed by the `anchor` block support);
  // auto-derived from the title here.
  anchor: string;
};

function slugify(str: string): string {
  return (str || "")
    .replace(/<[^>]+>/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function Edit({
  clientId,
  attributes,
  setAttributes,
}: BlockEditProps<SectionAttributes>) {
  const { title, titleLevel, showUnderline, anchor } = attributes;

  // Auto-preset anchor from title unless the user has manually customised it
  const prevAutoAnchor = useRef(slugify(title));
  useEffect(() => {
    const next = slugify(title);
    if (!anchor || anchor === prevAutoAnchor.current) {
      setAttributes({ anchor: next });
    }
    prevAutoAnchor.current = next;
  }, [title]);
  const [activeTab, setActiveTab] = useState(0);

  const innerBlocks = useSelect(
    (select) => select(blockEditorStore).getBlocks(clientId),
    [clientId],
  );

  const tabs = innerBlocks.filter((b) => b.name === "cns-theme/cns-tab");
  const hasTabs = tabs.length > 0;

  const blockProps = useBlockProps({ className: "cns-section" });
  const innerBlocksProps = useInnerBlocksProps(
    { className: "cns-section__content" },
    { templateLock: false },
  );

  return (
    <>
      <InspectorControls>
        <PanelBody title={__("Title", "cns-theme")}>
          <SelectControl
            label={__("Title Level", "cns-theme")}
            value={titleLevel}
            options={[
              { label: __("Page Title (H1)", "cns-theme"), value: "h1" },
              { label: __("Section Title (H2)", "cns-theme"), value: "h2" },
              { label: __("Subsection Title (H3)", "cns-theme"), value: "h3" },
            ]}
            onChange={(value) =>
              setAttributes({ titleLevel: value as TitleLevel })
            }
            __nextHasNoMarginBottom
            __next40pxDefaultSize
          />
          <ToggleControl
            label={__("Show Underline", "cns-theme")}
            checked={showUnderline}
            onChange={(value) => setAttributes({ showUnderline: value })}
            __nextHasNoMarginBottom
          />
        </PanelBody>
      </InspectorControls>

      <div {...blockProps}>
        <div
          className={`cns-section__title-container${
            showUnderline ? " has-underline" : ""
          }`}
        >
          <RichText
            tagName={titleLevel}
            className="cns-section__title"
            value={title}
            onChange={(value: string) => setAttributes({ title: value })}
            placeholder={__("Section title…", "cns-theme")}
            allowedFormats={[]}
          />

          {hasTabs && (
            <div className="cns-section__tabs" role="tablist">
              {tabs.map((tab, i) => (
                <button
                  key={tab.clientId}
                  type="button"
                  role="tab"
                  aria-selected={i === activeTab}
                  className={`cns-section__tab-btn${
                    i === activeTab ? " is-active" : ""
                  }`}
                  onClick={() => setActiveTab(i)}
                >
                  {(tab.attributes as { label?: string }).label ||
                    __("Tab", "cns-theme")}
                </button>
              ))}
            </div>
          )}
        </div>

        <div {...innerBlocksProps} />
      </div>
    </>
  );
}
