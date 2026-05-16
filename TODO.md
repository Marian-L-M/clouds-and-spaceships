# To Do

## Bugs

- Fix nested `get_default_data()` function inside `allSearchResults()` in search-route.php (fatal on second request)
- Hook `themeRegisterWikiSearch` to `rest_api_init` in search-route.php (wiki search endpoint never registers)
- Fix wrong CSS path in login-settings.php: `/css/system.css` → `/assets/css/system.css`
- Create missing `parts/sidebar-right.html` (referenced in theme.json but file doesn't exist)

## Security

- Add `permission_callback` to like-route.php REST routes (required since WP 5.5)
- Replace `die()` calls in like-route.php with `WP_Error` returns
- Escape `$color` param in `design-functions.php` with `esc_attr()` to prevent XSS

## Cleanup

- Decide if `functions/archive-settings.php` should be included or deleted (currently orphaned)
- Add filtering support to `wikiSearchResults()` (currently ignores search params)

- ✅ Create CNS Wikis Multiblock plugin
- Move infobox and wiki post type declaration to plugin
- CHeck if its possible to preset the column width via attributes
- Unify functionality in wp-options
- Create cleanup after deletion
- Theme updater
- Get reference theme
- Do a best practice check for all blocks
- Unify theme blocks into a single multiblock with shared assets (Constants, utility functions, src etc.)
- Cleanup sidebar vibe logic, its a mess
- Theme options page to:
  - Enable author page
  - Enable comment block

Block development

- unify cns-theme blocks into multiblock
- comment block & add functionality
- Multi image block
- Fancy title block
- Check: Banner and Hero might be superflous
