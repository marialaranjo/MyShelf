# Self-hosting — Docker + Cloudflare Tunnel

🇵🇹 [Ler em português](self-hosting.md)

Guide for running MyShelf on a NAS or VPS with secure external access via Cloudflare Tunnel.

## Prerequisites

- Docker + Docker Compose installed
- A Cloudflare account (free)
- A domain or subdomain configured in Cloudflare

---

## 1. Docker Compose

Create a `docker-compose.yml` file on the server:

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

Create the `nginx.conf` file:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Static asset caching
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

Start the container:

```bash
docker compose up -d
```

Test locally: `http://localhost:8080`

---

## 2. Cloudflare Tunnel (secure external access)

### Install cloudflared

```bash
# On the server (Linux x64)
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
```

### Authenticate

```bash
cloudflared tunnel login
```

Open the browser and authorize.

### Create the tunnel

```bash
cloudflared tunnel create myshelf
```

Save the UUID that's printed (e.g. `abc123...`).

### Configure

Create `~/.cloudflared/config.yml`:

```yaml
tunnel: abc123...   # replace with your UUID
credentials-file: /root/.cloudflared/abc123....json

ingress:
  - hostname: books.yourdomain.com
    service: http://localhost:8080
  - service: http_status:404
```

### DNS

```bash
cloudflared tunnel route dns myshelf books.yourdomain.com
```

### Start as a service

```bash
cloudflared service install
systemctl start cloudflared
```

---

## 3. Authentication (optional but recommended)

To protect access with a login, use **Cloudflare Access** (free for up to 50 users):

1. In the Cloudflare dashboard → **Zero Trust** → **Access** → **Applications**
2. Add a "Self-hosted" application
3. URL: `books.yourdomain.com`
4. Policy: allow only specific emails (e.g. `you@email.com`, `guest@email.com`)
5. Login method: one-time PIN by email (no password)

This way, anyone who tries to access it gets an email with a 6-digit code.

---

## 4. Updating the app

```bash
# On the server, in the project folder
git pull origin main          # updates index.html
docker compose restart        # nginx re-reads the file
```

Or without git:

```bash
scp index.html user@server:/path/to/project/
docker compose restart
```

---

## Diagram

```
Guest (phone)                You (computer)
        ↓                          ↓
  books.yourdomain.com     books.yourdomain.com
        ↓                          ↓
  Cloudflare Access (email login)
        ↓
  Cloudflare Tunnel (encrypted)
        ↓
  NAS / VPS (Docker → nginx → index.html)
```
