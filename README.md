# Berie's Exam Space v2

Nieuwe versie van beriesexamspace.com, in opbouw. Live voorbeeld (niet delen tot het af is): https://beriesexamspace.com/v2/

## Hoe we hieraan werken
- Claude Code bouwt alle stappen (sinds 14-09-2026). Codex springt alleen bij als Berat dat vraagt, in een eigen branch met een PR. Nooit tegelijk aan hetzelfde bestand.
- Elke stap is een eigen commit met de stapnaam in het bericht, bijvoorbeeld `Stap 2: gedeelde basis`.
- Voor je begint: eerst de laatste versie ophalen (`git pull`). Na je stap: alles committen en pushen.
- De bouwstappen (1, 1b, 2, 3, 4, 5, 6a, 6b, 6c) staan in Berats to-do lijst; elke stap is een aparte prompt.

## Bestandsstructuur (doel)
```
index.html            startpagina (de deur)
welkom.html           naam-scherm
aanmelden.html        account maken, één vraag per stap
inloggen.html         inloggen en herstelmail aanvragen
wachtwoord.html       wachtwoord instellen via een herstel-link
nieuw.html            eenmalig overzicht vóór de hub
hub.html              jaren + tools
jaar-1ba.html         vakken 1ste bachelor
jaar-2ba.html         vakken 2de bachelor
jaar-3ba.html         vakken 3de bachelor
whatsapp.html         uitleg en link naar de WhatsApp-groep
vak/voorbeeld/        vak-template (index.html + data.js)
assets/style.css      gedeelde stijl
assets/app.js         gedeelde logica (nav, fade, terugknop, naam)
assets/config.js      publieke Supabase-instellingen
assets/auth.js        gedeelde sessie- en accountlogica
assets/vak.js         logica van de vakpagina
assets/vakken.js      lijst van alle vakken per jaar
```

## Stand van zaken
- Klaar: stap 1 (startpagina), 2 (gedeelde basis), 3 (`welkom.html`), 4 (`hub.html`), 5 (`jaar-1ba/2ba/3ba.html`) en 6c (`assets/vakken.js`, 34 vakken). Volgende: stap 6a (vak-template) en 6b (`assets/vak.js`).
- De jaarpagina's zijn één sjabloon; alleen `data-jaar` op `<body>`, de titel en de `<h1>` verschillen. De vakkaarten linken naar de bestaande tools op de huidige site tot `v2: true` staat in `vakken.js`.
- Gedeelde kaartstijl in `style.css`: `.pagina` (binnenpagina met terugknop), `.kaart-pijl`, `.kaart-tekst`, `.kaart-titel`, `.kaart-sub`, `.pijl`, `.rooster-2`, `.sectie`, `.sectie-kop`.
- De tool-kaarten op de hub linken voorlopig naar de live site (`?leren=1` en `?deel=1`); zodra de tools in v2 staan, worden dat interne links.
- De startpagina (`index.html`) heeft bewust geen navigatiebalk en past in één schermhoogte. De getekende grijze muisaanwijzer (overgenomen uit Helder) zit in `style.css` en `app.js` en werkt op elke pagina; op touch verschijnt hij niet.
- Gedeelde helpers staan op `window.BES` (`naamOpslaan`, `naamOphalen`, `jaarOpslaan`, `jaarOphalen`); de losse `window.naamOpslaan` enz. blijven als alias bestaan.
- Navigatiebalk: `<nav class="navigation">` of `<nav class="nav-vol">` krijgt het Helder-gedrag (recht bovenaan, pill bij scrollen). De startpagina heeft geen balk.
- Kleurvariabelen: `--ink-soft`, `--grey-title`, `--accent-dark`, `--line` (#E9E7F3), `--pill`, `--font`, `--ease`; `--muted`, `--secondary`, `--radius-pill` en `--font-family` zijn aliassen daarvan.

## Regels
- Verandert een gedeeld bestand in `assets`? Verhoog dan in alle pagina's het nummer achter `?v=` (nu 6), anders zien telefoons nog tien minuten de oude versie.
- Alleen HTML, CSS en vanilla JavaScript. Geen framework, geen build-stap.
- De Supabase-client is de enige externe JavaScript-bibliotheek, vastgezet op `2.45.4` via `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js`.
- Kleurregel: blauw = doen (knoppen, links, balk), teal = bijzonder (logo, gelukt, afgerond, "Laatst gekozen"), grijs = rust. Geen andere kleuren, behalve de afgesproken subtiele rand bij een ongeldig veld.
- Relatieve links, zodat alles lokaal en op GitHub Pages werkt.
- De live site (beriesexamspace.github.io) wordt niet aangeraakt tot v2 klaar is.

## Accounts (Supabase)
1. De beheerder vult `assets/config.js` in met de project-URL en publieke anon key uit Supabase, via Settings → API. Vervang `[SUPABASE_URL]` en `[SUPABASE_ANON_KEY]`. De anon key mag publiek zijn; voeg nooit een geheime sleutel of service-role key toe.
2. Zet onder Authentication → Providers → Email de instelling "Confirm email" uit. Een nieuw account krijgt dan direct een sessie.
3. Stel in dezelfde e-mailinstellingen de minimale wachtwoordlengte in op 8 tekens en voeg geen extra tekenvereisten toe, zodat de server overeenkomt met de formulieren.
4. Stel onder Authentication → URL Configuration de Site URL in op `https://beriesexamspace.com/v2/` en voeg `https://beriesexamspace.com/v2/wachtwoord.html` toe als Redirect URL.
5. Test na het invullen aanmelden, inloggen, herstelmail, het nieuwe wachtwoord en uitloggen. Zonder ingevulde instellingen blijven accounts uitgeschakeld en kan iedereen wel oefenen. Voor herstelmail in een lokale preview moet ook de exacte lokale `wachtwoord.html`-URL in Supabase als Redirect URL zijn toegestaan.

De accountnaam staat in Supabase onder user metadata `naam` en wordt lokaal opgeslagen via `BES.naamOpslaan`. Accountvoortgang tussen toestellen valt buiten deze stap. De client wordt na `app.js` en `config.js` geladen; `auth.js` regelt de sessie en de inloglink centraal.

Een project op het instapplan kan na een week zonder voldoende gebruik pauzeren. Open dan het project in het Supabase-dashboard en kies "Resume project". Zie de [Supabase-uitleg over projectpauzes](https://supabase.com/docs/guides/platform/free-project-pausing).

De enige toegangspoort naar `nieuw.html` staat vóór het renderen in de head van `hub.html`. `bes_nieuw_gezien` wordt na "Begrepen" in zowel localStorage als sessionStorage opgeslagen. Als beide opslagmogelijkheden ontbreken of geen gegevens kunnen opslaan, blijft de hub bereikbaar om een doorverwijslus te voorkomen.
