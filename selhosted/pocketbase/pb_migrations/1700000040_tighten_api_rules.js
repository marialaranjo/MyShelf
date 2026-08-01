/// <reference path="../pb_data/types.d.ts" />

// ─────────────────────────────────────────────────────────
// Migração: apertar as regras de API (controlo de acesso)
// ─────────────────────────────────────────────────────────
// Define List/View/Create/Update/Delete em cada coleção, de
// forma que cada utilizador só acede aos SEUS registos.
//
// CORRE DEPOIS do backfill (1700000030_...), porque o filtro
// "owner = @request.auth.id" só faz sentido com owner já
// preenchido. A ordem é garantida pelo timestamp do nome.
//
// IMPORTANTE: aplicar isto remove o acesso público anónimo que
// existia (regras vazias). A partir daqui, sem token → 401.
// ─────────────────────────────────────────────────────────

migrate((db) => {
  const dao = new Dao(db);

  // Regra única para as coleções de dados: tem de estar autenticado
  // E ser o dono do registo.
  const ownerRule = '@request.auth.id != "" && owner = @request.auth.id';

  for (const name of ["books", "libraries", "wishlist", "loans"]) {
    let col;
    try {
      col = dao.findCollectionByNameOrId(name);
    } catch (e) {
      continue; // coleção inexistente neste ambiente
    }
    col.listRule   = ownerRule;
    col.viewRule   = ownerRule;
    col.createRule = ownerRule;
    col.updateRule = ownerRule;
    col.deleteRule = ownerRule;
    dao.saveCollection(col);
  }

  // Coleção auth `users`: cada um só se vê/edita a si próprio.
  // O createRule NÃO é tocado — o registo via OAuth é gerido pelo
  // próprio fluxo auth-with-oauth2, e mexer aqui pode partir o login.
  try {
    const users = dao.findCollectionByNameOrId("users");
    const selfRule = "@request.auth.id = id";
    users.listRule   = selfRule;
    users.viewRule   = selfRule;
    users.updateRule = selfRule;
    users.deleteRule = selfRule;
    // users.createRule → deixado como está, de propósito.
    dao.saveCollection(users);
  } catch (e) {
    // sem coleção users neste ambiente
  }

}, (db) => {
  // Reversão: repor as regras vazias REABRE o acesso público.
  // Por segurança, esta migração não reverte automaticamente.
  // Se precisares mesmo de reverter, fá-lo à mão no painel /_/.
});
