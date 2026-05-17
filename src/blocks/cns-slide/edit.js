import {
  useBlockProps,
  InnerBlocks,
  InspectorControls,
  MediaUpload,
  MediaUploadCheck,
} from "@wordpress/block-editor";
import {
  PanelBody,
  SelectControl,
  ColorPicker,
  Button,
  BoxControl,
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

function getFlexValues(position) {
  const [v, h] = position.split("-");
  return {
    alignItems:
      v === "top" ? "flex-start" : v === "bottom" ? "flex-end" : "center",
    justifyContent:
      h === "left" ? "flex-start" : h === "right" ? "flex-end" : "center",
  };
}

export default function Edit({ attributes, setAttributes }) {
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
  const containerStyle = {
    alignItems,
    justifyContent,
    paddingTop:    slidePadding?.top    ?? "0px",
    paddingRight:  slidePadding?.right  ?? "0px",
    paddingBottom: slidePadding?.bottom ?? "0px",
    paddingLeft:   slidePadding?.left   ?? "0px",
  };

  if (slideType === "image" && bgImageURL) {
    containerStyle.backgroundImage    = `url(${bgImageURL})`;
    containerStyle.backgroundSize     = "cover";
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
            onChange={(value) => setAttributes({ slideType: value })}
          />

          {slideType === "image" && (
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
              const isActive = contentPosition === pos;
              return (
                <button
                  key={pos}
                  onClick={() => setAttributes({ contentPosition: pos })}
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
        </PanelBody>

        <PanelBody title="Slide Padding">
          <BoxControl
            label="Padding"
            value={slidePadding}
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
