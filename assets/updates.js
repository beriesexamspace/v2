window.BES_UPDATES = [
  { soort: 'verbeterd', datum: '16 september 2026', tekst: '**Reken je punten** en **Examen-info** staan in de nieuwe stijl.' },
  { soort: 'verbeterd', datum: '15 september 2026', tekst: 'Alle vakken staan in de **nieuwe vakpagina**, met **voortgang bij je account**.' },
  { soort: 'nieuw', datum: '15 september 2026', tekst: '**Aanmelden en inloggen** met je eigen account.' },
  { soort: 'nieuw', datum: '14 september 2026', tekst: "Nieuwe **startpagina**, **hub**, **jaarpagina's** en **WhatsApp-pagina**." }
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

window.BES.updateRij = (update, variant) => {
  const item = document.createElement('li');
  item.className = variant === 'hub' ? 'hub-update' : 'nieuw-update';
  const meta = document.createElement('span');
  meta.className = 'update-meta';
  const label = document.createElement('span');
  const soort = update.soort === 'verbeterd' ? 'verbeterd' : 'nieuw';
  label.className = 'update-label update-label-' + soort;
  label.textContent = soort === 'verbeterd' ? 'Verbeterd' : 'Nieuw';
  const datum = document.createElement('span');
  datum.className = 'update-datum';
  datum.textContent = update.datum;
  meta.append(label, datum);
  const tekst = document.createElement('span');
  tekst.append(window.BES.updateTekst(update.tekst));
  item.append(meta, tekst);
  return item;
};
