<?php
// Setup theme

require get_theme_file_path("/functions/theme-utilities.php");
require get_theme_file_path("/functions/page-presets.php");
require get_theme_file_path("/functions/theme-admin/cns-admin.php");
// require get_theme_file_path("/functions/block-patterns.php");

// Old
require get_theme_file_path("/functions/search-route.php");
require get_theme_file_path("/functions/like-route.php");
require get_theme_file_path("/functions/login-settings.php");
require get_theme_file_path("/functions/subscriber-settings.php");
require get_theme_file_path("/functions/api-functions.php");
require get_theme_file_path("/functions/design-functions.php");

// Register the shared toast notification system so plugins can depend on it.
function cns_register_toast(): void {
    $toast_asset_file = get_template_directory() . '/build/toast.asset.php';
    $toast_asset      = file_exists( $toast_asset_file )
        ? require $toast_asset_file
        : [ 'dependencies' => [], 'version' => '1.0' ];

    wp_register_script(
        'cns-toast',
        get_template_directory_uri() . '/build/toast.js',
        $toast_asset['dependencies'],
        $toast_asset['version'],
        true
    );
    wp_register_style(
        'cns-toast',
        get_template_directory_uri() . '/build/toast.css',
        [],
        $toast_asset['version']
    );
}
add_action( 'init', 'cns_register_toast' );

// Enqueue toast on frontend and in WP admin (so plugins can use it).
function cns_enqueue_toast(): void {
    wp_enqueue_script( 'cns-toast' );
    wp_enqueue_style( 'cns-toast' );
}
add_action( 'wp_enqueue_scripts',    'cns_enqueue_toast' );
add_action( 'admin_enqueue_scripts', 'cns_enqueue_toast' );

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
    wp_register_block_types_from_metadata_collection(
        __DIR__ . "/build/blocks",
        __DIR__ . "/build/blocks-manifest.php"
    );
}
add_action("init", "register_cns_theme_blocks");

// Editor UI styles (modals, panels, toolbars). Unlike add_editor_style(),
// these load into the editor app shell where portaled UI like <Modal> lives,
// and selectors are NOT rescoped under .editor-styles-wrapper.
function cns_editor_ui_styles()
{
    $asset_file = get_template_directory() . "/build/editor.asset.php";
    $asset = file_exists($asset_file)
        ? require $asset_file
        : ["dependencies" => [], "version" => "1.0"];
    wp_enqueue_style(
        "cns-editor-ui",
        get_template_directory_uri() . "/build/editor.css",
        [],
        $asset["version"],
    );
}
add_action("enqueue_block_editor_assets", "cns_editor_ui_styles");
