# Arquitectura — MyShelf

🇬🇧 [Read this in English](architecture.en.md)

## Decisões técnicas

### Por que HTML puro (sem framework)?

- **Zero dependências** — abre em qualquer browser, sem `npm install`
- **Portabilidade** — um ficheiro = a aplicação completa
- **Simplicidade de deploy** — Vercel, GitHub Pages, NAS, pen USB — tudo funciona
- **Local-first** — os dados ficam no dispositivo do utilizador

### Estrutura interna do `index.html`

```
index.html
├── <head>
│   ├── Meta tags (viewport, theme-color, description)
│   ├── Google Fonts (Instrument Serif + DM Sans)
│   └── SheetJS CDN (para exportação Excel)
│
├── <style>
│   ├── CSS custom properties (:root — paleta light)
│   ├── [data-theme="dark"] — variáveis dark forçadas
│   ├── [data-theme="light"] — variáveis light forçadas
│   ├── @media (prefers-color-scheme: dark) — fallback automático
│   └── Componentes: nav, cards, modais, accordion, scan, etc.
│
├── <body>
│   ├── .top-bar (sticky)
│   ├── .content
│   │   ├── #page-catalog
│   │   ├── #page-dashboard
│   │   ├── #page-scan (página "Adicionar")
│   │   ├── #page-libraries
│   │   ├── #page-wishlist
│   │   └── #page-lent
│   ├── .fab (floating action button)
│   ├── .bottom-nav
│   └── Modais (overlay + modal)
│
└── <script>
    ├── DB — abstracção sobre localStorage
    ├── i18n — sistema T() com STRINGS PT/EN
    ├── Tema — applyTheme() + toggleTheme()
    ├── Navegação — showPage()
    ├── ISBN Lookup — fetchTimeout() + lookupISBN()
    ├── Catálogo — renderCatalog()
    ├── Dashboard — renderDashboard() + setGoal()
    ├── Scanner — initScan() + procScan()
    ├── Manual — setManualTab() + doManualTextSearch()
    ├── Bibliotecas — renderLibs()
    ├── Wishlist — renderWish()
    ├── Empréstimos — renderLent()
    ├── Excel — exportExcel() + runExcelImport()
    └── JSON — btn-json-save + btn-json-load
```

### Fluxo de dados

```
Utilizador
    ↓
Acção (click, scan, form submit)
    ↓
Função JS (ex: DB.addBook)
    ↓
localStorage (persistência local)
    ↓
Render (ex: renderCatalog)
    ↓
DOM actualizado
```

### APIs externas

| API | URL | Uso | Rate limit |
|-----|-----|-----|-----------|
| Open Library | `openlibrary.org/api/books` | Lookup ISBN | Sem limite documentado |
| Google Books | `googleapis.com/books/v1/volumes` | Fallback ISBN + pesquisa por texto | 1000 req/dia (sem chave) |

Ambas com timeout de 8 segundos via `AbortController`.

### Sistema de temas

Três estados, controlados pelo atributo `data-theme` no `<html>`:

| Estado | `data-theme` | Fonte das variáveis CSS |
|--------|-------------|------------------------|
| Automático | ausente | `@media (prefers-color-scheme)` |
| Claro forçado | `"light"` | `[data-theme="light"] { ... }` |
| Escuro forçado | `"dark"` | `[data-theme="dark"] { ... }` |

Preferência guardada em `localStorage('bib_theme')`.

### Acessibilidade

- WCAG 2.1 AA
- `role="dialog"` + `aria-modal="true"` em todos os modais
- `aria-live="polite"` nos toasts
- `aria-current="page"` na navegação
- Navegação por teclado no scan zone e stars picker
- Labels com `for=` associados aos inputs
