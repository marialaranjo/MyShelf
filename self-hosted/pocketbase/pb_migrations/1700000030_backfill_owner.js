/// <reference path="../pb_data/types.d.ts" />

// ─────────────────────────────────────────────────────────
// Migração: backfill do campo `owner` nos registos antigos
// ─────────────────────────────────────────────────────────
// Livros/bibliotecas/wishlist/empréstimos criados antes de existir
// login OAuth ficaram com `owner` vazio. A migração seguinte
// (1700000040_tighten_api_rules.js) exige owner = @request.auth.id
// em list/view/update/delete — um registo com owner vazio nunca
// bate certo com essa regra e fica invisível/inacessível para sempre
// via API (o admin em /_/ continua a ver tudo, porque bypassa regras).
//
// Esta app é de uso pessoal (um único utilizador até à data desta
// migração), por isso atribuímos os registos órfãos ao primeiro
// utilizador existente na coleção `users`. Idempotente: corre em
// registos com owner vazio, portanto é seguro repetir.
// ─────────────────────────────────────────────────────────

migrate((db) => {
  const dao = new Dao(db);

  let user;
  try {
    user = new DynamicModel({ id: "" });
    db.newQuery("SELECT id FROM users ORDER BY created ASC LIMIT 1").one(user);
  } catch (e) {
    return; // sem coleção `users` ou sem utilizadores ainda — nada a fazer
  }
  if (!user.id) return;

  for (const name of ["books", "libraries", "wishlist", "loans"]) {
    try {
      dao.findCollectionByNameOrId(name);
    } catch (e) {
      continue; // coleção inexistente neste ambiente
    }
    db.newQuery(`UPDATE ${name} SET owner = {:owner} WHERE owner IS NULL OR owner = ''`)
      .bind({ owner: user.id })
      .execute();
  }
}, (db) => {
  // Reversão: não é possível distinguir com segurança quais registos tinham
  // owner vazio antes do backfill, por isso não revertemos automaticamente.
});
