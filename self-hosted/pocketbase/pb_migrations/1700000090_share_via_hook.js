/// <reference path="../pb_data/types.d.ts" />

// O token de partilha deixa de abrir as coleções "books" e "libraries".
//
// A estante pública passa a ser servida por /api/partilha/:token
// (pb_hooks/partilha.pb.js), que só devolve os campos seguros. Com a regra
// antiga (1700000060), quem tivesse o link podia pedir qualquer campo,
// incluindo notas, preço, empréstimos e sessões de leitura.
//
// Ficam só as regras de dono: cada pessoa vê os seus registos.

migrate((db) => {
  const dao = new Dao(db);
  const ownerRule = '@request.auth.id != "" && owner = @request.auth.id';
  for (const name of ["books", "libraries"]) {
    const col = dao.findCollectionByNameOrId(name);
    col.listRule = ownerRule;
    col.viewRule = ownerRule;
    dao.saveCollection(col);
  }
}, (db) => {
  // reverter: volta a aceitar o token nas regras (comportamento de 1700000060)
  const dao = new Dao(db);
  const ownerRule = '@request.auth.id != "" && owner = @request.auth.id';
  const shareOr = "(@collection.shares.token = @request.query.token && @collection.shares.owner = owner && @collection.shares.active = true)";
  for (const name of ["books", "libraries"]) {
    const col = dao.findCollectionByNameOrId(name);
    col.listRule = `${ownerRule} || ${shareOr}`;
    col.viewRule = `${ownerRule} || ${shareOr}`;
    dao.saveCollection(col);
  }
});
