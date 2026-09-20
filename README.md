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
aanmelden.html        account maken, één vraag per stap
inloggen.html         inloggen en herstelmail aanvragen
wachtwoord.html       wachtwoord instellen via een herstel-link
nieuw.html            highlights-carrousel na iedere nieuwe login, vóór de hub
hub.html              jaren + tools
over-mij.html         kennismaking, sociale links en het ontstaan van de site
profiel.html          naam, e-mailadres, profielfoto, wachtwoord en studiekalender
jaar-1ba.html         vakken 1ste bachelor
jaar-2ba.html         vakken 2de bachelor
jaar-3ba.html         vakken 3de bachelor
whatsapp.html         uitleg en link naar de WhatsApp-groep
feedback.html         feedback sturen (fout in een vraag, idee, iets anders) naar de tabel feedback
leren.html            leren leren: slim studeren, concentratie en hulplijnen; gelinkt vanaf de hub (Tools) en boven elk tabblad Studie-hacks
privacy.html          wat we bewaren, waar, cookies, rechten en contact; gelinkt in elke voettekst en onder het aanmeldformulier
beheer.html           alleen voor de beheerder: hoeveel accounts per dag oefenden (aantallen, geen namen)
404.html              nette foutpagina van GitHub Pages; gebruikt absolute paden /v2/ (bij de lancering aanpassen)
manifest.webmanifest  naam, kleuren en iconen voor "Zet op beginscherm" (Android); Safari gebruikt de apple-touch-icon
vak/voorbeeld/        vak-template (index.html + data.js)
assets/style.css      gedeelde stijl
assets/app.js         gedeelde logica (nav, fade, terugknop, naam)
assets/config.js      publieke Supabase-instellingen
assets/auth.js        gedeelde sessie- en accountlogica
assets/vak.css        aanvullende stijl van de vakpagina
assets/vak.js         logica van de vakpagina
assets/vakken.js      lijst van alle vakken per jaar
assets/updates.js     updates voor de sectie Wat is nieuw op de hub
assets/highlights.css gedeelde stijl van de highlights-carrousel (welkomstscherm en Hoe werkt het op de hub)
assets/highlights.js  bouwt de carrousel: BES.highlights(element, { metNieuw, kopniveau, bijLaatste })
assets/icoon-*.png    beginscherm-iconen (180 Apple, 192 en 512 manifest); assets/deel.png is het deelvoorbeeld (1200x630) voor WhatsApp en co
assets/activiteit.js  persoonlijke dagtotalen, bezoeksessies en studiekalender
assets/kalender.css   aanvullende stijl voor de studiekalender
supabase/studieactiviteit.sql optionele accountopslag voor de studiekalender
supabase/account-en-beheer.sql account_verwijderen(), tabel beheerders, studie_dagcijfers() en studie_totalen() (uitgevoerd op 20-09-2026)
lancering/maak-doorsturen.js maakt doorstuurpagina's voor de oude vaklinks; uitvoer lancering/doorsturen/ staat niet in git en gaat pas bij de lancering naar de oude site
referentie/comit-schetsen.html drie schetsen van de mascotte Comit met vier bewegingen, niet gelinkt, alleen om te kiezen
referentie/comit-pixel/ Comit als pixel-poppetje: raster + palet in comit-pixel.js (bron voor SVG op de site en voor PNG via node maak-png.js), voorbeeldpagina index.html; trainingspak wit in licht, zwart in donker
```

## Stand van zaken
- Klaar: startpagina, gedeelde basis, accounts, hub, drie jaarpagina's, vak-template en oefenlogica. Het voorbeeldvak bevat 14 vragen, waaronder twee vragen met meerdere te kiezen antwoorden. Alle 34 vakken in `assets/vakken.js` hebben een eigen map met overgezette inhoud; Sociologie I (19-09-2026) gebruikt het formaat met meerdere antwoorden (`a: [..]` en `kies: 'fout'`), en vragen met één antwoord maar meer dan vijf opties staan daar als lijst met één index.
- De jaarpagina's zijn één sjabloon; alleen `data-jaar` op `<body>`, de titel en de `<h1>` verschillen. De vakkaarten linken naar de bestaande tools op de huidige site tot `v2: true` staat in `vakken.js`.
- Gedeelde kaartstijl in `style.css`: `.pagina` (binnenpagina met terugknop), `.kaart-pijl`, `.kaart-tekst`, `.kaart-titel`, `.kaart-sub`, `.pijl`, `.rooster-2`, `.sectie`, `.sectie-kop`.
- Reken je punten en Examen-info staan nu in v2 (`reken.html` en `examen-info.html`), bereikbaar via de tool-kaarten op de hub.
- De startpagina (`index.html`) heeft bewust geen navigatiebalk en past in één schermhoogte. De getekende muisaanwijzer (overgenomen uit Helder) zit in `style.css` en `app.js`; hij kiest zwart of wit op basis van de tekst die hij raakt (lichte tekst = zwarte bol, donkere tekst = witte bol, ook als de bol de tekst maar half raakt) en anders op basis van de berekende achtergrondkleur onder de muis, inclusief transparante bovenliggende vlakken. Op touch verschijnt hij niet.
- Gedeelde helpers staan op `window.BES` (`naamOpslaan`, `naamOphalen`, `jaarOpslaan`, `jaarOphalen`); de losse `window.naamOpslaan` enz. blijven als alias bestaan.
- Navigatiebalk: `<nav class="navigation">` of `<nav class="nav-vol">` staat bovenaan gecentreerd met zijmarges en wordt bij scrollen een pill. De ruststand is maximaal 1160 px breed, de zwevende stand maximaal 1100 px. De startpagina heeft geen balk. Elke binnenpagina heeft naast het logo een Home-knop naar de hub. Op `profiel.html` houdt `data-nav="vast"` de balk stil. Uitloggen staat onder Opslaan op Profiel; de bestaande uitloglink op de startpagina blijft werken. De logolink blijft naar de startpagina wijzen.
- Kleurvariabelen: `--ink-soft`, `--grey-title`, `--accent-dark`, `--line` (#E9E7F3), `--pill`, `--font`, `--ease`; `--muted`, `--secondary`, `--radius-pill` en `--font-family` zijn aliassen daarvan.

## Regels
- Verandert een gedeeld bestand in `assets`? Verhoog dan in alle pagina's het nummer achter `?v=` (nu 23), anders zien telefoons nog tien minuten de oude versie.
- Alleen HTML, CSS en vanilla JavaScript. Geen framework, geen build-stap.
- De Supabase-client is de enige externe JavaScript-bibliotheek, vastgezet op `2.45.4` via `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js`.
- Kleurregel: blauw = doen (knoppen, links, balk), teal = bijzonder (logo, gelukt, afgerond, "Laatst gekozen"), grijs = rust. Rood is alleen voor de afgesproken foutmarkering bij een ongeldig veld of onjuist antwoord.
- Relatieve links, zodat alles lokaal en op GitHub Pages werkt.
- De live site (beriesexamspace.github.io) wordt niet aangeraakt tot v2 klaar is.

Elke regel in `assets/updates.js` heeft `soort: 'nieuw'` of `soort: 'verbeterd'`, een datum en tekst. De hub toont eerst vier regels; bij meer regels wisselt de knop tussen Alles bekijken en Minder tonen. Het updatescherm na inloggen toont altijd alle regels. Beide gebruiken dezelfde labels en veilige tekstweergave.

In `assets/updates.js` mogen korte belangrijke stukjes in `tekst` tussen `**dubbele sterretjes**` staan. Ze verschijnen als vetgedrukte tekst op de hub en het updatescherm. De rest blijft gewone tekst; HTML wordt niet uitgevoerd. Gebruik nadruk voor de naam van een veranderd onderdeel, niet voor hele alinea's.

Hover volgt de werkelijk gebruikte invoer via `html.has-hover`: muisbewegingen schakelen de effecten in, aanraken schakelt ze uit. Dit werkt ook in ingebouwde browsers die geen hovermogelijkheid melden. Knoppen bewegen maximaal 2 px met een kleine vergroting; bij verminderde beweging blijven alleen kleur en schaduw veranderen.

## Accounts (Supabase)
1. De beheerder vult `assets/config.js` in met de project-URL en publieke anon key uit Supabase, via Settings → API. Vervang `[SUPABASE_URL]` en `[SUPABASE_ANON_KEY]`. De anon key mag publiek zijn; voeg nooit een geheime sleutel of service-role key toe.
2. Zet onder Authentication → Providers → Email de instelling "Confirm email" uit. Een nieuw account krijgt dan direct een sessie.
3. Stel in dezelfde e-mailinstellingen de minimale wachtwoordlengte in op 8 tekens en voeg geen extra tekenvereisten toe, zodat de server overeenkomt met de formulieren.
4. Stel onder Authentication → URL Configuration de Site URL in op `https://beriesexamspace.com/v2/` en voeg `https://beriesexamspace.com/v2/wachtwoord.html` toe als Redirect URL.
5. Test na het invullen aanmelden, inloggen, herstelmail, het nieuwe wachtwoord en uitloggen. Zonder ingevulde instellingen blijven accounts uitgeschakeld en kan iedereen wel oefenen. Voor herstelmail in een lokale preview moet ook de exacte lokale `wachtwoord.html`-URL in Supabase als Redirect URL zijn toegestaan.

