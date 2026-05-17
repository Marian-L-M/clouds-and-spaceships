<?php
/**
 * Render callback for the multi-image block.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Unused – dynamic block.
 * @var WP_Block $block      Block instance.
 */

$images        = $attributes['images']       ?? [];
$max_width     = intval( $attributes['maxWidth']     ?? 0 );
$thumbs_per_row = intval( $attributes['thumbsPerRow'] ?? 4 );

if ( empty( $images ) ) {
    return;
}

$first = $images[0];

// CSS custom properties + optional max-width cap
$wrapper_style = '--thumbs-per-row:' . $thumbs_per_row . ';';
if ( $max_width ) {
    $wrapper_style .= 'max-width:' . $max_width . 'px;margin:0 auto;';
}

// The full images array is stored in context so view.js can navigate without
// a server round-trip. For large galleries consider storing only URLs/alts.
$context = wp_json_encode( [
    'activeIndex'  => 0,
    'lightboxOpen' => false,
    'images'       => array_map( fn( $img ) => [
        'urlMedium' => $img['urlMedium'] ?? $img['url'] ?? '',
        'urlLarge'  => $img['urlLarge']  ?? $img['url'] ?? '',
        'urlFull'   => $img['urlFull']   ?? $img['url'] ?? '',
        'alt'       => $img['alt'] ?? '',
    ], $images ),
] );

$wrapper_attrs = get_block_wrapper_attributes( [
    'class'                    => 'multi-image',
    'style'                    => $wrapper_style,
    'data-wp-interactive'      => 'cns-theme/cns-multi-image',
    'data-wp-context'          => $context,
    'data-wp-on-document--keydown' => 'actions.handleEscape',
] );

$has_multiple = count( $images ) > 1;
?>
<div <?php echo $wrapper_attrs; ?>>

  <!-- ── Main viewer ──────────────────────────────────────────────────────── -->
  <div class="multi-image__main">
    <img
      class="multi-image__main-img"
      src="<?php echo esc_url( $first['urlLarge'] ?? $first['url'] ?? '' ); ?>"
      alt="<?php echo esc_attr( $first['alt'] ?? '' ); ?>"
      data-wp-bind--src="state.activeMainUrl"
      data-wp-bind--alt="state.activeAlt"
    >

    <?php if ( $has_multiple ) : ?>
      <button
        class="multi-image__arrow multi-image__arrow--prev"
        type="button"
        aria-label="<?php esc_attr_e( 'Previous image', 'cns-theme' ); ?>"
        data-wp-on--click="actions.prev"
      >&#8249;</button>
      <button
        class="multi-image__arrow multi-image__arrow--next"
        type="button"
        aria-label="<?php esc_attr_e( 'Next image', 'cns-theme' ); ?>"
        data-wp-on--click="actions.next"
      >&#8250;</button>
    <?php endif; ?>

    <button
      class="multi-image__fullscreen-btn"
      type="button"
      aria-label="<?php esc_attr_e( 'Open fullscreen', 'cns-theme' ); ?>"
      data-wp-on--click="actions.openLightbox"
    >&#x26F6;</button>
  </div>

  <!-- ── Thumbnail strip ──────────────────────────────────────────────────── -->
  <div class="multi-image__thumbs">
    <?php foreach ( $images as $i => $img ) :
      $thumb_context = esc_attr( wp_json_encode( [ 'index' => $i ] ) );
    ?>
      <button
        class="multi-image__thumb<?php echo $i === 0 ? ' is-active' : ''; ?>"
        type="button"
        data-wp-context="<?php echo $thumb_context; ?>"
        data-wp-on--click="actions.setActive"
        data-wp-class--is-active="state.isThumbActive"
      >
        <img
          src="<?php echo esc_url( $img['urlMedium'] ?? $img['url'] ?? '' ); ?>"
          alt="<?php echo esc_attr( $img['alt'] ?? '' ); ?>"
          loading="lazy"
        >
      </button>
    <?php endforeach; ?>
  </div>

  <!-- ── Lightbox ─────────────────────────────────────────────────────────── -->
  <div
    class="multi-image__lightbox"
    data-wp-class--is-open="context.lightboxOpen"
    role="dialog"
    aria-modal="true"
    aria-label="<?php esc_attr_e( 'Image fullscreen view', 'cns-theme' ); ?>"
  >
    <div
      class="multi-image__lightbox-backdrop"
      data-wp-on--click="actions.closeLightbox"
    ></div>

    <div class="multi-image__lightbox-content">
      <button
        class="multi-image__lightbox-close"
        type="button"
        aria-label="<?php esc_attr_e( 'Close fullscreen', 'cns-theme' ); ?>"
        data-wp-on--click="actions.closeLightbox"
      >&#x2715;</button>

      <img
        class="multi-image__lightbox-img"
        src="<?php echo esc_url( $first['urlFull'] ?? $first['url'] ?? '' ); ?>"
        alt="<?php echo esc_attr( $first['alt'] ?? '' ); ?>"
        data-wp-bind--src="state.activeLightboxUrl"
        data-wp-bind--alt="state.activeAlt"
      >

      <?php if ( $has_multiple ) : ?>
        <button
          class="multi-image__arrow multi-image__arrow--prev"
          type="button"
          aria-label="<?php esc_attr_e( 'Previous image', 'cns-theme' ); ?>"
          data-wp-on--click="actions.prev"
        >&#8249;</button>
        <button
          class="multi-image__arrow multi-image__arrow--next"
          type="button"
          aria-label="<?php esc_attr_e( 'Next image', 'cns-theme' ); ?>"
          data-wp-on--click="actions.next"
        >&#8250;</button>
      <?php endif; ?>
    </div>
  </div>

</div>
