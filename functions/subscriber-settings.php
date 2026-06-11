<?php
// Subscriber functionality

function redirectSubsToFrontend(): void {
    if ( ! cns_get_theme_setting( 'subscriber_redirect_enabled', false ) ) {
        return;
    }

    $user = wp_get_current_user();
    if ( count( $user->roles ) === 1 && $user->roles[0] === 'subscriber' ) {
        wp_safe_redirect( cns_get_theme_setting( 'subscriber_redirect_url', '/' ) );
        exit();
    }
}

add_action( 'admin_init', 'redirectSubsToFrontend' );
