# WoW Classic Era – Schmiedekunst Rezepte

Statische GitHub-Pages-Seite zur Verwaltung deiner Schmiedekunst-Rezepte (Classic Era).

## Aktueller Stand

- Kategorien als Kacheln: **Waffen**, **Rüstung**, **Materialien**
- Status pro Rezept: **gelernt (grün)** / **nicht gelernt (grau)**
- Hover-/Fokus-Effekt: aktive Karte wird heller
- Filter: Suche, Status, Quelle, **Art**
- Wowhead-Item-Link pro Rezept
- Zusätzliche Metadaten: **Min. Lvl**, **Item Slot**, **Quelle**, **Art**
- Standard-Sortierung: **Min. Stufe absteigend** (höchste zuerst)
- Export von `learned.json` für Commit ins Repo

## Empfohlener Workflow (GitHub)

1. Rezepte auf der Seite abhaken.
2. `learned.json exportieren` klicken.
3. Datei nach `data/learned.json` kopieren und committen.
4. GitHub Pages deployed automatisch die neue Version.

## Nächste sinnvolle Schritte

1. **Echte Rezeptliste importieren**
   - Daten in `data/recipes.json` eintragen (Name, Item-ID/Link, Min. Stufe, Quelle, Kategorie).
2. **Datenpflege vereinfachen**
   - Optional: kleines Skript ergänzen, das CSV -> `recipes.json` konvertiert.
3. **Qualitätssicherung**
   - JSON-Validierung im CI-Workflow (GitHub Actions) ergänzen.
4. **Benutzerführung**
   - Optional: Badge "lokale Änderungen nicht committet" ergänzen.

## Datenformat

### `data/recipes.json`

```json
{
  "recipes": [
    {
      "id": "item:2844",
      "name": "Kupferaxt",
      "skill": 1,
      "difficulty": "Orange/Gelb/Grün/Grau: 1/35/55/75",
      "category": "Waffen",
      "source": "Trainer",
      "wowheadUrl": "https://www.wowhead.com/classic/de/item=2844"
    }
  ]
}
```

### `data/learned.json`

```json
{
  "learned": ["item:2844"]
}
```
