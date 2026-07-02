<?php
add_action('after_switch_theme', 'cns_create_preset_pages');

function cns_create_preset_pages()
{
    $page_id = get_option('cns_profile_page_id');

    $post = $page_id ? get_post($page_id) : null;

    if (!$post || !in_array($post->post_status, ['publish', 'draft', 'private'])) {
        $page_id = wp_insert_post([
            'post_type'   => 'page',
            'post_title'  => 'Profile',
            'post_name'   => 'profile',
            'post_status' => 'publish',
        ]);

        if ($page_id && !is_wp_error($page_id)) {
            update_post_meta($page_id, '_wp_page_template', 'page-profile');
            update_option('cns_profile_page_id', $page_id);
        }
    }
}
