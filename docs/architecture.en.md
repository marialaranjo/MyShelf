# Architecture — MyShelf

🇵🇹 [Ler em português](architecture.md)

## Technical decisions

### Why plain HTML (no framework)?

- **Zero dependencies** — opens in any browser, no `npm install`
- **Portability** — one file = the whole application
- **Deploy simplicity** — Vercel, GitHub Pages, NAS, USB stick — all of it works
- **Local-first** — data stays on the user's device

### Internal structure of `index.html`

```
index.html
├── <head>
│   ├── Meta tags (viewport, theme-color, description)
│   ├── Google Fonts (Instrument Serif + DM Sans)
│   └── SheetJS CDN (for Excel export)
│
├── <style>
│   ├── CSS custom properties (:root — light palette)
│   ├── [data-theme="dark"] — forced dark variables
│   ├── [data-theme="light"] — forced light variables
│   ├── @media (prefers-color-scheme: dark) — automatic fallback
│   └── Components: nav, cards, modals, accordion, scan, etc.
│
├── <body>
│   ├── .top-bar (sticky)
│   ├── .content
│   │   ├── #page-catalog
│   │   ├── #page-dashboard
│   │   ├── #page-scan ("Add" page)
│   │   ├── #page-libraries
│   │   ├── #page-wishlist
│   │   └── #page-lent
│   ├── .fab (floating action button)
│   ├── .bottom-nav
│   └── Modals (overlay + modal)
│
└── <script>
    ├── DB — abstraction over localStorage
    ├── i18n — T() system with PT/EN STRINGS
    ├── Theme — applyTheme() + toggleTheme()
    ├── Navigation — showPage()
    ├── ISBN Lookup — fetchTimeout() + lookupISBN()
    ├── Catalog — renderCatalog()
    ├── Dashboard — renderDashboard() + setGoal()
    ├── Scanner — initScan() + procScan()
    ├── Manual entry — setManualTab() + doManualTextSearch()
    ├── Libraries — renderLibs()
    ├── Wishlist — renderWish()
    ├── Loans — renderLent()
    ├── Excel — exportExcel() + runExcelImport()
    └── JSON — btn-json-save + btn-json-load
```

### Data flow

```
User
    ↓
Action (click, scan, form submit)
    ↓
JS function (e.g. DB.addBook)
    ↓
localStorage (local persistence)
    ↓
Render (e.g. renderCatalog)
    ↓
DOM updated
```

### External APIs

| API | URL | Use | Rate limit |
|-----|-----|-----|-----------|
| Open Library | `openlibrary.org/api/books` | ISBN lookup | No documented limit |
| Google Books | `googleapis.com/books/v1/volumes` | ISBN fallback + text search | 1000 req/day (no key) |

Both have an 8-second timeout via `AbortController`.

### Theme system

Three states, controlled by the `data-theme` attribute on `<html>`:

| State | `data-theme` | Source of CSS variables |
|--------|-------------|------------------------|
| Automatic | absent | `@media (prefers-color-scheme)` |
| Forced light | `"light"` | `[data-theme="light"] { ... }` |
| Forced dark | `"dark"` | `[data-theme="dark"] { ... }` |

Preference stored in `localStorage('bib_theme')`.

### Accessibility

- WCAG 2.1 AA
- `role="dialog"` + `aria-modal="true"` on every modal
- `aria-live="polite"` on toasts
- `aria-current="page"` in navigation
- Keyboard navigation in the scan zone and star picker
- Labels with `for=` tied to their inputs
