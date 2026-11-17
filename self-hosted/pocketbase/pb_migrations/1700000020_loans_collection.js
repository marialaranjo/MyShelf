/// <reference path="../pb_data/types.d.ts" />

// ─────────────────────────────────────────────────────────
// Migração: coleção `loans` — histórico de empréstimos
// ─────────────────────────────────────────────────────────
// Cada registo = UM empréstimo (ativo ou já devolvido). Dá
// histórico real e multi-empréstimo por livro, em vez de
// guardar só o empréstimo atual nos campos lent/lentTo/lentDate
// do próprio livro (que eram apagados ao devolver).
//
//   • book         — relação para `books` (o livro emprestado)
//   • who          — a quem foi emprestado (obrigatório)
//   • lentDate     — data de saída (texto ISO yyyy-mm-dd)
//   • dueDate      — devolução prevista (opcional)
//   • returnedDate — data de devolução real (vazio = ainda fora)
//   • returned     — bool; false = ativo, true = devolvido
//   • owner        — opcional, igual às restantes coleções
//
// Regras API vazias (igual às outras nesta fase de testes locais).
// ─────────────────────────────────────────────────────────

migrate((db) => {
  const dao = new Dao(db);

  // Idempotência: não recriar se a migration já correu
  try { dao.findCollectionByNameOrId("loans"); return; } catch (e) { /* não existe — continuar */ }

  const books = dao.findCollectionByNameOrId("books");

  const loans = new Collection({
    name: "loans",
    type: "base",
    listRule:   "",
    viewRule:   "",
    createRule: "",
    updateRule: "",
    deleteRule: "",
    schema: [
      {
        name: "book",
        type: "relation",
        required: false,
        options: {
          collectionId: books.id,
          cascadeDelete: false,
          minSelect: null,
          maxSelect: 1,
          displayFields: null,
        },
      },
      { name: "who",          type: "text", required: true },
      { name: "lentDate",     type: "text" },
      { name: "dueDate",      type: "text" },
      { name: "returnedDate", type: "text" },
      { name: "returned",     type: "bool" },
      { name: "owner",        type: "text" },
    ],
    indexes: [
      "CREATE INDEX idx_loans_book  ON loans (book)",
      "CREATE INDEX idx_loans_owner ON loans (owner)",
    ],
  });
  dao.saveCollection(loans);

}, (db) => {
  // Reversão — remover a coleção
  const dao = new Dao(db);
  try {
    const c = dao.findCollectionByNameOrId("loans");
    dao.deleteCollection(c);
  } catch (e) { /* ignorar se já não existir */ }
});
