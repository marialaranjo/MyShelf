/// <reference path="../pb_data/types.d.ts" />

// ── GET /api/eu — «este pedido vem de alguém com sessão iniciada?» ────────
// Usado pelo Nginx (auth_request) antes dos atalhos /api/google-books,
// /api/porbase e /api/goodreads: só quem entrou na app os pode usar, por
// isso ninguém de fora gasta a quota da chave do Google Books.
// 204 = sessão válida de um utilizador; 401 = sem sessão.

routerAdd("GET", "/api/eu", (c) => {
  return c.noContent(204);
}, $apis.requireRecordAuth("users"));
