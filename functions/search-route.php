<?php

add_action( 'rest_api_init', 'themeRegisterAllCptSearch' );

function themeRegisterAllCptSearch(): void {
    register_rest_route( 'all/v1', 'search', [
        'methods'             => WP_REST_SERVER::READABLE,
        'callback'            => 'allSearchResults',
        'permission_callback' => '__return_true',
    ] );
}

function cns_search_get_post_data(): array {
    return [
        'post_type' => get_post_type(),
        'id'        => get_the_id(),
        'title'     => get_the_title(),
        'permalink' => get_the_permalink(),
        'excerpt'   => get_the_excerpt(),
        'thumbnail' => get_post_thumbnail_id()
            ? wp_get_attachment_image_src( get_post_thumbnail_id(), 'medium' )
            : '',
    ];
}

function allSearchResults( WP_REST_Request $data ): array {
    $allowed      = (array) cns_get_theme_setting( 'search_post_types', [] );
    $search_types = ! empty( $allowed )
        ? $allowed
        : array_keys( get_post_types( [ 'public' => true ] ) );

    $entries = new WP_Query( [
        'post_type' => $search_types,
        's'         => sanitize_text_field( $data['keyword'] ),
    ] );

    $results = array_fill_keys( $search_types, [] );

    while ( $entries->have_posts() ) {
        $entries->the_post();
        $type = get_post_type();
        if ( isset( $results[ $type ] ) ) {
            $results[ $type ][] = cns_search_get_post_data();
        }
    }

    wp_reset_postdata();

    return $results;
}

function themeRegisterWikiSearch(): void {
    register_rest_route( 'wiki/v1', 'search', [
        'methods'             => WP_REST_SERVER::READABLE,
        'callback'            => 'wikiSearchResults',
        'permission_callback' => '__return_true',
    ] );
}

function wikiSearchResults( WP_REST_Request $data ): array {
    $entries = new WP_Query( [
        'post_type' => 'wiki',
        's'         => sanitize_text_field( $data['keyword'] ),
    ] );

    return $entries->posts;
}
