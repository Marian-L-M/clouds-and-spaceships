<?php
$extra_attrs = [
    "data-wp-interactive"        => "cns-theme/cns-header",
    "data-wp-context"            => wp_json_encode( [ "isSearchOpen" => false ] ),
    "data-wp-init"               => "callbacks.trackScroll",
    "data-wp-on-window--scroll"  => "callbacks.trackScroll",
    "data-wp-class--search-open" => "context.isSearchOpen",
];

$styles = [];
if ( ! empty( $attributes['backgroundColor'] ) ) {
    $styles[] = 'background-color:' . esc_attr( $attributes['backgroundColor'] );
}
if ( ! empty( $attributes['textColor'] ) ) {
    $styles[] = 'color:' . esc_attr( $attributes['textColor'] );
}
if ( $styles ) {
    $extra_attrs['style'] = implode( ';', $styles );
}

$search_icon = '<svg class="icon-search" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
$close_icon  = '<svg class="icon-close" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

$wrapper_attributes = get_block_wrapper_attributes( $extra_attrs ); ?>
<div <?php echo $wrapper_attributes; ?>>
	<button
		type="button"
		class="mobile-search-toggle"
		aria-label="<?php echo esc_attr__( 'Toggle search', 'cns-theme' ); ?>"
		data-wp-on--click="actions.toggleSearch"
		data-wp-bind--aria-expanded="context.isSearchOpen"
	><?php echo $search_icon . $close_icon; ?></button>
	<?php echo $content; ?>
</div>
