# Gallery JSON Editor

A visual editor for gallery block JSON. Import JSON, rearrange items and modules via drag & drop, edit titles/descriptions, and export the updated JSON — all in the browser.

Built with [Next.js](https://nextjs.org/) (App Router), [Tailwind CSS](https://tailwindcss.com/), and [lucide-react](https://lucide.dev/). Deploys to [Vercel](https://vercel.com/) out of the box.

## Features

- Drag & drop reordering of gallery items
- Drag & drop modules between items
- Inline editing of item names, module titles, and descriptions
- Add, duplicate, and delete items and modules
- Preview mode and JSON export modal
- Sample data loader to get started quickly

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
            "entity": { "entityId": "...", "entityType": "assets" },
            "assetType": "video"
          },
          "loop": true,
          "textBox": {
            "textColor": "#000000",
            "bgColor": "#F6F6F6",
            "title": "Module title",
            "description": "Module description"
          }
        }
      ]
    }
  ]
}
```

## License

MIT
