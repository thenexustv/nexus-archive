# JSON Export Data Shape

Source: `export/nexus-export-1770519097.json` (5MB)

## Top-Level Structure

| Key | Count | Description |
|-----|-------|-------------|
| `series` | 13 | Podcast series (from WP categories) |
| `episodes` | 1384 | All episodes |
| `episode_relations` | 1005 | Fringe (553) and parent (452) links |
| `episode_medias` | 1381 | Audio files (all mp3) |
| `people` | 92 | Hosts and guests |
| `people_relations` | 3229 | Person-to-episode links with role (host: 2971, guest: 258) |

## Entity Schemas

### Series
```json
{ "id": 1, "name": "At The Nexus", "slug": "atn", "description": "..." }
```
- Slug is pre-generated and unique
- "Uncategorized" (id: 1) has 0 episodes

### Episodes
```json
{
  "id": 1, "name": "Fled Across the Desert", "number": "1",
  "content": "<em>HTML show notes...</em>",
  "description": "Plain text summary",
  "series_id": 2,
  "created_at": "2011-11-13 20:50:05",
  "updated_at": "2012-12-20 02:34:57"
}
```
- `number` is per-series (not globally unique)
- `content` is rich HTML with links, lists, headings
- No slug field — generated as `{series_slug}-{number}` (confirmed no duplicates)

### Episode Relations
```json
{ "type": "fringe", "episode_id": 100, "episode_related_id": 103 }
{ "type": "parent", "episode_id": 103, "episode_related_id": 100 }
```
- `fringe`: main episode → its fringe episode
- `parent`: fringe episode → its main episode
- These are bidirectional pairs

### Episode Medias
```json
{
  "type": "mp3", "episode_id": 1,
  "length": "00:20:20", "size": "19534014",
  "url": "http://s3.amazonaws.com/the-nexus-tv/podcasts/atn/atn1.mp3"
}
```
- All type "mp3"
- URLs point to S3 bucket `the-nexus-tv`
- `length` is HH:MM:SS format
- `size` is bytes as string
- 3 episodes have no media entry

### People
```json
{
  "id": 1, "name": "Ryan Rampersad", "content": "Bio text...",
  "email": "ryan.rampersad@gmail.com",
  "created_at": "2012-11-22 23:24:40",
  "updated_at": "2017-12-12 14:16:03"
}
```
- No slug field — generated from name (confirmed no duplicates)
- `content` is plain text bio (some have HTML)
- Email used for Gravatar in WP theme

### People Relations
```json
{ "role": "host", "person_id": 2, "episode_id": 1 }
```
- Role is "host" or "guest" per-episode

## Series Breakdown

| Slug | Name | Episodes |
|------|------|----------|
| tf | The Fringe | 587 |
| cs | Control Structure | 158 |
| atn | At The Nexus | 146 |
| eb | Eight Bit | 119 |
| so | Second Opinion | 118 |
| ns | Nexus Special | 66 |
| pk | PodKit | 66 |
| ted | The Extra Dimension | 56 |
| ib | In Bootcamp | 27 |
| tu | The Universe | 21 |
| rsj | Robots Will Steal Your Job | 20 |

"Uncategorized" (id: 1) has 0 episodes and is filtered out.

## Data Not in Export

These fields exist in the WP plugin but are absent from the JSON export:
- Album art / featured images
- NSFW flag
- Person social links (Twitter, Google+, website)
- Person host/guest global flag (derived from relations instead)
- Series retired flag
- iTunes subscription URLs
- PowerPress tracking URLs
