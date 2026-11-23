#!/usr/bin/env node
/**
 * backfill-pages.mjs — preenche o nº de páginas (pagesTotal) dos livros que
 * ainda não o têm, a partir da EDIÇÃO EXATA no Open Library (pelo ISBN).
 *
 * Funciona em dois passos, para nada ser gravado sem alguém ver primeiro:
 *
 *   1) Ensaio (por omissão): consulta o Open Library e escreve um relatório
 *      CSV com o que encontrou e a decisão para cada livro. Não grava nada.
 *        node scripts/backfill-pages.mjs
 *        node scripts/backfill-pages.mjs --limite=20      # só os primeiros 20
 *
 *   2) Aplicar um relatório revisto: grava SÓ as linhas com decisão «gravar»
 *      (podes mudar a decisão no CSV antes), e só se o livro continuar sem
 *      páginas no momento de gravar.
 *        node scripts/backfill-pages.mjs --aplicar=relatorio-paginas-2026-11-21.csv
 *
 * Variáveis (Node 18+, sem dependências):
 *   PB_URL=http://localhost:8090   (por omissão; produção só depois do teste local)
 *   PB_ADMIN_EMAIL=...  PB_ADMIN_PASSWORD=...   (conta de administrador do painel /_/)
 *   OL_URL=https://openlibrary.org   OL_PAUSA_MS=1000
 *
 * Regras de segurança:
 *  - Usa /isbn/<ISBN>.json → número de páginas DESSA edição (number_of_pages).
 *    Nunca usa a mediana de todas as edições da obra, nem pesquisa por título.
 *  - Confirma que a edição devolvida tem mesmo esse ISBN (ISBN-10 e ISBN-13
 *    contam como o mesmo) e que o título é parecido; se não, fica «rever».
 *  - Nunca sobrescreve um valor já existente.
 *  - 1 pedido por segundo ao Open Library (OL_PAUSA_MS) e --limite opcional.
 *  - O relatório tem títulos dos livros: guarda-o fora do repositório.
 */
import fs from "node:fs";

const PB_URL = (process.env.PB_URL || "http://localhost:8090").replace(/\/$/, "");
const OL_URL = (process.env.OL_URL || "https://openlibrary.org").replace(/\/$/, "");
const EMAIL = process.env.PB_ADMIN_EMAIL;
const PASS = process.env.PB_ADMIN_PASSWORD;
const PAUSA_MS = Number(process.env.OL_PAUSA_MS ?? 1000);
const arg = (nome) => (process.argv.find((a) => a.startsWith(`--${nome}=`)) || "").split("=").slice(1).join("=");
const APLICAR = arg("aplicar");
const LIMITE = Number(arg("limite")) || 0;
if (process.argv.includes("--aplicar")) {
  console.error("Indica o relatório revisto: --aplicar=relatorio-paginas-AAAA-MM-DD.csv");
  process.exit(1);
}

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const limparIsbn = (s) => String(s || "").replace(/[^0-9Xx]/g, "").toUpperCase();

