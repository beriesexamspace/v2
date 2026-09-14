# Berie's Exam Space v2

Nieuwe versie van beriesexamspace.com, in opbouw. Live voorbeeld (niet delen tot het af is): https://beriesexamspace.com/v2/

## Hoe we hieraan werken
- Twee bouwers, Codex en Claude Code, werken om de beurt in deze repo. Nooit tegelijk aan hetzelfde bestand.
- Elke stap is een eigen commit met de stapnaam in het bericht, bijvoorbeeld `Stap 2: gedeelde basis`.
- Voor je begint: eerst de laatste versie ophalen (`git pull`). Na je stap: alles committen en pushen.
- De bouwstappen (1, 1b, 2, 3, 4, 5, 6a, 6b, 6c) staan in Berats to-do lijst; elke stap is een aparte prompt.

## Bestandsstructuur (doel)
```
index.html            startpagina (de deur)
welkom.html           naam-scherm
hub.html              jaren + tools
jaar-1ba.html         vakken 1ste bachelor
jaar-2ba.html         vakken 2de bachelor
jaar-3ba.html         vakken 3de bachelor
vak/voorbeeld/        vak-template (index.html + data.js)
assets/style.css      gedeelde stijl
assets/app.js         gedeelde logica (nav, fade, terugknop, naam)
assets/vak.js         logica van de vakpagina
assets/vakken.js      lijst van alle vakken per jaar
```

## Stand van zaken
- Stap 1 (startpagina) en stap 2 (gedeelde basis) zijn klaar; `welkom.html` (stap 3) staat er in een eerste versie.
- Gedeelde helpers staan op `window.BES` (`naamOpslaan`, `naamOphalen`, `jaarOpslaan`, `jaarOphalen`); de losse `window.naamOpslaan` enz. blijven als alias bestaan.
- Navigatiebalk: `<nav class="navigation">` of `<nav class="nav-vol">` krijgt het Helder-gedrag (recht bovenaan, pill bij scrollen). De startpagina houdt bewust zijn eigen pill-balk.
- Kleurvariabelen: `--ink-soft`, `--grey-title`, `--accent-dark`, `--line` (#E9E7F3), `--pill`, `--font`, `--ease`; `--muted`, `--secondary`, `--radius-pill` en `--font-family` zijn aliassen daarvan.

## Regels
- Alleen HTML, CSS en vanilla JavaScript. Geen framework, geen build-stap.
- Relatieve links, zodat alles lokaal en op GitHub Pages werkt.
- De live site (beriesexamspace.github.io) wordt niet aangeraakt tot v2 klaar is.
