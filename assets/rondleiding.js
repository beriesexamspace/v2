(() => {
  'use strict';
  const tour = document.getElementById('rondleiding');
  if (!tour) return;
  const stappen = [
    { id: 'naam', titel: 'Begin met je naam', uitleg: 'Kies op de startpagina Aanmelden. Vul je voornaam en achternaam in. Een bijnaam mag, maar hoeft niet. Daarna vragen we je e-mailadres en een wachtwoord. Heb je al een account? Kies dan Log in op de startpagina.', actie: 'Vul je naam in en kies Verder.', alt: 'Het aanmeldscherm met voornaam, achternaam, optionele bijnaam en de knop Verder.' },
    { id: 'jaar', titel: 'Kies jouw studiejaar', uitleg: 'Na aanmelden of inloggen lees je eerst Wat is nieuw. Kies daarna Begrepen om naar je space te gaan. Hier staan de drie jaarkaarten. Open het jaar waarvan je een vak wilt oefenen.', actie: 'Klik op jouw jaarkaart. In dit voorbeeld: 1ste bachelor.', alt: 'De jaarkaart 1ste bachelor op de hub, met Bekijk vakken.' },
    { id: 'vak', titel: 'Open het vak dat je wilt oefenen', uitleg: 'Je jaarpagina laat de vakken zien met een korte beschrijving. De hele kaart is klikbaar. We gebruiken Inleiding tot de pedagogische wetenschappen als voorbeeld.', actie: 'Klik op de kaart met de naam van je vak.', alt: 'De vakkaart Inleiding tot de pedagogische wetenschappen op de jaarpagina.' },
    { id: 'vorm', titel: 'Kies hoe je wilt oefenen', uitleg: 'Examen Training geeft na elke vraag uitleg. Bij Examensimulatie krijg je je uitslag en uitleg pas aan het einde. Die gebruikt maximaal twintig vragen uit alle beschikbare hoofdstukken. In dit voorbeeld kiezen we Training.', actie: 'Kies Examen Training om met uitleg te oefenen.', alt: 'De keuzes Examen Training en Examensimulatie op de vakpagina.' },
    { id: 'niveau', titel: 'Begin op Normaal niveau', uitleg: 'Onder de oefenvorm staat bij dit voorbeeldvak de niveaukeuze. Normaal gebruikt de bestaande vragen. Hard mode heeft een aparte reeks moeilijkere toepassingsvragen. Alleen Inleiding tot de pedagogische wetenschappen heeft deze keuze nu. Bij andere vakken kun je deze stap overslaan.', actie: 'Kies Normaal om met de gewone vragen te beginnen.', alt: 'De niveaukeuze met Normaal geselecteerd en daarnaast Hard mode.' },
    { id: 'hoofdstuk', titel: 'Kies een hoofdstuk', uitleg: 'Bij Training bepaal jij wat je oefent. Klik op een hoofdstuk om het aan of uit te zetten. Met Niets maak je eerst de selectie leeg; met Alles kies je alle beschikbare hoofdstukken. Voor dit voorbeeld kiezen we alleen hoofdstuk 1.', actie: 'Selecteer minstens één hoofdstuk.', alt: 'De hoofdstukkeuze met het eerste hoofdstuk geselecteerd en de knoppen Alles en Niets.' },
    { id: 'start', titel: 'Controleer je keuze en begin', uitleg: 'Boven Start zie je bij dit voorbeeldvak je oefenvorm, niveau, gekozen hoofdstuk en het aantal vragen. Klopt je keuze? Dan kun je beginnen. Je oefening is pas gestart wanneer je op Start klikt.', actie: 'Klik op Start wanneer je klaar bent.', alt: 'Het overzicht Jouw oefening met Examen Training, Normaal, één hoofdstuk en de knop Start.' },
    { id: 'antwoord', titel: 'Lees de vraag en kies je antwoord', uitleg: 'Klik op het antwoord dat volgens jou klopt. Staat er Kies 2 antwoorden? Selecteer dan precies twee opties en kies Controleer. Bij een vraag met één antwoord wordt je keuze meteen nagekeken.', actie: 'Klik op een antwoord onder de vraag.', alt: 'Een echte oefenvraag met vier antwoordmogelijkheden.' },
    { id: 'uitleg', titel: 'Lees waarom een antwoord klopt', uitleg: 'Tijdens Training zie je meteen wat goed of fout was. Onder Waarom staat de uitleg. Neem die rustig door en ga dan naar de volgende vraag. Bij de laatste vraag heet de knop Bekijk je uitslag.', actie: 'Lees de uitleg en kies Volgende.', alt: 'De uitleg Waarom na een beantwoorde oefenvraag, met de knop Volgende.' },
    { id: 'uitslag', titel: 'Bekijk je resultaat en herhaal', uitleg: 'Na de laatste vraag zie je je score. Met Fouten opnieuw oefen je de vragen die nog lastig waren, met uitleg na iedere vraag. Terug naar het vak brengt je bij de hoofdstukken en je bijgewerkte trainingsvoortgang. Theorie en Studie-hacks vind je bovenaan de vakpagina.', actie: 'Kies Terug naar het vak om je hoofdstukken weer te zien.', alt: 'Een oefenuitslag met score, Fouten opnieuw, Opnieuw en Terug naar het vak.' }
  ];
  const beelden = {"naam":{"desktop":{"w":812,"h":551,"doel":{"x":50,"y":92.979}},"mobiel":{"w":367,"h":514,"doel":{"x":50,"y":92.452}}},"jaar":{"desktop":{"w":1084,"h":276,"doel":{"x":16.912,"y":81.041}},"mobiel":{"w":359,"h":275,"doel":{"x":50,"y":81.227}}},"vak":{"desktop":{"w":546,"h":136,"doel":{"x":44.103,"y":38.913}},"mobiel":{"w":359,"h":203,"doel":{"x":42.201,"y":37.007}}},"vorm":{"desktop":{"w":904,"h":360,"doel":{"x":13.885,"y":57.218}},"mobiel":{"w":367,"h":587,"doel":{"x":33.113,"y":34.439}}},"hoofdstuk":{"desktop":{"w":904,"h":400,"doel":{"x":50,"y":46.404}},"mobiel":{"w":367,"h":530,"doel":{"x":50,"y":48.007}}},"start":{"desktop":{"w":904,"h":166,"doel":{"x":88.164,"y":50}},"mobiel":{"w":367,"h":256,"doel":{"x":50,"y":75.012}}},"antwoord":{"desktop":{"w":904,"h":556,"doel":{"x":50,"y":46.442}},"mobiel":{"w":367,"h":725,"doel":{"x":50,"y":44.603}}},"uitleg":{"desktop":{"w":904,"h":233,"doel":{"x":87.168,"y":83.436}},"mobiel":{"w":367,"h":302,"doel":{"x":50,"y":87.314}}},"uitslag":{"desktop":{"w":904,"h":546,"doel":{"x":50,"y":80.792}},"mobiel":{"w":367,"h":613,"doel":{"x":50,"y":79.364}}},"niveau":{"mobiel":{"w":367,"h":220,"doel":{"x":20.557,"y":53.743}},"desktop":{"w":904,"h":219,"doel":{"x":8.346,"y":53.796}}}}; // CAPTURE_METADATA
  const byId = id => document.getElementById(id);
  const beeld = byId('rondleiding-foto');
  const mobielBeeld = byId('rondleiding-mobiel');
  const venster = byId('rondleiding-venster');
  const muis = byId('rondleiding-muis');
  const doel = byId('rondleiding-doel');
  const pijl = byId('rondleiding-pijl');
  const vorige = byId('rondleiding-vorige');
  const volgende = byId('rondleiding-volgende');
  const opnieuw = byId('rondleiding-opnieuw');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const mobiel = matchMedia('(max-width: 600px)');
  let index = 0;
  let zichtbaar = false;
  let afgespeeld = false;
  let animaties = [];
  let doelpunt = { x: 50, y: 50 };

  function stop() {
    animaties.forEach(animatie => animatie.cancel());
    animaties = [];
  }

  function speel() {
    stop();
    if (!zichtbaar || document.hidden || !beeld.complete || !beeld.naturalWidth) return;
    afgespeeld = true;
    if (motion.matches) return;
    const x = doelpunt.x + '%';
    const y = doelpunt.y + '%';
    animaties.push(muis.animate([
      { left: Math.max(4, doelpunt.x - 18) + '%', top: Math.max(4, doelpunt.y - 19) + '%', opacity: 0, offset: 0 },
      { left: Math.max(4, doelpunt.x - 18) + '%', top: Math.max(4, doelpunt.y - 19) + '%', opacity: 1, offset: .12 },
      { left: x, top: y, opacity: 1, transform: 'scale(1)', offset: .7 },
      { left: x, top: y, opacity: 1, transform: 'scale(.83)', offset: .82 },
      { left: x, top: y, opacity: 1, transform: 'scale(1)', offset: 1 }
    ], { duration: 2100, easing: 'ease-in-out', fill: 'both' }));
    animaties.push(doel.animate([
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(1.25)', opacity: .65 },
      { transform: 'scale(1)', opacity: 1 }
    ], { duration: 600, delay: 1470, fill: 'both', easing: 'ease-out' }));
  }

  function toonBeeld() {
    stop();
    const stap = stappen[index];
    const thema = document.documentElement.dataset.theme === 'dark' ? 'donker' : 'licht';
    const formaat = mobiel.matches ? 'mobiel' : 'desktop';
    const frame = beelden[stap.id]?.[formaat];
    venster.classList.add('is-laden');
    beeld.src = 'assets/rondleiding/' + stap.id + '-' + thema + '-desktop.jpg';
    mobielBeeld.srcset = 'assets/rondleiding/' + stap.id + '-' + thema + '-mobiel.jpg';
    beeld.alt = stap.alt;
    if (!frame) return;
    venster.style.setProperty('--beeld-verhouding', frame.w + '/' + frame.h);
    venster.style.setProperty('--beeld-max', Math.min(frame.w, mobiel.matches ? frame.w : 500 * frame.w / frame.h) + 'px');
    doelpunt = frame.doel;
    [muis, doel, pijl].forEach(element => {
      element.style.left = doelpunt.x + '%';
      element.style.top = doelpunt.y + '%';
    });
    if (beeld.complete && beeld.naturalWidth) venster.classList.remove('is-laden');
  }

  function toonStap(doorGebruiker = false) {
    const stap = stappen[index];
    byId('rondleiding-teller').textContent = 'Stap ' + (index + 1) + ' van ' + stappen.length;
    byId('rondleiding-titel').textContent = stap.titel;
    byId('rondleiding-uitleg').textContent = stap.uitleg;
    byId('rondleiding-actie').textContent = stap.actie;
    vorige.disabled = index === 0;
    volgende.disabled = index === stappen.length - 1;
    toonBeeld();
    afgespeeld = false;
    if (zichtbaar) speel();
    if (doorGebruiker) tour.querySelector('.rondleiding-kop').scrollIntoView({ block: 'start', behavior: motion.matches ? 'auto' : 'smooth' });
  }

  vorige.addEventListener('click', () => {
    if (index === 0) return;
    index -= 1;
    toonStap(true);
    if (vorige.disabled) volgende.focus({ preventScroll: true });
  });
  volgende.addEventListener('click', () => {
    if (index === stappen.length - 1) return;
    index += 1;
    toonStap(true);
    if (volgende.disabled) vorige.focus({ preventScroll: true });
  });
  opnieuw.addEventListener('click', () => {
    afgespeeld = false;
    venster.scrollIntoView({ block: 'center', behavior: motion.matches ? 'auto' : 'smooth' });
    speel();
  });
  beeld.addEventListener('load', () => {
    venster.classList.remove('is-laden');
    if (!afgespeeld) speel();
  });
  motion.addEventListener('change', stop);
  mobiel.addEventListener('change', toonBeeld);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  new MutationObserver(toonBeeld).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  new IntersectionObserver(entries => {
    zichtbaar = entries[0].isIntersecting;
    if (zichtbaar && !afgespeeld) speel();
    if (!zichtbaar) stop();
  }, { threshold: .15 }).observe(venster);
  toonStap();
})();
