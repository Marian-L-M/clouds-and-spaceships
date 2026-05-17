<?php
$items = $attributes["items"] ?? [];
$placement = $attributes["placement"] ?? "left";
$mode = $attributes["mode"] ?? "fixed";

usort($items, fn($a, $b) => ($a["order"] ?? 0) <=> ($b["order"] ?? 0));

$top_level = array_values(
    array_filter($items, fn($i) => empty($i["parentId"])),
);

$wrapper_class = implode(" ", [
    "cns-sidebar",
    "cns-sidebar--" . esc_attr($placement),
    "cns-sidebar--" . esc_attr($mode),
]);

// Closure avoids redeclaration when multiple sidebar blocks are on one page
$render_item = function (array $item, array $all_items) use (
    &$render_item
): string {
    $is_group = ($item["itemType"] ?? "link") === "group";
    $children = array_values(
        array_filter(
            $all_items,
            fn($i) => ($i["parentId"] ?? "") === $item["id"],
        ),
    );
    $label = esc_html($item["label"] ?? "");

    if ($is_group) {
        $default_open = !empty($item["groupDefaultOpen"]);
        $context = esc_attr(wp_json_encode(["isGroupOpen" => $default_open]));

        $html = '<li class="cns-sidebar__item cns-sidebar__item--group"';
        $html .= ' data-wp-context=\'' . $context . '\'';
        $html .= ' data-wp-class--is-open="context.isGroupOpen">';

        $html .= '<button class="cns-sidebar__group-toggle" type="button"';
        $html .= ' data-wp-on--click="actions.toggleGroup"';
        $html .= ' data-wp-bind--aria-expanded="context.isGroupOpen"';
        $html .= ' aria-expanded="' . ($default_open ? "true" : "false") . '">';
        $html .= $label;
        $html .= "</button>";

        if ($children) {
            $html .=
                '<ul class="cns-sidebar__sub-links" data-wp-class--is-open="context.isGroupOpen">';
            foreach ($children as $child) {
                $html .= $render_item($child, $all_items);
            }
            $html .= "</ul>";
        }

        $html .= "</li>";
        return $html;
    }

    // Regular link
    $target = !empty($item["linkNewTab"])
        ? ' target="_blank" rel="noopener noreferrer"'
        : "";
    $href = esc_url($item["url"] ?? "");

    $html = '<li class="cns-sidebar__item">';
    $html .= '<a href="' . $href . '"' . $target . ">" . $label . "</a>";

    if ($children) {
        $html .= '<ul class="cns-sidebar__sub-links is-open">';
        foreach ($children as $child) {
            $html .= $render_item($child, $all_items);
        }
        $html .= "</ul>";
    }

    $html .= "</li>";
    return $html;
};

// Per-sidebar context: isOpen for toggle overlay, isMobileOpen for fixed mobile accordion
$context = esc_attr(
    wp_json_encode(["isOpen" => false, "isMobileOpen" => false]),
);
?>
<aside
  class="<?php echo $wrapper_class; ?>"
  data-wp-interactive="cns-theme/cns-sidebar"
  data-wp-context='<?php echo $context; ?>'
  data-wp-class--is-open="context.isOpen"
  data-wp-class--is-mobile-open="context.isMobileOpen"
  data-wp-on-document--keydown="actions.handleEscape"
>

<!-- Toggle mode button start -->
  <?php if ($mode === "toggle"): ?>
  <button
    class="cns-sidebar__float-toggle-btn"
    type="button"
    aria-label="<?php esc_attr_e("Toggle sidebar", "cns-theme"); ?>"
    aria-expanded="false"
    data-wp-on--click="actions.toggleSidebar"
    data-wp-bind--aria-expanded="context.isOpen"
  >
    <span></span>
    <span></span>
    <span></span>
  </button>

  <!-- <div
    class="cns-sidebar__backdrop"
    data-wp-class--is-visible="context.isOpen"
    data-wp-on--click="actions.closeSidebar"
  ></div> -->
  <?php endif; ?>
  <!-- Toggle mode button end -->

  <div class="cns-sidebar__panel">
    <!-- Fixed mode mobile collpase start -->
    <?php if ($mode === "fixed"): ?>
    <button
      class="cns-sidebar__mobile-toggle"
      type="button"
      aria-expanded="false"
      data-wp-on--click="actions.toggleMobile"
      data-wp-bind--aria-expanded="context.isMobileOpen"
    >
      <?php esc_html_e("Navigation", "cns-theme"); ?>
    </button>
    <?php endif; ?>
    <!-- Fixed mode mobile collpase end -->
    <!-- Sidebar contents -->
    <nav class="cns-sidebar__nav">
      <ul class="cns-sidebar__links">
        <?php foreach ($top_level as $item): ?>
          <?php echo $render_item($item, $items); ?>
        <?php endforeach; ?>
      </ul>
    </nav>
  </div>
</aside>
