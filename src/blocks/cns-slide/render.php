<?php
$slide_type = $attributes["slideType"] ?? "image";
$position = $attributes["contentPosition"] ?? "middle-center";
$padding = $attributes["slidePadding"] ?? [
    "top" => "0px",
    "right" => "0px",
    "bottom" => "0px",
    "left" => "0px",
];

[$v, $h] = explode("-", $position);

$container_props = [
    "align-items" =>
        $v === "top" ? "flex-start" : ($v === "bottom" ? "flex-end" : "center"),
    "justify-content" =>
        $h === "left" ? "flex-start" : ($h === "right" ? "flex-end" : "center"),
    "padding-top" => $padding["top"] ?? "0px",
    "padding-right" => $padding["right"] ?? "0px",
    "padding-bottom" => $padding["bottom"] ?? "0px",
    "padding-left" => $padding["left"] ?? "0px",
];

if ($slide_type === "image") {
    $img_url = $attributes["bgImageURL"] ?? "";
    if ($img_url) {
        $container_props["background-image"] = "url(" . esc_url($img_url) . ")";
        $container_props["background-size"] = "cover";
        $container_props["background-position"] = "center";
    }
} elseif ($slide_type === "color") {
    $bg_color = $attributes["bgColor"] ?? "";
    if ($bg_color) {
        $container_props["background-color"] = $bg_color;
    }
}
?>
<li class="glide__slide">
  <div class="slideshow__container" style="<?php echo cns_generate_style_text(
      $container_props,
  ); ?>">
      <?php echo $content; ?>
  </div>
</li>
