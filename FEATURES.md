# Clouds and Spaceships — Feature Roadmap

Recommended features and changes for the theme and its companion suites (cns-map-suite, cns-story-suite, cns-wiki-suite). Compiled 2026-07-03 after the full code review; bug/structure work lives in each project's `IMPROVEMENT-PLAN.md` — this file is about what to build next.

**Legend:** 🟢 small (hours) · 🟡 medium (days) · 🔴 large (a week+)

---

## What exists today (quick inventory)

- **Theme**: FSE block theme; custom blocks (hero, banner, sidebar, section/tabs, slideshow, multi-image, fancy-title, header-nav, TOC); CNS admin panel with plugin tab system; login branding; site-wide search endpoint; profile page preset; shared toast system.
- **Wiki**: `wiki` CPT with locked 3-column template, infobox family, wiki-card/wiki-contents grids, archive with Query Loop, settings tab.
- **Maps**: canvas maps with objects, areas, **labels** (new), hierarchy/MasterMaps, icon library with SVG sanitizer, infobox drawer, time field on the data model.
- **Stories**: branching node graph over a map, paths with markers, substories, numbered reading list, shared infobox drawer.

---

## 1. Reader experience (theme)

| # | Feature | Size | Notes |
|---|---------|------|-------|
| 1.1 | **Dark/light color scheme** | 🟡 | The SCSS palette (`variables/_colors.scss`) is nearly token-ready. Move it into `theme.json` `settings.color.palette` + a `prefers-color-scheme`/toggle pair of style variations. Users get site-editor color tools for free; canvas maps already carry their own backgrounds so they're unaffected. |
| 1.2 | **Search overlay UX** | 🟡 | The `all/v1/search` endpoint is hardened and grouped by CPT — build the frontend to match: keyboard-first overlay (`/` to open), grouped headings with CPT labels, thumbnails, and the `search_post_types` setting respected in the UI. |
| 1.3 | **Breadcrumbs block** | 🟢 | Wiki → topic → article, Map → parent map (hierarchy data already exists), Story → substory. One small dynamic block, big orientation win on a deep wiki. |
| 1.4 | **TOC active-section highlight** | 🟢 | `cns-table-of-contents` renders static links; add an IntersectionObserver in a small view script to highlight the current section and smooth-scroll. |
| 1.5 | **Related content footer** | 🟡 | "More from this topic" under wiki articles and substories (shared terms → wiki-card grid). Pairs with 3.1. |
| 1.6 | **Reading progress bar** on single wiki/substory | 🟢 | Cheap polish that suits long-form lore pages. |
| 1.7 | **Pattern library** | 🟡 | Only `hero` and `header` patterns exist. Add: wiki landing page, story landing, map showcase, character/location article starters. Patterns are the cheapest onboarding tool for new installs. |

## 2. Community & accounts (theme)

