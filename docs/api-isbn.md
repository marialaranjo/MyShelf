# APIs de ISBN

🇬🇧 [Read this in English](api-isbn.en.md)

Documentação das APIs usadas para lookup de metadados de livros.

## Fluxo

```
ISBN inserido/scaneado
        ↓
   lookupISBN(isbn)
        ↓
┌─────────────────────┐
│  1. Open Library    │ → sucesso → devolve dados
└─────────────────────┘
        ↓ falha
┌─────────────────────┐
│  2. Google Books    │ → sucesso → devolve dados
└─────────────────────┘
        ↓ falha
   devolve null
   (livro guardado com título "ISBN: XXXX", editável depois)
```

Cada chamada tem timeout de **8 segundos** via `AbortController`.

---

## Open Library API

**URL:** `https://openlibrary.org/api/books`

**Parâmetros:**
```
bibkeys=ISBN:9789720040312
format=json
jscmd=data
```

**Exemplo de resposta:**
```json
{
  "ISBN:9789720040312": {
    "title": "O Nome da Rosa",
    "authors": [{ "name": "Umberto Eco" }],
    "publishers": [{ "name": "Gradiva" }],
    "publish_date": "2004",
    "cover": {
      "medium": "https://covers.openlibrary.org/b/id/123-M.jpg"
    }
  }
}
```

**Cobertura:** Boa para livros anglo-saxónicos e clássicos. Limitada para livros portugueses recentes.

**Rate limit:** Sem limite documentado. Uso justo.

---

## Google Books API

**URL:** `https://www.googleapis.com/books/v1/volumes`

**Parâmetros (ISBN):**
```
q=isbn:9789720040312
```

**Parâmetros (texto):**
```
q=Umberto Eco nome rosa
maxResults=8
```

**Exemplo de resposta:**
```json
{
  "totalItems": 1,
  "items": [{
    "volumeInfo": {
      "title": "O Nome da Rosa",
      "authors": ["Umberto Eco"],
      "publisher": "Gradiva",
      "publishedDate": "2004-01-01",
      "imageLinks": {
        "thumbnail": "http://books.google.com/books/content?id=..."
      },
      "industryIdentifiers": [
        { "type": "ISBN_13", "identifier": "9789720040312" }
      ]
    }
  }]
}
```

**Cobertura:** Melhor cobertura que Open Library, incluindo livros portugueses.

**Rate limit:** 1000 requests/dia sem chave API. Suficiente para uso pessoal.

**Nota:** As URLs das capas são `http://` — a app converte automaticamente para `https://`.

---

## Pesquisa por título/autor

Usa a Google Books API com query de texto livre:

```
GET https://www.googleapis.com/books/v1/volumes?q=Winnicott+playing+reality&maxResults=8
```

Devolve até 8 resultados ordenados por relevância. O utilizador escolhe o livro correcto da lista.
