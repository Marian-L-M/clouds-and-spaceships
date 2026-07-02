# Clouds and Spaceships Theme — Improvement Plan

## Status (updated 2026-07-02, second pass)

**Done & verified:** #1 banner XSS fixed (`esc_url` + `get_block_wrapper_attributes`); #2 AJAX/cron guard on subscriber redirect; #3 like-route.php deleted; #4 search route hardened (arg schema, publish-only, per_page cap, `exclude_from_search` respected, dead wiki search removed); #5 legacy files purged (api-functions, archive-settings, design-functions, block-patterns) + `post_author` hardcode removed; #6 `cns_` prefixes, manifest guard, editor `cnsThemeData` via `wp-blocks` inline script (wp-editor localize hack gone); #7 all CSS enqueues version-stamped (verified `?ver=1.1`); #8 jQuery dependency dropped (index.ts has no jQuery); #9 style.css header fixed (PHP 8.0, requires/tested-up-to, version 1.1); #10 `404.html`, `search.html`, `archive.html` added (404 verified). Toast now admin-only (no frontend consumers; plugins pull it via handle dependency).

**Deferred:** #11 splitting the 640-line edit.tsx files; #12 CI/PHPCS; folding static CSS into the SCSS build (versioning done instead); P3 features.

---

Reviewed: 2026-07-02. The FSE side (blocks, `theme.json` v3, interactivity API usage in cns-sidebar/cns-multi-image, the `cns_admin_tabs` plugin-integration system) is solid and modern. The `functions/` directory, by contrast, carries visible legacy from an earlier project and a few real bugs. Ordered by priority.

---

## P0 — Bugs / security

### 1. XSS via unescaped block attribute in cns-banner
`src/blocks/cns-banner/render.php`:

```php
style="background-image: url('<?php echo $attributes["imgURL"]; ?>');"
```

`imgURL` is echoed raw. Block attributes live in HTML comments and are not reliably filtered by kses for lower-privileged authors, so a crafted attribute value (`'); …" onmouseover="…`) breaks out of the attribute. Fix with `esc_url()`, and while in the file: this is the only theme block not using `get_block_wrapper_attributes()` — add it. Compare `cns-sidebar/render.php`, which handles the same problem correctly (regex-validated `maxWidth`, slug-sanitized presets).

### 2. Subscriber redirect breaks AJAX
`functions/subscriber-settings.php` hooks `admin_init` and redirects subscribers away from wp-admin. `admin_init` also fires on `admin-ajax.php`, so any frontend AJAX for a logged-in subscriber gets a 302 instead of a response. Guard it:

```php
if ( wp_doing_ajax() || wp_doing_cron() ) return;
```

### 3. `like-route.php` is broken legacy — remove or rebuild
It references post types `likes` and `projects` that don't exist on this platform (leftovers from a portfolio project), registers REST routes **without `permission_callback`** (triggers `_doing_it_wrong` since WP 5.5), and terminates with `die("...")` inside REST callbacks, which bypasses the REST envelope entirely. Nothing in the theme's JS can be using it meaningfully. Delete the file (and the `require`), or rewrite it properly if likes are on the roadmap (nonce-verified `permission_callback`, `WP_Error` returns, post-type check against real CPTs).

### 4. Search route leaks and dead search code
`functions/search-route.php`:
- `wikiSearchResults()` returns raw `WP_Post` objects — including `post_content` and `post_password`. Its route registration (`themeRegisterWikiSearch`) is never hooked, so it's currently dead code — delete both, or hook it and return the same curated shape as `allSearchResults`.
- `allSearchResults()` falls back to *all* public post types, which includes `attachment` — media library items appear in site search. Exclude it, and add a `posts_per_page` cap + `no_found_rows` (currently relies on the default 10, implicitly).
- `WP_REST_SERVER::READABLE` → `WP_REST_Server::READABLE` (works, but wrong case).

---

## P1 — Structure & dead code

### 5. Purge the legacy `functions/` files
The `// Old` comment in `functions.php` is honest. Concretely:

