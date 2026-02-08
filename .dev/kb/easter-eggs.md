# Easter Eggs

Quick reference for all hidden features on the site.

## 1. Episode 404

- **Trigger**: Visit any non-existent URL
- **File**: `src/pages/404.astro`
- **What**: Fake episode detail page — "The Nexus #404: Page Not Found" with humorous copy, fake date (Feb 30, 2014), fake hosts, infinite duration, and a "Transmission Error" notice

## 2. Console Logo

- **Trigger**: Open browser dev tools on any page
- **Files**: `src/layouts/Base.astro` (in the `<script>` block)
- **What**: `console.info` prints an ASCII "NX" logo in brand colors (red `#E53030` / blue `#2BA0E5`) with the message "Looking under the hood? We always loved doing that too."

## 3. Total Listen Time

- **Trigger**: Always visible on homepage stats row
- **Files**: `src/pages/index.astro` (frontmatter for calculation, template for display)
- **What**: Build-time sum of all `episode.media.length` values, displayed as rounded-up hours (e.g. "1,221 hours of audio"). Hover shows days equivalent via `title` attribute. Uses `cursor-help` to hint at the tooltip.

## 4. CRT Mode

- **Trigger**: Append `?crt` to any page URL
- **Files**:
  - `src/layouts/Base.astro` — inline script checks `location.search` for "crt", adds `nx-fringe-mode` class to `<body>`
  - `src/styles/global.css` — all `.nx-fringe-mode` styles: `nx-flicker` and `nx-scanline` keyframes, hue-rotate/saturate filter, scanline overlay (`::after`), CRT vignette (`::before`), chromatic aberration (`text-shadow` on `*`, `drop-shadow` on `img`)
- **What**: VHS/CRT visual effect with scanlines, flicker, chromatic aberration, and vignette. Dark mode has stronger aberration and deeper vignette.
- **Note**: CSS class is `nx-fringe-mode` (historical name) but the query param trigger is `?crt`

## 5. Anniversary Badge

- **Trigger**: Visit the site during November 10-16 (the week around ATN #1's air date, 2011-11-13)
- **Files**: `src/layouts/Base.astro` — hidden `<span id="nx-anniversary">` next to the logo, inline script removes `hidden` class based on date check
- **What**: Party popper emoji and "Est. 2011" appears next to "THE NEXUS" in the header

## Other Hidden Features (pre-existing)

- **Print stylesheet** (`src/styles/global.css`): Printing any page shows "You cannot print podcasts!"
- **Idle logo spin** (`src/layouts/Base.astro`): After ~2.4 minutes of inactivity, the NX logo in the header starts slowly spinning
- **HTML comment ASCII art** (`src/layouts/Base.astro`): Full "THE NEXUS" ASCII art in the `<head>` comment
