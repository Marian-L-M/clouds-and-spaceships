import {
  useBlockProps,
  useInnerBlocksProps,
  InspectorControls,
  store as blockEditorStore,
} from "@wordpress/block-editor";
import { PanelBody, SelectControl, RangeControl } from "@wordpress/components";
import { useEffect, useRef } from "@wordpress/element";
import { useSelect } from "@wordpress/data";
import Glide from "@glidejs/glide";
import type { BlockEditProps } from "@wordpress/blocks";
import type { CSSProperties } from "react";

type SlideshowType = "hero" | "banner" | "fixed";

export type SlideshowAttributes = {
  align: string;
  imgID?: number;
  imgURL?: string;
  slideshowType: SlideshowType;
  bannerHeight: number;
  fixedHeight: number;
  fixedMaxWidth: number;
};

export default function Edit({
  clientId,
  attributes,
  setAttributes,
}: BlockEditProps<SlideshowAttributes>) {
  const { slideshowType, bannerHeight, fixedHeight, fixedMaxWidth } =
    attributes;
  const blockProps = useBlockProps();
  const glideRef = useRef<HTMLDivElement>(null);

  const slideCount = useSelect(
    (select) => select(blockEditorStore).getBlockCount(clientId),
    [clientId],
  );

  const innerBlocksProps = useInnerBlocksProps(
    { className: "glide__slides" },
    { allowedBlocks: ["cns-theme/cns-slide"] },
  );

  useEffect(() => {
    if (!glideRef.current) return;
    const glide = new Glide(glideRef.current, { draggable: false }).mount();
    return () => glide.destroy();
  });

  const wrapperStyle: CSSProperties = {};
  if (slideshowType === "banner") {
    wrapperStyle.height = `${bannerHeight}px`;
  } else if (slideshowType === "fixed") {
    wrapperStyle.height = `${fixedHeight}px`;
    wrapperStyle.maxWidth = `${fixedMaxWidth}px`;
    wrapperStyle.margin = "0 auto";
  }

  return (
    <>
      <InspectorControls>
        <PanelBody title="Slideshow Type">
          <SelectControl
            label="Mode"
            value={slideshowType}
            options={[
              { label: "Hero (full screen)", value: "hero" },
              { label: "Banner (full width, fixed height)", value: "banner" },
              { label: "Fixed (fixed width & height)", value: "fixed" },
            ]}
            onChange={(value) =>
              setAttributes({ slideshowType: value as SlideshowType })
            }
            __next40pxDefaultSize
          />
          {slideshowType === "banner" && (
            <RangeControl
              label="Height (px)"
              value={bannerHeight}
              min={100}
              max={1200}
              step={10}
              onChange={(value) => setAttributes({ bannerHeight: value ?? 0 })}
              __next40pxDefaultSize
            />
          )}
          {slideshowType === "fixed" && (
            <>
              <RangeControl
                label="Height (px)"
                value={fixedHeight}
                min={100}
                max={1200}
                step={10}
                onChange={(value) => setAttributes({ fixedHeight: value ?? 0 })}
                __next40pxDefaultSize
              />
              <RangeControl
                label="Max Width (px)"
                value={fixedMaxWidth}
                min={320}
                max={1920}
                step={10}
                onChange={(value) =>
                  setAttributes({ fixedMaxWidth: value ?? 0 })
                }
                __next40pxDefaultSize
              />
            </>
          )}
        </PanelBody>
      </InspectorControls>
      <div {...blockProps}>
        <div
          className={`cns-slideshow__wrapper cns-slideshow__wrapper--${slideshowType}`}
          style={wrapperStyle}
        >
          <div className="glide" ref={glideRef}>
            <div className="glide__track" data-glide-el="track">
              <ul {...innerBlocksProps} />
            </div>
            <div className="glide__arrows" data-glide-el="controls">
              <button
                className="glide__arrow glide__arrow--left"
                data-glide-dir="&lt;"
              >
                ‹
              </button>
              <button
                className="glide__arrow glide__arrow--right"
                data-glide-dir="&gt;"
              >
                ›
              </button>
            </div>
            {slideCount > 1 && (
              <div className="glide__bullets" data-glide-el="controls[nav]">
                {Array.from({ length: slideCount }, (_, i) => (
                  <button
                    key={i}
                    className="glide__bullet"
                    data-glide-dir={`=${i}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
