<?php
$extra_attrs = [
    "data-wp-interactive" => "cns-theme/cns-header",
    "data-wp-context" => wp_json_encode(["isSearchOpen" => false]),
    "data-wp-init" => "callbacks.trackScroll",
    "data-wp-on-window--scroll" => "callbacks.trackScroll",
    "data-wp-class--search-open" => "context.isSearchOpen",
];

$styles = [];
if (!empty($attributes["backgroundColor"])) {
    $styles[] = "background-color:" . esc_attr($attributes["backgroundColor"]);
}
if (!empty($attributes["textColor"])) {
    $styles[] = "color:" . esc_attr($attributes["textColor"]);
}
if ($styles) {
    $extra_attrs["style"] = implode(";", $styles);
}

$wrapper_attributes = get_block_wrapper_attributes($extra_attrs);
?>
<div <?php echo $wrapper_attributes; ?>>
	<?php echo $content; ?>
</div>
