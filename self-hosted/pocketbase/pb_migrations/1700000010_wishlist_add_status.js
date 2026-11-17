/// <reference path="../pb_data/types.d.ts" />

// ─────────────────────────────────────────────────────────
// Migração: adicionar campo `status` à coleção `wishlist`
// ─────────────────────────────────────────────────────────
// Suporta o fluxo de sub-tabs na Wishlist:
//   desejado → comprado → adicionado
//
// Valores possíveis (validados no frontend):
//   • "desejado"   — ainda na lista de compra (default)
//   • "comprado"   — já comprado, à espera de chegar à estante
//   • "adicionado" — já entrou para a colecção `books`
//
// Campo opcional sem `required: true` para garantir
// compatibilidade com registos pré-existentes — qualquer wish
// sem `status` é tratada como "desejado" no frontend
// (`(w.status||'desejado')`).
// ─────────────────────────────────────────────────────────

migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("wishlist");

  // Idempotência: não duplicar se a migration já correu
  if (collection.schema.getFieldByName("status")) {
    return;
  }

  collection.schema.addField(new SchemaField({
    name: "status",
    type: "text",
    required: false,
  }));

  dao.saveCollection(collection);

  // Backfill: marcar todos os registos existentes como "desejado"
  // (mantém compatibilidade com dados criados antes desta migration)
  const records = dao.findRecordsByExpr("wishlist", $dbx.exp("status = '' OR status IS NULL"));
  for (const r of records) {
    r.set("status", "desejado");
    dao.saveRecord(r);
  }

}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("wishlist");
  const field = collection.schema.getFieldByName("status");
  if (field) {
    collection.schema.removeField(field.id);
    dao.saveCollection(collection);
  }
});