Nieuwe accounts bewaren `voornaam`, `achternaam` en de optionele `bijnaam` in Supabase user metadata. `naam` blijft de volledige naam voor bestaande koppelingen. `BES.auth.naamGegevens(user)` geeft de volledige naam en aanspreeknaam terug; `BES.naamOpslaan` bewaart de bijnaam of voornaam. Alleen Profiel toont de volledige naam. Een oude, ongesplitste naam wordt niet automatisch verdeeld en blijft op Profiel behouden; de hub gebruikt daarvoor een algemene begroeting totdat de gebruiker de losse velden invult. Bestaande gebruikers hoeven naamvelden niet opnieuw in te vullen om hun wachtwoord of e-mailadres te wijzigen.

De client wordt na `app.js` en `config.js` geladen; `auth.js` regelt de sessie en de inloglink centraal. `BES.auth.client` geeft de bestaande Supabase-client door aan de vakpagina. Voortgang tussen toestellen werkt voor ingelogde gebruikers na het aanmaken van de tabel en toegangsregels onder "Vakpagina".

### Inloggen met Google

`aanmelden.html` en `inloggen.html` hebben de knop "Verder met Google" (`BES.auth.metGoogle()`). De knop controleert eerst of de provider aanstaat; zolang dat niet zo is, toont hij de rode regel "Inloggen met Google is nog niet ingeschakeld." en blijft de gebruiker op de pagina. Na een geslaagde login komt de gebruiker terug op `inloggen.html?google=terug`, waarna de bestaande logica hem naar de hub stuurt (en dus eerst langs `nieuw.html`). Ontbreken voornaam en achternaam, dan neemt `auth.js` ze één keer over uit de naam die Google meegeeft. De profielfoto van Google wordt niet overgenomen.

