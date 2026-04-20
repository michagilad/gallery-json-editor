# Gallery JSON Editor

A visual editor for gallery block JSON. Import JSON, rearrange items and modules via drag & drop, edit titles/descriptions, and export the updated JSON — all in the browser.

Built with [Next.js](https://nextjs.org/) (App Router), [Tailwind CSS](https://tailwindcss.com/), and [lucide-react](https://lucide.dev/). Deploys to [Vercel](https://vercel.com/) out of the box.

## Features

- **Gallery-level settings panel** — edit `textColor`, `backgroundColor`, `showPBE`, `navigation.showBackButton`, `layout.buttonsContainerHeight`, `layout.navButtonsLocation`
- **Item editing** — rename, reorder via drag & drop, and edit the item's `icon` asset ID inline
- **Module editing** — full modal for video `entity.entityId`, `loop`, `textBox` title/description, and `textBox` text / background colors (with color pickers)
- **Drag & drop** reordering of gallery items and movement of modules between items
- **Add / duplicate / delete** items and modules
- **Preview mode** and **JSON export** modal
- **Sample data loader** that matches the current gallery schema
- Unknown/new fields in imported JSON are preserved on export (round-trip safe)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for production

```bash
npm run build
npm start
```

## Deploying to Vercel

The easiest way to deploy is through Vercel:

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Vercel auto-detects Next.js — just click **Deploy**.

Alternatively, deploy from the CLI:

```bash
npm i -g vercel
vercel
```

## Project Structure

```
app/
  globals.css      # Tailwind base styles
  layout.js        # Root layout
  page.js          # Home page – renders the editor
components/
  GalleryEditor.jsx  # Main editor component
```

## Expected JSON Shape

```json
{
  "items": [
    {
      "id": "optional-uuid",
      "itemType": "galleryItemV2",
      "name": "Item Name",
      "modules": [
        {
          "itemType": "videoModule",
          "video": {
            "entity": { "entityType": "assets", "entityId": "..." },
            "assetType": "video"
          },
          "loop": true,
          "textBox": {
            "textColor": "#000000",
            "bgColor": "#F6F6F6",
            "title": "(optional)",
            "description": "(optional)"
          }
        }
      ],
      "icon": {
        "assetType": "image",
        "entity": { "entityType": "assets", "entityId": "..." }
      }
    }
  ],
  "showPBE": false,
  "navigation": { "showBackButton": false },
  "textColor": "Primary",
  "backgroundColor": "Secondary",
  "layout": {
    "buttonsContainerHeight": 57,
    "navButtonsLocation": "nav"
  }
}
```

Notes:

- Module `textBox.title` and `textBox.description` are optional. The editor shows a sensible fallback label in the list and preserves absence on export.
- Item `icon` is optional but supported — the editor displays an inline editor for its `entity.entityId`.
- Any extra top-level or nested keys in your imported JSON that the editor doesn't know about are passed through untouched on export.

## License

MIT
