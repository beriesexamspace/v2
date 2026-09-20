// Maakt doorstuurpagina's voor de oude vaklinks (bijvoorbeeld beriesexamspace.com/mbg/).
// Uitvoer: lancering/doorsturen/<id>/index.html, één per vak uit assets/vakken.js.
// Deze mappen kopieer je bij de lancering in de repo van de oude site (beriesexamspace.github.io),
// over de bestaande vakmappen heen. Tot die dag blijft de oude site onaangeroerd.
//
//   node lancering/maak-doorsturen.js            -> doel /vak/<id>/ (na de lancering op het hoofddomein)
//   node lancering/maak-doorsturen.js /v2/vak/   -> doel /v2/vak/<id>/ (zolang v2 nog onder /v2/ staat)

const fs = require('fs');
const path = require('path');

const doelBasis = process.argv[2] || '/vak/';
global.window = {};
require(path.join(__dirname, '..', 'assets', 'vakken.js'));
const vakken = window.BES_VAKKEN || [];
const uit = path.join(__dirname, 'doorsturen');
fs.rmSync(uit, { recursive: true, force: true });

const pagina = (id, naam) => `<!doctype html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <meta http-equiv="refresh" content="0; url=${doelBasis}${id}/">
  <link rel="canonical" href="https://beriesexamspace.com${doelBasis}${id}/">
  <title>${naam} is verhuisd | Berie's Exam Space</title>
  <script>window.location.replace('${doelBasis}${id}/' + window.location.hash);</script>
  <style>body{margin:0;min-height:100vh;display:grid;place-items:center;font-family:Inter,-apple-system,system-ui,sans-serif;background:#fff;color:#1d1d1f;text-align:center;padding:24px}a{color:#0071e3}@media(prefers-color-scheme:dark){body{background:#0b0b0c;color:#f5f5f7}a{color:#0a84ff}}</style>
</head>
<body>
  <p>${naam} staat nu op de nieuwe site.<br><a href="${doelBasis}${id}/">Ga verder →</a></p>
</body>
</html>
`;

let n = 0;
for (const vak of vakken) {
  const map = path.join(uit, vak.id);
  fs.mkdirSync(map, { recursive: true });
  fs.writeFileSync(path.join(map, 'index.html'), pagina(vak.id, vak.naam));
  n++;
}
console.log(`${n} doorstuurpagina's in ${path.relative(process.cwd(), uit)} (doel ${doelBasis}<id>/)`);
