#!/usr/bin/env node
/**
 * validate.js — verificações rápidas antes de fundir um PR (corre também no
 * GitHub Actions, em .github/workflows/validar.yml). Sem dependências.
 *
 *   node scripts/validate.js
 *
 * O que verifica:
 *  1. Sintaxe JavaScript: frontend/app.js, frontend/sw.js, pb_hooks e
 *     pb_migrations do PocketBase, scripts/*.mjs.
 *  2. O index.html carrega o app.js com um <script src> e não tem JavaScript
 *     inline nem atributos on…= (a CSP bloqueia-os em produção).
 *  3. Os ficheiros que o index.html e o service worker pedem existem
 *     (app.js, ícones, manifest, letras).
 *  4. O nginx/dockerfile ainda consegue pôr a versão no endereço do app.js
 *     (procura exatamente src="/app.js").
 *  5. Não há chaves de API do Google no código (AIza…).
 *  6. O script das páginas decide bem nos casos conhecidos.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const raiz = path.join(__dirname, '..');
const rel = (p) => path.relative(raiz, p);
let falhas = 0;
const ok = (msg) => console.log(`  ✓ ${msg}`);
const erro = (msg) => { console.error(`  ✗ ${msg}`); falhas++; };
const ler = (p) => fs.readFileSync(path.join(raiz, p), 'utf8');
const lista = (dir, re) => fs.existsSync(path.join(raiz, dir))
  ? fs.readdirSync(path.join(raiz, dir)).filter((f) => re.test(f)).map((f) => path.join(raiz, dir, f))
  : [];

// 1) Sintaxe
console.log('1. Sintaxe JavaScript');
const ficheirosJs = [
  path.join(raiz, 'frontend/app.js'),
  path.join(raiz, 'frontend/sw.js'),
  ...lista('pocketbase/pb_hooks', /\.js$/),
  ...lista('pocketbase/pb_migrations', /\.js$/),
  ...lista('scripts', /\.(mjs|js)$/),
];
for (const f of ficheirosJs) {
  try { execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }); ok(rel(f)); }
  catch (e) { erro(`${rel(f)}\n${(e.stderr || '').toString().trim()}`); }
}

// 2) index.html compatível com a CSP
console.log('2. index.html e CSP');
const html = ler('frontend/index.html');
if (/<script[^>]+src="\/app\.js"/.test(html)) ok('carrega /app.js com <script src>');
else erro('o index.html deixou de ter <script src="/app.js"> (o nginx/dockerfile depende disto)');
const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].filter((m) => m[1].trim());
if (!inline.length) ok('sem JavaScript inline'); else erro(`${inline.length} bloco(s) <script> inline — a CSP bloqueia-os`);
const handlers = html.match(/\son[a-z]+\s*=\s*["']/gi) || [];
if (!handlers.length) ok('sem atributos on…= (usa data-action)'); else erro(`atributos de evento inline: ${[...new Set(handlers)].join(', ')}`);

// 3) Ficheiros pedidos existem
console.log('3. Ficheiros pedidos pelo index.html e pelo service worker');
const pedidos = new Set();
for (const m of html.matchAll(/(?:src|href)="(\/[^"?#]+)/g)) pedidos.add(m[1]);
const sw = ler('frontend/sw.js');
const shell = (sw.match(/SHELL_FILES\s*=\s*\[([^\]]*)\]/) || [])[1] || '';
for (const m of shell.matchAll(/'([^']+)'/g)) if (m[1] !== '/') pedidos.add('/' + m[1].replace(/^\//, ''));
for (const p of pedidos) {
  if (p === '/' || p.startsWith('/api/') || p.startsWith('/c/')) continue;
  if (fs.existsSync(path.join(raiz, 'frontend', p))) ok(p); else erro(`${p} não existe em frontend/`);
}

// 4) Passo da versão no nginx/dockerfile
console.log('4. Versão no endereço do app.js');
const df = ['nginx/Dockerfile', 'nginx/dockerfile'].find((f) => fs.existsSync(path.join(raiz, f)));
if (df && /src=\\"\/app\.js\\"/.test(ler(df))) ok(`${df} troca src="/app.js" por src="/app.js?v=…"`);
else erro('o Dockerfile do nginx já não tem o passo que põe a versão no app.js');

// 4b) Scripts do PowerShell com BOM UTF-8 (sem ele, o PowerShell 5.1 estraga os acentos)
for (const f of lista('scripts', /\.ps1$/)) {
  const b = fs.readFileSync(f);
  if (b[0] === 0xef && b[1] === 0xbb && b[2] === 0xbf) ok(`${rel(f)} tem BOM UTF-8`); else erro(`${rel(f)} sem BOM UTF-8 — os acentos aparecem mal no PowerShell 5.1`);
}

// 5) Segredos
console.log('5. Chaves de API');
const suspeitos = [];
const percorrer = (dir) => {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', 'fonts'].includes(f.name)) continue;
    const p = path.join(dir, f.name);
    if (f.isDirectory()) percorrer(p);
    else if (/\.(js|mjs|html|json|yml|yaml|md|template|conf)$/.test(f.name) && /AIza[0-9A-Za-z_-]{30,}/.test(fs.readFileSync(p, 'utf8'))) suspeitos.push(rel(p));
  }
};
percorrer(raiz);
if (!suspeitos.length) ok('nenhuma chave Google (AIza…) no código'); else erro(`possível chave em: ${suspeitos.join(', ')}`);

// 6) Script das páginas
console.log('6. Script das páginas (decisões)');
const casos = `
  import { decidir, isbn13 } from ${JSON.stringify(path.join(raiz, 'scripts/backfill-pages.mjs'))};
  const t = [
    [decidir({title:'Ensaio sobre a Cegueira',isbn:'9722111349'},{title:'Ensaio Sobre a Cegueira',number_of_pages:310,isbn_13:['9789722111348']}).decisao,'gravar'],
    [decidir({title:'Os Maias',isbn:'9789720046123'},{title:'Os Maias',number_of_pages:700,isbn_13:['9789720000000']}).decisao,'rever'],
    [decidir({title:'O Evangelho',isbn:'9789722035637'},{title:'Outro livro',number_of_pages:200,isbn_13:['9789722035637']}).decisao,'rever'],
    [decidir({title:'X',isbn:'9789896655555'},{title:'X',isbn_13:['9789896655555']}).decisao,'manual'],
    [decidir({title:'X',isbn:'9789999999990'},null).decisao,'manual'],
    [isbn13('0141036141'),'9780141036144'],
  ];
  const mal = t.filter(([a,b]) => a !== b);
  if (mal.length) { console.error(JSON.stringify(mal)); process.exit(1); }`;
try { execFileSync(process.execPath, ['--input-type=module', '-e', casos], { stdio: 'pipe' }); ok('6 casos certos'); }
catch (e) { erro(`casos errados: ${(e.stderr || '').toString().trim()}`); }

console.log(falhas ? `\n✗ ${falhas} problema(s)` : '\n✓ Tudo certo');
process.exit(falhas ? 1 : 0);
