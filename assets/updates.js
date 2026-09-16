window.BES_UPDATES = [
  { datum: '16 september 2026', tekst: '**Reken je punten** en **Examen-info** staan in de nieuwe stijl.' },
  { datum: '15 september 2026', tekst: 'Alle vakken staan in de **nieuwe vakpagina**, met **voortgang bij je account**.' },
  { datum: '15 september 2026', tekst: '**Aanmelden en inloggen** met je eigen account.' },
  { datum: '14 september 2026', tekst: "Nieuwe **startpagina**, **hub**, **jaarpagina's** en **WhatsApp-pagina**." }
];

window.BES = window.BES || {};
window.BES.updateTekst = tekst => {
  const waarde = typeof tekst === 'string' ? tekst : '';
  const fragment = document.createDocumentFragment();
  let vanaf = 0;
  for (const match of waarde.matchAll(/\*\*([^*]+)\*\*/g)) {
    fragment.append(waarde.slice(vanaf, match.index));
    const nadruk = document.createElement('strong');
    nadruk.textContent = match[1];
    fragment.append(nadruk);
    vanaf = match.index + match[0].length;
  }
  fragment.append(waarde.slice(vanaf));
  return fragment;
};
