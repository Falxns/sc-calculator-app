# STALZONE Materials Calculator

A single-page app for quick material price calculations and copy-paste trade messages while playing [STALZONE](https://stalzone.com/). Built with React, TypeScript, Vite, and Tailwind CSS.

**[Live demo](https://falxns.github.io/sc-calculator-app/)**

Installable as a **PWA** — use “Install app” in the browser (or the in-app install hint on first visit).

---

## Features

### Materials calculator

- **Dynamic materials** — Built-in items plus custom materials (name, default price, optional icon upload).
- **Calculator profiles** — Multiple presets (farming run, crafting batch, etc.) with rename, duplicate, drag reorder, add, and delete in a manage modal.
- **Profile switcher** — Custom dropdown in the calculator header (auto-width, truncates long names).
- **List / grid view** — Toggle layout; grid shows icon, price, and quantity in compact tiles.
- **Per-row inputs** — Material picker (custom dropdown), price, quantity; click subtotal to copy.
- **Drag reorder** — Reorder calculator rows in both list and grid modes.
- **Global total** — Sum of all rows; click to copy (raw number).
- **Reset** — Clear quantity on one row or reset all quantities at once.

### Message builder

- **Named templates** — Each block has an editable name (defaults: “Buy ad”, “Whisper”, …).
- **Drag reorder** — Reorder message blocks like materials and profiles.
- **Collapse / expand** — Fold templates to save space; preview stays visible when collapsed.
- **Live preview** — Resolved in-game text updates as you type, with placeholder warnings.
- **Copy from preview** — One-click copy of resolved text from the preview panel.
- **Row placeholders** — `{1}`, `{2}`, `{total}`, or insert via `{+}` menu.
- **Copy resolves for game chat** — `{1}` → `[MaterialName]price` (STALZONE chat highlight). `{total}` → calculator sum.

### Data & backup

- **localStorage persistence** — Materials, profiles, calculator rows, messages, locale, and view mode survive reloads.
- **Full backup export/import** — JSON file with materials, profiles, and messages.
- **Import preview** — Shows counts before import; choose **merge** (combine data) or **replace** (overwrite all).
- **Materials-only import** — Older `sc-materials-*.json` files still work.
- **Cyrillic-safe material IDs** — Custom materials get transliterated slugs (e.g. `myakot-slasteny`).

### UI & i18n

- **English / Russian** — Language toggle in the right sidebar; defaults to browser locale on first visit.
- **Side toolbar** — Materials settings, backup export/import, language.
- **Profile settings** — Gear button left of calculator opens profile manage modal.
- **Glassmorphism** dark theme, responsive layout, global toasts.
- **Keyboard** — Escape closes modals and dropdowns.

---

## Tech stack

- **React 19** + **TypeScript**
- **Vite 7** + **vite-plugin-pwa**
- **Tailwind CSS 3**
- **@dnd-kit** — drag-and-drop reordering
- **localStorage** (no backend)

---

## Getting started

### Prerequisites

- Node.js 18+
- npm (or yarn / pnpm)

### Install

```bash
git clone https://github.com/Falxns/sc-calculator-app.git
cd sc-calculator-app
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173/sc-calculator-app/](http://localhost:5173/sc-calculator-app/) (or the URL Vite prints).

### Build & deploy

```bash
npm run build
npm run preview   # test production build + PWA locally
npm run deploy    # build + push to gh-pages branch
```

PWA install prompts require **HTTPS** (GitHub Pages) or localhost via `npm run preview`.

---

## Backup format

Full backup JSON (version 1):

```json
{
  "version": 1,
  "exportedAt": "2026-06-11T12:00:00.000Z",
  "materials": [ ... ],
  "profiles": {
    "activeProfileId": "...",
    "profiles": [ ... ]
  },
  "messages": {
    "messages": [
      { "id": "...", "name": "Buy ad", "content": "..." }
    ]
  }
}
```

**Merge** adds imported materials (by id), appends profiles and messages with unique names. **Replace** overwrites everything.

---

## Project structure

```
src/
├── components/
│   ├── CalculatorRow/         # List view row
│   ├── CalculatorGridTile/    # Grid view tile
│   ├── DropdownMenu/          # Shared dropdown primitive
│   ├── MaterialManager/       # Materials modal (drag reorder, edit)
│   ├── MaterialSelect/        # Material picker dropdown
│   ├── MessageBuilder/        # Message list
│   ├── MessageSortableRow/    # Named template row + preview
│   ├── ProfileManager/        # Profiles modal
│   ├── ProfileSelector/       # Header profile dropdown
│   ├── PriceCalculator/       # Calculator layout
│   ├── SideToolbar/           # Materials + backup + language
│   └── InstallAppBanner/      # PWA install hint
├── context/
│   ├── LocaleContext.tsx
│   └── ToastContext.tsx       # Global toast notifications
├── hooks/
│   ├── useCalculatorProfiles.ts
│   ├── useDropdown.ts
│   └── useLocalStorage.ts
├── i18n/                      # en / ru translations
└── utils/
    ├── backupIo.ts            # Full backup export/import
    ├── backupMerge.ts         # Merge vs replace logic
    ├── messageTemplate.ts     # Placeholder resolution
    └── slugify.ts             # Cyrillic → ASCII material ids
public/
├── assets/                    # Material PNG icons
├── pwa-192.png                # PWA icons
└── pwa-512.png
```

---

## Scripts

| Command           | Description                   |
| ----------------- | ----------------------------- |
| `npm run dev`     | Start dev server              |
| `npm run build`   | Type-check + production build |
| `npm run preview` | Serve `dist/` locally         |
| `npm run deploy`  | Build and push to gh-pages    |
| `npm run lint`    | Run ESLint                    |
| `npm run format`  | Format with Prettier          |

---

## License

MIT
