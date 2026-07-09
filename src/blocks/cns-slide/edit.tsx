import {
  useBlockProps,
  InnerBlocks,
  InspectorControls,
} from "@wordpress/block-editor";
import { PanelBody, SelectControl } from "@wordpress/components";
import { ColorPicker, BoxControl } from "../../types/wp-components";
import type { BlockEditProps } from "@wordpress/blocks";
import type { CSSProperties } from "react";
import type { BoxSides } from "../../types/wordpress";
import { getFlexValues } from "../../shared/lib/positions";
import { MediaPicker } from "../../shared/components/MediaPicker";
import { PositionPicker } from "../../shared/components/PositionPicker";

type SlideType = "image" | "color";

export type SlideAttributes = {
  align: string;
  slideType: SlideType;
  bgImageID?: number;
  bgImageURL: string;
  bgColor: string;
  contentPosition: string;
  slidePadding: BoxSides;
};

export default function Edit({
  attributes,
  setAttributes,
}: BlockEditProps<SlideAttributes>) {
  const {
    slideType,
    bgImageID,
    bgImageURL,
    bgColor,
    contentPosition,
    slidePadding,
  } = attributes;

  const blockProps = useBlockProps({ className: "glide__slide" });

  const { alignItems, justifyContent } = getFlexValues(contentPosition);
  const containerStyle: CSSProperties = {
    alignItems,
    justifyContent,
    paddingTop: slidePadding?.top ?? "0px",
    paddingRight: slidePadding?.right ?? "0px",
    paddingBottom: slidePadding?.bottom ?? "0px",
    paddingLeft: slidePadding?.left ?? "0px",
  };

  if (slideType === "image" && bgImageURL) {
    containerStyle.backgroundImage = `url(${bgImageURL})`;
    containerStyle.backgroundSize = "cover";
    containerStyle.backgroundPosition = "center";
  } else if (slideType === "color" && bgColor) {
    containerStyle.backgroundColor = bgColor;
  }

  return (
    <>
      <InspectorControls>
        <PanelBody title="Slide Background">
          <SelectControl
            label="Type"
            value={slideType}
            options={[
              { label: "Image", value: "image" },
              { label: "Color", value: "color" },
            ]}
            onChange={(value) =>
              setAttributes({ slideType: value as SlideType })
            }
          />

          {slideType === "image" && (
            <div style={{ marginTop: "8px" }}>
              <MediaPicker
                value={bgImageID}
                url={bgImageURL}
                previewRadius="2px"
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
            </div>
          )}

          {slideType === "color" && (
            <ColorPicker
              color={bgColor}
              onChange={(value) => setAttributes({ bgColor: value })}
              enableAlpha
              defaultValue=""
            />
          )}
        </PanelBody>

        <PanelBody title="Content Position">
          <PositionPicker
            value={contentPosition}
            onChange={(pos) => setAttributes({ contentPosition: pos })}
          />
        </PanelBody>

        <PanelBody title="Slide Padding">
          <BoxControl
            label="Padding"
            values={slidePadding}
            onChange={(value) => setAttributes({ slidePadding: value })}
          />
        </PanelBody>
      </InspectorControls>

      <li {...blockProps}>
        <div className="slideshow__container" style={containerStyle}>
          <InnerBlocks />
        </div>
      </li>
    </>
  );
}
