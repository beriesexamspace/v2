// Comit als pixel-poppetje: één bron (het raster) voor de site (SVG) én voor afbeeldingen (PNG via maak-png.js).
// Elke letter in het raster is een kleur uit het palet. Het trainingspak (w) is wit in lichte modus en zwart in donkere modus.
(function (root) {
  const RASTER = [
    '....######......',
    '...#hhhhhh#.....',
    '..#hhhhhhhh#....',
    '.#hhhhhhhhhh#...',
    '.#hhssssssss#...',
    '.#hsssssssss#...',
    '.#hsseessees#...',
    '.#hsssssssss#...',
    '..#ssssssss#....',
    '...#ssssss#.....',
    '....#ssss#......',
    '...#wwwwww#.....',
    '..#wwwwwwww#....',
    '.#ww#wwww#ww#...',
    '.#ww#wwww#ww#...',
    '.#ww#wwww#ww#...',
    '..##wwwwww##....',
    '...#wwwwww#.....',
    '...#ww##ww#.....',
    '...#ww#.#ww#....',
    '...#ww#.#ww#....',
    '...####.####....'
  ];

  // Kleuren per stand. Huid en haar zijn variabelen zodat ze later uit een foto kunnen komen.
  const PALET = {
    licht: { '#': '#1d1d1f', h: '#3b2a1f', s: '#e6b58f', e: '#1d1d1f', w: '#ffffff' },
    donker: { '#': '#9a9aa0', h: '#3b2a1f', s: '#e6b58f', e: '#0b0b0c', w: '#0f0f10' }
  };

  const breedte = RASTER[0].length;
  const hoogte = RASTER.length;

  // SVG met één rect per pixel; kleuren via CSS-variabelen zodat het thema ze wisselt zonder herteken
  function svg(opties = {}) {
    const schaal = opties.schaal || 8;
    const klas = opties.klas || 'comit-pixel';
    let rects = '';
    RASTER.forEach((rij, y) => {
      Array.from(rij).forEach((teken, x) => {
        if (teken === '.') return;
        rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="var(--comit-${teken === '#' ? 'rand' : teken})"/>`;
      });
    });
    return `<svg class="${klas}" viewBox="0 0 ${breedte} ${hoogte}" width="${breedte * schaal}" height="${hoogte * schaal}" shape-rendering="crispEdges" aria-label="Comit" role="img">${rects}</svg>`;
  }

  // CSS-variabelen voor beide standen
  const css = `
.comit-pixel { --comit-rand: ${PALET.licht['#']}; --comit-h: ${PALET.licht.h}; --comit-s: ${PALET.licht.s}; --comit-e: ${PALET.licht.e}; --comit-w: ${PALET.licht.w}; image-rendering: pixelated; }
html[data-theme="dark"] .comit-pixel { --comit-rand: ${PALET.donker['#']}; --comit-h: ${PALET.donker.h}; --comit-s: ${PALET.donker.s}; --comit-e: ${PALET.donker.e}; --comit-w: ${PALET.donker.w}; }
`;

  root.COMIT_PIXEL = { RASTER, PALET, breedte, hoogte, svg, css };
})(typeof window !== 'undefined' ? window : module.exports);
