/// <reference path="../pb_data/types.d.ts" />

// ── Estante partilhada: GET /api/partilha/:token ─────────────────────────
// A página pública /c/<token> pede aqui os livros e as coleções de quem
// partilhou. O servidor escolhe os campos: só sai o que a estante pública
// mostra (título, autor, capa, coleção, estado, quantidade).
//
// Antes, a página pedia diretamente /api/collections/books/records?token=…
// e era o browser a escolher os campos (fields=), por isso quem tivesse o
// link podia pedir também notas, preço, a quem foi emprestado e sessões de
// leitura. A migração 1700000090 retira o token dessas regras.
//
// Nota: no PocketBase 0.22 cada handler corre isolado, por isso tudo o que
// a rota usa está dentro dela.

routerAdd("GET", "/api/partilha/:token", (c) => {
  const token = String(c.pathParam("token") || "").trim();
  // tokens gerados com crypto.randomUUID(): 36 caracteres
  if (token.length < 20 || token.length > 100) throw new NotFoundError("Link inválido.");

  let share;
  try {
    share = $app.dao().findFirstRecordByFilter("shares", "token = {:t} && active = true", { t: token });
  } catch (_) {
    throw new NotFoundError("Este link não existe ou já não está ativo.");
  }
  const owner = share.getString("owner");
  if (!owner) throw new NotFoundError("Este link não existe ou já não está ativo.");

  const books = $app.dao().findRecordsByFilter("books", "owner = {:o}", "title", 5000, 0, { o: owner });
  const libs = $app.dao().findRecordsByFilter("libraries", "owner = {:o}", "name", 500, 0, { o: owner });

  // não deixar o browser nem proxies guardarem uma estante que pode deixar de ser pública
  c.response().header().set("Cache-Control", "no-store");

  return c.json(200, {
    books: books.map((b) => ({
      id: b.id,
      title: b.getString("title"),
      author: b.getString("author"),
      cover: b.getString("cover"),
      library: b.getString("library"),
      status: b.getString("status"),
      quantity: b.getInt("quantity"),
    })),
    libs: libs.map((l) => ({
      id: l.id,
      name: l.getString("name"),
      icon: l.getString("icon"),
    })),
  });
});
