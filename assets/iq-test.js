/* Ruwe spelbenadering zonder normering: deze zelfgekozen omrekening is geen
   IQ-meting. De grenzen zijn geen betrouwbaarheidsinterval of leeftijdsnorm. */
const IQ_BEREIK_PER_SCORE = Object.freeze([
  [80, 90], [82, 92], [84, 94], [86, 96], [88, 98], [90, 100],
  [92, 102], [94, 104], [96, 106], [98, 108], [100, 110], [102, 112],
  [104, 114], [106, 116], [108, 118], [110, 120], [112, 122], [114, 124],
  [116, 126], [118, 128], [120, 130], [122, 132], [124, 134], [126, 136],
  [128, 138]
].map(bereik => Object.freeze(bereik)));

function iqBereik(score) {
  if (!Number.isInteger(score) || score < 0 || score >= IQ_BEREIK_PER_SCORE.length) {
    throw new RangeError('De score moet een geheel getal van 0 tot en met 24 zijn.');
  }
  return IQ_BEREIK_PER_SCORE[score];
}

(() => {
  'use strict';

  const DUUR_MS = 20 * 60 * 1000;
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const $ = id => document.getElementById(id);
  const data = window.BES_IQ_DATA;
  let index = 0;
  let answers = [];
  let orders = [];
  let previousOrders = [];
  let startedAt = 0;
  let startedMonotonic = 0;
  let elapsed = 0;
  let interval = null;
  let state = 'start';
  let ready = false;
  let owner = null;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function svgNode(tag, attributes) {
    const node = document.createElementNS(SVG_NS, tag);
    Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, value));
    return node;
  }

  function grid(parent, cells, x, y, size) {
    const unit = size / 3;
    for (let cell = 0; cell < 9; cell += 1) {
      parent.append(svgNode('rect', {
        x: x + (cell % 3) * unit + 2,
        y: y + Math.floor(cell / 3) * unit + 2,
        width: unit - 4, height: unit - 4, rx: 3,
        class: cells.includes(cell) ? 'iq-cell iq-cell-fill' : 'iq-cell iq-cell-empty'
      }));
    }
  }

  function cellDescription(cells) {
    return cells.length ? 'Ingevulde vakjes: ' + cells.slice().sort((a, b) => a - b).map(cell =>
      'rij ' + (Math.floor(cell / 3) + 1) + ' kolom ' + (cell % 3 + 1)
    ).join(', ') : 'Geen ingevulde vakjes';
  }

  function figure(cells, className = 'iq-spatial') {
    const svg = svgNode('svg', { viewBox: '0 0 180 180', class: className, role: 'img', 'aria-label': cellDescription(cells) });
    grid(svg, cells, 0, 0, 180);
    return svg;
  }

  function visual(question) {
    const specification = question.visual;
    if (!specification) return null;
    if (specification.type === 'sequence') {
      const row = element('div', 'iq-sequence');
      row.setAttribute('aria-label', 'Reeks: ' + specification.values.join(', ') + ', vraagteken');
      specification.values.concat('?').forEach(value => row.append(element('span', '', String(value))));
      return row;
    }
    if (specification.type === 'spatial') return figure(specification.cells);
    const svg = svgNode('svg', { viewBox: '0 0 324 324', class: 'iq-matrix', role: 'img' });
    svg.setAttribute('aria-label', specification.cells.map((cells, tile) =>
      'Figuur rij ' + (Math.floor(tile / 3) + 1) + ' kolom ' + (tile % 3 + 1) + ': ' +
      (cells === null ? 'ontbreekt' : cellDescription(cells))
    ).join('. '));
    specification.cells.forEach((cells, tile) => {
      const x = (tile % 3) * 108;
      const y = Math.floor(tile / 3) * 108;
      svg.append(svgNode('rect', { x: x + 3, y: y + 3, width: 102, height: 102, rx: 12, class: 'iq-tile' }));
      if (cells === null) {
        const missing = svgNode('text', { x: x + 54, y: y + 67, 'text-anchor': 'middle', class: 'iq-missing' });
        missing.textContent = '?';
        svg.append(missing);
      } else grid(svg, cells, x + 17, y + 17, 74);
    });
    return svg;
  }

  function shuffle(options, previous) {
    const shuffled = options.slice();
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    if (previous && shuffled.every((option, i) => option.id === previous[i].id)) shuffled.push(shuffled.shift());
    return shuffled;
  }

  function screen(nextState) {
    state = nextState;
    document.body.dataset.iqState = nextState;
    ['start', 'quiz', 'results'].forEach(name => { $('iq-' + name).hidden = name !== nextState; });
    window.scrollTo(0, 0);
  }

  function focus(node) {
    node.focus({ preventScroll: true });
  }

  function updateElapsed() {
    elapsed = Math.min(DUUR_MS, Math.max(elapsed, Date.now() - startedAt, performance.now() - startedMonotonic));
    return elapsed;
  }

  function formatTime(milliseconds) {
    const seconds = Math.ceil(milliseconds / 1000);
    return String(Math.floor(seconds / 60)).padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0');
  }

  function tick() {
    if (state !== 'quiz') return false;
    const remaining = DUUR_MS - updateElapsed();
    $('iq-timer').textContent = formatTime(remaining);
    $('iq-timer').classList.toggle('is-low', remaining <= 60 * 1000);
    if (remaining <= 0) { finish(true); return false; }
    return true;
  }

  function choose(answer) {
    if (!tick()) return;
    answers[index] = answer;
    $('iq-options').querySelectorAll('button').forEach(button => {
      const selected = button.dataset.answer === answer;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }

  function renderQuestion() {
    const question = data.questions[index];
    const section = data.sections.find(item => item.id === question.section);
    $('iq-progress').textContent = 'Vraag ' + (index + 1) + ' van ' + data.questions.length;
    $('iq-section').textContent = section.title;
    $('iq-progress-bar').value = index;
    $('iq-question-title').textContent = question.title;
    $('iq-instruction').textContent = question.instruction;
    $('iq-quiz').dataset.type = question.visual?.type || 'words';
    $('iq-visual').replaceChildren();
    const drawing = visual(question);
    if (drawing) $('iq-visual').append(drawing);
    $('iq-visual').hidden = !drawing;
    $('iq-options').querySelectorAll('button').forEach(button => button.remove());
    orders[index].forEach((option, optionIndex) => {
      const button = element('button', 'iq-option');
      button.type = 'button';
      button.dataset.answer = option.id;
      button.setAttribute('aria-pressed', 'false');
      const number = element('span', 'iq-option-number', String(optionIndex + 1));
      number.setAttribute('aria-hidden', 'true');
      const content = element('span', 'iq-option-content');
      if (option.cells) {
        content.append(figure(option.cells, 'iq-choice-figure'));
        button.setAttribute('aria-label', 'Antwoord ' + (optionIndex + 1) + '. ' + cellDescription(option.cells));
      } else {
        content.textContent = option.text;
        button.setAttribute('aria-label', 'Antwoord ' + (optionIndex + 1) + ': ' + option.text);
      }
      button.append(number, content);
      button.addEventListener('click', () => choose(option.id));
      $('iq-options').append(button);
    });
    $('iq-next').textContent = index === data.questions.length - 1 ? 'Afronden →' : 'Volgende →';
    focus($('iq-question-title'));
  }

  function start() {
    if (!ready || state === 'quiz') return;
    data.validate();
    orders = data.questions.map((question, i) => shuffle(question.options, previousOrders[i]));
    previousOrders = orders;
    answers = Array(data.questions.length).fill(null);
    index = 0;
    elapsed = 0;
    startedAt = Date.now();
    startedMonotonic = performance.now();
    screen('quiz');
    renderQuestion();
    tick();
    interval = window.setInterval(tick, 250);
  }

  function next() {
    if (!tick()) return;
    if (index === data.questions.length - 1) finish(false);
    else { index += 1; renderQuestion(); }
  }

  function finish(expired) {
    if (state !== 'quiz') return;
    updateElapsed();
    window.clearInterval(interval);
    interval = null;
    const score = data.questions.reduce((sum, question, i) => sum + (answers[i] === question.answer ? 1 : 0), 0);
    const [low, high] = iqBereik(score);
    $('iq-estimate').textContent = 'Ongeveer ' + low + ' tot ' + high;
    $('iq-total-score').textContent = score + ' van ' + data.questions.length + ' goed';
    $('iq-time-used').textContent = formatTime(elapsed) + ' gebruikt';
    const skipped = answers.filter(answer => answer === null).length;
    $('iq-result-message').textContent = (expired ? 'De 20 minuten zijn voorbij. ' : 'Je ronde is afgerond. ') +
      (skipped ? skipped + ' onbeantwoorde ' + (skipped === 1 ? 'vraag telt' : 'vragen tellen') + ' als fout.' : 'Je hebt alle vragen beantwoord.');
    $('iq-section-results').replaceChildren();
    data.sections.forEach(section => {
      const questions = data.questions.filter(question => question.section === section.id);
      const correct = questions.filter(question => answers[data.questions.indexOf(question)] === question.answer).length;
      const card = element('div', 'iq-section-result');
      const heading = element('h3', '', section.title);
      const count = element('span', '', correct + ' van ' + questions.length);
      const bar = element('progress');
      bar.max = questions.length;
      bar.value = correct;
      bar.setAttribute('aria-label', section.title + ': ' + correct + ' van ' + questions.length + ' goed');
      card.append(heading, count, bar);
      $('iq-section-results').append(card);
    });
    $('iq-review-list').replaceChildren();
    data.questions.forEach((question, i) => {
      const review = element('details', 'iq-review');
      const correct = question.options.find(option => option.id === question.answer);
      const selected = question.options.find(option => option.id === answers[i]);
      const result = !selected ? 'Overgeslagen' : selected.id === correct.id ? 'Goed' : 'Onjuist';
      const summary = element('summary', '', (i + 1) + '. ' + question.title + ' · ' + result);
      const instruction = element('p', 'iq-review-explanation', question.instruction);
      review.append(summary, instruction);
      const drawing = visual(question);
      if (drawing) review.append(drawing);
      const answer = element('div', 'iq-review-answer');
      answer.append(element('strong', '', 'Juiste antwoord: ' + (correct.text || '')));
      if (correct.cells) answer.append(figure(correct.cells, 'iq-choice-figure'));
      review.append(answer);
      const given = element('div', 'iq-review-answer');
      given.append(element('span', '', 'Jouw antwoord: ' + (selected?.text || (!selected ? 'niet ingevuld' : ''))));
      if (selected?.cells) given.append(figure(selected.cells, 'iq-choice-figure'));
      review.append(given, element('p', 'iq-review-explanation', question.explanation));
      $('iq-review-list').append(review);
    });
    screen('results');
    focus($('iq-estimate'));
  }

  function keyboard(event) {
    if (state !== 'quiz' || event.repeat || event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
    if (/^[1-6]$/.test(event.key)) {
      event.preventDefault();
      const option = orders[index][Number(event.key) - 1];
      if (option) choose(option.id);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      next();
    }
  }

  async function initialize() {
    try {
      if (!data || data.questions.length !== 24 || !data.validate()) throw new Error('vragen');
      const user = await window.BES?.auth?.gebruiker();
      if (!user) {
        $('iq-status').textContent = 'Log in om de denktest te openen.';
        return;
      }
      ready = true;
      owner = user.id;
      $('iq-start-button').disabled = false;
      $('iq-status').textContent = '';
    } catch {
      $('iq-status').textContent = 'De denktest kon niet laden. Vernieuw de pagina om het opnieuw te proberen.';
    }
  }

  $('iq-start-button').addEventListener('click', start);
  $('iq-next').addEventListener('click', next);
  $('iq-retry').addEventListener('click', start);
  document.addEventListener('keydown', keyboard);
  document.addEventListener('visibilitychange', tick);
  window.addEventListener('focus', tick);
  window.addEventListener('pageshow', tick);
  window.addEventListener('bes:auth', event => {
    if (!ready || event.detail?.user?.id === owner) return;
    ready = false;
    owner = null;
    window.clearInterval(interval);
    interval = null;
    answers = [];
    orders = [];
    previousOrders = [];
    ['iq-options', 'iq-review-list', 'iq-section-results', 'iq-estimate', 'iq-total-score', 'iq-time-used', 'iq-result-message'].forEach(id => $(id).replaceChildren());
    screen('start');
    $('iq-start-button').disabled = true;
    $('iq-status').textContent = 'Je sessie is veranderd. Log opnieuw in om een nieuwe ronde te starten.';
    window.BES_DEUR?.naarInloggen();
  });
  window.addEventListener('beforeunload', event => {
    if (state !== 'quiz') return;
    event.preventDefault();
    event.returnValue = '';
  });
  initialize();
})();
