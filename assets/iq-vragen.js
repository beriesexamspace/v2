(() => {
  'use strict';

  const sections = [
    { id: 'patronen', title: 'Matrices en figuurpatronen' },
    { id: 'getallen', title: 'Getalreeksen' },
    { id: 'woorden', title: 'Woordverbanden' },
    { id: 'ruimte', title: 'Ruimtelijk inzicht' }
  ];

  const sorted = cells => [...cells].sort((a, b) => a - b);
  const key = cells => sorted(cells).join(',');
  const same = (a, b) => key(a) === key(b);
  const rotate = cells => sorted(cells.map(cell => (cell % 3) * 3 + 2 - Math.floor(cell / 3)));
  const mirrorLeftRight = cells => sorted(cells.map(cell => Math.floor(cell / 3) * 3 + 2 - cell % 3));
  const mirrorTopBottom = cells => sorted(cells.map(cell => (2 - Math.floor(cell / 3)) * 3 + cell % 3));
  const shift = cells => sorted(cells.map(cell => Math.floor(cell / 3) * 3 + (cell + 1) % 3));
  const union = (a, b) => sorted([...new Set([...a, ...b])]);
  const intersection = (a, b) => sorted(a.filter(cell => b.includes(cell)));
  const difference = (a, b) => sorted(union(a, b).filter(cell => a.includes(cell) !== b.includes(cell)));

  function transform(cells, operations) {
    return operations.reduce((figure, operation) => {
      if (operation === 'clockwise') return rotate(figure);
      if (operation === 'counterclockwise') return rotate(rotate(rotate(figure)));
      if (operation === 'halfturn') return rotate(rotate(figure));
      if (operation === 'left-right') return mirrorLeftRight(figure);
      if (operation === 'top-bottom') return mirrorTopBottom(figure);
      throw new Error('Onbekende figuurbewerking.');
    }, sorted(cells));
  }

  function combine(kind, left, middle) {
    if (kind === 'shift') return shift(middle);
    if (kind === 'rotate') return rotate(middle);
    if (kind === 'union') return union(left, middle);
    if (kind === 'intersection') return intersection(left, middle);
    if (kind === 'difference') return difference(left, middle);
    if (kind === 'rotate-difference') return difference(rotate(left), middle);
    throw new Error('Onbekende matrixregel.');
  }

  function optionsWith(correct, distractors, correctIndex, figures) {
    const values = [...distractors];
    values.splice(correctIndex, 0, correct);
    return values.map((value, index) => ({
      id: String.fromCharCode(97 + index),
      ...(figures ? { cells: sorted(value), size: 3 } : { text: String(value) })
    }));
  }

  function matrix(id, kind, pairs, distractors, correctIndex, explanation) {
    const cells = pairs.flatMap(([left, middle]) => [left, middle, combine(kind, left, middle)]);
    const correct = cells[8];
    cells[8] = null;
    return {
      id, section: 'patronen', title: 'Het ontbrekende vakje',
      instruction: 'In elke rij geldt dezelfde regel. Welke figuur ontbreekt?',
      visual: { type: 'matrix', cells, size: 3 },
      options: optionsWith(correct, distractors, correctIndex, true),
      answer: String.fromCharCode(97 + correctIndex), explanation,
      rule: { kind }
    };
  }

  const numberRules = {
    plusFive: count => Array.from({ length: count }, (_, index) => 7 + index * 5),
    double: count => Array.from({ length: count }, (_, index) => 3 * 2 ** index),
    alternate: count => {
      const values = [4];
      for (let index = 1; index < count; index += 1) values.push(values[index - 1] + (index % 2 ? 5 : -2));
      return values;
    },
    growingDifference: count => {
      const values = [6];
      for (let index = 1; index < count; index += 1) values.push(values[index - 1] + 4 + (index - 1) * 3);
      return values;
    },
    doublePlusOne: count => {
      const values = [2];
      for (let index = 1; index < count; index += 1) values.push(values[index - 1] * 2 + 1);
      return values;
    },
    multiplyAndAdd: count => {
      const values = [2];
      for (let index = 1; index < count; index += 1) values.push(values[index - 1] * index + index);
      return values;
    }
  };

  function sequence(id, kind, count, distractors, correctIndex, explanation) {
    const values = numberRules[kind](count + 1);
    const correct = values.pop();
    return {
      id, section: 'getallen', title: 'Welk getal volgt?',
      instruction: 'Zoek de regel en maak de reeks af.',
      visual: { type: 'sequence', values },
      options: optionsWith(correct, distractors, correctIndex, false),
      answer: String.fromCharCode(97 + correctIndex), explanation,
      rule: { kind }
    };
  }

  const relations = {
    function: { first: ['potlood', 'schrijven'], second: ['schaar', 'knippen'] },
    part: { first: ['blad', 'boom'], second: ['bladzijde', 'boek'] },
    quiet: { first: ['fluisteren', 'spreken'], second: ['sluipen', 'lopen'] },
    intensity: { first: ['koud', 'ijskoud'], second: ['moe', 'uitgeput'] },
    energy: { first: ['brandstof', 'motor'], second: ['voedsel', 'lichaam'] },
    reasoning: { first: ['gevolg', 'oorzaak'], second: ['conclusie', 'premisse'] }
  };

  function analogy(id, relation, distractors, correctIndex, explanation) {
    const { first, second } = relations[relation];
    return {
      id, section: 'woorden',
      title: `${first[0]} staat tot ${first[1]} zoals ${second[0]} tot...`,
      instruction: 'Kies hetzelfde soort verband.', visual: null,
      options: optionsWith(second[1], distractors, correctIndex, false),
      answer: String.fromCharCode(97 + correctIndex), explanation,
      rule: { kind: 'analogy', relation }
    };
  }

  function spatial(id, cells, operations, distractors, correctIndex, instruction, explanation) {
    return {
      id, section: 'ruimte', title: operations.length > 1 ? 'Twee bewerkingen' : 'Draaien of spiegelen',
      instruction,
      visual: { type: 'spatial', cells, size: 3 },
      options: optionsWith(transform(cells, operations), distractors, correctIndex, true),
      answer: String.fromCharCode(97 + correctIndex), explanation,
      rule: { kind: 'transform', operations }
    };
  }

  const questions = [
    matrix('p1', 'shift', [
      [[0], [1]], [[3], [4]], [[6], [7]]
    ], [[0], [2], [4], [6], [7]], 2,
    'Het gevulde vakje schuift in elke rij telkens één plek naar rechts. Na linksonder en middenonder volgt rechtsonder.'),

    matrix('p2', 'union', [
      [[0], [1]], [[3], [4]], [[6], [7]]
    ], [[6], [7], [7, 8], [3, 6], [6, 7, 8]], 4,
    'De derde figuur bevat alle gevulde vakjes van de eerste twee samen. Onderaan blijven dus linksonder en middenonder gevuld.'),

    matrix('p3', 'rotate', [
      [[0, 3, 4], [1, 2, 4]], [[1, 6, 7], [0, 3, 5]], [[0, 1, 3, 8], [1, 2, 5, 6]]
    ], [[0, 1, 3, 8], [0, 1, 2, 5], [0, 3, 7, 8], [1, 2, 5, 6], [0, 2, 6, 8]], 0,
    'Elke volgende figuur is een kwartslag met de klok mee gedraaid. Na twee kwartslagen staat de eerste figuur ondersteboven: linksboven, middenrechts, middenonder en rechtsonder zijn gevuld.'),

    matrix('p4', 'intersection', [
      [[0, 1, 4], [1, 4, 8]], [[2, 3, 5], [3, 5, 6]], [[0, 2, 4, 6], [2, 4, 5, 8]]
    ], [[0, 6], [5, 8], [0, 2, 4, 6], [0, 5, 6, 8], [2, 4, 8]], 5,
    'Alleen vakjes die in beide eerste figuren gevuld zijn, blijven in de derde figuur staan. In de onderste rij zijn dat rechtsboven en het midden.'),

    matrix('p5', 'difference', [
      [[0, 1, 4], [1, 4, 8]], [[2, 3, 5], [3, 5, 6]], [[0, 2, 4, 6], [2, 4, 5, 8]]
    ], [[2, 4], [0, 2, 4, 5, 6, 8], [0, 6], [5, 8], [0, 2, 6, 8]], 1,
    'Vakjes die maar in één van de eerste twee figuren gevuld zijn, blijven staan. Gedeelde vakjes verdwijnen. Linksboven, middenrechts, linksonder en rechtsonder blijven over.'),

    matrix('p6', 'rotate-difference', [
      [[0, 3, 4], [1, 4, 8]], [[2, 4, 5], [0, 4, 7]], [[0, 2, 6], [0, 3, 8]]
    ], [[0, 2, 3, 8], [0, 2, 8], [0, 3, 8], [2, 6], [3, 6]], 3,
    'Draai eerst de linker figuur een kwartslag met de klok mee. Combineer hem met de middelste figuur en haal de gedeelde vakjes weg. Alleen rechtsboven en middenlinks blijven over.'),

    sequence('g1', 'plusFive', 5, [28, 30, 31, 34, 37], 1,
    'Er komt steeds 5 bij: 7, 12, 17, 22, 27, 32.'),
    sequence('g2', 'double', 5, [51, 72, 84, 108, 192], 3,
    'Elk getal is het dubbele van het vorige. Twee keer 48 is 96.'),
    sequence('g3', 'alternate', 6, [11, 12, 17, 18, 20], 5,
    'De stappen wisselen: 5 erbij, 2 eraf. Na 10 naar 15 met 5 erbij volgt 15 min 2: 13.'),
    sequence('g4', 'growingDifference', 5, [53, 54, 55, 57, 59], 0,
    'De verschillen zijn 4, 7, 10 en 13. Ze worden telkens 3 groter. Het volgende verschil is 16, dus 40 plus 16 is 56.'),
    sequence('g5', 'doublePlusOne', 5, [93, 94, 96, 97, 99], 4,
    'Vermenigvuldig steeds met 2 en tel er 1 bij op. Na 47 volgt 47 keer 2 plus 1: 95.'),
    sequence('g6', 'multiplyAndAdd', 5, [560, 561, 564, 566, 570], 2,
    'Gebruik achtereenvolgens 1, 2, 3, 4 en 5: vermenigvuldig met dat getal en tel hetzelfde getal erbij op. De laatste stap is 112 keer 5 plus 5: 565.'),

    analogy('w1', 'function', ['meten', 'lijmen', 'vouwen', 'tekenen', 'wegen'], 3,
    'Het verband is een hulpmiddel en zijn gebruik: met een potlood schrijf je, met een schaar knip je.'),
    analogy('w2', 'part', ['kast', 'potlood', 'letter', 'lezer', 'inkt'], 0,
    'Het eerste is een onderdeel van het tweede. Een blad hoort bij een boom, een bladzijde bij een boek.'),
    analogy('w3', 'quiet', ['rennen', 'liggen', 'roepen', 'kijken', 'wachten'], 4,
    'Fluisteren is zacht spreken. Sluipen is stil en voorzichtig lopen. Beide eerste woorden zijn een stille vorm van de tweede handeling.'),
    analogy('w4', 'intensity', ['wakker', 'ontspannen', 'slaperig', 'fit', 'tevreden'], 2,
    'Het tweede woord versterkt het eerste: ijskoud is heel koud en uitgeput is heel moe.'),
    analogy('w5', 'energy', ['bord', 'keuken', 'vork', 'recept', 'voorraad'], 5,
    'Het eerste levert energie aan het tweede: brandstof aan een motor, voedsel aan een lichaam.'),
    analogy('w6', 'reasoning', ['voorbeeld', 'vraag', 'bezwaar', 'uitzondering', 'voorspelling'], 1,
    'Een gevolg vloeit voort uit een oorzaak. Een conclusie volgt in een redenering uit een premisse, een aanname of uitgangspunt.'),

    spatial('r1', [0, 3, 4], ['clockwise'],
      [[0, 3, 4], [4, 5, 8], [4, 6, 7], [1, 4, 6], [2, 4, 5]], 4,
      'Draai de figuur een kwartslag met de klok mee.',
      'Linksboven wordt rechtsboven, middenlinks wordt middenboven en het midden blijft staan. De gevulde vakjes zijn middenboven, rechtsboven en het midden.'),
    spatial('r2', [0, 1, 5], ['counterclockwise'],
      [[1, 2, 7], [3, 7, 8], [0, 3, 5], [2, 4, 7], [1, 5, 8]], 1,
      'Draai de figuur een kwartslag tegen de klok in.',
      'Linksboven wordt linksonder, middenboven wordt middenlinks en middenrechts wordt middenboven. Dus middenboven, middenlinks en linksonder zijn gevuld.'),
    spatial('r3', [0, 3, 7], ['left-right'],
      [[0, 3, 7], [1, 5, 8], [1, 3, 6], [1, 6, 7], [0, 5, 7]], 3,
      'Spiegel de figuur van links naar rechts. Boven en onder blijven gelijk.',
      'Linksboven wordt rechtsboven en middenlinks wordt middenrechts. Middenonder blijft op dezelfde plek: rechtsboven, middenrechts en middenonder zijn gevuld.'),
    spatial('r4', [1, 2, 3, 8], ['top-bottom'],
      [[0, 5, 6, 7], [0, 3, 7, 8], [0, 1, 3, 8], [1, 2, 5, 6], [0, 2, 6, 8]], 0,
      'Spiegel de figuur van boven naar onder. Links en rechts blijven gelijk.',
      'De bovenste en onderste rij wisselen. De middelste rij blijft staan. Rechtsboven, middenlinks, middenonder en rechtsonder zijn nu gevuld.'),
    spatial('r5', [0, 1, 3, 8], ['halfturn', 'left-right'],
      [[0, 1, 3, 8], [0, 5, 7, 8], [1, 2, 5, 6], [0, 1, 2, 5], [3, 6, 7, 8]], 5,
      'Draai een halve slag. Spiegel daarna van links naar rechts.',
      'Na de halve slag zijn linksboven, middenrechts, middenonder en rechtsonder gevuld. Na het spiegelen blijven rechtsboven, middenlinks, linksonder en middenonder over.'),
    spatial('r6', [0, 1, 3, 8], ['clockwise', 'top-bottom'],
      [[0, 1, 3, 8], [0, 1, 2, 5], [2, 3, 6, 7], [1, 2, 5, 6], [5, 6, 7, 8]], 2,
      'Draai een kwartslag met de klok mee. Spiegel daarna van boven naar onder.',
      'Na het draaien zijn middenboven, rechtsboven, middenrechts en linksonder gevuld. Wissel daarna boven en onder: linksboven, middenrechts, middenonder en rechtsonder zijn gevuld.')
  ];

  function assert(condition, message) {
    if (!condition) throw new Error(`Ongeldige denktest: ${message}`);
  }

  function validateCells(cells) {
    assert(Array.isArray(cells), 'een figuur mist vakjes');
    assert(new Set(cells).size === cells.length, 'dubbele vakjes in een figuur');
    assert(cells.every(cell => Number.isInteger(cell) && cell >= 0 && cell < 9), 'vakje buiten het raster');
  }

  function expectedValue(question) {
    if (question.section === 'patronen') {
      const { cells } = question.visual;
      assert(cells.length === 9 && cells[8] === null, 'matrix moet rechtsonder één vakje missen');
      cells.slice(0, 8).forEach(validateCells);
      for (let row = 0; row < 3; row += 1) {
        const [left, middle, right] = cells.slice(row * 3, row * 3 + 3);
        if (question.rule.kind === 'shift') assert(same(shift(left), middle), 'matrixverschuiving klopt niet');
        if (question.rule.kind === 'rotate') assert(same(rotate(left), middle), 'matrixdraaiing klopt niet');
        if (row < 2) assert(same(combine(question.rule.kind, left, middle), right), 'matrixregel klopt niet');
      }
      return key(combine(question.rule.kind, cells[6], cells[7]));
    }
    if (question.section === 'getallen') {
      const generate = numberRules[question.rule.kind];
      assert(typeof generate === 'function', 'getalregel ontbreekt');
      const generated = generate(question.visual.values.length + 1);
      assert(question.visual.values.every((value, index) => value === generated[index]), 'getalreeks klopt niet');
      return String(generated[generated.length - 1]);
    }
    if (question.section === 'woorden') {
      const relation = relations[question.rule.relation];
      assert(Boolean(relation), 'woordverband ontbreekt');
      return relation.second[1];
    }
    validateCells(question.visual.cells);
    return key(transform(question.visual.cells, question.rule.operations));
  }

  function validate(candidateQuestions = questions) {
    assert(candidateQuestions.length === 24, 'er moeten 24 vragen zijn');
    assert(new Set(candidateQuestions.map(question => question.id)).size === 24, 'dubbele vraag-id');
    sections.forEach(section => {
      assert(candidateQuestions.filter(question => question.section === section.id).length === 6, 'elk onderdeel moet zes vragen hebben');
    });
    candidateQuestions.forEach((question, index) => {
      assert(question.section === sections[Math.floor(index / 6)].id, 'onderdelen staan niet op volgorde');
      assert(question.options.length === 6, 'elke vraag moet zes keuzes hebben');
      assert(new Set(question.options.map(option => option.id)).size === 6, 'dubbele keuze-id');
      const values = question.options.map(option => {
        if (Array.isArray(option.cells)) {
          validateCells(option.cells);
          return key(option.cells);
        }
        return option.text.trim().toLocaleLowerCase('nl');
      });
      assert(new Set(values).size === values.length, `${question.id} heeft gelijke keuzes`);
      const expected = expectedValue(question);
      const matches = values.map((value, optionIndex) => value === expected ? optionIndex : -1).filter(optionIndex => optionIndex >= 0);
      assert(matches.length === 1, `${question.id} heeft niet precies één passend antwoord`);
      assert(question.options[matches[0]].id === question.answer, `${question.id} wijst het verkeerde antwoord aan`);
      assert(typeof question.explanation === 'string' && question.explanation.length > 0, 'uitleg ontbreekt');
    });
    return true;
  }

  validate();
  window.BES_IQ_DATA = { sections, questions, validate };
})();
