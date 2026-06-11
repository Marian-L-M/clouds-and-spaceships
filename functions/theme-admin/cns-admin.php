<?php
/**
 * CNS administration panel.
 *
 * Registers the top-level "CNS" menu and one submenu entry per tab.
 * Runs at admin_menu priority 99 so it lands near the bottom of the sidebar.
 *
 * ── Plugin / suite integration ───────────────────────────────────────────────
 * Any plugin can inject its own tab by hooking `cns_admin_tabs` before
 * admin_menu fires at priority 99 (i.e. use the default priority 10):
 *
 *   add_filter( 'cns_admin_tabs', function ( array $tabs ): array {
 *       $tabs['my-slug'] = [
 *           'menu_title' => 'My Suite',       // sidebar label
 *           'title'      => 'My Suite Title', // horizontal tab label
 *           'capability' => 'manage_options',
 *           'callback'   => 'my_suite_render_tab', // callable
 *           'priority'   => 40,               // lower = further left/up
 *       ];
 *       return $tabs;
 *   } );
 */

defined( 'ABSPATH' ) || exit;

// ── Theme settings helpers ────────────────────────────────────────────────────

/**
 * Returns a single value from the cns_theme_settings option array.
 * Result is cached per request so get_option() is only called once.
 */
function cns_get_theme_setting( string $key, $default = null ) {
    static $settings = null;
    if ( null === $settings ) {
        $settings = (array) get_option( 'cns_theme_settings', [] );
    }
    return array_key_exists( $key, $settings ) ? $settings[ $key ] : $default;
}

// ── Settings API registration ─────────────────────────────────────────────────

add_action( 'admin_init', 'cns_admin_register_settings' );

function cns_admin_register_settings(): void {
    register_setting(
        'cns_theme_settings_group',
        'cns_theme_settings',
        [ 'sanitize_callback' => 'cns_sanitize_theme_settings' ]
    );
}

function cns_sanitize_theme_settings( $input ): array {
    $input  = is_array( $input ) ? $input : [];
    $output = [];

    $output['subscriber_redirect_enabled'] = ! empty( $input['subscriber_redirect_enabled'] ) ? 1 : 0;
    $raw_url                               = $input['subscriber_redirect_url'] ?? '/';
    $output['subscriber_redirect_url']     = esc_url_raw( $raw_url ) ?: '/';
    $output['login_logo_id']               = absint( $input['login_logo_id'] ?? 0 );
    $output['login_bg_color']              = sanitize_hex_color( $input['login_bg_color'] ?? '' ) ?? '';
    $output['login_bg_image_id']           = absint( $input['login_bg_image_id'] ?? 0 );

    $public_types                 = array_keys( get_post_types( [ 'public' => true ] ) );
    $raw_types                    = is_array( $input['search_post_types'] ?? null ) ? $input['search_post_types'] : [];
    $output['search_post_types']  = array_values( array_intersect( array_map( 'sanitize_key', $raw_types ), $public_types ) );

    $output['profile_page_id'] = absint( $input['profile_page_id'] ?? 0 );

    return $output;
}

// ── Admin asset enqueue ───────────────────────────────────────────────────────

add_action( 'admin_enqueue_scripts', 'cns_admin_enqueue_theme_assets' );

function cns_admin_enqueue_theme_assets( string $hook ): void {
    if ( ! str_contains( $hook, 'cns-settings' ) ) {
        return;
    }
    wp_enqueue_media();
    wp_add_inline_script( 'jquery', cns_admin_media_picker_js() );
}

