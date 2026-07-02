<?php
// Setup theme

require get_theme_file_path("/functions/theme-utilities.php");
require get_theme_file_path("/functions/page-presets.php");
require get_theme_file_path("/functions/theme-admin/cns-admin.php");
require get_theme_file_path("/functions/search-route.php");
require get_theme_file_path("/functions/login-settings.php");
require get_theme_file_path("/functions/subscriber-settings.php");

/**
 * Reads a wp-scripts asset file, falling back to the theme version.
 *
 * @return array{dependencies: string[], version: string}
 */
function cns_get_asset_meta(string $relative_path): array
{
    $asset_file = get_template_directory() . $relative_path;
    return file_exists($asset_file)
        ? require $asset_file
        : ["dependencies" => [], "version" => cns_theme_version()];
}

function cns_theme_version(): string
{
    static $version = null;
    if (null === $version) {
        $version = wp_get_theme(get_template())->get("Version") ?: "1.0";
    }
    return $version;
}

// Register the shared toast notification system so plugins can depend on it.
function cns_register_toast(): void
{
    $toast_asset = cns_get_asset_meta("/build/toast.asset.php");

    wp_register_script(
        "cns-toast",
        get_template_directory_uri() . "/build/toast.js",
        $toast_asset["dependencies"],
        $toast_asset["version"],
        true
    );
    wp_register_style(
        "cns-toast",
        get_template_directory_uri() . "/build/toast.css",
        [],
        $toast_asset["version"]
    );
}
add_action("init", "cns_register_toast");

// Toast is enqueued in wp-admin so plugin suites can rely on it; frontend
// scripts that need it should declare the 'cns-toast' handle as a dependency.
function cns_enqueue_toast(): void
{
    wp_enqueue_script("cns-toast");
    wp_enqueue_style("cns-toast");
}
add_action("admin_enqueue_scripts", "cns_enqueue_toast");

// Load CSS & JS
function cns_enqueue_frontend_assets(): void
{
    $version = cns_theme_version();

    // Register & load theme required styles
    wp_enqueue_style("styles", get_stylesheet_uri(), [], $version);
    // CSS resets etc
    wp_enqueue_style(
        "page_setup",
        get_template_directory_uri() . "/assets/css/setup.css",
        [],
        $version
    );
    // Structural css for template
    wp_enqueue_style(
        "main_styles",
        get_template_directory_uri() . "/assets/css/main.css",
        [],
        $version
    );
    // Utility css classes
    wp_enqueue_style(
        "utilities",
        get_template_directory_uri() . "/assets/css/utilities.css",
        [],
        $version
    );
    wp_enqueue_style(
        "animation",
        get_template_directory_uri() . "/assets/css/animation.css",
        [],
        $version
    );

    // Global theme styles + scripts (compiled from src/ by wp-scripts)
    $index_asset = cns_get_asset_meta("/build/index.asset.php");
    wp_enqueue_style(
        "global_styles",
        get_template_directory_uri() . "/build/index.css",
        [],
        $index_asset["version"]
    );
    wp_enqueue_script(
        "cns-theme-modules",
        get_theme_file_uri("/build/index.js"),
        $index_asset["dependencies"],
        $index_asset["version"],
        true
    );
    wp_localize_script("cns-theme-modules", "cnsThemeData", [
        "root_url" => get_site_url(),
        "theme_uri" => get_template_directory_uri(),
        "nonce" => wp_create_nonce("wp_rest"),
    ]);
}
add_action("wp_enqueue_scripts", "cns_enqueue_frontend_assets");

// Theme custom features
function cns_theme_features(): void
{
    add_theme_support("title-tag");
    add_theme_support("post-thumbnails");
    add_theme_support("editor-styles");
    add_editor_style(["build/index.css", "build/editor.css"]);
    add_image_size("banner", 1600, 600, true);
    register_nav_menu("headerMenuLocation", "Header Menu Location");
    register_nav_menu("footerMenuLocation", "Footer Menu Location");
}
add_action("after_setup_theme", "cns_theme_features");

// Register theme blocks
function cns_register_theme_blocks(): void
{
    if (file_exists(__DIR__ . "/build/blocks-manifest.php")) {
        wp_register_block_types_from_metadata_collection(
            __DIR__ . "/build/blocks",
            __DIR__ . "/build/blocks-manifest.php"
        );
    } elseif (defined("WP_DEBUG") && WP_DEBUG) {
        trigger_error(
            "CNS theme: block manifest not found — run `npm run build` in the theme directory.",
            E_USER_NOTICE
        );
    }
}
add_action("init", "cns_register_theme_blocks");

// Expose cnsThemeData inside the block editor (block edit components read
// theme_uri for asset defaults, e.g. the banner placeholder image).
function cns_editor_theme_data(): void
{
    wp_add_inline_script(
        "wp-blocks",
        "window.cnsThemeData = window.cnsThemeData || " .
            wp_json_encode([
                "theme_uri" => get_stylesheet_directory_uri(),
            ]) .
            ";",
        "before"
    );
}
add_action("enqueue_block_editor_assets", "cns_editor_theme_data");

// Editor UI styles (modals, panels, toolbars). Unlike add_editor_style(),
// these load into the editor app shell where portaled UI like <Modal> lives,
// and selectors are NOT rescoped under .editor-styles-wrapper.
function cns_editor_ui_styles(): void
{
    $asset = cns_get_asset_meta("/build/editor.asset.php");
    wp_enqueue_style(
        "cns-editor-ui",
        get_template_directory_uri() . "/build/editor.css",
        [],
        $asset["version"]
    );
}
add_action("enqueue_block_editor_assets", "cns_editor_ui_styles");
