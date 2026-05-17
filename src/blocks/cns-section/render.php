<?php
$title         = $attributes['title']        ?? '';
$title_level   = $attributes['titleLevel']   ?? 'h2';
$show_underline = $attributes['showUnderline'] ?? true;

// Collect cns-tab inner blocks
$tab_blocks = [];
foreach ( $block->inner_blocks as $inner_block ) {
    if ( $inner_block->name === 'cns-theme/cns-tab' ) {
        $tab_blocks[] = $inner_block;
    }
}
$has_tabs = ! empty( $tab_blocks );

// Title container class
$title_container_class = 'cns-section__title-container';
if ( $show_underline ) {
    $title_container_class .= ' has-underline';
}

// Build tabs bar and panels when in tab mode
$tabs_bar_html  = '';
$panels_html    = '';

if ( $has_tabs ) {
    $tabs_bar_html .= '<div class="cns-section__tabs" role="tablist">';

    foreach ( $tab_blocks as $i => $tab_block ) {
        $label    = esc_html( $tab_block->attributes['label'] ?? ( 'Tab ' . ( $i + 1 ) ) );
        $is_first = ( $i === 0 );

        $tab_ctx = wp_json_encode( [ 'tabIndex' => $i ] );

        $tabs_bar_html .= sprintf(
            '<button class="cns-section__tab-btn%s" role="tab" aria-selected="%s"
                data-wp-on--click="actions.setTab"
                data-wp-class--is-active="state.isTabActive"
                data-wp-context=\'%s\'>%s</button>',
            $is_first ? ' is-active' : '',
            $is_first ? 'true' : 'false',
            esc_attr( $tab_ctx ),
            $label
        );

        $panel_ctx     = wp_json_encode( [ 'panelIndex' => $i ] );
        $panel_content = $tab_block->render();

        $panels_html .= sprintf(
            '<div class="cns-tab__panel%s" role="tabpanel"
                data-wp-context=\'%s\'
                data-wp-class--is-active="state.isPanelActive">%s</div>',
            $is_first ? ' is-active' : '',
            esc_attr( $panel_ctx ),
            $panel_content
        );
    }

    $tabs_bar_html .= '</div>';
}

// Wrapper attributes — only wire up interactivity when tabs exist
$wrapper_attrs = [];
if ( $has_tabs ) {
    $wrapper_attrs['data-wp-interactive'] = 'cns-theme/cns-section';
    $wrapper_attrs['data-wp-context']     = wp_json_encode( [ 'activeTab' => 0 ] );
}
?>
<div <?php echo get_block_wrapper_attributes( $wrapper_attrs ); ?>>
    <div class="<?php echo esc_attr( $title_container_class ); ?>">
        <?php if ( $title ) : ?>
        <<?php echo esc_html( $title_level ); ?> class="cns-section__title">
            <?php echo wp_kses_post( $title ); ?>
        </<?php echo esc_html( $title_level ); ?>>
        <?php endif; ?>

        <?php echo $tabs_bar_html; ?>
    </div>

    <div class="cns-section__content">
        <?php if ( $has_tabs ) : ?>
            <?php echo $panels_html; ?>
        <?php else : ?>
            <?php echo $content; ?>
        <?php endif; ?>
    </div>
</div>
