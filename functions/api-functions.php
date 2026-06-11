<?php
// REST API TEMPLATE
function theme_custom_rest_global() {
$post_types = get_post_types();

// register_global_api_field($post_types, "FIELD_NAME_HERE", "DISPLAY_VALUE");
}

/**
* Register an API field value for a provided array of post_types
*
* @param array $post_types
* @param string $fieldName
* @param mixed $fieldValue
*
* @return void
*/
function register_global_api_field($post_types, $fieldName, $fieldValue) {
    foreach( $post_types as $type) {
        register_rest_field($type, $fieldName, array(
            'get_callback' => function() use ($fieldValue) {return $fieldValue;}
        ));
    }
}

add_action('rest_api_init', "theme_custom_rest_global");