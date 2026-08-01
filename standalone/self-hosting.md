# Self-hosting — Docker + Cloudflare Tunnel

🇬🇧 [Read this in English](self-hosting.en.md)

Guia para correr "MyShelf" num NAS ou VPS com acesso externo seguro via Cloudflare Tunnel.

## Pré-requisitos

- Docker + Docker Compose instalado
- Conta Cloudflare (gratuita)
- Domínio ou subdomínio configurado no Cloudflare

---

## 1. Docker Compose

Cria um ficheiro `docker-compose.yml` no servidor:

```yaml
version: '3.8'

services:
  myshelf:
    image: nginx:alpine
    container_name: myshelf
    volumes:
      - ./index.html:/usr/share/nginx/html/index.html:ro
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    ports:
      - "8080:80"
    restart: unless-stopped
```

Cria o ficheiro `nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Cache de assets estáticos
    location ~* \.(js|css|png|jpg|ico|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
}
```

Inicia o container:

```bash
docker compose up -d
```

Testa localmente: `http://localhost:8080`

---

## 2. Cloudflare Tunnel (acesso externo seguro)

### Instalar cloudflared

```bash
# No servidor (Linux x64)
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
```

### Autenticar

```bash
cloudflared tunnel login
```

Abre o browser e autoriza.

### Criar tunnel

```bash
cloudflared tunnel create myshelf
```

Guarda o UUID que aparece (ex: `abc123...`).

### Configurar

Cria `~/.cloudflared/config.yml`:

```yaml
tunnel: abc123...   # substitui pelo teu UUID
credentials-file: /root/.cloudflared/abc123....json

ingress:
  - hostname: livros.teudominio.com
    service: http://localhost:8080
  - service: http_status:404
```

### DNS

```bash
cloudflared tunnel route dns myshelf livros.teudominio.com
```

### Iniciar como serviço

```bash
cloudflared service install
systemctl start cloudflared
```

---

## 3. Autenticação (opcional mas recomendado)

Para proteger o acesso com login, usa **Cloudflare Access** (gratuito até 50 utilizadores):

1. No painel Cloudflare → **Zero Trust** → **Access** → **Applications**
2. Adiciona aplicação do tipo "Self-hosted"
3. URL: `livros.teudominio.com`
4. Política: permite apenas emails específicos (ex: `tu@email.com`, `convidado@email.com`)
5. Método de login: One-time PIN por email (sem password)

Desta forma, qualquer pessoa que tente aceder recebe um email com um código de 6 dígitos.

---

## 4. Actualizar a aplicação

```bash
# No servidor, na pasta do projecto
git pull origin main          # actualiza o index.html
docker compose restart        # nginx relê o ficheiro
```

Ou sem git:

```bash
scp index.html user@servidor:/path/para/projecto/
docker compose restart
```

---

## Diagrama

```
Convidado (telemóvel)       Tu (computador)
        ↓                          ↓
  livros.teudominio.com    livros.teudominio.com
        ↓                          ↓
  Cloudflare Access (login por email)
        ↓
  Cloudflare Tunnel (encriptado)
        ↓
  NAS / VPS (Docker → nginx → index.html)
```
