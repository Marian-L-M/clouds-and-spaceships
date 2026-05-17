import { __ } from "@wordpress/i18n";
import {
  useBlockProps,
  InspectorControls,
  MediaUpload,
  MediaUploadCheck,
} from "@wordpress/block-editor";
import {
  Button,
  PanelBody,
  Placeholder,
  RangeControl,
} from "@wordpress/components";
import { useState } from "@wordpress/element";
import "./editor.scss";

function normaliseMedia( media ) {
  const s = media.sizes ?? {};
  const full = s.full?.url ?? media.url ?? "";
  return {
    id:        media.id,
    urlMedium: s.medium?.url ?? s.large?.url ?? full,
    urlLarge:  s.large?.url  ?? full,
    urlFull:   full,
    alt:       media.alt ?? "",
  };
}

export default function Edit( { attributes, setAttributes } ) {
  const { images, maxWidth, thumbsPerRow } = attributes;
  const [ activeIndex, setActiveIndex ] = useState( 0 );

  // Clamp when images are removed
  const safeActive = Math.min( activeIndex, Math.max( 0, images.length - 1 ) );

  // ── Image operations ─────────────────────────────────────────────────────────

  function addImages( selection ) {
    const picked = Array.isArray( selection ) ? selection : [ selection ];
    setAttributes( { images: [ ...images, ...picked.map( normaliseMedia ) ] } );
  }

  function replaceImage( index, media ) {
    const next = [ ...images ];
    next[ index ] = normaliseMedia( media );
    setAttributes( { images: next } );
  }

  function removeImage( index ) {
    const next = images.filter( ( _, i ) => i !== index );
    setAttributes( { images: next } );
    if ( safeActive >= next.length ) setActiveIndex( Math.max( 0, next.length - 1 ) );
  }

  function moveImage( index, dir ) {
    const target = index + dir;
    if ( target < 0 || target >= images.length ) return;
    const next = [ ...images ];
    [ next[ index ], next[ target ] ] = [ next[ target ], next[ index ] ];
    setAttributes( { images: next } );
    setActiveIndex( target );
  }

  // ── Styles ───────────────────────────────────────────────────────────────────

  const blockStyle = maxWidth ? { maxWidth: `${ maxWidth }px`, margin: "0 auto" } : {};

  const blockProps = useBlockProps( { style: blockStyle, className: "multi-image" } );

  // ── Empty state ──────────────────────────────────────────────────────────────

  if ( images.length === 0 ) {
    return (
      <div { ...blockProps }>
        <InspectorControls>
          <PanelBody title={ __( "Display", "cns-theme" ) } initialOpen={ true }>
            <RangeControl
              label={ __( "Max width (px, 0 = none)", "cns-theme" ) }
              value={ maxWidth }
              onChange={ ( v ) => setAttributes( { maxWidth: v } ) }
              min={ 0 } max={ 2400 } step={ 10 }
              __nextHasNoMarginBottom __next40pxDefaultSize
            />
            <RangeControl
              label={ __( "Thumbnails per row", "cns-theme" ) }
              value={ thumbsPerRow }
              onChange={ ( v ) => setAttributes( { thumbsPerRow: v } ) }
              min={ 2 } max={ 10 }
              __nextHasNoMarginBottom __next40pxDefaultSize
            />
          </PanelBody>
        </InspectorControls>
        <Placeholder
          icon="format-gallery"
          label={ __( "Multi Image", "cns-theme" ) }
          instructions={ __( "Add images to get started.", "cns-theme" ) }
        >
          <MediaUploadCheck>
            <MediaUpload
              onSelect={ addImages }
              allowedTypes={ [ "image" ] }
              multiple
              render={ ( { open } ) => (
                <Button variant="primary" onClick={ open }>
                  { __( "Add images", "cns-theme" ) }
                </Button>
              ) }
            />
          </MediaUploadCheck>
        </Placeholder>
      </div>
    );
  }

  // ── Populated state ──────────────────────────────────────────────────────────

  return (
    <div { ...blockProps }>
      <InspectorControls>
        <PanelBody title={ __( "Display", "cns-theme" ) } initialOpen={ true }>
          <RangeControl
            label={ __( "Max width (px, 0 = none)", "cns-theme" ) }
            value={ maxWidth }
            onChange={ ( v ) => setAttributes( { maxWidth: v } ) }
            min={ 0 } max={ 2400 } step={ 10 }
            __nextHasNoMarginBottom __next40pxDefaultSize
          />
          <RangeControl
            label={ __( "Thumbnails per row", "cns-theme" ) }
            value={ thumbsPerRow }
            onChange={ ( v ) => setAttributes( { thumbsPerRow: v } ) }
            min={ 2 } max={ 10 }
            __nextHasNoMarginBottom __next40pxDefaultSize
          />
        </PanelBody>
      </InspectorControls>

      {/* ── Main viewer ─────────────────────────────────────────────────────── */}
      <div className="multi-image__main">
        <img
          className="multi-image__main-img"
          src={ images[ safeActive ]?.urlLarge }
          alt={ images[ safeActive ]?.alt }
        />

        { images.length > 1 && (
          <>
            <button
              className="multi-image__arrow multi-image__arrow--prev"
              type="button"
              aria-label={ __( "Previous image", "cns-theme" ) }
              onClick={ () => setActiveIndex( ( i ) => ( i - 1 + images.length ) % images.length ) }
            >
              &#8249;
            </button>
            <button
              className="multi-image__arrow multi-image__arrow--next"
              type="button"
              aria-label={ __( "Next image", "cns-theme" ) }
              onClick={ () => setActiveIndex( ( i ) => ( i + 1 ) % images.length ) }
            >
              &#8250;
            </button>
          </>
        ) }

        {/* Fullscreen is frontend-only; shown as a disabled hint in the editor */}
        <button
          className="multi-image__fullscreen-btn"
          type="button"
          disabled
          title={ __( "Fullscreen (frontend only)", "cns-theme" ) }
        >
          &#x26F6;
        </button>
      </div>

      {/* ── Thumbnail strip ──────────────────────────────────────────────────── */}
      <div
        className="multi-image__thumbs"
        style={ { "--thumbs-per-row": thumbsPerRow } }
      >
        { images.map( ( img, i ) => (
          <div
            key={ img.id ?? i }
            className={ `multi-image__thumb-wrap${ i === safeActive ? " is-active" : "" }` }
          >
            <button
              className="multi-image__thumb-btn"
              type="button"
              onClick={ () => setActiveIndex( i ) }
              aria-label={ img.alt || `Image ${ i + 1 }` }
            >
              <img src={ img.urlMedium } alt={ img.alt } />
            </button>

            <div className="multi-image__thumb-actions">
              <button
                type="button"
                onClick={ () => moveImage( i, -1 ) }
                disabled={ i === 0 }
                title={ __( "Move left", "cns-theme" ) }
              >
                &#8592;
              </button>
              <button
                type="button"
                onClick={ () => moveImage( i, 1 ) }
                disabled={ i === images.length - 1 }
                title={ __( "Move right", "cns-theme" ) }
              >
                &#8594;
              </button>
              <MediaUploadCheck>
                <MediaUpload
                  onSelect={ ( media ) => replaceImage( i, media ) }
                  allowedTypes={ [ "image" ] }
                  value={ img.id }
                  render={ ( { open } ) => (
                    <button
                      type="button"
                      onClick={ open }
                      title={ __( "Replace", "cns-theme" ) }
                    >
                      &#x270E;
                    </button>
                  ) }
                />
              </MediaUploadCheck>
              <button
                type="button"
                onClick={ () => removeImage( i ) }
                title={ __( "Remove", "cns-theme" ) }
                className="is-destructive"
              >
                &#x2715;
              </button>
            </div>
          </div>
        ) ) }

        {/* Add more images */}
        <MediaUploadCheck>
          <MediaUpload
            onSelect={ addImages }
            allowedTypes={ [ "image" ] }
            multiple
            render={ ( { open } ) => (
              <button
                className="multi-image__thumb-add"
                type="button"
                onClick={ open }
                title={ __( "Add images", "cns-theme" ) }
              >
                +
              </button>
            ) }
          />
        </MediaUploadCheck>
      </div>
    </div>
  );
}
