# PWA Icons for FYP Finder

This folder should contain PNG icons for the PWA. The app uses a 🎓 graduation cap as its logo.

## Quick Generation (Recommended)

### Option 1: Emoji-based Icon (Fastest)

1. Go to [Emoji to Image](https://emojipedia.org/graduation-cap) 
2. Right-click the 512px Apple emoji
3. Save as `icon-512x512.png`
4. Or use [EmojiCDN](https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f393.png)

### Option 2: Custom Design with Canva/Figma

1. Create 512x512 canvas
2. Background: `#111827` (dark gray - matches app)
3. Add 🎓 graduation cap centered
4. Optional: Add "FYP" text
5. Export as PNG

### Option 3: AI Icon Generator

Use [IconKitchen](https://icon.kitchen/):
1. Choose "Clip Art" → search "graduation"
2. Set background: `#111827`
3. Download all sizes automatically

## Generate All Sizes

Once you have a 512x512 base icon:

1. Go to [App Icon Generator](https://www.pwabuilder.com/imageGenerator)
2. Upload your icon
3. Download the package
4. Rename files to match list below

## Required Files

| Filename | Size | Purpose |
|----------|------|---------|
| icon-72x72.png | 72x72 | Android |
| icon-96x96.png | 96x96 | Notification badge |
| icon-128x128.png | 128x128 | Chrome |
| icon-144x144.png | 144x144 | iOS |
| icon-152x152.png | 152x152 | iOS |
| icon-192x192.png | 192x192 | Android/PWA |
| icon-384x384.png | 384x384 | Splash |
| icon-512x512.png | 512x512 | Splash |
| icon-maskable-192x192.png | 192x192 | Android adaptive |
| icon-maskable-512x512.png | 512x512 | Android adaptive |

## Maskable Icons

For maskable icons:
- Keep logo in center 80% (safe zone)
- Solid background `#111827` to edges
- No transparency

Test at [Maskable.app](https://maskable.app/editor)

## Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Dark Background | `#111827` | Icon BG |
| White | `#ffffff` | Foreground |

## Verify

After adding icons:
1. `npm run dev`
2. DevTools → Application → Manifest
3. Check icons load
