<?php
/**
 * CNS administration panel — theme settings.
 *
 * The tabbed settings page itself lives in the shared framework
 * (cns-settings-page.php); this file registers the theme's own "Theme" tab
 * and its settings. Suite plugins add their tabs the same way via the
 * `cns_admin_tabs` filter — see the framework file header for the format.
 */

defined( 'ABSPATH' ) || exit;

// Shared CNS settings page framework (no-op if a suite plugin already
// loaded its identical copy — plugins load before the theme).
require __DIR__ . '/cns-settings-page.php';

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

// ── Tab registration ──────────────────────────────────────────────────────────

add_filter( 'cns_admin_tabs', function ( array $tabs ): array {
    $tabs['theme'] = [
        'menu_title' => __( 'Theme', 'cns-theme' ),
        'title'      => __( 'Theme', 'cns-theme' ),
        'capability' => 'manage_options',
        'callback'   => 'cns_admin_render_tab_theme',
        'priority'   => 10,
    ];
    return $tabs;
} );

function cns_admin_render_tab_theme(): void {
    include __DIR__ . '/partials/tab-theme.php';
}
