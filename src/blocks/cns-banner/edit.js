import apiFetch from "@wordpress/api-fetch";
import { Button, PanelBody, PanelRow } from "@wordpress/components";
import {
  useBlockProps,
  InnerBlocks,
  InspectorControls,
  MediaUpload,
  MediaUploadCheck,
} from "@wordpress/block-editor";
import { useEffect } from "@wordpress/element";

export default function Edit(props) {
  const blockProps = useBlockProps();

  useEffect(function () {
    if (!props.attributes.imgURL) {
      props.setAttributes({
        imgURL: cnsThemeData.theme_uri + "/assets/images/banner.png",
      });
    }
  }, []);

  useEffect(
    function () {
      if (props.attributes.imgID) {
        async function go() {
          const response = await apiFetch({
            path: `/wp/v2/media/${props.attributes.imgID}`,
            method: "GET",
          });
          props.setAttributes({
            imgURL: response.media_details.sizes.banner.source_url,
          });
        }
        go();
      }
    },
    [props.attributes.imgID],
  );

  function onFileSelect(x) {
    props.setAttributes({ imgID: x.id });
  }

  return (
    <div {...blockProps}>
      <InspectorControls>
        <PanelBody title="Background" initialOpen={true}>
          <PanelRow>
            <MediaUploadCheck>
              <MediaUpload
                onSelect={onFileSelect}
                value={props.attributes.imgID}
                render={({ open }) => {
                  return <Button onClick={open}>Choose Image</Button>;
                }}
              />
            </MediaUploadCheck>
          </PanelRow>
        </PanelBody>
      </InspectorControls>
      <div className="page-banner">
        <div
          className="page-banner__bg-image"
          style={{ backgroundImage: `url('${props.attributes.imgURL}')` }}
        ></div>
        <div className="page-banner__content container t-center c-white">
          <InnerBlocks
            allowedBlocks={[
              "core/paragraph",
              "core/heading",
              "core/list",
              "cns-theme/genericheading",
              "cns-theme/genericbutton",
            ]}
          />
        </div>
      </div>
    </div>
  );
}
