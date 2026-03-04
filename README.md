# Stalcraft:X Materials Calculator

A small single-page app for quick material calculations and message templates while playing [Stalcraft](https://stalcraft.net/). Built with React, TypeScript, Vite, and Tailwind CSS.

**[Live demo](https://falxns.github.io/sc-calculator-app/)**

---

## Features

### Materials calculator

- **Multiple items** — Preset list of in-game materials (Slastena, Solevik, Kub, Limonnik, Spirten, Myatnoplod) with default prices.
- **Per-row inputs** — Price and quantity for each item; subtotal per row.
- **Global total** — Sum of all (price × quantity) at the bottom.
- **Reset** — Clear quantity for a single row or reset all quantities at once.
- **Persistence** — Calculator state (prices and quantities) saved in `localStorage`.

### Message builder

- **Add messages** — Create multiple text blocks for quick copy-paste (e.g. trade messages).
- **Edit & copy** — Edit any message and copy to clipboard with one click.
- **Delete** — Remove a message with a confirmation modal (Escape to cancel).
- **Persistence** — Messages saved in `localStorage`.

### UI & UX

- **Glassmorphism** — Frosted glass-style panels and inputs.
- **Responsive** — Layout adapts to mobile and desktop.
- **Toasts** — Feedback for copy and delete actions.
- **Error boundary** — Fallback screen if something goes wrong, with "Try again".
- **Accessibility** — Labels, ARIA, keyboard support (Escape closes modal).

---

## Tech stack

- **React 19** + **TypeScript**
- **Vite 7**
- **Tailwind CSS 3**
- **localStorage** for state persistence (no backend)

---

## Getting started

### Prerequisites

- Node.js 18+
- npm (or yarn / pnpm)

### Install

    git clone https://github.com/Falxns/sc-calculator-app.git
    cd sc-calculator-app
    npm install

### Development

    npm run dev

Open [http://localhost:5173](http://localhost:5173).

### Build

    npm run build

Output is in `dist/`.

### Preview production build

    npm run preview

---

## Project structure

    src/
    ├── components/
    │   ├── CalculatorRow/     # Single calculator row (price, quantity, subtotal, reset)
    │   ├── ConfirmModal/      # Reusable confirmation dialog (e.g. delete message)
    │   ├── ErrorBoundary/     # Catches render errors and shows fallback UI
    │   ├── Header/            # App title and logo
    │   ├── MessageBuilder/    # Message list, add, toast, delete modal
    │   ├── MessageComponent/  # Single message (textarea, copy, delete)
    │   ├── PriceCalculator/   # Calculator list and global total
    │   └── icons/             # CopyIcon, TrashIcon, ResetIcon, LogoIcon
    ├── hooks/
    │   └── useLocalStorage.ts # Persist state to localStorage
    ├── types/
    │   └── index.ts           # CalculatorState, Message, etc.
    ├── App.tsx
    ├── main.tsx
    └── index.css              # Tailwind + custom component classes
    public/
    └── assets/                # Item icons (PNG) and logo

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
