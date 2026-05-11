<?php
// Setup theme

require get_theme_file_path("/functions/theme-utilities.php");
require get_theme_file_path("/functions/page-presets.php");
// require get_theme_file_path("/functions/block-patterns.php");

// Old
require get_theme_file_path("/functions/search-route.php");
require get_theme_file_path("/functions/like-route.php");
require get_theme_file_path("/functions/login-settings.php");
require get_theme_file_path("/functions/subscriber-settings.php");
require get_theme_file_path("/functions/api-functions.php");
require get_theme_file_path("/functions/design-functions.php");

// Load CSS&JS
function load_project_files()
{
    // Register & load theme required styles
    wp_enqueue_style("styles", get_stylesheet_uri());
    wp_enqueue_style(
        "page_setup",
        get_template_directory_uri() . "/assets/css/setup.css",
    ); // CSS resets etc
    wp_enqueue_style(
        "main_styles",
        get_template_directory_uri() . "/assets/css/main.css",
    ); // Structural css for template
    wp_enqueue_style(
        "utilities",
        get_template_directory_uri() . "/assets/css/utilities.css",
    ); // utility css classes
    wp_enqueue_style(
        "animation",
        get_template_directory_uri() . "/assets/css/animation.css",
    );

    // Global theme styles (compiled from src/scss/style.scss)
    wp_enqueue_style(
        "global_styles",
        get_template_directory_uri() . "/build/index.css",
    );

    // Load Scripts
    wp_enqueue_script(
        "cns-theme-modules",
        get_theme_file_uri("/build/index.js"),
        ["jquery"],
        "1.0",
        true,
    );
    wp_localize_script("cns-theme-modules", "cnsThemeData", [
        "root_url" => get_site_url(), // Make root url accessible to JS
        "theme_uri" => get_template_directory_uri(),
        "nonce" => wp_create_nonce("wp_rest"),
    ]);
}
add_action("wp_enqueue_scripts", "load_project_files");

// Theme custom features
function theme_features()
{
    add_theme_support("title-tag");
    add_theme_support("post-thumbnails");
    add_theme_support("editor-styles");
    add_editor_style(["build/index.css", "build/editor.css"]);
    add_image_size("banner", 1600, 600, true);
    // add_image_size("mobile", 600, 900, true);
    // add_image_size("banner-xl", 2400, 900, true);
    register_nav_menu("headerMenuLocation", "Header Menu Location");
    register_nav_menu("footerMenuLocation", "Footer Menu Location");
}

add_action("after_setup_theme", "theme_features");

// Register new blocks
function register_cns_theme_blocks()
{
    wp_localize_script("wp-editor", "cnsThemeData", [
        "theme_uri" => get_stylesheet_directory_uri(),
    ]);
    register_block_type_from_metadata(__DIR__ . "/build/cns-header");
    register_block_type_from_metadata(__DIR__ . "/build/cns-header-nav");
    register_block_type_from_metadata(__DIR__ . "/build/cns-user-menu");
    register_block_type_from_metadata(__DIR__ . "/build/cns-sidebar");
    register_block_type_from_metadata(__DIR__ . "/build/cns-hero");
    // register_block_type_from_metadata(__DIR__ . "/build/footer");
    register_block_type_from_metadata(__DIR__ . "/build/banner");
    register_block_type_from_metadata(__DIR__ . "/build/slideshow");
    register_block_type_from_metadata(__DIR__ . "/build/slide");
    // Migrated blocks
    // register_block_type_from_metadata(__DIR__ . "/build/infobox");
    // register_block_type_from_metadata(__DIR__ . "/build/infobox-group");
    // register_block_type_from_metadata(__DIR__ . "/build/infobox-row");
    register_block_type_from_metadata(__DIR__ . "/build/sidebar");
}
add_action("init", "register_cns_theme_blocks");
