/// <reference path="../pb_data/types.d.ts" />

// ─────────────────────────────────────────────────────────
// Migração inicial — coleções books / libraries / wishlist
// ─────────────────────────────────────────────────────────
// Esta migração cria o schema com os nomes de campos EXATOS
// que a SPA usa (verificados no frontend/app.js).
//
// Decisões para esta fase:
//
// 1. Campo `owner` é OPCIONAL (não required).
//    Em testes locais sem OAuth, a SPA não envia owner.
//    Na NAS com OAuth, quando preenchermos, fica registado.
//
// 2. Regras API estão TODAS VAZIAS (qualquer um pode tudo).
//    Adequado para testes locais. Antes de produção pública,
//    tightening: rules para `@request.auth.id != '' && owner = @request.auth.id`.
// ─────────────────────────────────────────────────────────

migrate((db) => {
  const dao = new Dao(db);

  // ═══════════════════════════════════════════════════════
  // COLEÇÃO: books
  // ═══════════════════════════════════════════════════════
  const books = new Collection({
    name: "books",
    type: "base",
    listRule:   "",
    viewRule:   "",
    createRule: "",
    updateRule: "",
    deleteRule: "",
    schema: [
      // Identificação
      { name: "isbn",                type: "text" },
      { name: "title",               type: "text", required: true },
      { name: "author",              type: "text" },
      { name: "publisher",           type: "text" },
      { name: "year",                type: "text" },
      { name: "edition",             type: "text" },
      { name: "lang",                type: "text" },

      // Localização física
      { name: "library",             type: "text" },
      { name: "location",            type: "text" },
      { name: "type",                type: "text" },

      // Estado e metadados
      { name: "status",              type: "text" },
      { name: "rating",              type: "number" },
      { name: "price",               type: "number" },
      { name: "tags",                type: "json" },
      { name: "notes",               type: "text" },
      { name: "cover",               type: "text" },
      { name: "added",               type: "text" },

      // Leitura
      { name: "pagesRead",           type: "number" },
      { name: "pagesTotal",          type: "number" },
      { name: "readingSessions",     type: "json" },

      // Empréstimo
      { name: "lent",                type: "bool" },
      { name: "lentTo",              type: "text" },
      { name: "lentDate",            type: "text" },

      // Goodreads (enriquecimento via BiblioReads)
      { name: "goodreadsUrl",        type: "text" },
      { name: "goodreadsData",       type: "json" },
      { name: "goodreadsEnrichedAt", type: "text" },

      // Owner (opcional nesta fase, ver topo)
      { name: "owner",               type: "text" },
    ],
    indexes: [
      "CREATE INDEX idx_books_isbn  ON books (isbn)",
      "CREATE INDEX idx_books_owner ON books (owner)",
    ],
  });
  dao.saveCollection(books);

  // ═══════════════════════════════════════════════════════
  // COLEÇÃO: libraries
  // ═══════════════════════════════════════════════════════
  const libraries = new Collection({
    name: "libraries",
    type: "base",
    listRule:   "",
    viewRule:   "",
    createRule: "",
    updateRule: "",
    deleteRule: "",
    schema: [
      { name: "name",  type: "text", required: true },
      { name: "icon",  type: "text" },
      { name: "desc",  type: "text" },
      { name: "owner", type: "text" },
    ],
    indexes: [
      "CREATE INDEX idx_libraries_owner ON libraries (owner)",
    ],
  });
  dao.saveCollection(libraries);

  // ═══════════════════════════════════════════════════════
  // COLEÇÃO: wishlist
  // ═══════════════════════════════════════════════════════
  const wishlist = new Collection({
    name: "wishlist",
    type: "base",
    listRule:   "",
    viewRule:   "",
    createRule: "",
    updateRule: "",
    deleteRule: "",
    schema: [
      { name: "title",    type: "text", required: true },
      { name: "author",   type: "text" },
      { name: "priority", type: "text" },
      { name: "url",      type: "text" },
      { name: "notes",    type: "text" },
      { name: "cover",    type: "text" },
      { name: "added",    type: "text" },
      { name: "owner",    type: "text" },
    ],
    indexes: [
      "CREATE INDEX idx_wishlist_owner ON wishlist (owner)",
    ],
  });
  dao.saveCollection(wishlist);

}, (db) => {
  // Reversão — remover coleções pela ordem inversa
  const dao = new Dao(db);
  for (const name of ["wishlist", "libraries", "books"]) {
    try {
      const c = dao.findCollectionByNameOrId(name);
      dao.deleteCollection(c);
    } catch (e) { /* ignorar se já não existir */ }
  }
});

