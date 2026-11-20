"""Baut site/laeufe/1..3 aus den drei Webkarten in run2, run3, run4.

Jede Kopie bekommt genau eine zusätzliche Zeile vor </head>, die den Vergleich (Reiter Lauf 1 | 2 | 3) lädt.
Die Originale in run2/, run3/, run4/ werden nur gelesen.
Aufruf aus dem Projektordner:  python3 werkzeug/baue.py
"""
from pathlib import Path

WURZEL = Path(__file__).resolve().parent.parent
LAEUFE = {1: "run2", 2: "run3", 3: "run4"}   # Lauf 1 = TEST_02, Lauf 2 = TEST_03, Lauf 3 = TEST_04
ZEILE = ('<link rel="stylesheet" href="../../vergleich/vergleich.css">'
         '<script src="../../vergleich/vergleich.js" defer></script>\n')

for n, ordner in LAEUFE.items():
    quellen = sorted((WURZEL / ordner).glob("*.html"))
    if len(quellen) != 1:
        raise SystemExit(f"{ordner}: genau eine HTML-Datei erwartet, gefunden {len(quellen)}")
    html = quellen[0].read_text(encoding="utf-8")
    i = html.find("</head>")
    if i < 0:
        raise SystemExit(f"{quellen[0]}: kein </head>")
    ziel = WURZEL / "site" / "laeufe" / str(n) / "kombi.html"
    ziel.parent.mkdir(parents=True, exist_ok=True)
    ziel.write_text(html[:i] + ZEILE + html[i:], encoding="utf-8")
    # Die Karte fragt beim Start nach einer Verzeichnisliste von daten/; ohne Ordner gibt das einen 404 in der Konsole.
    # Eine leere Seite ist keine Verzeichnisliste: Die Karte nimmt dann wie vorher die eingebetteten Daten.
    (ziel.parent / "daten").mkdir(exist_ok=True)
    (ziel.parent / "daten" / "index.html").write_text(
        '<!doctype html><meta charset="utf-8"><title>daten</title><p>Daten sind in kombi.html eingebettet.</p>\n', encoding="utf-8")
    print(f"Lauf {n}: {quellen[0].relative_to(WURZEL)} -> {ziel.relative_to(WURZEL)} ({ziel.stat().st_size / 1e6:.1f} MB)")
