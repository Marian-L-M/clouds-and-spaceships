<?php
$items = $attributes["items"] ?? [];
$icon  = $attributes["icon"] ?? "user";

$icons = [
    "user"   => '<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 7C9.65685 7 11 5.65685 11 4C11 2.34315 9.65685 1 8 1C6.34315 1 5 2.34315 5 4C5 5.65685 6.34315 7 8 7Z" fill="currentColor"/><path d="M14 12C14 10.3431 12.6569 9 11 9H5C3.34315 9 2 10.3431 2 12V15H14V12Z" fill="currentColor"/></svg>',
    "avatar" => '<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="2"/><path d="M8 8C9.38071 8 10.5 6.88071 10.5 5.5C10.5 4.11929 9.38071 3 8 3C6.61929 3 5.5 4.11929 5.5 5.5C5.5 6.88071 6.61929 8 8 8Z" fill="currentColor"/><path d="M3 13.5C3 11.567 5.23858 10 8 10C10.7614 10 13 11.567 13 13.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
];

$context = [ "isOpen" => false ];
$wrapper_attributes = get_block_wrapper_attributes([
    "data-wp-interactive" => "cns-theme/cns-user-menu",
    "data-wp-context"     => wp_json_encode( $context ),
]);
?>

<div <?php echo $wrapper_attributes; ?>>
    <div class="cns-um__wrapper">
        <button
            class="cns-um__toggle"
            data-wp-on--click="actions.toggle"
            data-wp-bind--aria-expanded="context.isOpen"
        ><?php echo $icons[ $icon ] ?? $icons["user"]; ?></button>
        <ul class="cns-um__nav-links" data-wp-bind--hidden="!context.isOpen">
            <?php foreach ($items as $item): ?>
            <li class="cns-um__nav-link">
                    <a href="<?php echo esc_url($item["url"]); ?>"
                        <?php if (
                            !empty($item["linkNewTab"])
                        ): ?>target="_blank" rel="noopener noreferrer"<?php endif; ?>
                    >
                        <?php echo esc_html($item["label"]); ?>
                    </a>
            </li>
            <?php endforeach; ?>
        </ul>
    </div>
</div>