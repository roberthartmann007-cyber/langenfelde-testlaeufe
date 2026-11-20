# Langenfelde: Vergleich der drei Testläufe

Statische Seite, die die Empfehlung (Kapitel „Konzept“) von drei Testläufen der Webkarte nebeneinanderstellt.
Auf jeder Folie dieses Kapitels stehen oben rechts am Kartenbild drei Reiter: **Lauf 1 | Lauf 2 | Lauf 3**.
Ein Reiter öffnet dieselbe Folie (gezählt innerhalb des Kapitels) im anderen Lauf.

| Reiter | Quelle im Projekt | Ursprung |
|---|---|---|
| Lauf 1 | `run2/2026-11-20_langenfelde_webkarte.html` | TEST_02 |
| Lauf 2 | `run3/S-Langenfelde_Webkarte.html` | TEST_03 |
| Lauf 3 | `run4/2026-11-20_langenfelde_webkarte.html` | TEST_04 |

## Aufbau

```
run2/ run3/ run4/          Originale der drei Webkarten (nur gelesen)
werkzeug/baue.py           baut site/laeufe/1..3 aus den Originalen
site/                      die fertige Seite (wird so auf Cloudflare Pages ausgeliefert)
  index.html               Übersicht mit den drei Läufen
  laeufe/<n>/kombi.html    Kopie der Webkarte + eine Zeile, die den Vergleich lädt
  laeufe/<n>/daten/        leere Seite, damit die Karte ihre eingebetteten Daten nimmt
  vergleich/vergleich.js   Reiter, Sprung an die Folie, Hinweis bei fehlender Folie
  vergleich/vergleich.css  Aussehen der Reiter (#6470FF)
  _headers, 404.html       Einstellungen für Cloudflare Pages
wrangler.toml              Cloudflare Pages: Ausgabeordner site/
```

Adresse einer Folie: `laeufe/<n>/kombi.html#tour=empfehlung&s=<folie>`.
Hat ein Lauf weniger Folien im Kapitel, zeigt er seine letzte und den Hinweis „Lauf n hat hier keine Folie …“.

### Änderungen an der Karte

Keine. `tour.js` in den Kopien ist unverändert. Der Vergleich nutzt nur, was die Karte schon anbietet
(`TOUR.start`, `TOUR.zeige`, `TOUR.folie`, `TD`, `BEREIT`, `willkommen`). Jede Kopie hat genau eine Zeile mehr vor `</head>`.

## Neu bauen

```bash
python3 werkzeug/baue.py
```

## Lokal ansehen

```bash
python3 -m http.server 8765 --directory site
```

Dann <http://localhost:8765/> öffnen.

## Veröffentlichen

### GitHub

```bash
git remote add origin https://github.com/roberthartmann007-cyber/langenfelde-testlaeufe.git
git push -u origin main
```

Die drei Karten sind 2,6 bis 5,6 MB groß und liegen unter den Grenzen von GitHub (100 MB je Datei) und Cloudflare Pages (25 MB je Datei).

### Cloudflare Pages

**Über GitHub (empfohlen):** Cloudflare Dashboard → Workers & Pages → Create → Import a repository → Repository wählen. Deploy command: `npx wrangler deploy` (Vorgabe). `wrangler.toml` liefert `site/` als statische Dateien aus.


**Direkt von diesem Rechner:**

```bash
npx wrangler deploy
```

Die Seite enthält `noindex`. Wenn sie nicht öffentlich sein soll, im Dashboard unter
Zero Trust → Access eine Anwendung für die Pages-Adresse anlegen (z. B. Zugang nur per E-Mail-Code).
