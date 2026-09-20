// Stap-voor-stap-intro: één kaart per stap met Volgende, Vorige en Overslaan.
// Gebruik: BES.stappen(element, { soorten, kopniveau, overslaan, lus, laatsteTekst, bijKlaar })
//   soorten      welke stappen: intro (alleen welkomstscherm), uitleg (ook op de hub), groep (WhatsApp), nieuw (Wat is nieuw)
//   overslaan    true: knop Overslaan tonen (telt als gezien)
//   lus          true: na de laatste stap weer naar de eerste (hub); anders knop laatsteTekst en bijKlaar()
window.BES = window.BES || {};

(() => {
  const BASIS = (document.querySelector('script[src*="intro.js"]')?.getAttribute('src') || '').replace(/assets\/intro\.js.*$/, '');
  const STATUS = '<div class="tel-status"><span>9:41</span><span class="tel-status-icoontjes" aria-hidden="true"><i></i><i></i><i></i></span></div>';
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
      naam: 'Oud naast nieuw',
      label: 'Oud naast nieuw',
      titel: 'Zelfde vragen, nieuwe jas.',
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
      titel: 'Dit is er de laatste tijd veranderd.',
      tekst: 'Elke update staat hier, en ook op de hub onder <strong>Wat is nieuw</strong>.',
      lijst: true
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
      updates.slice(0, 5).forEach((update, n) => {
        const rij = window.BES.updateRij(update, 'nieuw');
        rij.classList.add('anim');
        rij.style.setProperty('--i', String(n + 2));
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
})();
