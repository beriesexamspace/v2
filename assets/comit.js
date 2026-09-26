(() => {
  'use strict';

  const BES = window.BES = window.BES || {};
  const ns = 'http://www.w3.org/2000/svg';
  let logoNummer = 0;

  BES.comitLogo = (grootte = 24) => {
    const maat = Number.isFinite(Number(grootte)) && Number(grootte) > 0 ? Number(grootte) : 24;
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 96 96');
    svg.setAttribute('width', maat);
    svg.setAttribute('height', maat);
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const defs = document.createElementNS(ns, 'defs');
    const verloop = document.createElementNS(ns, 'linearGradient');
    const id = `comit-verloop-${++logoNummer}`;
    verloop.id = id;
    verloop.setAttribute('x1', '0%');
    verloop.setAttribute('y1', '0%');
    verloop.setAttribute('x2', '100%');
    verloop.setAttribute('y2', '100%');
    ['--teal', '--accent'].forEach((kleur, index) => {
      const stop = document.createElementNS(ns, 'stop');
      stop.setAttribute('offset', `${index * 100}%`);
      stop.style.stopColor = `var(${kleur})`;
      verloop.append(stop);
    });
    defs.append(verloop);
    svg.append(defs);
    [
      'M72 22C62 12 47 9 33 15C17 21 9 37 12 53C14 64 20 72 29 77L25 88L44 81C56 82 67 78 75 69L65 60C59 66 51 69 42 66L36 69L37 61C30 58 26 52 26 45C26 33 35 25 47 25C54 25 60 28 64 32Z',
      'M76 31C78 39 81 42 89 44C81 46 78 49 76 57C74 49 71 46 63 44C71 42 74 39 76 31Z'
    ].forEach(d => {
      const pad = document.createElementNS(ns, 'path');
      pad.setAttribute('d', d);
      pad.setAttribute('fill', `url(#${id})`);
      svg.append(pad);
    });
    return svg;
  };

  async function initialize() {
    const pagina = document.querySelector('.comit-pagina');
    if (!pagina) return;
    let user;
    try {
      await BES.auth.gereed;
      user = await BES.auth.gebruiker();
    } catch {
      window.BES_DEUR?.naarInloggen();
      return;
    }
    if (!user) {
      window.BES_DEUR?.naarInloggen();
      return;
    }

    const byId = id => document.getElementById(id);
    const minderBeweging = window.matchMedia('(prefers-reduced-motion: reduce)');
    const welkom = byId('comit-welkom');
    const gesprek = byId('comit-gesprek');
    const scroller = byId('comit-scroll');
    const formulier = byId('comit-form');
    const invoer = byId('comit-tekst');
    const verstuur = byId('comit-verstuur');
    const begroeting = byId('comit-begroeting');
    const naam = BES.auth.naamGegevens(user).aanspreeknaam.trim();
    const tekst = naam ? `Hallo, ${naam}.` : 'Hallo.';
    begroeting.setAttribute('aria-label', tekst);
    tekst.split(/\s+/).forEach((woord, index) => {
      const span = document.createElement('span');
      span.className = 'comit-woord';
      span.textContent = woord;
      span.setAttribute('aria-hidden', 'true');
      span.style.setProperty('--woord-index', index);
      if (index) begroeting.append(' ');
      begroeting.append(span);
    });
    pagina.querySelectorAll('[data-comit-logo]').forEach(plek => plek.append(BES.comitLogo(plek.dataset.comitLogo)));

    let gezien = false;
    try { gezien = window.localStorage.getItem('bes_comit_gezien') === '1'; } catch {}
    try { window.localStorage.setItem('bes_comit_gezien', '1'); } catch {}
    let openingTimer;
    const openingKlaar = () => {
      window.clearTimeout(openingTimer);
      pagina.dataset.opening = 'klaar';
    };
    minderBeweging.addEventListener('change', event => { if (event.matches) openingKlaar(); });

    const pasHoogteAan = () => {
      const viewport = window.visualViewport;
      if (viewport && viewport.scale !== 1) return;
      pagina.style.setProperty('--comit-viewport-hoogte', `${viewport?.height || window.innerHeight}px`);
      pagina.style.setProperty('--comit-viewport-top', `${viewport?.offsetTop || 0}px`);
      document.body.style.setProperty('--comit-viewport-bodem', `${Math.max(0, window.innerHeight - (viewport?.height || window.innerHeight) - (viewport?.offsetTop || 0))}px`);
    };
    pasHoogteAan();
    window.addEventListener('resize', pasHoogteAan);
    window.visualViewport?.addEventListener('resize', pasHoogteAan);
    window.visualViewport?.addEventListener('scroll', pasHoogteAan);

    const pasInvoerAan = () => {
      const stijl = window.getComputedStyle(invoer);
      const rand = parseFloat(stijl.borderTopWidth) + parseFloat(stijl.borderBottomWidth);
      const ruimte = parseFloat(stijl.paddingTop) + parseFloat(stijl.paddingBottom) + rand;
      const maximum = parseFloat(stijl.lineHeight) * 4 + ruimte;
      invoer.style.height = 'auto';
      invoer.style.height = `${Math.min(invoer.scrollHeight + rand, maximum)}px`;
      invoer.style.overflowY = invoer.scrollHeight + rand > maximum ? 'auto' : 'hidden';
    };
    let bezig = false;
    const werkKnopBij = () => { verstuur.disabled = bezig || !invoer.value.trim(); };
    const onderaan = () => scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop <= 32;
    let volgGesprek = onderaan();
    let laatsteScrollTop = scroller.scrollTop;
    let scrollFrame;
    const stopMeescrollen = () => {
      volgGesprek = false;
      window.cancelAnimationFrame(scrollFrame);
      scrollFrame = null;
    };
    scroller.addEventListener('scroll', () => {
      if (scroller.scrollTop < laatsteScrollTop - 1) stopMeescrollen();
      else if (scroller.scrollTop > laatsteScrollTop && scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop <= 1) volgGesprek = true;
      laatsteScrollTop = scroller.scrollTop;
    }, { passive: true });
    scroller.addEventListener('wheel', event => { if (event.deltaY < 0) stopMeescrollen(); }, { passive: true });
    scroller.addEventListener('keydown', event => {
      if (['ArrowUp', 'PageUp', 'Home'].includes(event.key)) stopMeescrollen();
    });
    let touchY;
    scroller.addEventListener('touchstart', event => { touchY = event.touches[0]?.clientY; }, { passive: true });
    scroller.addEventListener('touchmove', event => {
      const y = event.touches[0]?.clientY;
      if (y > touchY) stopMeescrollen();
      touchY = y;
    }, { passive: true });
    const naarLaatsteBericht = () => {
      if (!volgGesprek) return;
      if (minderBeweging.matches) {
        scroller.scrollTop = scroller.scrollHeight;
        return;
      }
      if (scrollFrame != null) return;
      const begin = performance.now();
      const stap = nu => {
        const doel = scroller.scrollHeight - scroller.clientHeight;
        const deel = Math.min(1, (nu - begin) / 220);
        scroller.scrollTop += (doel - scroller.scrollTop) * (1 - (1 - deel) ** 3);
        laatsteScrollTop = scroller.scrollTop;
        scrollFrame = deel < 1 ? window.requestAnimationFrame(stap) : null;
      };
      scrollFrame = window.requestAnimationFrame(stap);
    };
    minderBeweging.addEventListener('change', event => {
      if (!event.matches) return;
      window.cancelAnimationFrame(scrollFrame);
      scrollFrame = null;
      naarLaatsteBericht();
    });

    const verbergWelkom = () => new Promise(resolve => {
      if (welkom.hidden) { resolve(); return; }
      let timer;
      const klaar = () => {
        window.clearTimeout(timer);
        minderBeweging.removeEventListener('change', minder);
        welkom.hidden = true;
        laatsteScrollTop = scroller.scrollTop;
        resolve();
      };
      const minder = event => { if (event.matches) klaar(); };
      welkom.inert = true;
      if (minderBeweging.matches) { klaar(); return; }
      welkom.classList.add('is-vertrekkend');
      minderBeweging.addEventListener('change', minder);
      timer = window.setTimeout(klaar, 220);
    });

    const toonAntwoord = (plek, tekst) => new Promise(resolve => {
      const delen = tekst.match(/\s+|\S+/gu) || [];
      const aantal = delen.filter(deel => /\S/u.test(deel)).length;
      if (minderBeweging.matches || document.hidden || !aantal) {
        plek.textContent = tekst;
        resolve();
        return;
      }
      // Reserveer ook de laatste fade en een frame binnen de limiet van 1,5 s.
      const interval = aantal > 1 ? Math.min(25, 1320 / (aantal - 1)) : 0;
      const begin = performance.now();
      let index = 0;
      let woorden = 0;
      let frame;
      let timer;
      let laatsteWoordOp = begin;
      const klaar = () => {
        window.cancelAnimationFrame(frame);
        window.clearTimeout(timer);
        minderBeweging.removeEventListener('change', minder);
        document.removeEventListener('visibilitychange', zichtbaarheid);
        plek.textContent = tekst;
        naarLaatsteBericht();
        resolve();
      };
      const minder = event => { if (event.matches) klaar(); };
      const zichtbaarheid = () => { if (document.hidden) klaar(); };
      const stap = nu => {
        const fragment = document.createDocumentFragment();
        while (index < delen.length) {
          const deel = delen[index];
          if (/\S/u.test(deel)) {
            if (nu - begin < woorden * interval) break;
            const woord = document.createElement('span');
            woord.className = 'comit-antwoord-woord';
            woord.textContent = deel;
            fragment.append(woord);
            woorden += 1;
            laatsteWoordOp = nu;
          } else fragment.append(document.createTextNode(deel));
          index += 1;
        }
        if (fragment.childNodes.length) {
          plek.append(fragment);
          naarLaatsteBericht();
        }
        if (index === delen.length && nu - laatsteWoordOp >= 150) klaar();
        else frame = window.requestAnimationFrame(stap);
      };
      minderBeweging.addEventListener('change', minder);
      document.addEventListener('visibilitychange', zichtbaarheid);
      timer = window.setTimeout(klaar, 1500);
      frame = window.requestAnimationFrame(stap);
    });

    const bericht = (inhoud, assistent = false) => {
      const rij = document.createElement('div');
      rij.className = `comit-bericht comit-bericht-${assistent ? 'assistent' : 'gebruiker'}`;
      if (assistent) {
        rij.classList.add('is-denkend');
        const logo = document.createElement('span');
        logo.className = 'comit-bericht-logo';
        logo.append(BES.comitLogo(24));
        rij.append(logo);
      }
      const wolk = document.createElement('p');
      wolk.className = 'comit-wolk';
      if (assistent) wolk.setAttribute('aria-busy', 'true');
      const label = document.createElement('span');
      label.className = 'comit-sr-only';
      label.textContent = assistent ? 'Comit denkt na.' : 'Jij: ';
      if (assistent) label.setAttribute('aria-atomic', 'true');
      wolk.append(label, document.createTextNode(inhoud));
      rij.append(wolk);
      gesprek.append(rij);
      return wolk;
    };

    const verstuurVraag = async vraag => {
      const inhoud = vraag.trim();
      if (!inhoud || bezig) return;
      bezig = true;
      openingKlaar();
      volgGesprek = onderaan();
      invoer.value = '';
      pasInvoerAan();
      werkKnopBij();
      invoer.focus({ preventScroll: true });
      await verbergWelkom();
      gesprek.tabIndex = 0;
      bericht(inhoud);
      const wolk = bericht('', true);
      wolk.classList.add('comit-denkt');
      const denkTekst = document.createElement('span');
      denkTekst.className = 'comit-denk-tekst';
      denkTekst.setAttribute('aria-hidden', 'true');
      const denkBegin = performance.now();
      const werkDenkTekstBij = () => {
        denkTekst.textContent = minderBeweging.matches ? 'Comit denkt na.' :
          performance.now() - denkBegin >= 3000 ? 'Nog even denken' : 'Comit denkt na';
      };
      werkDenkTekstBij();
      const denkTimer = window.setTimeout(werkDenkTekstBij, 3000);
      minderBeweging.addEventListener('change', werkDenkTekstBij);
      wolk.append(denkTekst);
      naarLaatsteBericht();
      const minimumDenktijd = new Promise(resolve => window.setTimeout(resolve, 600));
      let antwoord = null;
      try {
        antwoord = await BES.comitAntwoord(inhoud, { client: BES.auth.client, user });
      } catch {}
      if (antwoord == null && typeof BES.comitVrij === 'function') {
        try {
          antwoord = await BES.comitVrij(inhoud, { client: BES.auth.client, user });
        } catch { antwoord = null; }
      }
      if (!antwoord || typeof antwoord.tekst !== 'string') {
        antwoord = {
          tekst: 'Dat kan ik nog niet. Wil je het als feedback sturen?',
          knoppen: [{ label: 'Stuur als feedback →', href: 'feedback.html' }]
        };
      }
      await minimumDenktijd;
      window.clearTimeout(denkTimer);
      minderBeweging.removeEventListener('change', werkDenkTekstBij);
      wolk.classList.remove('comit-denkt');
      wolk.parentElement.classList.remove('is-denkend');
      denkTekst.remove();
      // Het bestaande aria-live-gesprek krijgt één volledige tekst, geen losse woorden.
      wolk.firstChild.textContent = `Comit: ${antwoord.tekst}`;
      const antwoordTekst = document.createElement('span');
      antwoordTekst.className = 'comit-antwoord-tekst';
      antwoordTekst.setAttribute('aria-hidden', 'true');
      wolk.append(antwoordTekst);
      wolk.setAttribute('aria-busy', 'false');
      const knoppen = document.createElement('span');
      knoppen.className = 'comit-antwoord-knoppen';
      for (const knop of Array.isArray(antwoord.knoppen) ? antwoord.knoppen : []) {
        if (!knop || typeof knop.label !== 'string' || typeof knop.href !== 'string' || !knop.href.trim()) continue;
        try {
          const url = new URL(knop.href, window.location.href);
          if (!['http:', 'https:'].includes(url.protocol) || url.origin !== window.location.origin) continue;
        } catch { continue; }
        const link = document.createElement('a');
        link.className = 'knop-secundair comit-antwoord-knop';
        link.href = knop.href;
        link.textContent = knop.label;
        knoppen.append(link);
      }
      knoppen.hidden = true;
      if (knoppen.childElementCount) wolk.append(knoppen);
      await toonAntwoord(antwoordTekst, antwoord.tekst);
      knoppen.hidden = false;
      knoppen.classList.add('is-zichtbaar');
      bezig = false;
      werkKnopBij();
      naarLaatsteBericht();
    };

    formulier.addEventListener('submit', event => {
      event.preventDefault();
      verstuurVraag(invoer.value);
    });
    invoer.addEventListener('input', () => { pasInvoerAan(); werkKnopBij(); });
    invoer.addEventListener('keydown', event => {
      if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
        event.preventDefault();
        formulier.requestSubmit();
      }
    });
    pagina.querySelectorAll('.comit-voorstel').forEach(knop => knop.addEventListener('click', () => verstuurVraag(knop.textContent)));
    pagina.hidden = false;
    const logo = pagina.querySelector('.comit-hero-logo').getBoundingClientRect();
    const midden = (window.visualViewport?.offsetTop || 0) + (window.visualViewport?.height || window.innerHeight) / 2;
    pagina.style.setProperty('--comit-logo-start-y', `${midden - logo.top - logo.height / 2}px`);
    pagina.dataset.opening = minderBeweging.matches ? 'klaar' : gezien ? 'herhaal' : 'eerste';
    pasInvoerAan();
    new ResizeObserver(() => {
      document.body.style.setProperty('--comit-invoer-hoogte', `${formulier.getBoundingClientRect().height}px`);
    }).observe(formulier);
    werkKnopBij();
    if (!minderBeweging.matches) openingTimer = window.setTimeout(openingKlaar, gezien ? 300 : 2200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
