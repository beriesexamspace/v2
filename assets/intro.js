// Stap-voor-stap-intro: één kaart per stap met Volgende, Vorige en Overslaan.
// Gebruik: BES.stappen(element, { soorten, kopniveau, overslaan, lus, laatsteTekst, bijKlaar })
//   soorten      welke stappen: intro (alleen welkomstscherm), uitleg (ook op de hub), groep (WhatsApp), nieuw (Wat is nieuw)
//   overslaan    true: knop Overslaan tonen (telt als gezien)
//   lus          true: na de laatste stap weer naar de eerste (hub); anders knop laatsteTekst en bijKlaar()
window.BES = window.BES || {};

(() => {
  const BASIS = (document.querySelector('script[src*="intro.js"]')?.getAttribute('src') || '').replace(/assets\/intro\.js.*$/, '');
  const STATUS = '<div class="tel-status"><span>9:41</span><span class="tel-batterij" aria-hidden="true"><i></i></span></div>';
  // De iPhone: eerste keer veert hij binnen (anim-pop), bij de volgende telefoon-stap blijft hij staan en wisselt alleen het scherm.
  const telefoon = (scherm, pop = true) => `<div class="tel${pop ? ' anim-pop' : ''}" style="--i:0">${STATUS}<div class="tel-scherm">${scherm}</div></div>`;

  const STAPPEN = [
    {
      soort: 'intro',
      naam: 'Welkom',
      label: 'Welkom',
      titel: "Berie's Exam Space is vernieuwd.",
      tekst: 'Nieuwe stijl, een account dat je voortgang bewaart, en alle vakken van je jaar op één plek. In een paar stappen zie je wat er veranderd is en hoe het werkt.',
      beeld: `
        <div class="stap-merk">
          <span class="stap-merk-b anim-pop" style="--i:1" aria-hidden="true">B</span>
          <span class="stap-merk-naam anim" style="--i:4">Berie's Exam Space</span>
          <span class="stap-merk-sub anim" style="--i:5">Duidelijk leren. Rustig groeien.</span>
        </div>`
    },
    {
      soort: 'intro',
      naam: 'Oud naast nieuw: startpagina',
      label: 'Oud naast nieuw · 1 van 3',
      titel: 'De startpagina.',
      tekst: 'Vroeger één lange lijst met links naar alle vakken. Nu een rustige start: je meldt je aan of logt in, en daarna is het jouw eigen space.',
      beeld: `
        <div class="oudnieuw">
          <div class="mini is-oud anim-links">
            <span class="mini-label">Oud</span>
            <span class="mini-oud-kop">Berie's Exam Space</span>
            <span class="mini-oud-tekst">Oefenvragen voor psychologie</span>
            <span class="mini-oud-link">Menselijke biologie en genetica</span>
            <span class="mini-oud-link">Statistiek I</span>
            <span class="mini-oud-link">Statistiek II</span>
            <span class="mini-oud-link">Inleiding pedagogiek</span>
            <span class="mini-oud-link">Ontwikkelingspsychologie</span>
            <span class="mini-oud-tekst">Al 1.500 keer geopend</span>
          </div>
          <div class="mini is-nieuw is-hero anim-rechts">
            <span class="mini-label">Nieuw</span>
            <span class="mini-hero-kop">Jouw leerstof.<em>Jouw eigen space.</em></span>
            <span class="mini-hero-sub">Alles wat je nodig hebt om overzicht te krijgen en slimmer te leren.</span>
            <div class="tel-knop">Aanmelden →</div>
            <span class="mini-hero-link">Heb je al een account? Log in</span>
          </div>
        </div>`
    },
    {
      soort: 'intro',
      naam: 'Oud naast nieuw: oefenen',
      label: 'Oud naast nieuw · 2 van 3',
      titel: 'Oefenen.',
      tekst: 'Vroeger stond een vraag met a, b, c en d onder elkaar, met het antwoord eronder. Nu krijg je één vraag per scherm, je kiest, en je ziet meteen of het goed was, met uitleg.',
      beeld: `
        <div class="oudnieuw">
          <div class="mini is-oud anim-links">
            <span class="mini-label">Oud</span>
            <span class="mini-oud-kop">Statistiek I</span>
            <span class="mini-oud-vraag">Vraag 12. Welke maat hoort bij een ordinale schaal?</span>
            <span class="mini-oud-optie">a) gemiddelde</span>
            <span class="mini-oud-optie">b) mediaan</span>
            <span class="mini-oud-optie">c) standaardafwijking</span>
            <span class="mini-oud-optie">d) variantie</span>
            <span class="mini-oud-link">Toon antwoord</span>
            <span class="mini-oud-tekst">Antwoord: b</span>
          </div>
          <div class="mini is-nieuw anim-rechts">
            <span class="mini-label">Nieuw</span>
            <span class="tel-rij"><span>Vraag 12 van 20</span><span>Training</span></span>
            <span class="tel-vraag">Welke maat hoort bij een ordinale schaal?</span>
            <div class="tel-optie">Gemiddelde</div>
            <div class="tel-optie is-goed">Mediaan ✓</div>
            <div class="tel-optie">Standaardafwijking</div>
            <div class="mini-uitleg">Goed. Bij een ordinale schaal kan je wel ordenen, maar niet rekenen met afstanden.</div>
            <div class="tel-knop">Volgende →</div>
          </div>
        </div>`
    },
    {
      soort: 'intro',
      naam: 'Oud naast nieuw: hoofdstukken',
      label: 'Oud naast nieuw · 3 van 3',
      titel: 'Je hoofdstukken.',
      tekst: 'De oude site was één lange pagina per vak. Nu kies je eerst je jaar en je vak, vink je hoofdstukken aan en oefen je in <strong>Training</strong> of <strong>Simulatie</strong>. Je voortgang blijft bewaard.',
      beeld: `
        <div class="oudnieuw">
          <div class="mini is-oud anim-links">
            <span class="mini-label">Oud</span>
            <span class="mini-oud-kop">Berie's Exam Space</span>
            <span class="mini-oud-link">Statistiek I</span>
            <span class="mini-oud-link">Inleiding pedagogiek</span>
            <span class="mini-oud-vraag">Vraag 12. Welke maat hoort bij een ordinale schaal?</span>
            <span class="mini-oud-optie">a) gemiddelde</span>
            <span class="mini-oud-optie">b) mediaan</span>
            <span class="mini-oud-optie">c) standaardafwijking</span>
          </div>
          <div class="mini is-nieuw anim-rechts">
            <span class="mini-label">Nieuw</span>
            <span class="tel-kop">Kies je hoofdstukken</span>
            <div class="tel-kaart"><span class="tel-vink is-aan">✓</span>Meetschalen</div>
            <div class="tel-kaart"><span class="tel-vink is-aan">✓</span>Centrummaten</div>
            <div class="tel-kaart"><span class="tel-vink"></span>Spreiding</div>
            <div class="tel-knop">Start →</div>
          </div>
        </div>`
    },
    {
      soort: 'uitleg',
      naam: 'Vakken',
      label: 'Vakken',
      titel: 'Alle vakken van je jaar, op één plek.',
      tekst: 'Kies je jaar, dan je vak. Per vak vind je <strong>oefenvragen</strong>, <strong>studie-hacks</strong> en <strong>theorie</strong>, allemaal in dezelfde stijl.',
      telefoon: true,
      scherm: `
        <p class="tel-kop anim" style="--i:1">Welkom.</p>
        <p class="tel-sub anim" style="--i:1">In welk jaar zit je?</p>
        <div class="tel-kaart anim" style="--i:2"><span class="tel-nummer">1</span>1ste bachelor<span class="tel-pijl">→</span></div>
        <div class="tel-kaart anim" style="--i:3"><span class="tel-nummer">2</span>2de bachelor<span class="tel-pijl">→</span></div>
        <div class="tel-kaart anim" style="--i:4"><span class="tel-nummer">3</span>3de bachelor<span class="tel-pijl">→</span></div>
        <p class="tel-kop anim" style="--i:5">Tools</p>
        <div class="tel-kaart anim" style="--i:6">Reken je punten<span class="tel-pijl">→</span></div>
        <div class="tel-kaart anim" style="--i:7">Examen-info<span class="tel-pijl">→</span></div>`
    },
    {
      soort: 'uitleg',
      naam: 'Examensimulatie',
      label: 'Examensimulatie',
      titel: 'Oefen zoals op het examen.',
      tekst: '<strong>Examen Training</strong> geeft uitleg na elke vraag. <strong>Examensimulatie</strong> houdt je uitslag tot het einde, net als het echte examen.',
      telefoon: true,
      scherm: `
        <div class="tel-rij anim" style="--i:1"><span>Vraag 4 van 20</span><span>Simulatie</span></div>
        <div class="tel-balk is-doen"><i class="anim-vul" style="--doel:20%;--i:0"></i></div>
        <p class="tel-vraag anim" style="--i:2">Wat hoort bij operante conditionering?</p>
        <div class="tel-optie anim anim-kies" style="--i:3">Bekrachtiging</div>
        <div class="tel-optie anim" style="--i:4">Onvoorwaardelijke stimulus</div>
        <div class="tel-optie anim" style="--i:5">Habituatie</div>
        <div class="tel-optie anim" style="--i:6">Spiegelneuronen</div>
        <div class="tel-knop anim anim-puls" style="--i:7">Volgende →</div>`
    },
    {
      soort: 'uitleg',
      naam: 'Hoofdstukken kiezen',
      label: 'Hoe werkt het',
      titel: 'Vink je hoofdstukken aan en start.',
      tekst: 'Log in, kies je jaar en vak, vink de hoofdstukken aan die je wil oefenen en klik op <strong>Start →</strong>. Je kan ook alles in één keer kiezen.',
      telefoon: true,
      scherm: `
        <p class="tel-kop anim" style="--i:1">Kies je hoofdstukken</p>
        <div class="tel-kaart anim" style="--i:2"><span class="tel-vink is-aan anim-vink" style="--i:0">✓</span>Inleiding<span class="tel-klein tel-pijl">12 vragen</span></div>
        <div class="tel-kaart anim" style="--i:3"><span class="tel-vink is-aan anim-vink" style="--i:1">✓</span>Leertheorieën<span class="tel-klein tel-pijl">18 vragen</span></div>
        <div class="tel-kaart anim" style="--i:4"><span class="tel-vink"></span>Ontwikkeling<span class="tel-klein tel-pijl">15 vragen</span></div>
        <div class="tel-kaart anim" style="--i:5"><span class="tel-vink"></span>Onderzoek<span class="tel-klein tel-pijl">9 vragen</span></div>
        <div class="tel-knop anim anim-puls" style="--i:6">Start →</div>`
    },
    {
      soort: 'uitleg',
      naam: 'Voortgang',
      label: 'Hoe werkt het',
      titel: 'Zie je voortgang groeien.',
      tekst: 'Per hoofdstuk zie je hoeveel je goed had. <strong>Teal</strong> betekent: gelukt. Met een account staat je voortgang op elk toestel klaar.',
      telefoon: true,
      scherm: `
        <p class="tel-kop anim" style="--i:1">Kies je hoofdstukken</p>
        <div class="tel-kaart is-los anim" style="--i:2">
          <div class="tel-kaart-kop"><span class="tel-vink is-teal anim-vink" style="--i:2">✓</span>Inleiding</div>
          <div class="tel-balk"><i class="anim-vul" style="--doel:100%;--i:0"></i></div>
          <span class="tel-klein anim-teal">12 van 12 goed · Afgerond ✓</span>
        </div>
        <div class="tel-kaart is-los anim" style="--i:3">
          <div class="tel-kaart-kop"><span class="tel-vink is-aan">✓</span>Leertheorieën</div>
          <div class="tel-balk"><i class="anim-vul" style="--doel:72%;--i:1"></i></div>
          <span class="tel-klein">13 van 18 goed</span>
        </div>
        <div class="tel-kaart is-los anim" style="--i:4">
          <div class="tel-kaart-kop"><span class="tel-vink"></span>Ontwikkeling</div>
          <div class="tel-balk"><i style="width:0"></i></div>
          <span class="tel-klein">Nog niet geoefend</span>
        </div>`
    },
    {
      soort: 'uitleg',
      naam: 'Laptop',
      label: 'Tip',
      titel: 'Werkt het best op een laptop.',
      tekst: 'Op je telefoon kan alles. Op een laptop zie je meer in één keer: je hoofdstukken, je voortgang en de uitleg naast elkaar. Vooral bij een examensimulatie is dat rustiger.',
      beeld: `
        <div class="toestellen">
          <div class="tel is-klein anim-links">${STATUS}<div class="tel-scherm">
            <p class="tel-kop">Kies je hoofdstukken</p>
            <div class="tel-kaart"><span class="tel-vink is-aan">✓</span>Inleiding</div>
            <div class="tel-kaart"><span class="tel-vink is-aan">✓</span>Leertheorieën</div>
            <div class="tel-kaart"><span class="tel-vink"></span>Ontwikkeling</div>
            <div class="tel-knop">Start →</div>
          </div></div>
          <div class="laptop anim-rechts">
            <div class="laptop-scherm">
              <div class="laptop-balk"><span class="laptop-merk">B</span><span class="laptop-merknaam">Berie's Exam Space</span><span class="laptop-pil"></span></div>
              <div class="laptop-inhoud">
                <div class="laptop-kolom">
                  <span class="tel-kop">Kies je hoofdstukken</span>
                  <div class="tel-kaart"><span class="tel-vink is-aan">✓</span>Inleiding<span class="tel-klein tel-pijl">12 vragen</span></div>
                  <div class="tel-kaart"><span class="tel-vink is-aan">✓</span>Leertheorieën<span class="tel-klein tel-pijl">18 vragen</span></div>
                  <div class="tel-kaart"><span class="tel-vink"></span>Ontwikkeling<span class="tel-klein tel-pijl">15 vragen</span></div>
                  <div class="tel-kaart"><span class="tel-vink"></span>Onderzoek<span class="tel-klein tel-pijl">9 vragen</span></div>
                </div>
                <div class="laptop-kolom">
                  <span class="tel-kop">Jouw voortgang</span>
                  <div class="tel-kaart is-los"><div class="tel-kaart-kop">Inleiding</div><div class="tel-balk"><i style="width:100%"></i></div><span class="tel-klein is-teal">12 van 12 goed</span></div>
                  <div class="tel-kaart is-los"><div class="tel-kaart-kop">Leertheorieën</div><div class="tel-balk"><i style="width:72%"></i></div><span class="tel-klein">13 van 18 goed</span></div>
                  <div class="tel-knop">Start →</div>
                </div>
              </div>
            </div>
            <div class="laptop-voet"></div>
          </div>
        </div>`
    },
    {
      soort: 'groep',
      naam: 'WhatsApp-groep',
      label: 'WhatsApp-groep',
      titel: 'Blijf op de hoogte.',
      tekst: 'In de groep hoor je als eerste wat er nieuw is: vakken, vragen en verbeteringen. Alleen updates, geen drukte.<br><a class="knop stap-whatsapp anim" style="--i:3" href="https://chat.whatsapp.com/Ci1d1PQzvWr6VPcq10l7bK">Word lid →</a>',
      beeld: `
        <div class="stap-qr">
          <img class="anim-pop" style="--i:1" src="${BASIS}assets/whatsapp-qr.svg" width="200" height="200" alt="">
          <span class="anim" style="--i:4">Scan met je telefoon</span>
        </div>
        <div class="stap-groep" aria-hidden="true">
          <span class="stap-groep-icoon anim-pop" style="--i:1">B</span>
          <span class="stap-groep-naam anim" style="--i:3">Berie's Exam Space</span>
          <span class="stap-groep-sub anim" style="--i:4">WhatsApp-groep · alleen updates</span>
          <span class="stap-groep-sub anim" style="--i:5">Bijna 200 studenten</span>
        </div>`
    },
    {
      soort: 'nieuw',
      naam: 'Wat is nieuw',
      label: 'Wat is nieuw',
      titel: 'Nieuw op de site? Dat zie je op de hub.',
      tekst: 'Onder de tools staat het blok <strong>Wat is nieuw</strong>. Elk nieuw vak, elke nieuwe vraag en elke verbetering komt daar met datum bij. Is er een grote nieuwe versie, dan zie je deze kennismaking één keer opnieuw.',
      beeld: `
        <div class="mini-nieuw anim-pop" style="--i:1">
          <span class="mini-nieuw-kop">Wat is nieuw</span>
          <ul class="stap-updates is-mini" data-max="3" aria-label="Laatste updates"></ul>
          <span class="mini-nieuw-knop">Alles bekijken →</span>
        </div>`
    }
  ];

  window.BES.stappen = (root, opties = {}) => {
    const soorten = opties.soorten || ['intro', 'uitleg', 'groep', 'nieuw'];
    const stappen = STAPPEN.filter(stap => soorten.includes(stap.soort));
    const kop = opties.kopniveau || 'h3';
    const rustig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const laatsteTekst = opties.laatsteTekst || 'Begrepen →';
    let actief = 0;
    let vorigIndex = -1;
    let bezig = false;

    root.classList.add("stappen");
    root.setAttribute('aria-roledescription', 'stappen');
    root.innerHTML = `
      <div class="stap-boven">
        <span class="stap-teller" aria-live="polite"></span>
        <span class="stap-stippen" aria-hidden="true">${stappen.map(() => '<i></i>').join('')}</span>
        <button class="stap-overslaan tekstlink" type="button"${opties.overslaan ? '' : ' hidden'}>Overslaan</button>
      </div>
      <article class="stap-kaart" tabindex="0"></article>
      <div class="stap-bediening">
        <button class="stap-vorige tekstlink" type="button">← Vorige</button>
        <button class="knop stap-volgende" type="button">Volgende →</button>
      </div>`;

    const kaart = root.querySelector('.stap-kaart');
    const teller = root.querySelector('.stap-teller');
    const stippen = Array.from(root.querySelectorAll('.stap-stippen i'));
    const vorige = root.querySelector('.stap-vorige');
    const volgende = root.querySelector('.stap-volgende');
    const overslaan = root.querySelector('.stap-overslaan');

    const tekstVan = stap => `
      <div class="stap-tekst">
        <p class="stap-label anim" style="--i:0">${stap.lijst && window.BES_VERSIE ? `${stap.label} · Versie ${window.BES_VERSIE}` : stap.label}</p>
        <${kop} class="stap-titel anim" style="--i:1">${stap.titel}</${kop}>
        <p class="stap-uitleg anim" style="--i:2">${stap.tekst}</p>
      </div>`;
    const beeldVan = (stap, pop) => stap.lijst
      ? '<ul class="stap-updates" aria-label="Laatste updates"></ul>'
      : `<div class="stap-beeld" aria-hidden="true">${stap.telefoon ? telefoon(stap.scherm, pop) : stap.beeld}</div>`;

    const vulLijst = () => {
      const lijst = kaart.querySelector('.stap-updates');
      if (!lijst || !window.BES.updateRij) return;
      const versie = window.BES_VERSIE;
      const updates = (window.BES_UPDATES || []).filter(update => !versie || !update.versie || update.versie === versie);
      const max = Number(lijst.dataset.max) || 5;
      updates.slice(0, max).forEach((update, n) => {
        const rij = window.BES.updateRij(update, 'nieuw');
        rij.classList.add('anim');
        rij.style.setProperty('--i', String(n + 3));
        lijst.append(rij);
      });
    };

    const toon = index => {
      actief = index;
      const stap = stappen[index];
      const laatste = index === stappen.length - 1;
      const vorigeStap = stappen[vorigIndex];
      const telefoonStaat = Boolean(vorigeStap?.telefoon && stap.telefoon && kaart.querySelector('.tel:not(.is-klein)'));
      kaart.className = `stap-kaart is-${stap.soort}${stap.lijst ? ' is-lijst' : ''}`;
      kaart.setAttribute('aria-label', `Stap ${index + 1} van ${stappen.length}: ${stap.naam}`);
      if (telefoonStaat) {
        // Toestel blijft staan, alleen de tekst en het scherm wisselen.
        kaart.querySelector('.stap-tekst').outerHTML = tekstVan(stap);
        kaart.querySelector('.tel').classList.remove('anim-pop');
        kaart.querySelector('.tel-scherm').innerHTML = stap.scherm;
      } else {
        kaart.innerHTML = tekstVan(stap) + beeldVan(stap, true);
      }
      vorigIndex = index;
      vulLijst();
      teller.textContent = `${index + 1} van ${stappen.length}`;
      stippen.forEach((stip, n) => stip.classList.toggle('is-actief', n === index));
      vorige.classList.toggle('is-onzichtbaar', index === 0);
      vorige.disabled = index === 0;
      volgende.textContent = laatste ? (opties.lus ? 'Opnieuw' : laatsteTekst) : 'Volgende →';
      if (overslaan) overslaan.hidden = !opties.overslaan || laatste;
      // Op de laatste stap (niet in de lus) schuift de knop naar het midden.
      const bediening = root.querySelector('.stap-bediening');
      if (laatste && !opties.lus) {
        const dx = bediening.clientWidth / 2 - (volgende.offsetLeft + volgende.offsetWidth / 2);
        volgende.style.transform = `translateX(${Math.round(dx)}px) scale(1.06)`;
        root.classList.add('is-laatste');
      } else {
        volgende.style.transform = '';
        root.classList.remove('is-laatste');
      }
    };

    const gaNaar = (index, richting) => {
      if (bezig) return;
      const doel = (index + stappen.length) % stappen.length;
      if (doel === actief) return;
      root.style.setProperty('--stap-richting', String(richting));
      if (rustig) { toon(doel); return; }
      bezig = true;
      kaart.classList.add('is-weg');
      window.setTimeout(() => {
        toon(doel);
        bezig = false;
      }, 170);
    };

    const klaar = () => { opties.bijKlaar?.(); };

    volgende.addEventListener('click', () => {
      if (actief === stappen.length - 1) {
        if (opties.lus) gaNaar(0, 1);
        else klaar();
        return;
      }
      gaNaar(actief + 1, 1);
    });
    vorige.addEventListener('click', () => gaNaar(actief - 1, -1));
    overslaan?.addEventListener('click', klaar);

    kaart.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight' && actief < stappen.length - 1) { event.preventDefault(); gaNaar(actief + 1, 1); }
      if (event.key === 'ArrowLeft' && actief > 0) { event.preventDefault(); gaNaar(actief - 1, -1); }
    });

    // Vegen op een telefoon: naar links is verder, naar rechts is terug.
    let startX = null;
    let startY = null;
    kaart.addEventListener('pointerdown', event => { if (event.pointerType !== 'mouse') { startX = event.clientX; startY = event.clientY; } }, { passive: true });
    kaart.addEventListener('pointerup', event => {
      if (startX === null) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      startX = startY = null;
      if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      if (dx < 0 && actief < stappen.length - 1) gaNaar(actief + 1, 1);
      if (dx > 0 && actief > 0) gaNaar(actief - 1, -1);
    }, { passive: true });

    toon(0);
    return { gaNaar: index => gaNaar(index, index >= actief ? 1 : -1), get stap() { return actief; } };
  };

  // Carrousel zoals bij Apple: schuift vanzelf door, balkjes die zich vullen, pauzeknop, swipen. Voor Hoe werkt het op de hub.
  // Gebruik: BES.carrousel(element, { soorten, kopniveau })
  const PAUZE_ICOON = '<svg class="carrousel-ico-pauze" viewBox="0 0 14 14" aria-hidden="true"><rect x="2" y="1" width="3.5" height="12" rx="1"/><rect x="8.5" y="1" width="3.5" height="12" rx="1"/></svg>'
    + '<svg class="carrousel-ico-speel" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 1.5v11a.8.8 0 0 0 1.2.7l9-5.5a.8.8 0 0 0 0-1.4l-9-5.5A.8.8 0 0 0 3 1.5z"/></svg>';

  window.BES.carrousel = (root, opties = {}) => {
    const soorten = opties.soorten || ['uitleg'];
    const stappen = STAPPEN.filter(stap => soorten.includes(stap.soort));
    const kop = opties.kopniveau || 'h3';
    const naam = root.id || 'carrousel';
    const rustig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const DUUR = 8000;
    root.classList.add('stappen', 'carrousel');
    root.innerHTML = `
      <div class="carrousel-baan" tabindex="0">
        ${stappen.map((stap, n) => `
          <article class="stap-kaart is-dia is-${stap.soort}" id="${naam}-dia-${n + 1}" aria-roledescription="dia" aria-label="${n + 1} van ${stappen.length}: ${stap.naam}">
            <div class="stap-tekst">
              <p class="stap-label">${stap.label}</p>
              <${kop} class="stap-titel">${stap.titel}</${kop}>
              <p class="stap-uitleg">${stap.tekst}</p>
            </div>
            <div class="stap-beeld" aria-hidden="true">${stap.telefoon ? telefoon(stap.scherm, false) : stap.beeld}</div>
          </article>`).join('')}
      </div>
      <div class="carrousel-bediening">
        <div class="carrousel-stippen" role="tablist" aria-label="Kies een stap">
          ${stappen.map((stap, n) => `<button class="carrousel-stip" type="button" role="tab" aria-selected="${n === 0}" aria-controls="${naam}-dia-${n + 1}" aria-label="${stap.naam}"${n ? ' tabindex="-1"' : ''}><i></i></button>`).join('')}
        </div>
        <button class="carrousel-pauze" type="button" aria-pressed="false" aria-label="Pauzeren">${PAUZE_ICOON}</button>
      </div>`;

    const baan = root.querySelector('.carrousel-baan');
    const kaarten = Array.from(baan.querySelectorAll('.stap-kaart'));
    const stippen = Array.from(root.querySelectorAll('.carrousel-stip'));
    const pauzeKnop = root.querySelector('.carrousel-pauze');
    let actief = 0;
    let gepauzeerd = rustig;
    let inBeeld = true;
    let timer = 0;
    let settleTimer = 0;

    // Animaties in een dia opnieuw laten lopen zodra hij in beeld komt.
    const speelAnimaties = kaart => {
      if (rustig) return;
      kaart.querySelectorAll('.anim, .anim-pop, .anim-links, .anim-rechts, .anim-vink, .anim-vul, .anim-kies, .anim-teal, .anim-puls').forEach(el => {
        el.getAnimations?.().forEach(animatie => { animatie.cancel(); animatie.play(); });
      });
    };

    const herstartVul = () => {
      const vul = stippen[actief].querySelector('i');
      vul.classList.remove('is-bezig');
      void vul.offsetWidth;
      if (!gepauzeerd && inBeeld) vul.classList.add('is-bezig');
    };
    const planVolgende = () => {
      window.clearTimeout(timer);
      if (gepauzeerd || !inBeeld || document.hidden) return;
      timer = window.setTimeout(() => gaNaar(actief + 1), DUUR);
    };
    const zetActief = index => {
      const veranderd = index !== actief;
      actief = index;
      kaarten.forEach((kaart, n) => kaart.classList.toggle('is-actief', n === index));
      stippen.forEach((stip, n) => {
        stip.setAttribute('aria-selected', String(n === index));
        stip.tabIndex = n === index ? 0 : -1;
      });
      if (veranderd) speelAnimaties(kaarten[index]);
    };
    const positieVan = kaart => kaart.offsetLeft - (baan.clientWidth - kaart.offsetWidth) / 2;
    const gaNaar = index => {
      const doel = (index + kaarten.length) % kaarten.length;
      const kaart = kaarten[doel];
      window.clearTimeout(timer);
      if (Math.abs(baan.scrollLeft - positieVan(kaart)) < 2) { zetActief(doel); herstartVul(); planVolgende(); return; }
      baan.scrollTo({ left: positieVan(kaart), behavior: rustig ? 'auto' : 'smooth' });
    };
    const dichtstbij = () => {
      const midden = baan.scrollLeft + baan.clientWidth / 2;
      let beste = 0;
      let afstand = Infinity;
      kaarten.forEach((kaart, n) => {
        const verschil = Math.abs(kaart.offsetLeft + kaart.offsetWidth / 2 - midden);
        if (verschil < afstand) { afstand = verschil; beste = n; }
      });
      return beste;
    };

    baan.addEventListener('scroll', () => {
      window.clearTimeout(timer);
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => { zetActief(dichtstbij()); herstartVul(); planVolgende(); }, 120);
    }, { passive: true });
    baan.addEventListener('pointerdown', () => window.clearTimeout(timer));
    baan.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight') { event.preventDefault(); gaNaar(actief + 1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); gaNaar(actief - 1); }
    });
    stippen.forEach((stip, n) => {
      stip.addEventListener('click', () => gaNaar(n));
      stip.addEventListener('keydown', event => {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
        event.preventDefault();
        const doel = (n + (event.key === 'ArrowRight' ? 1 : -1) + stippen.length) % stippen.length;
        stippen[doel].focus();
        gaNaar(doel);
      });
    });
    const zetPauze = waarde => {
      gepauzeerd = waarde;
      root.classList.toggle('is-gepauzeerd', waarde);
      pauzeKnop.setAttribute('aria-pressed', String(waarde));
      pauzeKnop.setAttribute('aria-label', waarde ? 'Afspelen' : 'Pauzeren');
      if (waarde) window.clearTimeout(timer);
      else { herstartVul(); planVolgende(); }
    };
    pauzeKnop.addEventListener('click', () => zetPauze(!gepauzeerd));
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) window.clearTimeout(timer);
      else if (!gepauzeerd) { herstartVul(); planVolgende(); }
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        const zichtbaar = entries.some(entry => entry.isIntersecting);
        if (zichtbaar === inBeeld) return;
        inBeeld = zichtbaar;
        if (!zichtbaar) window.clearTimeout(timer);
        else if (!gepauzeerd) { herstartVul(); planVolgende(); }
      }, { threshold: .4 }).observe(root);
    }
    window.addEventListener('resize', () => {
      window.clearTimeout(settleTimer);
      baan.scrollTo({ left: positieVan(kaarten[actief]), behavior: 'auto' });
    });

    zetPauze(gepauzeerd);
    zetActief(0);
    herstartVul();
    planVolgende();
    return { gaNaar, pauzeer: () => zetPauze(true) };
  };
})();
