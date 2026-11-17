/// <reference path="../pb_data/types.d.ts" />

// ════════════════════════════════════════════════════════════════════
//  Migração: Adicionar campo "quantity" à coleção books
//  NOTA: Idempotente — não falha se o campo já existir.
// ════════════════════════════════════════════════════════════════════

migrate(
  (db) => {
    const dao = new Dao(db);
    const books = dao.findCollectionByNameOrId("books");

    // Só adicionar se o campo ainda não existir
    const existing = books.schema.getFieldByName("quantity");
    if (!existing) {
      books.schema.addField(
        new SchemaField({
          name: "quantity",
          type: "number",
          required: true,
          options: {
            min: 1,
            max: null,
            noDecimal: true,
          },
        })
      );
      dao.saveCollection(books);
    }

    // Backfill: registos existentes → quantity = 1
    db.newQuery("UPDATE books SET quantity = 1 WHERE quantity IS NULL OR quantity = 0")
      .execute();
  },

  (db) => {
    const dao = new Dao(db);
    const books = dao.findCollectionByNameOrId("books");

    const field = books.schema.getFieldByName("quantity");
    if (field) {
      books.schema.removeField(field.id);
      dao.saveCollection(books);
    }
  }
);
