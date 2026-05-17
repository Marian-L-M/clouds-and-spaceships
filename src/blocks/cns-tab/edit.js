import { __ } from "@wordpress/i18n";
import {
  RichText,
  useBlockProps,
  useInnerBlocksProps,
} from "@wordpress/block-editor";

export default function Edit({ attributes, setAttributes }) {
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
          onChange={(value) => setAttributes({ label: value })}
          placeholder={__("Tab label…", "cns-theme")}
          allowedFormats={[]}
        />
      </div>
      <div {...innerBlocksProps} />
    </div>
  );
}
