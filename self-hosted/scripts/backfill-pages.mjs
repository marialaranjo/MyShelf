#!/usr/bin/env node
/**
 * backfill-pages.mjs — preenche o nº de páginas (pagesTotal) dos livros que
 * ainda não o têm, consultando o Open Library pelo ISBN.
 *
 * Por omissão é um ENSAIO: mostra o que faria e não escreve nada.
 * Só grava com --aplicar.
 *
 * Uso (Node 18+, sem dependências):
 *   PB_URL=https://myshelf.teudominio.com \
 *   PB_ADMIN_EMAIL=... PB_ADMIN_PASSWORD=... \
 *   node scripts/backfill-pages.mjs            # ensaio
 *   node scripts/backfill-pages.mjs --aplicar  # grava
 *
 * Regras:
 *  - Só toca em livros com pagesTotal vazio/0 E com ISBN.
 *  - Nunca sobrescreve um valor já existente.
 *  - Livros sem ISBN ou sem resposta do Open Library ficam listados no fim,
 *    para preencher à mão.
 *  - 1 pedido por segundo ao Open Library (boa educação com a API pública).
 */

const PB_URL = (process.env.PB_URL || "http://localhost:8090").replace(/\/$/, "");
const OL_URL = (process.env.OL_URL || "https://openlibrary.org").replace(/\/$/, "");
const EMAIL = process.env.PB_ADMIN_EMAIL;
const PASS = process.env.PB_ADMIN_PASSWORD;
const APLICAR = process.argv.includes("--aplicar");
const PAUSA_MS = Number(process.env.OL_PAUSA_MS ?? 1000);

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const limparIsbn = (s) => String(s || "").replace(/[^0-9Xx]/g, "");

async function pb(path, opts = {}, token) {
  const res = await fetch(PB_URL + path, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: token } : {}), ...(opts.headers || {}) },
  });
  const corpo = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${res.status} ${path}: ${corpo.message || "erro"}`);
  return corpo;
}

async function paginasOpenLibrary(isbn) {
  const url = `${OL_URL}/search.json?isbn=${encodeURIComponent(isbn)}&fields=number_of_pages_median,title&limit=1`;
  const res = await fetch(url, { headers: { "User-Agent": "myshelf/1.0 (backfill)" } });
  if (!res.ok) throw new Error(`Open Library ${res.status}`);
  const d = await res.json();
  const n = d?.docs?.[0]?.number_of_pages_median;
  return Number.isInteger(n) && n > 0 && n < 10000 ? n : null;
}

async function main() {
  if (!EMAIL || !PASS) {
    console.error("Faltam PB_ADMIN_EMAIL e PB_ADMIN_PASSWORD (conta de administrador do painel /_/).");
    process.exit(1);
  }
  console.log(`PocketBase: ${PB_URL}`);
  console.log(APLICAR ? "Modo: APLICAR (vai gravar)\n" : "Modo: ensaio (nada é gravado; usa --aplicar para gravar)\n");

  const { token } = await pb("/api/admins/auth-with-password", {
    method: "POST",
    body: JSON.stringify({ identity: EMAIL, password: PASS }),
  });

  // Todos os livros sem páginas (de todos os utilizadores — corre como admin)
  const livros = [];
  for (let page = 1; ; page++) {
    const filtro = encodeURIComponent("pagesTotal = 0 || pagesTotal = null");
    const r = await pb(`/api/collections/books/records?perPage=200&page=${page}&filter=${filtro}&fields=id,title,author,isbn,pagesTotal`, {}, token);
    livros.push(...r.items);
    if (page >= r.totalPages) break;
  }

  const semIsbn = livros.filter((b) => !limparIsbn(b.isbn));
  const comIsbn = livros.filter((b) => limparIsbn(b.isbn));
  console.log(`${livros.length} livros sem nº de páginas · ${comIsbn.length} com ISBN · ${semIsbn.length} sem ISBN\n`);

  const semResposta = [];
  let preenchidos = 0;
  for (const [i, b] of comIsbn.entries()) {
    const isbn = limparIsbn(b.isbn);
    let n = null;
    try {
      n = await paginasOpenLibrary(isbn);
    } catch (e) {
      console.log(`  ! ${b.title} — erro no Open Library (${e.message})`);
    }
    if (n) {
      console.log(`  ✓ ${b.title} — ${n} páginas`);
      if (APLICAR) await pb(`/api/collections/books/records/${b.id}`, { method: "PATCH", body: JSON.stringify({ pagesTotal: n }) }, token);
      preenchidos++;
    } else {
      semResposta.push(b);
    }
    if (i < comIsbn.length - 1) await dormir(PAUSA_MS);
  }

  console.log(`\n${APLICAR ? "Gravados" : "Seriam gravados"}: ${preenchidos}`);
  const manual = [...semIsbn, ...semResposta];
  if (manual.length) {
    console.log(`\nPara preencher à mão (${manual.length}):`);
    for (const b of manual) console.log(`  · ${b.title}${b.author ? " — " + b.author : ""}${b.isbn ? " (ISBN " + b.isbn + ", sem dados no Open Library)" : " (sem ISBN)"}`);
  }
}

main().catch((e) => {
  console.error("Falhou:", e.message);
  process.exit(1);
});