| File | Status | Action |
|---|---|---|
| `like-route.php` | broken legacy (P0 #3) | delete |
| `api-functions.php` | empty REST "template", registers a no-op | delete |
| `archive-settings.php` | targets `features`/`guides`/`roadmap` CPTs from another project; **not even required** in functions.php | delete |
| `design-functions.php` | one unused `generate_icon()` echoing `$color` unescaped | delete or move the SVG into an asset |
| `block-patterns.php` | require commented out | decide: wire in or delete |
| `page-presets.php` | works, but hardcodes `post_author => 1` | use `get_users(['role'=>'administrator'])[0]` or omit author |

That cuts the loaded legacy surface to zero and makes `functions.php` read as: utilities, presets, admin, toast, enqueues, blocks.

### 6. Naming & bootstrap hygiene
- Global function names `load_project_files`, `theme_features`, `redirectSubsToFrontend`, `createLike` are unprefixed camel/snake mix. Prefix everything `cns_` (the newer files already do this).
- `register_cns_theme_blocks()` calls `wp_localize_script('wp-editor', …)` — `wp-editor` is a deprecated handle and this duplicates the `cnsThemeData` localization already attached to `cns-theme-modules`. If editor JS needs `theme_uri`, attach the data to your own editor script handle.
- Add a `file_exists` guard around `build/blocks-manifest.php` like the plugins have.

### 7. Consolidate the CSS pipeline
Five hand-maintained CSS files (`setup.css`, `main.css`, `utilities.css`, `animation.css`, plus `style.css`) are enqueued individually **without version strings** (browser-cache staleness on every deploy), alongside the compiled `build/index.css`. Fold the static files into the SCSS build (`src/scss/`) so there's one compiled stylesheet with the asset-file version, or at minimum pass `wp_get_theme()->get('Version')` as the version arg everywhere. Long-term, migrate what you can into `theme.json` (the FSE-native home for spacing/typography/color rules).

### 8. jQuery dependency
`build/index.js` is enqueued with a `jquery` dependency. The theme's own modules (toast, view scripts) are vanilla/interactivity-API. Audit whether anything in `src/index` actually uses jQuery; if not, dropping the dep removes ~90 KB from every page. (The admin media-picker inline script in `cns-admin.php` legitimately uses jQuery — that one's fine, it's admin-only.)

### 9. Style.css header
- `Requires PHP: 8.4` is almost certainly unintended (nothing in the code needs >8.0, and it blocks installs on 8.1–8.3 hosts). Match the plugins: 8.0.
- Add `Requires at least: 6.8` / `Tested up to:`; bump `Version` on releases (still 1.0); dedupe the repeated `maps` tag.

### 10. Missing FSE templates
`templates/` has only `index`, `single`, `page`, `front-page`, `page-profile`. Add at minimum `404.html`, `search.html`, and `archive.html` — right now all of those fall through to `index.html`, which is a generic query loop and a poor 404/search experience for a content-heavy wiki site.

### 11. Split the giant block edit files
`cns-sidebar/edit.tsx` (643 lines) and `cns-hero/edit.tsx` (642 lines) each hold inspector panels + item management + preview in one component. Extract per-concern components (`SidebarItemEditor`, `HeroSettingsPanel`, …) under each block's folder; share the preset-color-resolution helper (currently re-implemented in render.php and edit.tsx) via `src/shared/`.

### 12. Tooling
Same gap as the plugins: no PHPCS, no CI, no tests. The theme is the git root here — a single GitHub Action running `npm run build`, `npm run typecheck`, and PHPCS over theme + plugins would catch most of the P0 class of issue automatically. `theme-check` plugin is already installed locally; run it and clear its warnings before any directory submission.

---

## P2 — Performance

- **Version-stamped assets** (#7) is the main one — cache busting currently doesn't exist for the static CSS.
- **Toast everywhere**: `cns_enqueue_toast()` loads on every admin **and** frontend page. Frontend usage is likely limited to specific interactions (likes/search UI); consider enqueuing only when a dependent script is present (`wp_script_add_data` deps already handle admin plugin pages, which declare `cns-toast` as a dependency — the unconditional enqueue can then be admin-only or dropped).
- **`wp_localize_script` nonce on every page**: fine, but the localized `root_url` duplicates what `wp-api-fetch` provides; if the frontend JS migrates to `@wordpress/api-fetch`, both localizations collapse.
- Audit `front-page.html`/`hero` images for `fetchpriority="high"`/preload — the hero is the LCP element on the landing page.

---

## P3 — Features

- **Profile page** (`page-profile` + `cns_profile_page_id`) exists as a preset but the settings tab exposes only the ID field; surface "recreate page" and link to it from the admin tab.
- **Like system**: if likes return (P0 #3), make them generic (`wiki`, `cns_story` post types), with a proper REST controller and per-post counts — pairs naturally with the wiki archive ("most liked articles").
- **Search UX**: the custom `all/v1/search` route powers a JS overlay; add grouped headings per CPT with the labels from `get_post_type_object`, and respect the `search_post_types` setting in the UI (it's already respected server-side).
- **Dark/light scheme**: the SCSS variable structure (`variables/_colors.scss`) is close to token-ready; exposing the palette through `theme.json` `settings.color.palette` would give users the site editor color tools for free.
- **Pattern library**: `patterns/` has only `hero` and `header`; wiki-article and story-landing patterns would showcase the plugin blocks and speed up onboarding for new installs.

---

## Ecosystem note (theme + 3 plugins)

The integration seams are already good: `cns_admin_tabs` for admin UI, the `cns-toast` registered handle, `cns_map_editor_extensions`. Two suggestions to keep the tandem clean as it grows:

1. **Write the contract down** — a short `INTEGRATION.md` in the theme listing: the filter signatures, the `cns-toast` handle, the expectation that plugins check `get_template() === 'clouds-and-spaceships'`, and the shared text-domain/prefix conventions.
2. **Shared frontend utilities** — the infobox drawer + `escHtml` are now copy-pasted in two plugins; the theme (or a tiny `cns-core` mu-plugin) could register a `cns-drawer` script the way it registers `cns-toast`, and both suites depend on it.

---

## Suggested order of work

1. P0 #1–#4 (escaping, AJAX guard, legacy route removal, search cleanup) — one sitting.
2. Dead-file purge + naming sweep (#5, #6).
3. CSS consolidation with versioning (#7) and header fixes (#9).
4. Missing templates (#10) — quick, user-visible.
5. CI + PHPCS across the repo (#12), then features.
