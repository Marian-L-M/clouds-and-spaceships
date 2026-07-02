<?php
$img_url = esc_url( $attributes['imgURL'] ?? '' )
	?: esc_url( get_theme_file_uri( '/assets/images/banner.png' ) );

$wrapper_attrs = get_block_wrapper_attributes( [ 'class' => 'page-banner' ] );
?>
<div <?php echo $wrapper_attrs; ?>>
  <div
    class="page-banner__bg-image"
    style="background-image: url('<?php echo $img_url; ?>');"
  ></div>
  <div class="page-banner__content">
    <?php echo $content; ?>
  </div>
</div>