Eenmalig inrichten door de eigenaar:
1. Google Cloud Console (console.cloud.google.com): nieuw project, "APIs & Services" → "OAuth consent screen" (extern, app-naam Berie's Exam Space, je e-mailadres), daarna "Credentials" → "Create credentials" → "OAuth client ID", type "Web application".
2. Bij "Authorized redirect URIs" de callback-URL plakken die Supabase toont onder Authentication → Providers → Google (eindigt op `/auth/v1/callback`).
3. Client ID en Client Secret in Supabase bij de Google-provider plakken, de provider aanzetten, Save.
4. Supabase → Authentication → URL Configuration → Redirect URLs: `https://beriesexamspace.com/v2/inloggen.html?google=terug` toevoegen (en voor de zekerheid `https://beriesexamspace.com/v2/**`).
5. Testen met een Google-account dat nog geen Berie-account heeft: knop, Google-scherm, terug op de site, "Wat is nieuw", hub met voornaam, en op Profiel de naam.

### E-mailadres wijzigen

Profiel gebruikt de bestaande `auth.updateUser`-functie. De gebruikers-ID blijft gelijk. De bevestiging volgt de huidige Supabase-instellingen; schakel beveiligde e-mailwijziging niet uit. Zolang de provider een `new_email` teruggeeft, meldt Profiel dat bevestiging nodig is. Alleen `user.email` geldt als het bevestigde adres.

Voeg voor deze flow `https://beriesexamspace.com/v2/profiel.html?email=bevestigen` toe aan de toegestane redirect-URL's in Supabase. Voor een echte lokale test is ook de exacte lokale URL nodig. De wijziging in deze PR voert geen configuratie-aanpassing of e-mailverzending uit. Browsercontroles gebruiken een nagebootste auth-provider; een echte bevestigingsmail, inclusief eventuele bevestiging via het oude adres, moet na inrichting met een testaccount worden gecontroleerd.

Een project op het instapplan kan na een week zonder voldoende gebruik pauzeren. Open dan het project in het Supabase-dashboard en kies "Resume project". Zie de [Supabase-uitleg over projectpauzes](https://supabase.com/docs/guides/platform/free-project-pausing).

Na een geslaagde aanmelding of login wordt `sessionStorage.bes_nieuw_gezien` gewist en opent `nieuw.html`. Uitloggen wist de sleutel ook. De toegangspoort in de head van `hub.html` controleert uitsluitend sessionStorage; oude waarden in localStorage worden niet meer gebruikt. "Begrepen →" bewaart de sleutel voor deze browsersessie en opent de hub, met behoud van een eventuele sectiehash. Tijdens dezelfde sessie verschijnt het scherm niet opnieuw bij paginawissels. Een nieuwe login toont de updates opnieuw. Als sessionStorage geblokkeerd is, blijft de hub bereikbaar om een doorverwijslus te voorkomen.

`nieuw.html` is sinds 20-09-2026 een highlights-carrousel (vijf dia's: Vakken, Examensimulatie, twee keer Hoe werkt het, Wat is nieuw). Hij loopt vanzelf door (8 seconden per dia, balkje vult zich), stopt bij de pauzeknop, bij een verborgen tabblad en bij "prefers-reduced-motion", en laat zich swipen, scrollen, met de pijltoetsen en via de stippen bedienen. De beelden zijn getekende telefoons in gewone opmaak (geen screenshots van de site). "Begrepen →" wordt actief zodra de laatste dia in beeld is geweest. Het welkomstscherm heeft bewust geen navigatiebalk (alleen de losse themaknop); "Begrepen →" zet ook `sessionStorage.bes_nav_intro`, waarna `hub.html` die sleutel meteen wist en de klasse `nav-intro` op `<html>` zet, zodat de balk daar één keer van boven binnenschuift (`nav-binnen`, niet bij "prefers-reduced-motion"). Vaste regel: geen `scroll-snap-stop: always` op de dia's, anders stopt een sprong over meerdere dia's halverwege.

De licht/donkerkeuze staat in `localStorage.bes_thema` (`licht` of `donker`). Zonder keuze volgt de pagina het systeem. Bij ingelogde accounts wordt de keuze ook opgeslagen in `user_metadata.thema`; de accountkeuze wordt toegepast zodra de sessie geladen is. Het kleine script vóór de stylesheet past de lokaal bekende keuze al vóór het eerste beeld toe. Op een nieuw toestel kan de accountkeuze pas worden toegepast zodra de accountgegevens beschikbaar zijn. `BES.themaToepassen()` past een keuze toe en bewaart die lokaal.

### Profielfoto's inschakelen

Voer onderstaande SQL één keer uit via **SQL Editor → Run**. De bucket is publiek leesbaar zodat avatars kunnen worden weergegeven. Elk ingelogd account kan alleen het eigen bestand schrijven, bijwerken of verwijderen. Profielfoto's worden in de browser vierkant bijgesneden, verkleind tot 256 × 256 pixels en als JPEG opgeslagen. De pagina weigert een resultaat groter dan 150 KB; de bucketlimiet is 200 KB.

```sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 204800, array['image/jpeg'])
on conflict (id) do nothing;
create policy "avatar lezen" on storage.objects for select using (bucket_id = 'avatars');
create policy "eigen avatar uploaden" on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid()::text = split_part(name, '.', 1));
create policy "eigen avatar bijwerken" on storage.objects for update using (bucket_id = 'avatars' and auth.uid()::text = split_part(name, '.', 1));
create policy "eigen avatar verwijderen" on storage.objects for delete using (bucket_id = 'avatars' and auth.uid()::text = split_part(name, '.', 1));
```

Zolang de bucket ontbreekt, meldt de profielpagina "Foto's zijn nog niet ingeschakeld." bij een fotobewerking. Naam, wachtwoord en thema blijven zelfstandig werken. De publieke foto-URL met tijdparameter staat in `user_metadata.foto`. Een upload en de daaropvolgende metadatawijziging zijn aparte verzoeken; bij een storing toont de pagina een fout en kan de gebruiker opnieuw proberen. Voer na het aanmaken van de bucket een echte upload en verwijdering uit en controleer met een tweede account dat alleen het eigen bestand aangepast kan worden. De browsercontroles bij deze wijziging gebruiken een nagebootste account- en opslagdienst en veranderen geen bestaande accounts of bestanden.

## Privacy, account wissen en beheer

- `privacy.html` beschrijft in gewone taal wat er bewaard wordt. Elke voettekst linkt ernaar (`.footer-links`, samen met het contactadres berie007yldrm@gmail.com); het aanmeldformulier heeft er een regel over onder de knop.
- Account wissen: onderaan `profiel.html` (alleen ingelogd zichtbaar). Eerst WISSEN typen, dan roept de pagina `rpc('account_verwijderen')` aan. Die functie (security definer) wist de avatar in de bucket, de rijen in voortgang, feedback en studieactiviteit en de rij in auth.users. Daarna signOut en terug naar de startpagina.
- Beheer: `beheer.html` roept `studie_totalen()` en `studie_dagcijfers(30)` aan. Beide geven alleen rijen terug als de ingelogde gebruiker in de tabel `beheerders` staat (gevuld via de SQL-editor, nooit een e-mailadres in de code). Een dag telt zodra iemand minstens 60 seconden leertijd of één bezoek had.
- De SQL staat in `supabase/account-en-beheer.sql`.

## Deelvoorbeeld, iconen en toegankelijkheid

- Elke pagina heeft og-tags (titel, omschrijving, `assets/deel.png`, url), een `apple-touch-icon` en een link naar `manifest.webmanifest`. De paden zijn absoluut (`/v2/...`) omdat vakpagina's twee mappen diep staan. **Bij de lancering op het hoofddomein:** `/v2/` vervangen door `/` in alle pagina's, in het manifest en in `404.html`.
- Elke pagina begint met een `.skip-link` ("Ga naar inhoud") naar `<main id="inhoud">`; alleen zichtbaar met de tab-toets.
- Teal als tekstkleur is te licht voor kleine tekst. Gebruik daarvoor `--teal-tekst` (licht #15756f, donker #5fd0c9); `--teal` blijft voor balken, randen en vinkjes.

## Feedback

De menulink "Feedback" op elke pagina opent `feedback.html`. Alleen ingelogde gebruikers kunnen sturen; het bericht gaat met naam, e-mailadres, soort (fout, idee, anders), gekozen vak en tekst naar de tabel `feedback`. Je leest de berichten in Supabase onder Table Editor. Een link naar de pagina mag `?vak=<id>` en `?vraag=<nummer>` meegeven om het vak en het vraagnummer vooraf in te vullen (bedoeld voor een latere knop per vraag).

Eenmalig in de SQL-editor uitvoeren:

```sql
create table if not exists public.feedback (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  naam text, email text,
  soort text not null check (soort in ('fout', 'idee', 'anders')),
  vak text, tekst text not null check (char_length(tekst) between 1 and 2000),
  pagina text,
  gemaakt timestamptz not null default now());
alter table public.feedback enable row level security;
create policy "eigen feedback sturen" on public.feedback for insert with check (auth.uid() = user_id);
create policy "eigen feedback lezen" on public.feedback for select using (auth.uid() = user_id);
```

Zolang de tabel ontbreekt, toont de pagina de rode regel "Feedback is nog niet ingeschakeld." en verwijst ze naar de WhatsApp-groep.

## Persoonlijke studiekalender

`assets/activiteit.js` wordt na `auth.js` geladen. Alleen ingelogde accounts worden gemeten. Lokale dagsamenvattingen staan onder `bes_studieactiviteit_<account-id>`. De willekeurige browser-ID in `bes_studieapparaat` bevat geen persoonsgegevens. Alleen leertijd en bezoeken per dag worden gesynchroniseerd, geen antwoorden of bezochte pagina's.

- Een bezoek is een sessie met maximaal 30 minuten tussen activiteiten. Navigeren en herladen tellen niet opnieuw. Verschillende toestellen hebben afzonderlijke bezoeksessies.
- Leertijd loopt alleen op een zichtbaar en actief oefenscherm, theorietabblad of tabblad Studie-hacks. Instellingen, uitslag, hub en Profiel tellen niet mee.
- Na 120 seconden zonder invoer pauzeert de teller. Hervatten telt de pauze niet achteraf mee. Een verborgen of niet-actief tabblad telt niet mee.
- Web Locks en gedeelde lokale opslag voorkomen dat meerdere tabbladen in dezelfde browser dezelfde tijd dubbel boeken. Als deze functies ontbreken, wordt dat gemeld en stopt de meting.
- Intervallen over middernacht worden over lokale kalenderdagen verdeeld. Leertijd is een indicatie op basis van activiteit, geen concentratiemeting.
- Ontbrekende dagen tonen "Geen gegevens geregistreerd" met een stippelrand. Een geregistreerde dag met nul leertijd is herkenbaar als zo'n dag. Historische gegevens worden niet verzonnen.
- De maandkalender begint bij de huidige maand. Vorige/volgende maand, hover, toetsenbordfocus en tikken tonen de dagsamenvatting. De legenda loopt van minder naar meer leertijd.

### Opslag tussen apparaten inschakelen

Voer [supabase/studieactiviteit.sql](supabase/studieactiviteit.sql) één keer uit via de SQL Editor van het bijbehorende Supabase-project. Deze PR voert dit niet op productie uit. Het script maakt een tabel met per account, browser en dag een rij. Lezen vereist de eigen account-ID via RLS. Schrijven loopt via een beperkte functie die de ingelogde gebruiker controleert; anon heeft geen toegang. Updates zijn monotoon en idempotent, zodat herhaalde of verlate verzoeken geen tijd verdubbelen of terugzetten. De kalender telt de dagtotalen van de eigen browsers op.

Zonder tabel, functie of verbinding blijft de kalender lokaal werken en vermeldt hij expliciet dat synchronisatie niet beschikbaar is. Verwar deze lokale werking niet met een bevestigde koppeling tussen apparaten. Na inrichting moeten een echt testaccount op twee apparaten en de toegangscontrole met een tweede testaccount nog worden gecontroleerd. De geautomatiseerde controles gebruiken nagebootste accounts en een nagebootste database.

## Hoe werkt het (hub)

Sinds 20-09-2026 staat hier dezelfde highlights-carrousel als op het welkomstscherm (zonder de dia Wat is nieuw), met daaronder de uitklapbare volledige uitleg in tekst. De carrousel loopt alleen door zolang hij in beeld is.

De sectie `hub.html#hoe-werkt-het` bestaat uit vier korte kaarten (Log in, Kies je jaar en vak, Kies hoofdstukken en oefenvorm, Zie je voortgang groeien) en daaronder een `details` "Volledige uitleg →" met tien tekststappen (Waar / Klik op / Daarna) met de exacte knopnamen van de site. Vaste regel: uitleg op de hub is tekst. Geen screenshots van de site in de site, geen nagemaakte muis, geen animaties in uitleg; maximaal vier kaarten zichtbaar, de rest ingeklapt. Verandert een knopnaam, pas dan ook de tekst hier aan.

## Vakpagina

`vak/voorbeeld/index.html` is het inhoudsloze sjabloon voor alle vakken. `assets/vak.css` sluit aan op de gedeelde stijl; `assets/vak.js` vult de kop, hoofdstukken en drie tabbladen vanuit `data.js`. Open het voorbeeld rechtstreeks via `vak/voorbeeld/index.html`; het staat bewust niet in de vakkenlijst of op een jaarpagina.

### Datamodel

Elk vak heeft één `data.js` dat `window.BES_VAK` instelt. Dit is de vorm, met één verkorte voorbeeldvraag:

```js
window.BES_VAK = {
  id: 'voorbeeld',
  jaar: '1ba',
  naam: 'Voorbeeldvak: studievaardigheden',
  hoofdstukken: [
    { id: 'h1', naam: 'Plannen' },
    { id: 'h2', naam: 'Onthouden' },
    { id: 'h3', naam: 'Examens' }
  ],
  vragen: [
    {
      h: 'h1',
      q: 'Vraagtekst',
      o: ['Optie A', 'Optie B', 'Optie C', 'Optie D'],
      a: 1,
      u: 'Uitleg waarom optie B juist is.'
    }
  ],
  hacks: [{ h: 'h1', t: 'Korte studietip.' }],
  theorie: [{ h: 'h1', kop: 'Titel', items: ['Kernpunt 1.', 'Kernpunt 2.'] }]
};
```

- `id` komt overeen met de mapnaam en het id in `assets/vakken.js`. `jaar` is `1ba`, `2ba` of `3ba`.
- Hoofdstuk-id's zijn uniek binnen een vak. Elk `h` verwijst naar zo'n id.
- Een vraag met één antwoord heeft 2 tot 5 verschillende opties. `a` is de index vanaf nul: `0` is de eerste optie, `1` de tweede. `u` legt uit waarom het antwoord juist is.
- Voor meerdere te kiezen antwoorden is `a` een niet-lege lijst met unieke indexen, bijvoorbeeld `a: [1, 3]`. Deze vragen mogen 2 tot 10 verschillende opties hebben. Voeg optioneel `kies: 'fout'` toe als de onjuiste uitspraken gekozen moeten worden. De indexen in `a` zijn altijd precies de opties die de leerling moet selecteren, ook bij `kies: 'fout'`.
- Boven deze opties staat bijvoorbeeld "Kies 2 antwoorden." of "Kies de 2 foute antwoorden." Een optie aanvinken of uitvinken telt nog niet als antwoord. "Controleer →" verschijnt alleen als precies het gevraagde aantal gekozen is. Alleen de volledige juiste combinatie levert één goed beantwoorde vraag op; er zijn geen deelpunten.
- Vragen en opties worden tijdens het oefenen geschud; alle juiste keuzes blijven gekoppeld aan de oorspronkelijke opties. De toetsen 1 tot en met 9 kiezen de bijbehorende optie, 0 kiest optie 10. Bij meerdere antwoorden schakelen deze toetsen de keuze aan of uit. Tab en spatie werken ook op de vinkopties.
- Tekst is gewone tekst, geen HTML. De vakinhoud staat uitsluitend in `data.js`.
- Het volledige voorbeeld heeft 3 hoofdstukken met respectievelijk 4, 5 en 5 vragen, 2 studie-hacks per hoofdstuk en 1 theorieblok per hoofdstuk. De tweede nieuwe meervoudige vraag bevat 10 opties en vraagt om de twee onjuiste uitspraken.
- Lege hoofdstukken tonen "Nog geen vragen". Lege lijsten voor vragen, hacks en theorie hebben ieder een eigen lege melding.

### Oefenen en voortgang

Alle 34 vakpagina's (en het sjabloon `vak/voorbeeld/index.html`) hebben sinds 19-09-2026 dezelfde oefenkeuze in drie stappen, met `data-niveaus` op `.vak-pagina`: Stap 1 Examen Training of Examensimulatie, Stap 2 Normaal of Hard mode, Stap 3 de hoofdstukken, en een samenvatting met het daadwerkelijke aantal vragen boven Start. Heeft een vak geen `hardVragen`, dan staat de knop Hard mode grijs met "Komt binnenkort" en blijft Normaal gekozen. De pagina's verschillen alleen in de titel en de versie van `data.js`; pas de opbouw dus aan via een script over alle mappen, niet per vak.

Normaal gebruikt de bestaande `vragen` zonder wijziging. De optionele lijst `hardVragen` gebruikt hetzelfde vraagformaat en bevat bij Inleiding pedagogiek een eerste set van 14 toepassingsvragen, twee per hoofdstuk h1 tot en met h7. Ze zijn uit de bestaande leerstof uitgewerkt en gecontroleerd op consistentie met die inhoud; verdere beoordeling door de vakinhoudelijke gebruiker blijft nodig vóór een brede uitrol. h8 (Echte examenvragen) krijgt geen verzonnen examenvragen. Een hoofdstuk zonder Hard mode-vragen is niet selecteerbaar op dat niveau; zonder geldige Hard mode-set is het niveau uitgeschakeld.

Hard mode gebruikt dezelfde trainings- en simulatieregels. Een Hard-training vraagt minstens 8 vragen (bij 2 per hoofdstuk dus 4 hoofdstukken); anders blijft Start uit met een hint. De simulatie neemt maximaal 20 vragen uit de gekozen moeilijkheid, dus bij deze eerste Hard mode-set 14. Een foutenronde en Opnieuw behouden het niveau. Zowel de oefening als de uitslag vermelden het niveau. De hoofdstukkeuze blijft per niveau bewaard zolang de pagina open is.

Normale voortgang behoudt de sleutel `bes_voortgang_inlped` en de bestaande Supabase-vakwaarde `inlped`. Hard mode bewaart dezelfde account-/gaststructuur apart onder `bes_voortgang_inlped__hard`, met Supabase-vakwaarde `inlped__hard`. De bestaande tabel laat tekstwaarden toe; er is geen schemawijziging nodig. Resultaten van de twee niveaus worden niet samengevoegd. Test aanpassingen met nagebootste accounts voordat je echte voortgang gebruikt.

Examen Training gebruikt alle vragen van de gekozen hoofdstukken en geeft uitleg na ieder antwoord. Examensimulatie gebruikt maximaal 20 willekeurige vragen uit alle hoofdstukken, zonder tijdklok of feedback tussendoor. Alleen de uitslag bevat dan de antwoorden en uitleg. "Fouten opnieuw" begint altijd een nieuwe trainingssessie met alleen de fouten uit de afgeronde sessie, ook na een simulatie. In die foutenronde krijg je na ieder antwoord uitleg en wordt de hoofdstukvoortgang bijgewerkt.

Bij meerdere antwoorden markeert de training na "Controleer →" elke benodigde optie teal en elke verkeerd gekozen optie rood. In een simulatie blijven goed/fout en uitleg verborgen tot de uitslag. Het overzicht toont daar per benodigde of gekozen optie wat juist was. De volledige combinatie bepaalt ook in de simulatie en foutenronde de score.

De lokale sleutel is `bes_voortgang_<vakid>`, voor het voorbeeld dus `bes_voortgang_voorbeeld`. `BES.vak.voortgang` geeft een kopie van de actieve hoofdstukgegevens. De opgeslagen JSON bevat de actieve gegevens en de bewaarde profielen. Dit verkorte voorbeeld toont de actieve gegevens:

```js
{
  eigenaar: null,
  hoofdstukken: {
    h1: {
      beantwoord: 8,
      goed: 6,
      laatstGoed: 3,
      laatstTotaal: 4,
      bijgewerkt: '2026-01-01T12:00:00.000Z'
    }
  },
  laatsteSimulatie: {
    goed: 9,
    totaal: 12,
    bijgewerkt: '2026-01-01T12:05:00.000Z'
  }
}
```

`eigenaar` is `null` voor een gast, anders het gebruikers-id van het account. `beantwoord` en `goed` tellen de trainingsantwoorden op. `laatstGoed` en `laatstTotaal` horen bij de laatste trainingssessie voor het hoofdstuk; het totaal is het aantal vragen van dat hoofdstuk in die sessie. Daardoor geeft één goed antwoord aan het begin van een reeks geen afgerond hoofdstuk. Na ieder trainingsantwoord wordt de stand bewaard. Bij een nieuwe training worden alleen de hoofdstukken met een beantwoord trainingsantwoord bijgewerkt.

Een foutenronde is een nieuwe sessie met een kleiner totaal. Bij een volledig juiste sessie is de hoofdstukbalk teal en staat er "Afgerond ✓". Een afgeronde simulatie wordt apart in `laatsteSimulatie` opgeslagen en verandert de hoofdstukbalken niet; zonder eerdere simulatie is die waarde `null`.

In dezelfde JSON staat daarnaast `profielen`: een map met de sleutels `gast` en `account:<gebruikers-id>`. Elk profiel bevat `{ eigenaar, hoofdstukken, laatsteSimulatie }`. De bovenste velden blijven de actieve stand; de profielen bewaren ook de andere lokale standen over uitloggen en herladen heen. Wie later opnieuw met hetzelfde account inlogt, kan zo ook zonder verbinding zijn eigen lokale voortgang terugkrijgen.

Alle lokale opslag zit in `try/catch`. Als de browser opslag weigert, blijft oefenen werken binnen de geopende pagina. Bij aanmelding wordt gastvoortgang eenmalig samengevoegd met dat account, waarbij per hoofdstuk de nieuwste `bijgewerkt` wint. Het overgenomen gastprofiel wordt daarna leeggemaakt, zodat het niet nogmaals naar een volgend account gaat. Afzonderlijke profielen voorkomen dat de bewaarde stand van het ene account naar een ander account wordt geüpload.

Met een ingelogd account haalt de pagina de hoofdstukrijen van dit vak op via de bestaande Supabase-client. Per hoofdstuk wint de nieuwste waarde van `bijgewerkt`. Wijzigingen gaan als batch naar Supabase, maximaal één batch per 2 seconden. De aparte laatste simulatie blijft lokaal. Bij een ontbrekende tabel, netwerkfout of geweigerde toegang gaat de pagina stil verder met lokale voortgang.

### Supabase-tabel aanmaken

Voer deze SQL één keer uit in het Supabase-project via **SQL Editor → Run**. De toegangsregels zorgen dat elk account alleen de eigen rijen kan lezen, invoegen en bijwerken:

```sql
create table if not exists public.voortgang (
  user_id uuid not null references auth.users(id) on delete cascade,
  vak text not null, hoofdstuk text not null,
  beantwoord int not null default 0, goed int not null default 0,
  laatst_goed int not null default 0, laatst_totaal int not null default 0,
  bijgewerkt timestamptz not null default now(),
  primary key (user_id, vak, hoofdstuk));
alter table public.voortgang enable row level security;
create policy "eigen voortgang lezen" on public.voortgang for select using (auth.uid() = user_id);
create policy "eigen voortgang schrijven" on public.voortgang for insert with check (auth.uid() = user_id);
create policy "eigen voortgang bijwerken" on public.voortgang for update using (auth.uid() = user_id);
```

De accountkoppeling uit de sectie "Accounts" moet ook zijn ingesteld. Totdat de tabel en regels bestaan, werkt de vakpagina lokaal; voortgang ophalen op een ander toestel en naar het account schrijven werken pas daarna. Test dat met hetzelfde account op twee toestellen. Controleer ook dat een tweede account de rijen van het eerste niet kan lezen of wijzigen.

### Een echt vak aansluiten

1. Neem het bestaande `id` en `jaar` uit `assets/vakken.js`. Maak de map `vak/<id>/`.
2. Kopieer `vak/voorbeeld/index.html` naar die map als `index.html`. Zet `data-terug` op `../../jaar-1ba.html`, `../../jaar-2ba.html` of `../../jaar-3ba.html`, passend bij het vak. De logica leidt de teruglink ook af uit `BES_VAK.jaar`.
3. Voeg in dezelfde map een `data.js` toe in het beschreven formaat. Vul id, jaar, vaknaam, hoofdstukken, vragen, uitleg, studie-hacks en theorie in. De HTML hoeft geen vakinhoud te krijgen.
4. Controleer de vakpagina lokaal op desktop en 375 px: tabbladen, training, simulatie, score, foutenronde en voortgang na herladen.
5. Zet voor dat bestaande vak `v2: true` in `assets/vakken.js`. `BES.vakLink` laat de jaarpagina dan naar `vak/<id>/` verwijzen. Verhoog bij deze gedeelde wijziging de versienummers in alle pagina's.

Voeg het voorbeeldvak niet aan de 34 vakken toe. Het sjabloon maakt deze stap compleet; het overzetten van de echte vakinhoud is een volgende opdracht.
