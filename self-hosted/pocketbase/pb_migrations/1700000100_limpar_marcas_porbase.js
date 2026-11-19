/// <reference path="../pb_data/types.d.ts" />

// Limpa as marcas «?» que vieram da PORBASE nos títulos já gravados.
//
// A PORBASE marca o artigo a ignorar na ordenação alfabética e a marca chega
// convertida em «?»: «?A ?menina do mar». Desde esta versão o lookup já limpa
// os livros novos (app.js, lookupPorbase); esta migração trata dos antigos,
// em "books" e "wishlist".
//
// Só remove um «?» no início do título ou depois de um espaço quando vem
// colado a uma palavra. Um «?» no fim («Quem sou eu?») fica.
// Não há volta atrás automática (down vazio): os títulos antigos estavam errados.

migrate((db) => {
  const dao = new Dao(db);
  const marca = /(^|\s)\?(?=[^\s?])/;
  const marcas = /(^|\s)\?(?=[^\s?])/g;
  for (const name of ["books", "wishlist"]) {
    let recs = [];
    try { recs = dao.findRecordsByExpr(name); } catch (_) { continue; }
    for (const r of recs) {
      const t = r.getString("title");
      if (!t || !marca.test(t)) continue;
      r.set("title", t.replace(marcas, "$1"));
      try { dao.saveRecord(r); } catch (_) { /* registo inválido por outro motivo: deixa como está */ }
    }
  }
}, (db) => {});
