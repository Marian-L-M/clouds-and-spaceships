<?php
/**
 * Render callback for the cns-fancy-title block.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Rendered inner blocks HTML.
 * @var WP_Block $block      Block instance.
 */

$mode              = $attributes['mode']               ?? 'branded';
$image_url         = $attributes['imageUrl']           ?? '';
$image_alt         = $attributes['imageAlt']           ?? '';
$image_width       = intval( $attributes['imageWidth']  ?? 200 );
$column_gap        = intval( $attributes['columnGap']   ?? 24 );
$show_v_divider    = (bool) ( $attributes['showVerticalDivider'] ?? false );
$divider_color     = $attributes['dividerColor']       ?? '#000000';
$divider_thickness = intval( $attributes['dividerThickness']     ?? 1 );

// Future modes are handled by adding cases here.
if ( $mode !== 'branded' ) {
    return;
}

$grid_style = sprintf(
    '--fancy-title-image-width:%dpx;--fancy-title-column-gap:%dpx;--fancy-title-divider-color:%s;--fancy-title-divider-thickness:%dpx;',
    $image_width,
    $column_gap,
    esc_attr( $divider_color ),
    $divider_thickness
);

$wrapper_attrs = get_block_wrapper_attributes( [
    'class' => 'fancy-title fancy-title--branded',
] );
?>
<div <?php echo $wrapper_attrs; ?>>
  <div class="fancy-title__grid" style="<?php echo esc_attr( $grid_style ); ?>">

    <div class="fancy-title__image-col<?php echo $show_v_divider ? ' has-vertical-divider' : ''; ?>">
      <?php if ( $image_url ) : ?>
        <img
          src="<?php echo esc_url( $image_url ); ?>"
          alt="<?php echo esc_attr( $image_alt ); ?>"
        >
      <?php endif; ?>
    </div>

    <div class="fancy-title__text-col">
      <?php echo $content; ?>
    </div>

  </div>
</div>
