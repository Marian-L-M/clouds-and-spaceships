import { MediaUpload, MediaUploadCheck } from "@wordpress/block-editor";
import { Button } from "@wordpress/components";
import type { WPMedia } from "../../types/wordpress";

interface MediaPickerProps {
  /** The selected attachment id (drives the media-library highlight). */
  value?: number;
  /** The resolved image URL, or "" when nothing is selected. */
  url: string;
  onSelect: (media: WPMedia) => void;
  onRemove: () => void;
  allowedTypes?: string[];
  /** Corner radius for the preview thumbnail / placeholder. */
  previewRadius?: string;
}

/**
 * Inspector image field: a thumbnail preview (or "no image" placeholder) with
 * Upload/Replace and Remove buttons. Shared by blocks that store a single
 * background image as an `{ id, url }` attribute pair.
 */
export function MediaPicker({
  value,
  url,
  onSelect,
  onRemove,
  allowedTypes = ["image"],
  previewRadius = "5px",
}: MediaPickerProps) {
  return (
    <MediaUploadCheck>
      <MediaUpload
        onSelect={onSelect}
        allowedTypes={allowedTypes}
        value={value}
        render={({ open }) => (
          <div>
            {url ? (
              <img
                src={url}
                alt=""
                style={{
                  width: "100%",
                  display: "block",
                  borderRadius: previewRadius,
                  marginBottom: "8px",
                }}
              />
            ) : (
              <div
                style={{
                  border: "1px dashed #999",
                  borderRadius: previewRadius,
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
                {url ? "Replace" : "Upload Image"}
              </Button>
              {url && (
                <Button
                  onClick={onRemove}
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
  );
}
