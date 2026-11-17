# Testar localmente antes de atualizar o servidor

Com o `self-hosted/docker-compose.local.yml` corres o MyShelf no teu computador, com o código que está na pasta. Não toca no servidor nem nos dados de produção.

- App: `http://localhost:8080`
- Painel do PocketBase: `http://localhost:8090/_/`
- Dados num volume à parte (`myshelf_pb_data_local`), apagado com `down -v`

## 1. Arrancar

Na pasta `self-hosted/`:

```bash
docker compose -f docker-compose.local.yml up -d --build
```

**No Windows**, algumas versões do Docker Desktop falham no `--build` com um erro sobre o *bake* («additional privileges requested»). Nesse caso, constrói as imagens à mão e arranca sem `--build`:

```powershell
docker build -t myshelf-local-pocketbase ./pocketbase
docker build -t myshelf-local-nginx -f nginx/Dockerfile .
docker compose -f docker-compose.local.yml up -d
```

Confirma que os três serviços estão a correr: `docker compose -f docker-compose.local.yml ps`.

## 2. Criar o administrador do painel

```bash
docker exec myshelf_local_pb /pb/pocketbase admin create tu@exemplo.com UmaPasswordLonga123 --dir /pb/pb_data
```

Entra em `http://localhost:8090/_/` com esses dados.

## 3. (Opcional) Testar com uma cópia dos teus dados

1. No painel de **produção**: **Settings → Backups → Initialize new backup** e descarrega o `.zip`.
2. No painel **local**: **Settings → Backups → Upload backup** e depois **Restore**.
3. O PocketBase local reinicia. Volta a entrar com a conta de administrador **da produção**, que veio na cópia.

Se a cópia não trouxer um administrador que conheças, repete o passo 2 com `admin update` em vez de `admin create`.

## 4. Login com Google no teste local

1. Na Google Cloud, no cliente OAuth do MyShelf, acrescenta `http://localhost:8080/` aos **URIs de redirecionamento autorizados**.
2. No painel local: **Settings → Application → Application URL** = `http://localhost:8080`.

A app usa sempre a origem da própria página como endereço de retorno, por isso o mesmo código serve para produção e para o teste local.

## 5. O que verificar

- [ ] Entras com Google e vês a tua estante (ou uma estante vazia, sem cópia de produção).
- [ ] Uma conta Google **sem convite** é recusada com a mensagem «Esta conta Google não foi convidada».
- [ ] O menu da conta mostra **Administração** para quem administra.
- [ ] No telemóvel (F12 → Ctrl+Shift+M, 375 px), nenhuma vista desliza para o lado.
- [ ] `docker compose -f docker-compose.local.yml logs pocketbase` não mostra erros de migração.

A pesquisa no Google Books só funciona se definires a chave antes de arrancar (`GOOGLE_BOOKS_KEY=…`). Sem ela, a app usa a Open Library e a PORBASE.

## 6. Parar e limpar

```bash
docker compose -f docker-compose.local.yml down      # para, mantém os dados de teste
docker compose -f docker-compose.local.yml down -v   # para e apaga os dados de teste
```
