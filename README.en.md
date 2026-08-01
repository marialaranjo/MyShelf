<div align="center">

# 📚 MyShelf

🇵🇹 [Ler em português](README.md)

**A place for your collection, across three libraries.**

[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![PocketBase](https://img.shields.io/badge/PocketBase-Backend-B8DBE4?logo=pocketbase)](https://pocketbase.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

*Your books, wherever you want them.*

</div>

---

## About the project

**MyShelf** is an app for managing your personal book collection — a cover-grid catalog, automatic ISBN lookup, a wishlist, loan tracking, and a reading dashboard. It comes in **two ways to run it**, in the same repository:

| | [`standalone/`](standalone/) | [`self-hosted/`](self-hosted/) |
|---|---|---|
| **What it is** | Single file, runs in the browser | Full Docker stack (PocketBase + Nginx + BiblioReads) |
| **Install** | None — just open `index.html` | `docker compose up -d` |
| **Data** | `localStorage`, local to the device | Its own database, multi-device |
| **Google login / sharing** | No | Yes |
| **Best for** | Trying it out, single-device use | Real use, multiple devices/people |

You can use just one, or both — they're not the same installation, but they share the same data model and the same philosophy (vanilla HTML/JS, no frameworks, your data stays under your control).

## Features

| Feature | Description |
|---|---|
| **Catalog** | Cover grid with filters by library, status, language, and subject |
| **Adding books** | USB scanner, Bluetooth, manual ISBN, or title/author search |
| **ISBN lookup** | Auto-fill via Open Library + Google Books |
| **Dashboard** | Stats, yearly reading goal, books-per-month chart |
| **Wishlist** | List of books to acquire, with a direct link to a bookstore |
| **Loans** | Track who has each book and since when |
| **Excel** | Export/import your collection as `.xlsx` |
| **JSON backup** | Export/import data between devices |
| **Languages** | Portuguese 🇵🇹 and English 🇬🇧 |
| **Themes** | Light ☀️, Dark 🌙, Automatic |

---

## Repository structure

```
myshelf/
├── README.md / README.en.md
├── CHANGELOG.md                 ← history of changes (Portuguese only)
├── LICENSE
├── docs/                        ← docs shared by both versions
│   ├── architecture.md / architecture.en.md
│   └── api-isbn.md / api-isbn.en.md
│
├── standalone/                  ← zero-install version
│   ├── index.html                 the whole app (single file)
│   ├── self-hosting.md / self-hosting.en.md   optional: Docker + Cloudflare Tunnel
│   └── scripts/validate.js        validates the embedded JS syntax
│
└── self-hosted/                 ← full Docker version (PocketBase + Nginx)
    ├── docker-compose.yml
    ├── .env.example
    ├── frontend/                   index.html + styles.css
    ├── nginx/                      reverse proxy, security headers, API proxies
    ├── pocketbase/                 Dockerfile + migrations
    └── scripts/validate.js
```

See [`docs/architecture.en.md`](docs/architecture.en.md) for technical decisions and [`docs/api-isbn.en.md`](docs/api-isbn.en.md) for the ISBN APIs used by both versions.

> **A note on language:** this README and the `docs/` files have English versions. `CHANGELOG.md` is Portuguese-only for now (it's a historical log), and the self-hosted setup's UI/config comments are also in Portuguese in places — translate as needed if that matters for your fork.

---

## 🗂️ Standalone — quick start

```bash
git clone https://github.com/marialaranjo/myshelf.git
cd myshelf/standalone
open index.html        # macOS
xdg-open index.html    # Linux
start index.html       # Windows
```

No dependencies, no account, no server. Data lives in `localStorage`; nothing leaves your device except calls to the public ISBN APIs. See [`standalone/self-hosting.en.md`](standalone/self-hosting.en.md) if you want to put this version behind your own domain (Docker + Cloudflare Tunnel, no backend).

---

## 🐳 Self-hosted — full guide

### Architecture

```
Internet
   │  HTTPS (Cloudflare Tunnel — required for OAuth)
   ▼
┌──────────────────────────────────────────────────────────────┐
│                        myshelf_net                            │
│                        172.40.0.0/24                          │
│                                                                │
│  172.40.0.3   ┌──────────────────────────────────────────┐   │
│  ──────────── │               Nginx  :80                  │   │
│               │  • Serves the frontend (index.html)       │   │
│               │  • Reverse proxy to PocketBase (/api/)    │   │
│               │  • Google Books proxy (/api/google-books) │   │
│               │  • PORBASE proxy (/api/porbase)           │   │
│               │  • BiblioReads proxy (/api/goodreads)     │   │
│               │  • Injects GOOGLE_BOOKS_KEY via envsubst  │   │
│               │  • Security headers (HSTS, CSP, CORS)     │   │
│               └──────────────────────────────────────────┘   │
│                              │                                │
│              ┌───────────────┼───────────────┐                │
│              ▼               ▼               ▼                │
│  172.40.0.2  ┌───────────┐  172.40.0.4  ┌───────────────┐    │
│  ──────────  │ PocketBase│  ──────────  │  BiblioReads  │    │
│              │   :8090   │              │     :3000     │    │
│              │ API+Auth  │              │  Goodreads/OL │    │
│              └───────────┘              └───────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

> **No container exposes ports externally.** The only entry point is the Cloudflare Tunnel, which points at Nginx (`http://172.40.0.3:80`) on the internal Docker network.

| Service | Image | Role |
|---|---|---|
| `myshelf_pb` | `ghcr.io/marialaranjo/myshelf-pocketbase` | Database, REST API, and OAuth authentication |
| `myshelf_nginx` | `ghcr.io/marialaranjo/myshelf-nginx` | Reverse proxy, static frontend, and API proxies |
| `myshelf_biblioreads` | `nesaku/biblioreads` | Metadata enrichment via OpenLibrary/Goodreads |

### Security

This application went through a security audit (June 2026). The following measures are in place:

**Access control (PocketBase API Rules)** — all collections (`books`, `libraries`, `wishlist`, `loans`) require authentication; writes and deletes are restricted to the record's owner (`owner = @request.auth.id`).

**CORS** — `Access-Control-Allow-Origin` is fixed to your domain; no wildcard.

**Google Books API Key** — never exposed to the frontend; injected into Nginx via `envsubst` from `GOOGLE_BOOKS_KEY`.

**Google OAuth** — full-page redirect (not popup) with PKCE; requires HTTPS via Cloudflare Tunnel.

**HTTP headers** on every response:

| Header | Value |
|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` |
| `Content-Security-Policy` | `default-src 'self'` + explicit origins per directive |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Cross-Origin-Opener-Policy` | `same-origin` |

> **Note:** inline `onclick`/`onerror` handlers were migrated to event delegation (`data-action` + `addEventListener`), which allows removing `'unsafe-inline'` from the CSP's `script-src`.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- A domain with [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/) set up (**required** for Google auth over HTTPS)
- Google OAuth credentials
- A Google Books API Key

### Installation

```bash
git clone https://github.com/marialaranjo/myshelf.git
cd myshelf/self-hosted
cp .env.example .env
```

Edit `.env`:

```env
GOOGLE_BOOKS_KEY=your-key-here
```

> ⚠️ `.env` is in `.gitignore` and should never be committed. The key is injected into Nginx at runtime — it never reaches the frontend.

```bash
docker compose up -d
docker compose ps
docker compose logs nginx --tail=20
```

The app becomes available at the domain configured in your Cloudflare Tunnel.

### Setting up Google OAuth

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Google Auth Platform** and create a *Web Application* OAuth 2.0 client
3. Add **exactly** these URIs (no extra trailing slash, no HTTP variants):
   - **Authorized JavaScript origins:** `https://myshelf.yourdomain.com`
   - **Authorized redirect URIs:** `https://myshelf.yourdomain.com/`
4. Go to the PocketBase admin panel at `https://myshelf.yourdomain.com/_/` → **Settings → Auth providers → Google** and fill in the Client ID and Secret

> **Note:** the correct redirect URI is `/` (the SPA's root) — the frontend computes it automatically via `window.location.origin`, so it works on whatever domain you deploy to, as long as it matches what you register here.

### Google Books API Key

1. In [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services → Credentials**, create/edit an API Key
2. **API restrictions** → limit it to the **Books API** only
3. **Application restrictions** → restrict by **HTTP referrers**: `myshelf.yourdomain.com/*`
4. Put the key in `.env`

> If an older key was ever exposed in source code or Git history, **revoke it and issue a new one**.

### Cloudflare Tunnel

Required — Google auth needs HTTPS, and Nginx runs plain HTTP internally.

1. [one.dash.cloudflare.com](https://one.dash.cloudflare.com) → **Networks → Tunnels**
2. Edit your tunnel → add a **Public Hostname**:
   - **Subdomain:** `myshelf`
   - **Domain:** `yourdomain.com`
   - **Service:** `http://172.40.0.3:80`

> Cloudflare strips the `Cross-Origin-Opener-Policy` header, which rules out OAuth via popup — that's why login uses a full-page redirect.

### Post-install checks

```bash
# Anonymous writes should be rejected
curl -X POST https://myshelf.yourdomain.com/api/collections/books/records \
  -H "Content-Type: application/json" -d '{"title":"test"}'
# → Expected: 401 Unauthorized

# CORS should not have a wildcard
curl -I https://myshelf.yourdomain.com/api/collections/books/records
# → Expected: Access-Control-Allow-Origin: https://myshelf.yourdomain.com

# Security headers present
curl -I https://myshelf.yourdomain.com
# → Expected: Strict-Transport-Security, Content-Security-Policy, X-Frame-Options

# Google Books Key doesn't appear in the page source
curl -s https://myshelf.yourdomain.com | grep -i "AIzaSy"
# → Expected: no results
```

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) (Portuguese only).

## License

MIT — see [LICENSE](LICENSE).

---

<div align="center">
  Made with ♥ by <a href="https://github.com/marialaranjo">marialaranjo</a>
</div>