// ISBN-10 → ISBN-13 (978…), para comparar as duas formas do mesmo livro.
export function isbn13(isbn) {
  const s = limparIsbn(isbn);
  if (s.length === 13) return s;
  if (s.length !== 10) return s;
  const base = "978" + s.slice(0, 9);
  let soma = 0;
  for (let i = 0; i < 12; i++) soma += Number(base[i]) * (i % 2 ? 3 : 1);
  return base + ((10 - (soma % 10)) % 10);
}
// Títulos: sem acentos, sem pontuação, sem marcas «?» da PORBASE, minúsculas.
export function normTitulo(t) {
  return String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
}
// Parecido = metade ou mais das palavras com 3+ letras do título mais curto
// aparece no outro (aguenta subtítulos, artigos e traduções do subtítulo).
export function titulosParecidos(a, b) {
  const pa = normTitulo(a).split(" ").filter((w) => w.length >= 3);
  const pb_ = new Set(normTitulo(b).split(" ").filter((w) => w.length >= 3));
  if (!pa.length || !pb_.size) return false;
  const [curto, longo] = pa.length <= pb_.size ? [pa, pb_] : [[...pb_], new Set(pa)];
  const comuns = curto.filter((w) => longo.has(w)).length;
  return comuns / curto.length >= 0.5;
}
// Decide o que fazer com a resposta do Open Library para um livro.
export function decidir(livro, edicao) {
  if (!edicao) return { decisao: "manual", motivo: "ISBN sem edição no Open Library" };
  const n = edicao.number_of_pages;
  if (!(Number.isInteger(n) && n > 0 && n < 10000)) return { decisao: "manual", motivo: "edição sem número de páginas" };
  const alvo = isbn13(livro.isbn);
  const isbns = [...(edicao.isbn_13 || []), ...(edicao.isbn_10 || [])].map(isbn13);
  if (!isbns.includes(alvo)) return { decisao: "rever", motivo: "a edição devolvida não tem este ISBN", paginas: n };
  if (!titulosParecidos(livro.title, edicao.title)) return { decisao: "rever", motivo: "título diferente", paginas: n };
  return { decisao: "gravar", motivo: "edição exata", paginas: n };
}

async function pb(path, opts = {}, token) {
  const res = await fetch(PB_URL + path, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: token } : {}), ...(opts.headers || {}) },
  });
  const corpo = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${res.status} ${path}: ${corpo.message || "erro"}`);
  return corpo;
}

// Edição exata pelo ISBN (o Open Library redireciona para /books/OL…M.json).
async function edicaoOpenLibrary(isbn) {
  const res = await fetch(`${OL_URL}/isbn/${encodeURIComponent(isbn)}.json`, {
    headers: { "User-Agent": "myshelf/1.0 (backfill-pages)" },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Open Library ${res.status}`);
  return res.json();
}

// CSV simples (separador «;», como o Excel em português espera).
const COLUNAS = ["id", "titulo", "isbn", "paginas", "titulo_open_library", "decisao", "motivo"];
const celula = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
function escreverCsv(ficheiro, linhas) {
  fs.writeFileSync(ficheiro, "﻿" + [COLUNAS.join(";"), ...linhas.map((l) => COLUNAS.map((c) => celula(l[c])).join(";"))].join("\n") + "\n");
}
export function lerCsv(texto) {
  const linhas = texto.replace(/^﻿/, "").split(/\r?\n/).filter(Boolean);
  const cab = linhas.shift().split(";").map((c) => c.replace(/^"|"$/g, ""));
  return linhas.map((l) => {
    const vals = []; let cur = ""; let dentro = false;
    for (let i = 0; i < l.length; i++) {
      const ch = l[i];
      if (dentro) { if (ch === '"' && l[i + 1] === '"') { cur += '"'; i++; } else if (ch === '"') dentro = false; else cur += ch; }
      else if (ch === '"') dentro = true; else if (ch === ";") { vals.push(cur); cur = ""; } else cur += ch;
    }
    vals.push(cur);
    return Object.fromEntries(cab.map((c, i) => [c, vals[i] ?? ""]));
  });
}

async function entrar() {
  if (!EMAIL || !PASS) {
    console.error("Faltam PB_ADMIN_EMAIL e PB_ADMIN_PASSWORD (conta de administrador do painel /_/).");
    process.exit(1);
  }
  const { token } = await pb("/api/admins/auth-with-password", { method: "POST", body: JSON.stringify({ identity: EMAIL, password: PASS }) });
  return token;
}