| # | Feature | Size | Notes |
|---|---------|------|-------|
| 2.1 | **Profile page buildout** | 🔴 | `page-profile` + subscriber redirect exist but the page is a shell. Show the member's liked/bookmarked articles, recently read stories, display name management. Prerequisite: 2.2. |
| 2.2 | **Likes/bookmarks, rebuilt properly** | 🟡 | The old like system was removed (broken legacy). Rebuild as a proper REST controller: generic across `wiki`/`cns_story`/`post`, nonce-verified `permission_callback`, per-post counts, optimistic UI + toast. Feeds "most liked" sorting in wiki-contents and archive. |
| 2.3 | **Contribution surface** | 🔴 | If the platform is meant for communities: front-end suggestion form ("report an error / suggest an edit") creating pending comments or drafts, so subscribers never need wp-admin (they're redirected away from it anyway). |

## 3. Wiki suite

| # | Feature | Size | Notes |
|---|---------|------|-------|
| 3.1 | **Wiki taxonomy** (`wiki_topic`) | 🟡 | Stop borrowing post categories; give the wiki its own hierarchy (Characters, Places, Ships, Events…). Archive filter bar + wiki-card badges follow naturally. |
| 3.2 | **Infobox presets** | 🟡 | Reusable field schemas per topic (Character: age/affiliation/ship; Location: region/population…). Builds on the existing infobox-row block; store presets in the settings option; "Apply preset" in the infobox toolbar. |
| 3.3 | **Wikilinks** | 🔴 | The defining wiki feature: a rich-text format button with `[[` autocomplete over wiki posts, plus a "What links here" panel (query post content for permalinks, cache in meta). Highest long-term value in this whole list. |
| 3.4 | **Article metadata footer** | 🟢 | Last updated + contributor avatars from revision history. Free data, adds credibility. |
| 3.5 | **Archive filter bar** | 🟡 | Term filter + sort (newest/A–Z/most liked) on the wiki archive; can be plain GET params over the existing Query Loop. |

## 4. Map suite

| # | Feature | Size | Notes |
|---|---------|------|-------|
| 4.1 | **Time slider** | 🟡 | `object_time` exists on maps, objects, and areas but the frontend ignores it. A range slider filtering visible objects/areas/labels by year makes "the world at time X" a headline feature. Consider adding `object_time` to labels for parity. |
| 4.2 | **Hover feedback** | 🟢 | Clickable objects/areas give no hover cue (hierarchy regions do). Redraw-on-hover highlight + cursor switch using the existing `isPointInPath` hit tests. |
| 4.3 | **Zoom & pan** | 🔴 | Wheel/pinch zoom + drag on frontend maps; most valuable on MasterMaps. Do together with the DPR work (see §7) since both restructure the render loop. |
| 4.4 | **Keyboard & screen-reader access** | 🟡 | Visually-hidden list of objects/areas/regions/labels as focusable buttons driving the same drawer/navigation; focus trap in the drawer. |
| 4.5 | **Map duplication** | 🟢 | "Duplicate" row action: copy post + meta + objects/areas/labels/hierarchy rows. Enables versioned maps (same region, different eras) cheaply. |
| 4.6 | **Import/export (JSON)** | 🟡 | Whole-map backup/transfer including all tables. Natural admin action next to Duplicate. |
| 4.7 | **Label niceties** | 🟢 | Follow-ups to the new Labels tab: per-label show/hide toggle, optional `object_time`, and drag-to-move offsets on the editor canvas. |

## 5. Story suite

| # | Feature | Size | Notes |
|---|---------|------|-------|
| 5.1 | **Prev/next reader navigation** | 🟢 | Buttons + arrow keys following edge `sort_order` from the active node — the branch-priority data already exists. Single biggest UX gap in the reader. |
| 5.2 | **Branch choice UI** | 🟡 | At a fork, present outgoing edges as explicit "choose your path" cards (title + excerpt of the target substory) instead of the flat numbered list. |
| 5.3 | **Progress persistence** | 🟢 | Remember last active node per story in `localStorage`; "Continue reading" state on return. |
| 5.4 | **Inline substory reading** | 🟡 | Open substory content in the shared drawer (server-side via `cns_map_suite_infobox_content`) so readers stay on the map. |
| 5.5 | **Animated path reveal** | 🟢 | Draw edges progressively up to the active node — easy now that redraws are event-driven. |
| 5.6 | **Story archive block** | 🟢 | Grid of published stories (thumbnail/title/excerpt); today stories are only reachable via direct URL or menus. |

## 6. Platform & integration

| # | Feature | Size | Notes |
|---|---------|------|-------|
| 6.1 | **`INTEGRATION.md` contract** | 🟢 | Document the seams the suites rely on: `cns_admin_tabs`, `cns-toast` handle, `cns_map_editor_extensions`, `cns_map_suite_get_map_data()`, text-domain/prefix conventions. Cheap insurance while the ecosystem grows. |
| 6.2 | **Shared `cns-drawer` script** | 🟡 | The infobox drawer + `escHtml` are copy-pasted in map and story view scripts. Register a `cns-drawer` handle the way the theme registers `cns-toast`; both suites depend on it. |
| 6.3 | **Onboarding wizard** | 🔴 | First-run checklist in the CNS admin panel: create first map → first wiki article → link them → first story. The suites are powerful but the happy path is undiscoverable. |
| 6.4 | **Demo content pack** | 🟡 | One-click sample world (map with areas/labels, 3 wiki articles, 1 branching story) — doubles as living documentation and a test fixture. |

## 7. Technical changes (carried over from the improvement plans)

These are the deliberately deferred engineering items; listed here so the roadmap is complete:

- **DPR/retina + resize-aware canvases** (map + story view.js) — 🟡, needs visual browser verification; prerequisite for zoom/pan (4.3).
- **CI**: GitHub Action running `npm run build`, `tsc --noEmit`, PHPCS across theme + plugins — 🟢 and the highest leverage guardrail here.
- **Split `cns-map-suite/includes/admin/api.php`** (~1,300 lines) into per-resource files — 🟢, mechanical.
- **Story REST arg schemas** (declarative `args` like map-suite) and **JSON-script-tag payload** for the story block — 🟡.
- **Split the 640-line `cns-sidebar`/`cns-hero` edit.tsx** files into per-concern components — 🟡.
- **Fold static CSS** (`assets/css/*.css`) into the SCSS build so there's one compiled stylesheet — 🟡.

---

## Suggested order

1. **Quick wins sweep** (a day or two): 5.1, 5.3, 4.2, 1.4, 3.4, 5.6, 6.1, CI.
2. **Wiki identity**: 3.1 taxonomy → 3.5 filter bar → 1.5 related content.
3. **Reader flagships**: 4.1 time slider, 5.2 branch UI, 5.4 inline reading.
4. **Community**: 2.2 likes → 2.1 profile.
5. **Big rocks** when ready: 3.3 wikilinks, 4.3 zoom/pan (+DPR), 6.3 onboarding.
