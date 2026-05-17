<?php
$items = $attributes["items"] ?? [];
usort( $items, fn( $a, $b ) => ( $a["order"] ?? 0 ) <=> ( $b["order"] ?? 0 ) );
$mode = $attributes["mode"] ?? "side-nav";
$wrapper_attributes = get_block_wrapper_attributes([
    "data-wp-interactive" => "cns-theme/cns-header",
]);
?>
<div <?php echo $wrapper_attributes; ?>>
    <nav class="cns-header__nav">
        <ul class="cns-header__nav__links <?php echo esc_attr($mode); ?>">
            <?php foreach ($items as $item): ?>
                <li class="cns-header__nav__item">
                    <a
                        href="<?php echo esc_url($item["url"]); ?>"
                        <?php if (
                            !empty($item["linkNewTab"])
                        ): ?>target="_blank" rel="noopener noreferrer"<?php endif; ?>
                    >
                        <?php echo esc_html($item["label"]); ?>
                    </a>
                </li>
            <?php endforeach; ?>
        </ul>
    </nav>
</div>