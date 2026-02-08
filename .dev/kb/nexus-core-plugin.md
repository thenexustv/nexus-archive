# Nexus Core WordPress Plugin Analysis

Plugin version 1.0.14. Provides the data model and admin UI for thenexus.tv.

## Custom Post Types

### Episode (`episode`)
- Supports: title, editor (content), excerpt, thumbnail (featured image), revisions
- Taxonomies: category (used as "series"), episode_attributes
- Has archive, publicly queryable

### Person (`person`)
- Supports: title, editor (content), excerpt
- No featured image support
- Has archive, publicly queryable

## Taxonomies

### Series (via WordPress categories)
- Not a separate CPT — uses native WordPress categories on episodes
- First category assignment = primary series
- Hierarchical

### Episode Attributes
- Hierarchical taxonomy on episodes
- Special "hidden" attribute hides episodes from non-logged-in users

## Meta Fields

### Episode Meta
| Key | Type | Purpose |
|-----|------|---------|
| `nexus-episode-number` | string | Episode number (extracted from slug) |
| `nexus-parent-episode` | int (post ID) | Parent episode (for fringe episodes) |
| `nexus-fringe-episode` | int (post ID) | Associated fringe episode |
| `nexus-nsfw-episode` | boolean ('1'/'') | NSFW content flag |
| `nexus-episode-people` | int[] (multiple entries) | Person post IDs — stored as multiple meta rows, not serialized |
| `enclosure` | string | PowerPress podcast enclosure: `{url}\n{file_size}\n{mime_type}\n{serialized_extra}` |

### Person Meta
| Key | Type | Purpose |
|-----|------|---------|
| `nexus-people-email` | string | Email (used for Gravatar) |
| `nexus-people-host` | boolean ('1'/'0') | Is this person a host? |
| `nexus-people-twitter-url` | string | Twitter profile URL |
| `nexus-people-googleplus-url` | string | Google+ profile URL |
| `nexus-people-website-url` | string | Personal website URL |

### Series Options
- `nexus_core_series_{term_id}` in wp_options with `retired` boolean flag

## URL Patterns

| Content | URL Pattern |
|---------|-------------|
| Episode | `/episode/{post-name}/` |
| Series | `/category/{category-slug}/` |
| Person | `/person/{post-name}/` |
| Hosts list | `/person/hosts/` |
| Guests list | `/person/guests/` |

## Relationships

### Episode → Series
- Via WordPress category assignment
- First assigned category = primary series
- Accessed via `Nexus_Episode::get_series()` → returns `Nexus_Series`

### Episode → People
- Many-to-many via multiple `nexus-episode-people` post meta entries
- `Nexus_Episode::get_people()` returns categorized array:
  - `hosts` — people flagged as hosts
  - `primary` — people with email, not hosts
  - `secondary` — people without email

### Episode → Fringe/Parent
- Bidirectional: `nexus-fringe-episode` on main episode, `nexus-parent-episode` on fringe
- Direct post ID references in post meta

## Model API

### Nexus_Episode
```
factory($object)                    → Episode from WP_Post, ID, or current query
get_title() / get_formatted_title() → "SERIES #NUMBER: Title"
get_episode_number()                → string
get_series()                        → Nexus_Series
get_enclosure($type = 'podcast')    → {url, size, mime, duration}
get_people()                        → {hosts[], primary[], secondary[]}
get_albumart($settings)             → via get-the-image vendor
is_fringe() / is_parent()           → boolean
has_fringe() / has_parent()         → boolean
get_fringe() / get_parent()         → Nexus_Episode
is_new($tolerance = 7)              → true if posted within N days
is_nsfw()                           → boolean
```

### Nexus_Person
```
factory($object)     → Person from WP_Post, ID, or current query
get_name()           → string
get_email()          → string
get_twitter_url()    → string
get_twitter_handle() → extracted from URL
get_website_url()    → string
get_permalink()      → string
get_content()        → string (bio)
```

### Nexus_Series
```
factory($object)                → Series from episode WP_Post, ID, or query
get_name() / get_slug()         → string
get_description()               → string
get_permalink()                 → string
get_feed_permalink()            → string
is_retired()                    → boolean
get_itunes_subscription_url()   → string (from PowerPress)
```

### Nexus_Utility
```
human_list($array)           → "a, b and c"
human_duration($length)      → "1 hour 23 minutes"
human_filesize($size)        → "42.5 MB"
human_time_difference($from) → "5 minutes ago"
```

## Feed/RSS

- Depends on PowerPress plugin for podcast feed generation
- Custom `Nexus_Feed` class modifies feed behavior:
  - 60-minute feed delay for non-logged-in users (±10min random)
  - `?instant` bypasses delay, `?fringe` includes fringe episodes
  - Feed title uses formatted title: "SERIES #NUMBER: Title"
  - Feed body: excerpt → NSFW warning → content → fringe/parent link → footer
  - NSFW episodes get warning text in feed

## Admin Features

- Episode metabox: parent/fringe episode search (AJAX autocomplete), NSFW checkbox, episode number display
- Episode people metabox: person search autocomplete, dynamic list, duplicate detection
- Person metabox: email, Twitter, Google+, website, is-host checkbox
- Category edit: retired checkbox for series
- Dashboard widgets: Playboard (episode counts per series), Most Recent (latest episodes)
- Strips default WP admin items (posts, links, comments, various dashboard widgets)

## Dependencies
- PowerPress plugin (required for podcast enclosures and feeds)
- Coprime theme (checked at install)
- Vendor libs: get-the-image, loop-pagination
