# ISBN APIs

🇵🇹 [Ler em português](api-isbn.md)

Documentation for the APIs used to look up book metadata.

## Flow

```
ISBN entered/scanned
        ↓
   lookupISBN(isbn)
        ↓
┌─────────────────────┐
│  1. Open Library    │ → success → returns data
└─────────────────────┘
        ↓ failure
┌─────────────────────┐
│  2. Google Books    │ → success → returns data
└─────────────────────┘
        ↓ failure
   returns null
   (book saved with title "ISBN: XXXX", editable afterwards)
```

Each call has an **8-second** timeout via `AbortController`.

---

## Open Library API

**URL:** `https://openlibrary.org/api/books`

**Parameters:**
```
bibkeys=ISBN:9789720040312
format=json
jscmd=data
```

**Example response:**
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

**Coverage:** Good for English-language and classic titles. Limited for recent Portuguese titles.

**Rate limit:** No documented limit. Fair use.

---

## Google Books API

**URL:** `https://www.googleapis.com/books/v1/volumes`

**Parameters (ISBN):**
```
q=isbn:9789720040312
```

**Parameters (text):**
```
q=Umberto Eco nome rosa
maxResults=8
```

**Example response:**
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

**Coverage:** Better coverage than Open Library, including Portuguese titles.

**Rate limit:** 1000 requests/day without an API key. Enough for personal use.

**Note:** Cover URLs come back as `http://` — the app automatically upgrades them to `https://`.

---

## Title/author search

Uses the Google Books API with a free-text query:

```
GET https://www.googleapis.com/books/v1/volumes?q=Winnicott+playing+reality&maxResults=8
```

Returns up to 8 results ranked by relevance. The user picks the correct book from the list.
