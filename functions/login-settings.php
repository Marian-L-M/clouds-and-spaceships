<?php

// Point login page back to the site root.
add_filter( 'login_headerurl', static fn() => esc_url( site_url( '/' ) ) );

// Use the site name as the logo link title.
add_filter( 'login_headertitle', static fn() => get_bloginfo( 'name' ) );

// Enqueue the theme's base login stylesheet (fixed path: was /css/system.css).
function cns_login_enqueue_styles(): void {
    wp_enqueue_style(
        'cns-login',
        get_template_directory_uri() . '/assets/css/system.css'
    );
}
add_action( 'login_enqueue_scripts', 'cns_login_enqueue_styles' );

// Output dynamic branding CSS (logo, background colour, background image).
function cns_login_branding_styles(): void {
    $logo_id     = (int) cns_get_theme_setting( 'login_logo_id', 0 );
    $bg_color    = (string) cns_get_theme_setting( 'login_bg_color', '' );
    $bg_image_id = (int) cns_get_theme_setting( 'login_bg_image_id', 0 );

    $css = '';

    // ── Body background ───────────────────────────────────────────────────────
    $body = '';
    if ( $bg_color ) {
        $body .= 'background-color:' . sanitize_hex_color( $bg_color ) . ';';
    }
    if ( $bg_image_id ) {
        $bg_url = wp_get_attachment_image_url( $bg_image_id, 'full' );
        if ( $bg_url ) {
            $body .= 'background-image:url(' . esc_url( $bg_url ) . ');'
                   . 'background-size:cover;background-position:center;';
        }
    }
    if ( $body ) {
        $css .= 'body.login{' . $body . '}';
    }

    // ── Custom logo ───────────────────────────────────────────────────────────
    if ( $logo_id ) {
        $src = wp_get_attachment_image_src( $logo_id, 'thumbnail' );
        if ( $src ) {
            $css .= '#login h1 a,.login h1 a{'
                  . 'background-image:url(' . esc_url( $src[0] ) . ');'
                  . 'width:' . (int) $src[1] . 'px;'
                  . 'height:' . (int) $src[2] . 'px;'
                  . 'background-size:contain;background-repeat:no-repeat;'
                  . '}';
        }
    }

    if ( $css ) {
        echo '<style>' . $css . '</style>' . "\n"; // phpcs:ignore WordPress.Security.EscapeOutput
    }
}
add_action( 'login_head', 'cns_login_branding_styles' );
