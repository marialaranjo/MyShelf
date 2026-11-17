/// <reference path="../pb_data/types.d.ts" />

// ─────────────────────────────────────────────────────────
// Migração: coleção "shares" — link público de partilha da coleção
// ─────────────────────────────────────────────────────────
// Cada utilizador pode gerar um "token" (frontend usa crypto.randomUUID())
// que dá acesso de leitura pública, sem autenticação, aos SEUS books/
// libraries — só aos campos que o frontend pede explicitamente via
// ?fields= na vista pública (notas e preço nunca são pedidos aí).
//
// A coleção `shares` em si fica sempre privada (só o dono a lista/edita/
// apaga); serve de "join" dentro das regras de books/libraries via
// @collection.shares.<campo>, sem precisar de expor a shares em si.
// Revogar o link = apagar o registo aqui.
// ─────────────────────────────────────────────────────────

migrate((db) => {
  const dao = new Dao(db);

  const ownerOnlyRule = "@request.auth.id != '' && owner = @request.auth.id";
  const shares = new Collection({
    name: "shares",
    type: "base",
    listRule:   ownerOnlyRule,
    viewRule:   ownerOnlyRule,
    createRule: ownerOnlyRule,
    updateRule: ownerOnlyRule,
    deleteRule: ownerOnlyRule,
    schema: [
      { name: "owner",  type: "text", required: true },
      { name: "token",  type: "text", required: true },
      { name: "active", type: "bool" },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_shares_token ON shares (token)",
      "CREATE INDEX idx_shares_owner ON shares (owner)",
    ],
  });
  dao.saveCollection(shares);

  // Acrescenta, às regras já existentes (dono autenticado), a hipótese de
  // um pedido público com ?token= de um share ativo do dono do registo.
  const ownerRule = '@request.auth.id != "" && owner = @request.auth.id';
  const shareOr = "(@collection.shares.token = @request.query.token && @collection.shares.owner = owner && @collection.shares.active = true)";
  for (const name of ["books", "libraries"]) {
    const col = dao.findCollectionByNameOrId(name);
    col.listRule = `${ownerRule} || ${shareOr}`;
    col.viewRule = `${ownerRule} || ${shareOr}`;
    dao.saveCollection(col);
  }
}, (db) => {
  const dao = new Dao(db);
  const ownerRule = '@request.auth.id != "" && owner = @request.auth.id';
  for (const name of ["books", "libraries"]) {
    try {
      const col = dao.findCollectionByNameOrId(name);
      col.listRule = ownerRule;
      col.viewRule = ownerRule;
      dao.saveCollection(col);
    } catch (e) { /* coleção inexistente neste ambiente */ }
  }
  try {
    const shares = dao.findCollectionByNameOrId("shares");
    dao.deleteCollection(shares);
  } catch (e) { /* já não existe */ }
});
