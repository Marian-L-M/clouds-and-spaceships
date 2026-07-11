<?php

// ── Content position ──────────────────────────────────────────────────────────
$content_position = $attributes["contentPosition"] ?? "middle-center";
[$v, $h] = explode("-", $content_position);

// ── Mode / height ─────────────────────────────────────────────────────────────
$mode = $attributes["mode"] ?? "unconstrained";
$banner_height = $attributes["bannerHeight"] ?? null;

// ── Background image ──────────────────────────────────────────────────────────
$img_id = $attributes["bgImageID"] ?? 0;
$img_url = $img_id
    ? wp_get_attachment_image_url($img_id, "full")
    : $attributes["bgImageURL"] ?? "";

// ── Slide padding ─────────────────────────────────────────────────────────────
$slide_padding = $attributes["slidePadding"] ?? [
    "top" => "0px",
    "right" => "0px",
    "bottom" => "0px",
    "left" => "0px",
];

// ── Container props ───────────────────────────────────────────────────────────
$container_props = [
    "align-items" =>
        $v === "top" ? "flex-start" : ($v === "bottom" ? "flex-end" : "center"),
    "justify-content" =>
        $h === "left" ? "flex-start" : ($h === "right" ? "flex-end" : "center"),
    "padding-top" => $slide_padding["top"] ?? "0px",
    "padding-right" => $slide_padding["right"] ?? "0px",
    "padding-bottom" => $slide_padding["bottom"] ?? "0px",
    "padding-left" => $slide_padding["left"] ?? "0px",
];

if ($img_url) {
    $container_props["background-image"] = "url(" . esc_url($img_url) . ")";
    $container_props["background-size"] = "cover";
    $container_props["background-position"] = "center";
}

if ($mode === "fixed" && $banner_height) {
    $container_props["height"] = $banner_height . "px";
} elseif ($mode === "constrained" && $banner_height) {
    $container_props["max-height"] = $banner_height . "px";
}

// ── Overlay props ─────────────────────────────────────────────────────────────
$overlay_padding = $attributes["overlayPadding"] ?? [
    "top" => "0px",
    "right" => "0px",
    "bottom" => "0px",
    "left" => "0px",
];
$bg_color = $attributes["bgColor"] ?? "";
$overlay_max_width = $attributes["overlayMaxWidth"] ?? "";
$content_gap = $attributes["contentGap"] ?? "0px";

$overlay_border = $attributes["overlayBorder"] ?? null;

$overlay_props = array_merge(
    [
        "padding-top" => $overlay_padding["top"] ?? "0px",
        "padding-right" => $overlay_padding["right"] ?? "0px",
        "padding-bottom" => $overlay_padding["bottom"] ?? "0px",
        "padding-left" => $overlay_padding["left"] ?? "0px",
        "background-color" => $bg_color ?: null,
        "gap" => $content_gap ?: null,
    ],
    cns_border_to_props($overlay_border),
);

// max-width belongs on the positioned wrapper (the flex child aligned by the
// container's justify-content), not the inner overlay.
$overlay_wrapper_props = [
    "max-width" => $overlay_max_width ?: null,
];

// ── Credit items ──────────────────────────────────────────────────────────────
$credit_items = $attributes["creditItems"] ?? [];
?>
<div <?php echo get_block_wrapper_attributes(); ?>>
    <div class="hero__container" style="<?php echo cns_generate_style_text(
        $container_props,
    ); ?>">
        <div class="wp-block-cns-theme-cns-hero-overlay" style="<?php echo cns_generate_style_text(
            $overlay_wrapper_props,
        ); ?>">
            <div class="hero__overlay" style="<?php echo cns_generate_style_text(
                $overlay_props,
            ); ?>">
                <?php echo $content; ?>
            </div>

            <?php foreach ($credit_items as $item):
                $item_props = cns_get_position_props(
                    $item["position"] ?? "bottom-left",
                    $item["offset"] ?? [],
                ); ?>
            <a
                class="cns-hero__credit-item"
                href="<?php echo esc_url($item["url"] ?? ""); ?>"
                style="<?php echo cns_generate_style_text($item_props); ?>"
            >
            <?php esc_html(cns_render_icon($item["icon"])); ?>
                <span style="color:<?php echo esc_attr(
                    $item["color"] ?? "#ffffff",
                ); ?>">
                    <?php echo esc_html($item["text"] ?? ""); ?>
                </span>
            </a>
            <?php
            endforeach; ?>

        </div>
    </div>
</div>
