// Highlights-carrousel: bouwt de dia's, balkjes en pauzeknop in een <section class="hl"> en regelt het doorlopen.
// Gebruik: BES.highlights(element, { metNieuw: true, metPauze: true, kopniveau: 'h3', bijLaatste: () => {} })
window.BES = window.BES || {};

(() => {
  const STATUS = '<div class="tel-status"><span>9:41</span><span>●●●</span></div>';
  const telefoon = scherm => `<div class="tel">${STATUS}<div class="tel-scherm">${scherm}</div></div>`;

  const DIAS = [
    {
      naam: 'Vakken',
      label: 'Vakken',
      titel: 'Alle vakken van je jaar, op één plek.',
      tekst: 'Kies je jaar, dan je vak. Per vak vind je <strong>oefenvragen</strong>, <strong>studie-hacks</strong> en <strong>theorie</strong>, allemaal in dezelfde stijl.',
      beeld: telefoon(`
        <p class="tel-kop">Welkom.</p>
        <p class="tel-sub">In welk jaar zit je?</p>
        <div class="tel-kaart"><span class="tel-nummer">1</span>1ste bachelor<span class="tel-pijl">→</span></div>
        <div class="tel-kaart"><span class="tel-nummer">2</span>2de bachelor<span class="tel-pijl">→</span></div>
        <div class="tel-kaart"><span class="tel-nummer">3</span>3de bachelor<span class="tel-pijl">→</span></div>
        <p class="tel-kop">Tools</p>
        <div class="tel-kaart">Reken je punten<span class="tel-pijl">→</span></div>
        <div class="tel-kaart">Examen-info<span class="tel-pijl">→</span></div>`)
    },
    {
      naam: 'Examensimulatie',
      label: 'Examensimulatie',
      titel: 'Oefen zoals op het examen.',
      tekst: '<strong>Examen Training</strong> geeft uitleg na elke vraag. <strong>Examensimulatie</strong> houdt je uitslag tot het einde, net als het echte examen.',
      beeld: telefoon(`
        <div class="tel-rij"><span>Vraag 4 van 20</span><span>Simulatie</span></div>
        <div class="tel-balk is-doen"><i style="width:20%"></i></div>
        <p class="tel-vraag">Wat hoort bij operante conditionering?</p>
        <div class="tel-optie is-gekozen">Bekrachtiging</div>
        <div class="tel-optie">Onvoorwaardelijke stimulus</div>
        <div class="tel-optie">Habituatie</div>
        <div class="tel-optie">Spiegelneuronen</div>
        <div class="tel-knop">Volgende →</div>`)
    },
    {
      naam: 'Hoofdstukken kiezen',
      label: 'Hoe werkt het',
      titel: 'Vink je hoofdstukken aan en start.',
      tekst: 'Log in, kies je jaar en vak, vink de hoofdstukken aan die je wil oefenen en klik op <strong>Start →</strong>. Je kan ook alles in één keer kiezen.',
      beeld: telefoon(`
        <p class="tel-kop">Kies je hoofdstukken</p>
        <div class="tel-kaart"><span class="tel-vink is-aan">✓</span>Inleiding<span class="tel-klein tel-pijl">12 vragen</span></div>
        <div class="tel-kaart"><span class="tel-vink is-aan">✓</span>Leertheorieën<span class="tel-klein tel-pijl">18 vragen</span></div>
        <div class="tel-kaart"><span class="tel-vink"></span>Ontwikkeling<span class="tel-klein tel-pijl">15 vragen</span></div>
        <div class="tel-kaart"><span class="tel-vink"></span>Onderzoek<span class="tel-klein tel-pijl">9 vragen</span></div>
        <div class="tel-knop">Start →</div>`)
    },
    {
      naam: 'Voortgang',
      label: 'Hoe werkt het',
      titel: 'Zie je voortgang groeien.',
      tekst: 'Per hoofdstuk zie je hoeveel je goed had. <strong>Teal</strong> betekent: gelukt. Met een account staat je voortgang op elk toestel klaar.',
      beeld: telefoon(`
        <p class="tel-kop">Kies je hoofdstukken</p>
        <div class="tel-kaart is-los">
          <div class="tel-kaart-kop"><span class="tel-vink is-teal">✓</span>Inleiding</div>
          <div class="tel-balk"><i style="width:100%"></i></div>
          <span class="tel-klein is-teal">12 van 12 goed · Afgerond ✓</span>
        </div>
        <div class="tel-kaart is-los">
          <div class="tel-kaart-kop"><span class="tel-vink is-aan">✓</span>Leertheorieën</div>
          <div class="tel-balk"><i style="width:72%"></i></div>
          <span class="tel-klein">13 van 18 goed</span>
        </div>
        <div class="tel-kaart is-los">
          <div class="tel-kaart-kop"><span class="tel-vink"></span>Ontwikkeling</div>
          <div class="tel-balk"><i style="width:0"></i></div>
          <span class="tel-klein">Nog niet geoefend</span>
        </div>`)
    },
    {
      naam: 'Wat is nieuw',
      label: 'Wat is nieuw',
      titel: 'Dit is er de laatste tijd veranderd.',
      tekst: 'Elke update staat hier, en later ook op de hub onder <strong>Wat is nieuw</strong>.',
      lijst: true
    }
  ];

  const PAUZE_ICOON = '<svg class="hl-ico-pauze" viewBox="0 0 14 14" aria-hidden="true"><rect x="2" y="1" width="3.5" height="12" rx="1"/><rect x="8.5" y="1" width="3.5" height="12" rx="1"/></svg>'
    + '<svg class="hl-ico-speel" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 1.5v11a.8.8 0 0 0 1.2.7l9-5.5a.8.8 0 0 0 0-1.4l-9-5.5A.8.8 0 0 0 3 1.5z"/></svg>';

  window.BES.highlights = (root, opties = {}) => {
    const dias = DIAS.filter(dia => opties.metNieuw !== false || !dia.lijst);
    const naam = root.id || 'hl';
    const kop = opties.kopniveau || 'h3';
    root.classList.add('hl');
    root.innerHTML = `
      <div class="hl-baan" tabindex="0">
        ${dias.map((dia, n) => `
          <article class="hl-kaart${dia.lijst ? ' is-lijst' : ''}" id="${naam}-dia-${n + 1}" aria-roledescription="dia" aria-label="${n + 1} van ${dias.length}: ${dia.naam}">
            <div class="hl-tekst">
              <p class="hl-label">${dia.lijst && window.BES_VERSIE ? `${dia.label} · Versie ${window.BES_VERSIE}` : dia.label}</p>
              <${kop} class="hl-titel">${dia.titel}</${kop}>
              <p class="hl-uitleg">${dia.tekst}</p>
            </div>
            ${dia.lijst ? '<ul class="hl-updates" aria-label="Laatste updates"></ul>' : `<div class="hl-beeld" aria-hidden="true">${dia.beeld}</div>`}
          </article>`).join('')}
      </div>
      <div class="hl-bediening">
        <div class="hl-stippen" role="tablist" aria-label="Kies een highlight">
          ${dias.map((dia, n) => `<button class="hl-stip" type="button" role="tab" aria-selected="${n === 0}" aria-controls="${naam}-dia-${n + 1}" aria-label="${dia.naam}"${n ? ' tabindex="-1"' : ''}><i></i></button>`).join('')}
        </div>
        ${opties.metPauze === false ? '' : `<button class="hl-pauze" type="button" aria-pressed="false" aria-label="Pauzeren">${PAUZE_ICOON}</button>`}
      </div>`;

    const lijst = root.querySelector('.hl-updates');
    if (lijst && window.BES.updateRij) {
      const versie = window.BES_VERSIE;
      const updates = (window.BES_UPDATES || []).filter(update => !versie || !update.versie || update.versie === versie);
      for (const update of updates.slice(0, 5)) lijst.append(window.BES.updateRij(update, 'nieuw'));
    }

    const baan = root.querySelector('.hl-baan');
    const kaarten = Array.from(baan.querySelectorAll('.hl-kaart'));
    const stippen = Array.from(root.querySelectorAll('.hl-stip'));
    const pauzeKnop = root.querySelector('.hl-pauze');
    const rustig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const DUUR = 8000;
    let actief = 0;
    let gepauzeerd = rustig;
    let inBeeld = true;
    let timer = 0;
    let settleTimer = 0;
    let laatsteGezien = false;

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
      actief = index;
      kaarten.forEach((kaart, n) => kaart.classList.toggle('is-actief', n === index));
      stippen.forEach((stip, n) => {
        stip.setAttribute('aria-selected', String(n === index));
        stip.tabIndex = n === index ? 0 : -1;
      });
      if (index === kaarten.length - 1 && !laatsteGezien) {
        laatsteGezien = true;
        opties.bijLaatste?.();
      }
    };

    const positieVan = kaart => kaart.offsetLeft - (baan.clientWidth - kaart.offsetWidth) / 2;

    const gaNaar = index => {
      const doel = (index + kaarten.length) % kaarten.length;
      const kaart = kaarten[doel];
      window.clearTimeout(timer);
      if (Math.abs(baan.scrollLeft - positieVan(kaart)) < 2) {
        zetActief(doel);
        herstartVul();
        planVolgende();
        return;
      }
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
      settleTimer = window.setTimeout(() => {
        zetActief(dichtstbij());
        herstartVul();
        planVolgende();
      }, 120);
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
      pauzeKnop?.setAttribute('aria-pressed', String(waarde));
      pauzeKnop?.setAttribute('aria-label', waarde ? 'Afspelen' : 'Pauzeren');
      if (waarde) window.clearTimeout(timer);
      else { herstartVul(); planVolgende(); }
    };
    pauzeKnop?.addEventListener('click', () => zetPauze(!gepauzeerd));

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) window.clearTimeout(timer);
      else if (!gepauzeerd) { herstartVul(); planVolgende(); }
    });

    // Alleen doorlopen zolang de carrousel echt in beeld is (bijvoorbeeld op de hub).
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
