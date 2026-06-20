# STALZONE Materials Calculator

A single-page app for quick material price calculations and copy-paste trade messages while playing [STALZONE](https://stalzone.com/). Built with React, TypeScript, Vite, and Tailwind CSS.

**[Live demo](https://falxns.github.io/sc-calculator-app/)**

---

## Features

### Materials calculator

- **Dynamic materials** — Built-in items plus custom materials (name, default price, optional icon).
- **Calculator profiles** — Save multiple presets (e.g. farming run, crafting batch) and switch between them.
- **Per-row inputs** — Material, price, and quantity; click subtotal to copy.
- **Global total** — Sum of all rows; click to copy (raw number, no formatting).
- **Reset** — Clear quantity on one row or reset all quantities at once.
- **Add/remove rows** — Customize which materials appear in the active profile.

### Message builder

- **Multiple messages** — Text blocks for quick copy-paste (trade ads, whispers, etc.).
- **Row placeholders** — Type `{1}`, `{2}`, or use `{+}` to insert from the active calculator profile.
- **Copy resolves for game chat** — `{1}` → `[MaterialName]price` (brackets highlight items in STALZONE chat). `{total}` → sum from calculator.
- **Edit & copy** — Expand-on-focus textarea; copy outputs resolved text, not raw placeholders.
- **Delete** — Remove a message with confirmation.

### Data & backup

- **localStorage persistence** — Materials, profiles, calculator rows, and messages survive reloads.
- **Full backup export/import** — Download or restore everything as `sc-calculator-backup-YYYY-MM-DD.json` (materials, profiles, messages).
- **Materials-only import** — Older `sc-materials-*.json` files still import materials only.

### UI

- **Side toolbar** (top-right) — Manage materials, export backup, import backup.
- **Profile toolbar** (left of calculator) — Switch, add, or delete profiles.
- **Glassmorphism** dark theme with responsive layout.
- **Toasts**, **error boundary**, keyboard support (Escape closes modals).

---

## Tech stack

- **React 19** + **TypeScript**
- **Vite 7**
- **Tailwind CSS 3**
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
npm run deploy   # build + push to gh-pages branch
```

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
    "messages": [ ... ]
  }
}
```

Importing a full backup **replaces** all local data (confirmation shown). Importing a materials-only file updates materials and remaps calculator rows.

---

## Project structure

```
src/
├── components/
│   ├── CalculatorRow/       # Single calculator row
│   ├── MaterialManager/     # Add/remove materials (modal)
│   ├── MessageBuilder/      # Message list
│   ├── PriceCalculator/     # Calculator + profiles layout
│   ├── ProfileToolbar/      # Profile switcher
│   ├── SideToolbar/         # Materials modal + backup I/O
│   └── icons/
├── hooks/
│   ├── useCalculatorProfiles.ts
│   ├── useMaterials.ts
│   └── useLocalStorage.ts
├── utils/
│   ├── backupIo.ts          # Full backup export/import
│   ├── materialsIo.ts       # Materials-only JSON helpers
│   └── calculatorProfiles.ts
└── constants/
    └── materials.ts         # Default in-game materials
public/assets/               # Material PNG icons
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
