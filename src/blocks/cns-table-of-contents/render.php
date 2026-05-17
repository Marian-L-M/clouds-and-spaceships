<?php
$toc_title = $attributes['title'] ?? 'Table of Contents';
$items     = $attributes['items'] ?? [];

// Filter out empty items
$items = array_filter( $items, fn( $item ) => ! empty( $item['label'] ) || ! empty( $item['anchor'] ) );

if ( empty( $items ) ) {
    return;
}
?>
<nav <?php echo get_block_wrapper_attributes( [ 'aria-label' => esc_attr( $toc_title ) ] ); ?>>
    <?php if ( $toc_title ) : ?>
    <p class="cns-toc__title"><?php echo wp_kses_post( $toc_title ); ?></p>
    <?php endif; ?>

    <ol class="cns-toc__list">
        <?php foreach ( $items as $item ) :
            $label  = esc_html( $item['label']  ?? '' );
            $anchor = esc_attr( $item['anchor'] ?? '' );
        ?>
        <li class="cns-toc__item">
            <?php if ( $anchor ) : ?>
            <a class="cns-toc__link" href="#<?php echo $anchor; ?>">
                <?php echo $label; ?>
            </a>
            <?php else : ?>
            <span class="cns-toc__link"><?php echo $label; ?></span>
            <?php endif; ?>
        </li>
        <?php endforeach; ?>
    </ol>
</nav>
