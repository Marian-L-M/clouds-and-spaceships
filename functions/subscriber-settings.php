<?php
// Subscriber functionality

function cns_redirect_subscribers_to_frontend(): void {
    // admin_init also fires for AJAX/cron requests — redirecting those would
    // break frontend AJAX for logged-in subscribers.
    if ( wp_doing_ajax() || wp_doing_cron() ) {
        return;
    }
    if ( ! cns_get_theme_setting( 'subscriber_redirect_enabled', false ) ) {
        return;
    }

    $user = wp_get_current_user();
    if ( count( $user->roles ) === 1 && $user->roles[0] === 'subscriber' ) {
        wp_safe_redirect( cns_get_theme_setting( 'subscriber_redirect_url', '/' ) );
        exit();
    }
}

add_action( 'admin_init', 'cns_redirect_subscribers_to_frontend' );
