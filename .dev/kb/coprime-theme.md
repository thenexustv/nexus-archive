# Coprime WordPress Theme Analysis

The presentation layer for thenexus.tv. Uses Foundation 3 grid, SCSS/Compass, and jQuery.

## File Structure

```
coprime/
├── header.php, footer.php             — Shell
├── functions.php                      — Minimal (loads library classes)
├── front-template.php                 — Homepage
├── single-episode.php                 — Episode detail
├── archive-episode.php                — Episode archive/category
├── single-person.php                  — Person profile
├── archive-person.php                 — People directory
├── page.php, page-about.php           — Generic/about pages
├── page-shows.php                     — Series listing
├── search.php, 404.php                — Search/error
├── library/
│   ├── class-coprime.php              — Main theme class (singleton)
│   ├── class-coprime-episode.php      — Episode presentation
│   ├── class-coprime-series.php       — Series presentation
│   └── class-coprime-person.php       — Person presentation
├── partials/
│   ├── identity.php                   — Header logo/nav
│   ├── villain.php                    — Hero carousel item
│   ├── showboard.php                  — Recent episode card
│   ├── episode-people.php             — Hosts/guests sidebar
│   ├── episode-subscribe.php          — Feed subscription links
│   ├── episode-share.php              — Social sharing widgets
│   ├── loop-pagination.php            — Pagination
│   └── footer-area.php                — Footer widget area
├── resources/
│   ├── css/source/                    — SCSS source files
│   ├── js/source/main.js             — jQuery (224 lines)
│   ├── fonts/league-gothic/           — Custom font
│   └── images/                        — Icons, logos, avatars
└── Gruntfile.js, config.rb            — Build tools
```

## Template Hierarchy & Page Layouts

### Homepage (`front-template.php`)

**Villain Section** (hero):
- 1–3 featured episodes from last 14 days
- Full album art as background, semi-transparent overlay
- Classes: `.dictator` (1), `.diarchy` (2), `.triumvirate` (3)
- Shows: title, series name + #number, date, "New" badge

**Showboard Section** (grid):
- Top: 6 most recent main episodes (3-col grid)
- Bottom: 3 most recent Fringe episodes (separated by gradient line)
- Cards: album art, title, series name + #number, date
- Footer: "← All Shows" and "More Episodes →" links

**Queries:**
- `get_villain_query($how_many = 3)` — featured, last 14 days
- `get_showboard_primary_query($exclude_ids)` — 6 recent, excludes villain
- `get_showboard_fringe_query()` — 3 fringe episodes

### Episode Detail (`single-episode.php`)

```
Header:
  Series name (link) + series description
  Album art (floated right on desktop)

Content (16 cols):
  Title (h1)
  #number · date (with relative "X days ago")
  Description box
  Full show notes (HTML content)

Sidebar (8 cols):
  Audio player (WP [audio] shortcode → MediaElementJS)
  Download meta: duration · file size · download link
  People: hosts with avatars, primary guests, secondary guests
  Subscribe: feed link, feed+fringe link, iTunes link
  Share: Facebook/Google+/Twitter (hidden by default, revealed on click)

Footer:
  Previous/Next episode navigation
```

### Episode Archive (`archive-episode.php`)
- Series name + description + subscribe options at top
- Episode list: album art (floated), title, number, date, description
- Pagination

### Person Detail (`single-person.php`)
- Avatar (Gravatar 150px, floated left) + name + social links
- Bio content
- "Episodes with {Name}" — 2-column list, paginated (20/page)

### Person Archive (`archive-person.php`)
- Grid of people cards: avatar (100px), name, bio (140 char truncated)
- Pagination

### Shows Page (`page-shows.php`)
- Grid of series: album art from latest episode, name, description
- Latest episode title with "New" badge
- Subscribe options (feed, feed+fringe, iTunes)

## Design System

### Color Palette
```
Backgrounds:     #000, #111, #222 (dark)  |  #e5e5e5 (content bg)  |  #fff (cards)
Text:            #222 (primary)  |  #555, #666 (secondary)  |  #999 (tertiary)
Links:           #303030, hover #383838
Header/Footer:   #222 bg, #fff/#bbb text
Accent:          #f00 (New badge)
```

### Typography
```
Site title:    League Gothic, 62px desktop / 48px mobile, uppercase, letter-spaced
Headings:      Open Sans, sans-serif, uppercase, letter-spaced
Body:          Open Sans, 13-16px
Display:       Raleway (some headings)
Font imports:  Google Fonts (Open Sans), local (League Gothic)
```

Title length classes: `.regular`, `.long`, `.epic-long` adjust font size.

### Layout
- Foundation 3 grid, 24 columns, 960px max-width, 30px gutters
- Breakpoints: mobile < 768px < tablet < 1024px < desktop
- Mobile-first approach

### Components
- **Cards** (`.box()` mixin): white bg, 2px radius, 12px padding, subtle shadow
- **Album art**: white 5-6px border, box shadow, 2px radius
- **Avatars**: Gravatar with fallback to `unknown-avatar.png`
- **Pagination**: `loop_pagination()` with mid_size=3, end_size=2

### Interactive Patterns
- Share widgets: hidden by default, "Load Sharing →" click to reveal
- Show notes links: automatically open in new tab
- Relative time: `<time>` elements get "X days ago" via JS
- Logo idle animation: rotates after 2.43 minutes of inactivity
- MediaElementJS: custom rail width fix on play

## JavaScript Features (main.js, 224 lines)

| Feature | Implementation |
|---------|---------------|
| Query string parser | Custom `$.parseParams()` |
| Relative time | `human_time_difference()` on `<time span.ago>` elements |
| Slug generation | `to_slug()` for URL-friendly strings |
| Share reveal | Click handler shows hidden social widgets |
| External links | Show notes links get `target="_blank"` |
| Contact form | Auto-populates Contact Form 7 with show/episode from URL params |
| Idle animation | Logo rotation after ~2.5 min idle |
| MEJS fix | Audio player rail width recalculation (commented out) |

## Caching
- Series list query: transient with 12-hour TTL, cleared on episode save
- PowerPress transients for feed data

## Key Observations for Static Conversion

1. **Episode formatted title**: "SERIES #NUMBER: Title" pattern used widely
2. **People categorization**: hosts vs primary (has email) vs secondary (no email)
3. **Fringe episodes**: treated as separate content stream on homepage, have their own feed variant
4. **Retired series**: boolean flag, could be shown differently in static version
5. **Subscribe options**: three variants per series — regular feed, feed+fringe, iTunes
6. **Album art**: via WordPress featured images (get-the-image lib), not in our JSON export yet
7. **NSFW flag**: shown as warning on episode detail and in feed
8. **"New" badge**: episodes within 7 days marked as new (configurable tolerance)
9. **Social sharing**: Facebook, Google+, Twitter — all obsolete embed patterns
10. **Contact form**: CF7 integration with show/episode pre-fill — not needed for static archive
