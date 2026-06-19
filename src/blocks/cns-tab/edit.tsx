import { __ } from "@wordpress/i18n";
import {
  RichText,
  useBlockProps,
  useInnerBlocksProps,
} from "@wordpress/block-editor";
import type { BlockEditProps } from "@wordpress/blocks";

export type TabAttributes = {
  label: string;
};

export default function Edit({
  attributes,
  setAttributes,
}: BlockEditProps<TabAttributes>) {
  const { label } = attributes;

  const blockProps = useBlockProps({ className: "cns-tab" });
  const innerBlocksProps = useInnerBlocksProps(
    { className: "cns-tab__content" },
    { templateLock: false },
  );

  return (
    <div {...blockProps}>
      <div className="cns-tab__editor-header">
        <span className="cns-tab__editor-prefix">
          {__("Tab:", "cns-theme")}
        </span>
        <RichText
          tagName="span"
          className="cns-tab__editor-label"
          value={label}
          onChange={(value: string) => setAttributes({ label: value })}
          placeholder={__("Tab label…", "cns-theme")}
          allowedFormats={[]}
        />
      </div>
      <div {...innerBlocksProps} />
    </div>
  );
}
