<?php
// Site-wide search endpoint: GET /wp-json/all/v1/search?keyword=…
// Returns published, searchable posts grouped by post type.

add_action( 'rest_api_init', 'cns_register_search_route' );

function cns_register_search_route(): void {
    register_rest_route( 'all/v1', 'search', [
        'methods'             => WP_REST_Server::READABLE,
        'callback'            => 'cns_search_results',
        'permission_callback' => '__return_true',
        'args'                => [
            'keyword' => [
                'type'              => 'string',
                'default'           => '',
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'per_page' => [
                'type'    => 'integer',
                'default' => 10,
                'minimum' => 1,
                'maximum' => 50,
            ],
        ],
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

function cns_search_results( WP_REST_Request $request ): array {
    $allowed      = (array) cns_get_theme_setting( 'search_post_types', [] );
    $search_types = ! empty( $allowed )
        ? $allowed
        // Public types that haven't opted out of search (also drops attachments).
        : array_keys( get_post_types( [ 'public' => true, 'exclude_from_search' => false ] ) );

    $entries = new WP_Query( [
        'post_type'      => array_values( $search_types ),
        's'              => $request['keyword'],
        'posts_per_page' => (int) $request['per_page'],
        'post_status'    => 'publish',
        'no_found_rows'  => true,
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