function cns_admin_media_picker_js(): string {
    return <<<'JS'
(function ($) {
    $(function () {
        $('.cns-media-btn').on('click', function (e) {
            e.preventDefault();
            var btn      = $(this);
            var inputId  = btn.data('input');
            var imgId    = btn.data('preview');
            var removeId = btn.data('remove');
            var frame    = wp.media({
                title:    btn.data('title') || 'Select Image',
                button:   { text: 'Use this image' },
                multiple: false,
                library:  { type: 'image' },
            });
            frame.on('select', function () {
                var att = frame.state().get('selection').first().toJSON();
                $('#' + inputId).val(att.id);
                $('#' + imgId).attr('src', att.url).show();
                $('#' + removeId).show();
                btn.text(btn.data('change-label') || 'Change image');
            });
            frame.open();
        });

        $('.cns-media-remove-btn').on('click', function (e) {
            e.preventDefault();
            var btn      = $(this);
            var inputId  = btn.data('input');
            var imgId    = btn.data('preview');
            var pickerId = btn.data('picker');
            $('#' + inputId).val('');
            $('#' + imgId).attr('src', '').hide();
            btn.hide();
            $('#' + pickerId).text($('#' + pickerId).data('select-label') || 'Select image');
        });
    });
})(jQuery);
JS;
}

// ── Tab registry ──────────────────────────────────────────────────────────────

/**
 * Returns the ordered tab definitions, merged with any plugin additions.
 * Result is cached so apply_filters only runs once per request.
 */
function cns_admin_get_tabs(): array {
    static $tabs = null;
    if ( null !== $tabs ) {
        return $tabs;
    }

    $built_in = [
        'theme' => [
            'menu_title' => __( 'Theme', 'cns-theme' ),
            'title'      => __( 'Theme', 'cns-theme' ),
            'capability' => 'manage_options',
            'callback'   => 'cns_admin_render_tab_theme',
            'priority'   => 10,
        ],
    ];

    $tabs = (array) apply_filters( 'cns_admin_tabs', $built_in );

    uasort( $tabs, static function ( array $a, array $b ): int {
        return ( (int) ( $a['priority'] ?? 50 ) ) <=> ( (int) ( $b['priority'] ?? 50 ) );
    } );

    return $tabs;
}

/**
 * Returns the WP admin page slug for a given tab slug.
 * The first/theme tab shares the parent slug so WordPress doesn't duplicate it.
 */
function cns_admin_page_slug( string $tab_slug ): string {
    return $tab_slug === 'theme' ? 'cns-settings' : 'cns-settings-' . $tab_slug;
}

// ── Menu registration ─────────────────────────────────────────────────────────

add_action( 'admin_menu', 'cns_admin_register_menus', 99 );

function cns_admin_register_menus(): void {
    $tabs = cns_admin_get_tabs();

    // Top-level entry — dashicons-cloud, position 99 = bottom of sidebar.
    add_menu_page(
        __( 'Clouds And Spaceships', 'cns-theme' ),
        __( 'CNS', 'cns-theme' ),
        'manage_options',
        'cns-settings',
        'cns_admin_render_page',
        'dashicons-cloud',
        99
    );

    // One named submenu per tab. The theme tab reuses the parent slug so it
    // replaces the auto-generated "CNS" duplicate that add_menu_page creates.
    foreach ( $tabs as $slug => $tab ) {
        add_submenu_page(
            'cns-settings',
            __( 'Clouds And Spaceships', 'cns-theme' ),
            esc_html( $tab['menu_title'] ),
            $tab['capability'] ?? 'manage_options',
            cns_admin_page_slug( $slug ),
            'cns_admin_render_page'
        );
    }

    // Remove the auto-generated "CNS" duplicate (first match on the parent slug).
    remove_submenu_page( 'cns-settings', 'cns-settings' );
}

// ── Page renderer ─────────────────────────────────────────────────────────────

function cns_admin_render_page(): void {
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_die( esc_html__( 'You do not have permission to access this page.', 'cns-theme' ) );
    }

    $tabs         = cns_admin_get_tabs();
    $current_page = sanitize_key( $_GET['page'] ?? 'cns-settings' );

    $active_tab = array_key_first( $tabs );
    foreach ( $tabs as $slug => $tab ) {
        if ( $current_page === cns_admin_page_slug( $slug ) ) {
            $active_tab = $slug;
            break;
        }
    }

    include __DIR__ . '/partials/page.php';
}

// ── Built-in tab callbacks ────────────────────────────────────────────────────

function cns_admin_render_tab_theme(): void {
    include __DIR__ . '/partials/tab-theme.php';
}
