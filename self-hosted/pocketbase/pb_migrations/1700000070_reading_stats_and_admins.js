/// <reference path="../pb_data/types.d.ts" />

// ════════════════════════════════════════════════════════════════════
//  Migração: dados para o novo Resumo e para a Administração
//  (Fase 1 do redesign "estante + cortiça")
//
//  1. books.finishedAt   — data em que o livro passou a "lido" (texto ISO,
//                          como os outros campos de data da coleção).
//                          Backfill: data da última sessão de leitura,
//                          só quando existe. Nunca inventa datas.
//  2. users.readingGoal  — meta anual de livros (desafio). Vazio = sem meta.
//  3. coleção "admins"   — quem vê a área de Administração. Só se altera no
//                          painel /_/ (regras de escrita = null). Semeada com
//                          o primeiro utilizador criado, tal como o
//                          backfill de owner (1700000030).
//
//  Porque não um campo "role" em users: a regra de update de users é
//  "@request.auth.id = id", por isso cada pessoa podia promover-se a si
//  própria. A coleção à parte evita mexer nas regras de users (e no login).
//
//  Idempotente: cada passo verifica se já foi feito. Seguro repetir.
// ════════════════════════════════════════════════════════════════════

migrate(
  (db) => {
    const dao = new Dao(db);

    // ── 1. books.finishedAt ──────────────────────────────────────────
    const books = dao.findCollectionByNameOrId("books");
    if (!books.schema.getFieldByName("finishedAt")) {
      books.schema.addField(new SchemaField({ name: "finishedAt", type: "text" }));
      dao.saveCollection(books);
    }

    // Backfill a partir das sessões de leitura (só livros lidos sem data)
    const lidos = dao.findRecordsByFilter(
      "books",
      "status = 'lido' && finishedAt = ''",
      "", 0, 0
    );
    for (const rec of lidos) {
      let sessions = [];
      try {
        let raw = rec.getString("readingSessions") || "[]";
        let parsed = JSON.parse(raw);
        // a SPA grava JSON.stringify(...) num campo json → pode vir duplamente codificado
        if (typeof parsed === "string") parsed = JSON.parse(parsed || "[]");
        if (Array.isArray(parsed)) sessions = parsed;
      } catch (e) {
        sessions = [];
      }
      const datas = sessions
        .map((s) => (s && s.date) || "")
        .filter((d) => d && !isNaN(Date.parse(d)))
        .sort();
      if (datas.length) {
        rec.set("finishedAt", datas[datas.length - 1]);
        dao.saveRecord(rec);
      }
    }

    // ── 2. users.readingGoal ─────────────────────────────────────────
    try {
      const users = dao.findCollectionByNameOrId("users");
      if (!users.schema.getFieldByName("readingGoal")) {
        users.schema.addField(
          new SchemaField({
            name: "readingGoal",
            type: "number",
            options: { min: 0, max: 1000, noDecimal: true },
          })
        );
        dao.saveCollection(users);
      }
    } catch (e) {
      // sem coleção users neste ambiente
    }

    // ── 3. coleção admins ────────────────────────────────────────────
    let admins;
    try {
      admins = dao.findCollectionByNameOrId("admins");
    } catch (e) {
      admins = new Collection({
        name: "admins",
        type: "base",
        // cada pessoa só consegue ver o SEU registo (= "sou admin?")
        listRule: '@request.auth.id != "" && user = @request.auth.id',
        viewRule: '@request.auth.id != "" && user = @request.auth.id',
        // escrita só pelo painel /_/ (null = apenas superutilizador)
        createRule: null,
        updateRule: null,
        deleteRule: null,
        schema: [{ name: "user", type: "text", required: true }],
        indexes: ["CREATE UNIQUE INDEX idx_admins_user ON admins (user)"],
      });
      dao.saveCollection(admins);
    }

    // Semear com o primeiro utilizador (se ainda não houver nenhum admin)
    try {
      const first = new DynamicModel({ id: "" });
      db.newQuery("SELECT id FROM users ORDER BY created ASC LIMIT 1").one(first);
      if (first.id) {
        const n = new DynamicModel({ total: 0 });
        db.newQuery("SELECT COUNT(*) AS total FROM admins").one(n);
        if (!n.total) {
          const rec = new Record(admins);
          rec.set("user", first.id);
          dao.saveRecord(rec);
        }
      }
    } catch (e) {
      // ainda não há utilizadores — semear à mão no painel /_/ depois do 1.º login
    }
  },

  (db) => {
    const dao = new Dao(db);
    try {
      dao.deleteCollection(dao.findCollectionByNameOrId("admins"));
    } catch (e) {}
    try {
      const users = dao.findCollectionByNameOrId("users");
      const f = users.schema.getFieldByName("readingGoal");
      if (f) { users.schema.removeField(f.id); dao.saveCollection(users); }
    } catch (e) {}
    try {
      const books = dao.findCollectionByNameOrId("books");
      const f = books.schema.getFieldByName("finishedAt");
      if (f) { books.schema.removeField(f.id); dao.saveCollection(books); }
    } catch (e) {}
  }
);
