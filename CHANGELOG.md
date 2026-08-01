# Changelog — MyShelf

Todas as alterações relevantes deste projecto estão documentadas aqui.  
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## [Não lançado]

### Em desenvolvimento
- Migração do Cloudflare Tunnel para container Docker directamente na NAS (a decidir)
- Refactorização dos handlers `onclick`/`onerror` inline para `addEventListener()` — permitirá remover `'unsafe-inline'` do `script-src` da CSP
- Botão de logout no cabeçalho da aplicação
- Conta secundária para um segundo utilizador, com isolamento de dados por conta

---

## [1.2.1] — 2026-07-02

### Corrigido
- **[CRÍTICO]** Login Google fechava o separador do browser — o `redirect_uri` apontava para `/api/oauth2-redirect` (endpoint PocketBase que serve HTML com `window.close()`, desenhado para popup); agora redireciona para `/` (a raiz da SPA), onde o `handleOAuthCallback()` processa o `?code=` devolvido pelo Google
- **[CRÍTICO]** `handleOAuthCallback()` usava o endpoint errado (`/api/oauth2-redirect`) para trocar o código OAuth pelo token; corrigido para `/api/collections/users/auth-with-oauth2` (endpoint real do PocketBase 0.22)
- **[ALTO]** `startGoogleLogin()` concatenava o `redirect_uri` ao `authUrl` sem verificar se o PocketBase já o incluía, resultando em duplicação do parâmetro; agora usa `.replace()` para substituir o valor existente

---

## [1.2.0] — 2026-06-25

### Segurança
- **[CRÍTICO]** Removida a Google Books API Key do frontend (`index.html`) — estava exposta em dois pontos do código JavaScript e no histórico Git; chave antiga deve ser revogada e substituída
- **[CRÍTICO]** Google Books Key movida para variável de ambiente `GOOGLE_BOOKS_KEY`, injectada no Nginx em tempo de execução via `envsubst` — nunca chega ao browser
- **[CRÍTICO]** Substituídas as duas chamadas directas a `googleapis.com/books/v1/volumes?key=...` pelo proxy interno `/api/google-books` (Nginx faz a chamada ao servidor Google com a chave segura)
- **[CRÍTICO]** CORS corrigido: `Access-Control-Allow-Origin: *` substituído por `https://myshelf.teudominio.com` — elimina risco de exfiltração de dados por sites externos
- **[ALTO]** Adicionado suporte a preflight CORS (`OPTIONS`) no Nginx — necessário para que o browser aceite os pedidos `POST`/`PATCH` autenticados
- **[MÉDIO]** `X-Frame-Options` alterado de `SAMEORIGIN` para `DENY` — a aplicação não usa iframes próprios
- **[MÉDIO]** Adicionado header `X-XSS-Protection: 1; mode=block`

### Adicionado
- `nginx.conf`: proxy `/api/google-books` que injeta a chave Google Books server-side e bloqueia pedidos de origens externas
- `docker-compose.yml`: directiva `env_file: .env` no serviço Nginx para leitura automática da `GOOGLE_BOOKS_KEY` sem necessidade de exportação manual no shell
- Headers de segurança completos no Nginx: `Strict-Transport-Security`, `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, `Referrer-Policy`, `Cross-Origin-Opener-Policy`, `Permissions-Policy`
- `README.md`: secção de Segurança com documentação de todas as medidas implementadas
- `README.md`: secção de Verificação pós-instalação com comandos `curl` de validação
- `README.md`: instruções correctas para a Google Books API Key (criação, restrição, rotação)

### Corrigido
- URI de redirecionamento OAuth no `README.md`: era `/api/oauth2-redirect` (incorrecto), passa a ser `/api/collections/users/auth-with-oauth2`
- `README.md`: Cloudflare Tunnel corrigido de "recomendado" para "obrigatório" (necessário para HTTPS e autenticação Google)
- `README.md`: diagrama de arquitectura actualizado para reflectir o fluxo real (Tunnel → Nginx → PocketBase/BiblioReads) e a ausência de portas expostas ao exterior

---

## [1.1.0] — 2026

### Adicionado
- Autenticação OAuth com Google via PocketBase (fluxo redirect full-page com PKCE)
- Suporte a domínio personalizado via Cloudflare Tunnel (`myshelf.teudominio.com`)
- Fluxo OAuth alterado de popup para redirect full-page — Cloudflare retira o header `Cross-Origin-Opener-Policy`, impossibilitando o fecho automático da janela popup
- `nginx.conf`: proxy `/api/porbase` para a BN Portugal (sem CORS na origem; formato query string `?id=` obrigatório — o formato de caminho foi descontinuado pela BNP)
- `nginx.conf`: proxy `/api/goodreads` para o BiblioReads
- Campo `owner` injectado em todos os registos criados via PocketBase (`withOwner()`) — base para isolamento de dados por utilizador
- Migrations PocketBase: backfill do campo `owner` nos registos existentes e restrição das API Rules nas quatro coleções (`books`, `libraries`, `wishlist`, `loans`)
- `nginx.conf`: header `Content-Security-Policy` construído a partir das origens reais da aplicação
- `nginx.conf`: header `Cross-Origin-Opener-Policy: same-origin`
- `.gitattributes`: forçar LF em ficheiros `.sh` e `.template` para evitar quebras de linha CRLF no container Docker (Windows)
- Imagens Docker publicadas como públicas no GitHub Container Registry — qualquer pessoa com quem partilhes o repositório pode fazer pull sem credenciais

### Corrigido
- URI de redirecionamento OAuth: dois URIs incorrectos identificados e removidos do Google Cloud Console (incluindo um com dupla barra)

---

## [1.0.0] — 2025

### Adicionado
- Stack Docker completa com três serviços orquestrados:
  - **PocketBase** (`myshelf_pb`) — base de dados e API REST/autenticação
  - **Nginx** (`myshelf_nginx`) — reverse proxy e serving do frontend
  - **BiblioReads** (`myshelf_biblioreads`) — integração com Goodreads/OpenLibrary
- Rede Docker isolada (`myshelf_net`) com sub-rede `172.40.0.0/24`
- IPs fixos para cada serviço na rede interna
- Volume persistente `myshelf_pb_data` para os dados do PocketBase
- Health checks em todos os serviços
- Imagens publicadas no GitHub Container Registry (`ghcr.io/marialaranjo/`)
- Ficheiro `.gitignore` com exclusão de segredos, dados e overrides locais
- `docker-compose.yml` versionado e pronto para deploy

---

> **Nota:** Este projecto segue versionamento semântico (MAJOR.MINOR.PATCH).