async function ensaio() {
  console.log(`PocketBase: ${PB_URL}\nModo: ensaio (nada é gravado)\n`);
  const token = await entrar();
  const livros = [];
  for (let page = 1; ; page++) {
    const filtro = encodeURIComponent("pagesTotal = 0 || pagesTotal = null");
    const r = await pb(`/api/collections/books/records?perPage=200&page=${page}&filter=${filtro}&fields=id,title,isbn,pagesTotal`, {}, token);
    livros.push(...r.items);
    if (page >= r.totalPages) break;
  }
  let comIsbn = livros.filter((b) => limparIsbn(b.isbn));
  const semIsbn = livros.filter((b) => !limparIsbn(b.isbn));
  console.log(`${livros.length} livros sem nº de páginas · ${comIsbn.length} com ISBN · ${semIsbn.length} sem ISBN`);
  if (LIMITE && comIsbn.length > LIMITE) { comIsbn = comIsbn.slice(0, LIMITE); console.log(`(limitado aos primeiros ${LIMITE})`); }
  console.log("");

  const linhas = [];
  for (const [i, b] of comIsbn.entries()) {
    const isbn = limparIsbn(b.isbn);
    let r;
    try {
      const ed = await edicaoOpenLibrary(isbn);
      r = { ...decidir(b, ed), titulo_open_library: ed?.title || "" };
    } catch (e) {
      r = { decisao: "manual", motivo: `erro no Open Library (${e.message})` };
    }
    linhas.push({ id: b.id, titulo: b.title, isbn, paginas: r.paginas || "", titulo_open_library: r.titulo_open_library || "", decisao: r.decisao, motivo: r.motivo });
    const s = r.decisao === "gravar" ? "✓" : r.decisao === "rever" ? "?" : "·";
    console.log(`  ${s} ${b.title}${r.paginas ? ` — ${r.paginas} páginas` : ""} (${r.motivo})`);
    if (i < comIsbn.length - 1) await dormir(PAUSA_MS);
  }
  for (const b of semIsbn) linhas.push({ id: b.id, titulo: b.title, isbn: "", paginas: "", titulo_open_library: "", decisao: "manual", motivo: "sem ISBN" });

  const ficheiro = `relatorio-paginas-${new Date().toISOString().slice(0, 10)}.csv`;
  escreverCsv(ficheiro, linhas);
  const conta = (d) => linhas.filter((l) => l.decisao === d).length;
  console.log(`\nRelatório: ${ficheiro}`);
  console.log(`  gravar: ${conta("gravar")} · rever: ${conta("rever")} · manual: ${conta("manual")}`);
  console.log(`\nRevê o relatório (podes mudar «rever» para «gravar», ou «gravar» para «não»).`);
  console.log(`Depois: node scripts/backfill-pages.mjs --aplicar=${ficheiro}`);
}

async function aplicar(ficheiro) {
  console.log(`PocketBase: ${PB_URL}\nModo: APLICAR o relatório ${ficheiro}\n`);
  const linhas = lerCsv(fs.readFileSync(ficheiro, "utf8")).filter((l) => l.decisao === "gravar");
  const token = await entrar();
  let gravados = 0, saltados = 0;
  for (const l of linhas) {
    const n = Number(l.paginas);
    if (!(Number.isInteger(n) && n > 0 && n < 10000)) { console.log(`  · ${l.titulo} — número de páginas inválido no relatório, saltado`); saltados++; continue; }
    const atual = await pb(`/api/collections/books/records/${encodeURIComponent(l.id)}?fields=id,pagesTotal`, {}, token).catch(() => null);
    if (!atual) { console.log(`  · ${l.titulo} — já não existe, saltado`); saltados++; continue; }
    if (atual.pagesTotal) { console.log(`  · ${l.titulo} — já tem ${atual.pagesTotal} páginas, não mexo`); saltados++; continue; }
    await pb(`/api/collections/books/records/${encodeURIComponent(l.id)}`, { method: "PATCH", body: JSON.stringify({ pagesTotal: n }) }, token);
    console.log(`  ✓ ${l.titulo} — ${n} páginas`);
    gravados++;
  }
  console.log(`\nGravados: ${gravados} · saltados: ${saltados}`);
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop())) {
  (APLICAR ? aplicar(APLICAR) : ensaio()).catch((e) => {
    console.error("Falhou:", e.message);
    process.exit(1);
  });
}
