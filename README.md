<div align="center">

# 📚 MyShelf

🇬🇧 [Read this in English](README.en.md)

**Um espaço para a tua coleção, em três bibliotecas.**

[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![PocketBase](https://img.shields.io/badge/PocketBase-Backend-B8DBE4?logo=pocketbase)](https://pocketbase.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

*Os teus livros, onde tu quiseres.*

</div>

---

## Sobre o projecto

**MyShelf** é uma aplicação para gerir a tua coleção de livros pessoal — catálogo com capas, lookup automático por ISBN, wishlist, registo de empréstimos e dashboard de leitura. Vem em **duas formas de usar**, no mesmo repositório:

| | [`standalone/`](standalone/) | [`self-hosted/`](self-hosted/) |
|---|---|---|
| **O que é** | Ficheiro único, corre no browser | Stack Docker completa (PocketBase + Nginx + BiblioReads) |
| **Instalação** | Nenhuma — abre o `index.html` | `docker compose up -d` |
| **Dados** | `localStorage`, local ao dispositivo | Base de dados própria, multi-dispositivo |
| **Login Google / partilha** | Não | Sim |
| **Ideal para** | Experimentar, uso num único dispositivo | Uso a sério, vários dispositivos/pessoas |

Podes usar só uma das duas, ou as duas — não são a mesma instalação, mas partilham o mesmo modelo de dados e a mesma filosofia (HTML/JS vanilla, sem frameworks, os teus dados sob o teu controlo).

## Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| **Catálogo** | Grelha de capas com filtros por biblioteca, estado, língua e área |
| **Adicionar livros** | Scanner USB, Bluetooth, ISBN manual ou pesquisa por título/autor |
| **ISBN Lookup** | Preenchimento automático via Open Library + Google Books |
| **Dashboard** | Estatísticas, meta anual de leitura, gráfico de livros por mês |
| **Wishlist** | Lista de livros a adquirir com link directo para livraria |
| **Empréstimos** | Registo de quem tem cada livro e desde quando |
| **Excel** | Exportar e importar colecção em `.xlsx` |
| **Backup JSON** | Exportar/importar dados entre dispositivos |
| **Idiomas** | Português 🇵🇹 e Inglês 🇬🇧 |
| **Temas** | Claro ☀️, Escuro 🌙, Automático |

---

## Estrutura do repositório

```
myshelf/
├── README.md / README.en.md
├── CHANGELOG.md
├── LICENSE
├── docs/                        ← documentação partilhada pelas duas versões
│   ├── architecture.md
│   └── api-isbn.md
│
├── standalone/                  ← versão zero-instalação
│   ├── index.html                 aplicação completa (ficheiro único)
│   ├── self-hosting.md            guia opcional: Docker + Cloudflare Tunnel
│   └── scripts/validate.js        valida a sintaxe do JS embutido
│
└── self-hosted/                 ← versão Docker completa (PocketBase + Nginx)
    ├── docker-compose.yml
    ├── .env.example
    ├── frontend/                   index.html + styles.css
    ├── nginx/                      reverse proxy, headers de segurança, proxies de API
    ├── pocketbase/                 Dockerfile + migrations
    └── scripts/validate.js
```

Ver [`docs/architecture.md`](docs/architecture.md) para as decisões técnicas e [`docs/api-isbn.md`](docs/api-isbn.md) para as APIs de ISBN usadas por ambas as versões.

---

## 🗂️ Standalone — guia rápido

```bash
git clone https://github.com/marialaranjo/myshelf.git
cd myshelf/standalone
open index.html        # macOS
xdg-open index.html    # Linux
start index.html       # Windows
```

Sem dependências, sem conta, sem servidor. Os dados ficam em `localStorage`; nada é enviado para fora excepto as chamadas às APIs públicas de ISBN. Ver [`standalone/self-hosting.md`](standalone/self-hosting.md) se quiseres pôr esta versão atrás de um domínio próprio (Docker + Cloudflare Tunnel, sem backend).

---

## 🐳 Self-hosted — guia completo

### Arquitectura

```
Internet
   │  HTTPS (Cloudflare Tunnel — obrigatório para OAuth)
   ▼
┌──────────────────────────────────────────────────────────────┐
│                        myshelf_net                            │
│                        172.40.0.0/24                          │
│                                                                │
│  172.40.0.3   ┌──────────────────────────────────────────┐   │
│  ──────────── │               Nginx  :80                  │   │
│               │  • Serve o frontend (index.html)          │   │
│               │  • Proxy reverso para PocketBase (/api/)  │   │
│               │  • Proxy Google Books (/api/google-books) │   │
│               │  • Proxy PORBASE (/api/porbase)           │   │
│               │  • Proxy BiblioReads (/api/goodreads)     │   │
│               │  • Injecta GOOGLE_BOOKS_KEY via envsubst  │   │
│               │  • Headers de segurança (HSTS, CSP, CORS) │   │
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

> **Nenhum container expõe portas ao exterior.** O único ponto de entrada é o Cloudflare Tunnel, que aponta para o Nginx (`http://172.40.0.3:80`) na rede interna Docker.

| Serviço | Imagem | Função |
|---|---|---|
| `myshelf_pb` | `ghcr.io/marialaranjo/myshelf-pocketbase` | Base de dados, API REST e autenticação OAuth |
| `myshelf_nginx` | `ghcr.io/marialaranjo/myshelf-nginx` | Reverse proxy, frontend estático e proxies de API |
| `myshelf_biblioreads` | `nesaku/biblioreads` | Enriquecimento de metadados via OpenLibrary/Goodreads |

### Segurança

Esta aplicação foi sujeita a uma auditoria de segurança (Junho 2026). As seguintes medidas estão implementadas:

**Controlo de acesso (PocketBase API Rules)** — todas as coleções (`books`, `libraries`, `wishlist`, `loans`) exigem autenticação; escrita e eliminação restritas ao proprietário do registo (`owner = @request.auth.id`).

**CORS** — `Access-Control-Allow-Origin` fixo no teu domínio; sem wildcard.

**Google Books API Key** — nunca exposta no frontend; injectada no Nginx via `envsubst` a partir de `GOOGLE_BOOKS_KEY`.

**OAuth Google** — redirect full-page (não popup) com PKCE; exige HTTPS via Cloudflare Tunnel.

**Headers HTTP** em todas as respostas:

| Header | Valor |
|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` |
| `Content-Security-Policy` | `default-src 'self'` + origens explícitas por directiva |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Cross-Origin-Opener-Policy` | `same-origin` |

> **Nota:** os handlers `onclick`/`onerror` inline foram migrados para event delegation (`data-action` + `addEventListener`), permitindo remover `'unsafe-inline'` do `script-src` da CSP.

### Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) e [Docker Compose](https://docs.docker.com/compose/install/)
- Um domínio com [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/) configurado (**obrigatório** para autenticação Google via HTTPS)
- Credenciais OAuth do Google
- Uma Google Books API Key

### Instalação

```bash
git clone https://github.com/marialaranjo/myshelf.git
cd myshelf/self-hosted
cp .env.example .env
```

Edita o `.env`:

```env
GOOGLE_BOOKS_KEY=a-tua-chave-aqui
```

> ⚠️ O `.env` está no `.gitignore` e nunca deve ser commitado. A chave é injectada no Nginx em tempo de execução — nunca aparece no frontend.

```bash
docker compose up -d
docker compose ps
docker compose logs nginx --tail=20
```

A aplicação fica disponível no domínio configurado no Cloudflare Tunnel.

### Configuração OAuth com Google

1. Cria um projecto em [Google Cloud Console](https://console.cloud.google.com/)
2. Activa a **Google Auth Platform** e cria um cliente OAuth 2.0 do tipo *Web Application*
3. Adiciona **exactamente** estes URIs (sem trailing slash extra, sem variantes HTTP):
   - **Authorized JavaScript origins:** `https://myshelf.teudominio.com`
   - **Authorized redirect URIs:** `https://myshelf.teudominio.com/`
4. Acede ao painel PocketBase em `https://myshelf.teudominio.com/_/` → **Settings → Auth providers → Google** e preenche o Client ID e Secret

> **Atenção:** o URI de redirecionamento correcto é `/` (a raiz da SPA) — o frontend usa `window.location.origin` para o calcular automaticamente, por isso funciona em qualquer domínio onde fizeres o deploy, desde que corresponda ao que registares aqui.

### Google Books API Key

1. Em [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services → Credentials**, cria/edita uma API Key
2. **API restrictions** → limita à **Books API** apenas
3. **Application restrictions** → restringe por **HTTP referrers**: `myshelf.teudominio.com/*`
4. Coloca a chave no `.env`

> Se uma chave antiga esteve exposta no código-fonte ou histórico Git, deve ser **revogada e substituída**.

### Cloudflare Tunnel

Obrigatório — a autenticação Google exige HTTPS, e o Nginx corre em HTTP simples internamente.

1. [one.dash.cloudflare.com](https://one.dash.cloudflare.com) → **Networks → Tunnels**
2. Edita o teu tunnel → adiciona um **Public Hostname**:
   - **Subdomínio:** `myshelf`
   - **Domínio:** `teudominio.com`
   - **Service:** `http://172.40.0.3:80`

> O Cloudflare retira o header `Cross-Origin-Opener-Policy`, o que impossibilita OAuth via popup — por isso o login usa redirect full-page.

### Verificação pós-instalação

```bash
# Escrita anónima deve ser rejeitada
curl -X POST https://myshelf.teudominio.com/api/collections/books/records \
  -H "Content-Type: application/json" -d '{"title":"teste"}'
# → Esperado: 401 Unauthorized

# CORS não deve ter wildcard
curl -I https://myshelf.teudominio.com/api/collections/books/records
# → Esperado: Access-Control-Allow-Origin: https://myshelf.teudominio.com

# Headers de segurança presentes
curl -I https://myshelf.teudominio.com
# → Esperado: Strict-Transport-Security, Content-Security-Policy, X-Frame-Options

# Google Books Key não aparece no source
curl -s https://myshelf.teudominio.com | grep -i "AIzaSy"
# → Esperado: sem resultados
```

---

## Changelog

Ver [CHANGELOG.md](CHANGELOG.md).

## Licença

MIT — ver [LICENSE](LICENSE).

---

<div align="center">
  Feito com ♥ por <a href="https://github.com/marialaranjo">marialaranjo</a>
</div>
