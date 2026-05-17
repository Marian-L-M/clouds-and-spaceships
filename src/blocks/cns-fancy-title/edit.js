import { __ } from "@wordpress/i18n";
import {
  useBlockProps,
  useInnerBlocksProps,
  InspectorControls,
  MediaUpload,
  MediaUploadCheck,
  ColorPalette,
} from "@wordpress/block-editor";
import {
  Button,
  PanelBody,
  RangeControl,
  ToggleControl,
} from "@wordpress/components";
import "./editor.scss";

const TEMPLATE = [
  [ "core/heading",   { level: 1 } ],
  [ "core/paragraph", {} ],
];

const ALLOWED_BLOCKS = [ "core/heading", "core/paragraph", "core/separator" ];

export default function Edit( { attributes, setAttributes } ) {
  const {
    imageId, imageUrl, imageAlt, imageWidth, columnGap,
    showVerticalDivider, dividerColor, dividerThickness,
  } = attributes;

  const blockProps = useBlockProps( { className: "fancy-title fancy-title--branded" } );

  const gridStyle = {
    "--fancy-title-image-width":      `${ imageWidth }px`,
    "--fancy-title-column-gap":       `${ columnGap }px`,
    "--fancy-title-divider-color":    dividerColor || "#000000",
    "--fancy-title-divider-thickness":`${ dividerThickness }px`,
  };

  const innerBlocksProps = useInnerBlocksProps(
    { className: "fancy-title__text-col" },
    { template: TEMPLATE, allowedBlocks: ALLOWED_BLOCKS, templateLock: false }
  );

  return (
    <div { ...blockProps }>
      <InspectorControls>

        <PanelBody title={ __( "Image", "cns-theme" ) } initialOpen={ true }>
          <RangeControl
            label={ __( "Width (px)", "cns-theme" ) }
            value={ imageWidth }
            onChange={ ( v ) => setAttributes( { imageWidth: v } ) }
            min={ 40 } max={ 600 } step={ 4 }
            __nextHasNoMarginBottom __next40pxDefaultSize
          />
          <RangeControl
            label={ __( "Gap to text column (px)", "cns-theme" ) }
            value={ columnGap }
            onChange={ ( v ) => setAttributes( { columnGap: v } ) }
            min={ 0 } max={ 120 } step={ 4 }
            __nextHasNoMarginBottom __next40pxDefaultSize
          />
        </PanelBody>

        <PanelBody title={ __( "Column divider", "cns-theme" ) } initialOpen={ false }>
          <ToggleControl
            label={ __( "Show divider between image and text", "cns-theme" ) }
            checked={ showVerticalDivider }
            onChange={ ( v ) => setAttributes( { showVerticalDivider: v } ) }
            __nextHasNoMarginBottom
          />
          { showVerticalDivider && (
            <>
              <p className="components-base-control__label">
                { __( "Colour", "cns-theme" ) }
              </p>
              <ColorPalette
                value={ dividerColor }
                onChange={ ( v ) => setAttributes( { dividerColor: v ?? "#000000" } ) }
                disableCustomColors={ false }
              />
              <RangeControl
                label={ __( "Thickness (px)", "cns-theme" ) }
                value={ dividerThickness }
                onChange={ ( v ) => setAttributes( { dividerThickness: v } ) }
                min={ 1 } max={ 10 }
                __nextHasNoMarginBottom __next40pxDefaultSize
              />
            </>
          ) }
        </PanelBody>

      </InspectorControls>

      <div className="fancy-title__grid" style={ gridStyle }>

        {/* ── Image column ───────────────────────────────────────────────── */}
        <div className={ `fancy-title__image-col${ showVerticalDivider ? " has-vertical-divider" : "" }` }>
          <MediaUploadCheck>
            <MediaUpload
              onSelect={ ( media ) =>
                setAttributes( { imageId: media.id, imageUrl: media.url, imageAlt: media.alt ?? "" } )
              }
              allowedTypes={ [ "image" ] }
              value={ imageId || undefined }
              render={ ( { open } ) =>
                imageUrl ? (
                  <button
                    type="button"
                    className="fancy-title__image-replace"
                    onClick={ open }
                    title={ __( "Click to replace image", "cns-theme" ) }
                  >
                    <img src={ imageUrl } alt={ imageAlt } />
                  </button>
                ) : (
                  <Button variant="secondary" onClick={ open }>
                    { __( "Add image", "cns-theme" ) }
                  </Button>
                )
              }
            />
          </MediaUploadCheck>
        </div>

        {/* ── Text column (InnerBlocks) ───────────────────────────────────── */}
        <div { ...innerBlocksProps } />

      </div>
    </div>
  );
}
