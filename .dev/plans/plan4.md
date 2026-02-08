# Plan 4: Custom Audio Player with Frequency Visualization

- **Date**: 2026-02-07
- **Status**: done

## Summary

Replaced the native `<audio>` element on episode detail pages with a custom React audio player featuring animated frequency bars, transport controls, seeking, keyboard shortcuts, and a native player fallback toggle.

## Changes Implemented

### 1. AudioPlayer React component — done
- New `src/components/AudioPlayer.tsx` (~220 lines of component code)
- Web Audio API `AnalyserNode` for real-time frequency visualization on `<canvas>`
- 40 vertical bars with rounded tops, blue-500 (light) / blue-400 (dark)
- CORS fallback: detects zero-data for 60+ frames, switches to synthetic sine-wave visualization
- If `crossOrigin` blocks loading entirely, retries without it and uses synthetic viz
- `preload="none"` — no download until play is clicked
- `ResizeObserver` keeps canvas crisp on retina displays

### 2. Transport controls — done
- Rewind 15s, play/pause (with loading spinner during buffering), forward 15s
- Monospace time display (`current / total`)
- Download link with file size
- All inline SVG icons, no icon library dependency

### 3. Canvas seeking — done
- Click/tap anywhere on the canvas to seek to that position
- Thin blue progress bar along bottom edge of canvas
- Touch events for mobile support

### 4. Keyboard shortcuts — done
- `Space` / `k`: toggle play/pause
- `ArrowLeft` / `ArrowRight`: skip ±5s
- `j` / `l`: skip ±15s
- Player wrapper has `tabIndex={0}` and `focus-visible:ring-2`

### 5. Dark mode — done
- Tailwind `dark:` classes on all DOM elements (stone neutrals)
- Canvas bar colors via `matchMedia("(prefers-color-scheme: dark)")` with live `change` listener

### 6. Native player fallback — done
- Gear icon button in controls row toggles `localStorage` key `nexus.player`
- When set to `"native"`, renders the original browser-default `<audio>` element
- Gear icon also present on the native player to switch back
- Persists across page loads

### 7. Accessibility — done
- Container: `role="region"` + `aria-label="Audio player for {title}"`
- Play/pause: `aria-label` toggles with state
- Skip buttons: descriptive `aria-label`s
- Canvas: `aria-hidden="true"` (decorative)
- All buttons keyboard-focusable with `focus-visible:ring-2`

### 8. Edge cases — done
- Null `duration` and `fileSize` handled gracefully
- Error state shows "Episode audio unavailable"
- Seek resets CORS zero-frame counter (prevents false synthetic fallback trigger)
- AudioContext created only on first user click (autoplay policy)
- Cleanup on unmount: closes AudioContext, cancels rAF, disconnects nodes

### 9. Vite React dev server fix — done
- Added `optimizeDeps.include` for React CJS→ESM pre-bundling in `astro.config.mjs`
- Fixes `jsxDEV is not a function` error in dev mode with React 19

## Files Changed

| File | Change |
|---|---|
| `src/components/AudioPlayer.tsx` | New — React audio player component |
| `src/pages/episodes/[slug].astro` | Replaced native `<audio>` with `<AudioPlayer client:visible />` |
| `astro.config.mjs` | Trailing comma fix (linter) |

## Build Result

- 1545 pages built in ~7s
- Zero errors
