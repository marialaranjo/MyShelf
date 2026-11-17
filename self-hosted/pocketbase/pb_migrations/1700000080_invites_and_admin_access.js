/// <reference path="../pb_data/types.d.ts" />

// ════════════════════════════════════════════════════════════════════
//  Migração: entrada só por convite + leitura de utilizadores pela
//  admin (Fase 5 do redesign — Administração)
//
//  1. coleção "invites" (email, suspended, note) — só quem administra
//     (quem está em "admins") lê e escreve.
//  2. backfill: todas as contas que JÁ existem recebem um convite, para
//     ninguém ficar à porta quando a regra de entrada for ativada.
//  3. users.list/viewRule: cada um vê-se a si próprio OU quem administra
//     vê todos (para a lista de utilizadores). update/delete/create ficam
//     iguais — o login não muda.
//  4. admins.list/viewRule: quem administra vê a lista de admins.
//
//  A regra de entrada propriamente dita está em pb_hooks/convites.pb.js.
//  Idempotente: seguro repetir.
// ════════════════════════════════════════════════════════════════════

migrate(
  (db) => {
    const dao = new Dao(db);
    const ADMIN = '@request.auth.id != "" && @collection.admins.user ?= @request.auth.id';

    // ── 1. invites ───────────────────────────────────────────────────
    let invites;
    try {
      invites = dao.findCollectionByNameOrId("invites");
    } catch (e) {
      invites = new Collection({
        name: "invites",
        type: "base",
        listRule: ADMIN,
        viewRule: ADMIN,
        createRule: ADMIN,
        updateRule: ADMIN,
        deleteRule: ADMIN,
        schema: [
          { name: "email", type: "email", required: true },
          { name: "suspended", type: "bool" },
          { name: "note", type: "text" },
        ],
        indexes: ["CREATE UNIQUE INDEX idx_invites_email ON invites (email)"],
      });
      dao.saveCollection(invites);
    }

    // ── 2. convite para todas as contas existentes ───────────────────
    try {
      const rows = arrayOf(new DynamicModel({ email: "" }));
      db.newQuery("SELECT email FROM users WHERE email != ''").all(rows);
      for (const r of rows) {
        const email = String(r.email || "").trim().toLowerCase();
        if (!email) continue;
        const n = new DynamicModel({ total: 0 });
        db.newQuery("SELECT COUNT(*) AS total FROM invites WHERE email = {:e}").bind({ e: email }).one(n);
        if (!n.total) {
          const rec = new Record(invites);
          rec.set("email", email);
          rec.set("note", "Conta já existente antes dos convites");
          dao.saveRecord(rec);
        }
      }
    } catch (e) {
      // sem utilizadores ainda
    }

    // ── 3. users: quem administra pode listar ───────────────────────
    try {
      const users = dao.findCollectionByNameOrId("users");
      const rule = "@request.auth.id = id || @collection.admins.user ?= @request.auth.id";
      users.listRule = rule;
      users.viewRule = rule;
      dao.saveCollection(users);
    } catch (e) {}

    // ── 3b. garantir um admin (se ainda não houver nenhum) ──
    //  Normalmente já foi semeado pela 1700000070; isto cobre ambientes onde
    //  as contas foram criadas depois dessa migração.
    try {
      const n = new DynamicModel({ total: 0 });
      db.newQuery("SELECT COUNT(*) AS total FROM admins").one(n);
      if (!n.total) {
        const first = new DynamicModel({ id: "" });
        db.newQuery("SELECT id FROM users ORDER BY created ASC LIMIT 1").one(first);
        if (first.id) {
          const rec = new Record(dao.findCollectionByNameOrId("admins"));
          rec.set("user", first.id);
          dao.saveRecord(rec);
        }
      }
    } catch (e) {}

    // ── 4. admins: quem administra vê todas ─────────────────────────
    try {
      const admins = dao.findCollectionByNameOrId("admins");
      const rule = '@request.auth.id != "" && (user = @request.auth.id || @collection.admins.user ?= @request.auth.id)';
      admins.listRule = rule;
      admins.viewRule = rule;
      dao.saveCollection(admins);
    } catch (e) {}
  },

  (db) => {
    const dao = new Dao(db);
    try { dao.deleteCollection(dao.findCollectionByNameOrId("invites")); } catch (e) {}
    try {
      const users = dao.findCollectionByNameOrId("users");
      users.listRule = "@request.auth.id = id";
      users.viewRule = "@request.auth.id = id";
      dao.saveCollection(users);
    } catch (e) {}
    try {
      const admins = dao.findCollectionByNameOrId("admins");
      admins.listRule = '@request.auth.id != "" && user = @request.auth.id';
      admins.viewRule = '@request.auth.id != "" && user = @request.auth.id';
      dao.saveCollection(admins);
    } catch (e) {}
  }
);
