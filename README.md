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
assets/vak.css        aanvullende stijl van de vakpagina
assets/vak.js         logica van de vakpagina
assets/vakken.js      lijst van alle vakken per jaar
assets/updates.js     updates voor de sectie Wat is nieuw op de hub
```

## Stand van zaken
- Klaar: startpagina, gedeelde basis, accounts, hub, drie jaarpagina's, vak-template en oefenlogica. Het voorbeeldvak bevat 14 vragen, waaronder twee vragen met meerdere te kiezen antwoorden. Van de 34 vakken in `assets/vakken.js` hebben 33 een eigen map met overgezette inhoud.
- De jaarpagina's zijn één sjabloon; alleen `data-jaar` op `<body>`, de titel en de `<h1>` verschillen. De vakkaarten linken naar de bestaande tools op de huidige site tot `v2: true` staat in `vakken.js`.
- Gedeelde kaartstijl in `style.css`: `.pagina` (binnenpagina met terugknop), `.kaart-pijl`, `.kaart-tekst`, `.kaart-titel`, `.kaart-sub`, `.pijl`, `.rooster-2`, `.sectie`, `.sectie-kop`.
- Reken je punten en Examen-info staan nu in v2 (`reken.html` en `examen-info.html`), bereikbaar via de tool-kaarten op de hub.
- De startpagina (`index.html`) heeft bewust geen navigatiebalk en past in één schermhoogte. De getekende grijze muisaanwijzer (overgenomen uit Helder) zit in `style.css` en `app.js` en werkt op elke pagina; op touch verschijnt hij niet.
- Gedeelde helpers staan op `window.BES` (`naamOpslaan`, `naamOphalen`, `jaarOpslaan`, `jaarOphalen`); de losse `window.naamOpslaan` enz. blijven als alias bestaan.
- Navigatiebalk: `<nav class="navigation">` of `<nav class="nav-vol">` krijgt het Helder-gedrag (recht bovenaan, pill bij scrollen). De startpagina heeft geen balk.
- Kleurvariabelen: `--ink-soft`, `--grey-title`, `--accent-dark`, `--line` (#E9E7F3), `--pill`, `--font`, `--ease`; `--muted`, `--secondary`, `--radius-pill` en `--font-family` zijn aliassen daarvan.

## Regels
- Verandert een gedeeld bestand in `assets`? Verhoog dan in alle pagina's het nummer achter `?v=` (nu 12), anders zien telefoons nog tien minuten de oude versie.
- Alleen HTML, CSS en vanilla JavaScript. Geen framework, geen build-stap.
- De Supabase-client is de enige externe JavaScript-bibliotheek, vastgezet op `2.45.4` via `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js`.
- Kleurregel: blauw = doen (knoppen, links, balk), teal = bijzonder (logo, gelukt, afgerond, "Laatst gekozen"), grijs = rust. Rood is alleen voor de afgesproken foutmarkering bij een ongeldig veld of onjuist antwoord.
- Relatieve links, zodat alles lokaal en op GitHub Pages werkt.
- De live site (beriesexamspace.github.io) wordt niet aangeraakt tot v2 klaar is.

## Accounts (Supabase)
1. De beheerder vult `assets/config.js` in met de project-URL en publieke anon key uit Supabase, via Settings → API. Vervang `[SUPABASE_URL]` en `[SUPABASE_ANON_KEY]`. De anon key mag publiek zijn; voeg nooit een geheime sleutel of service-role key toe.
2. Zet onder Authentication → Providers → Email de instelling "Confirm email" uit. Een nieuw account krijgt dan direct een sessie.
3. Stel in dezelfde e-mailinstellingen de minimale wachtwoordlengte in op 8 tekens en voeg geen extra tekenvereisten toe, zodat de server overeenkomt met de formulieren.
4. Stel onder Authentication → URL Configuration de Site URL in op `https://beriesexamspace.com/v2/` en voeg `https://beriesexamspace.com/v2/wachtwoord.html` toe als Redirect URL.
5. Test na het invullen aanmelden, inloggen, herstelmail, het nieuwe wachtwoord en uitloggen. Zonder ingevulde instellingen blijven accounts uitgeschakeld en kan iedereen wel oefenen. Voor herstelmail in een lokale preview moet ook de exacte lokale `wachtwoord.html`-URL in Supabase als Redirect URL zijn toegestaan.

De accountnaam staat in Supabase onder user metadata `naam` en wordt lokaal opgeslagen via `BES.naamOpslaan`. De client wordt na `app.js` en `config.js` geladen; `auth.js` regelt de sessie en de inloglink centraal. `BES.auth.client` geeft de bestaande Supabase-client door aan de vakpagina. Voortgang tussen toestellen werkt voor ingelogde gebruikers na het aanmaken van de tabel en toegangsregels onder "Vakpagina".

Een project op het instapplan kan na een week zonder voldoende gebruik pauzeren. Open dan het project in het Supabase-dashboard en kies "Resume project". Zie de [Supabase-uitleg over projectpauzes](https://supabase.com/docs/guides/platform/free-project-pausing).

De enige toegangspoort naar `nieuw.html` staat vóór het renderen in de head van `hub.html`. `bes_nieuw_gezien` wordt na "Begrepen" in zowel localStorage als sessionStorage opgeslagen. Als beide opslagmogelijkheden ontbreken of geen gegevens kunnen opslaan, blijft de hub bereikbaar om een doorverwijslus te voorkomen.

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
