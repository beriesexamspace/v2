(() => {
  'use strict';

  const BES = window.BES = window.BES || {};
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  // Na een echte klik zacht naar de volgende stap scrollen; niet bij verminderde beweging en niet als het doel al in beeld staat
  const scrollNaar = element => {
    if (!element || reducedMotion.matches) return;
    const rect = element.getBoundingClientRect();
    const boven = 88;
    if (rect.top >= boven && rect.bottom <= window.innerHeight) return;
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const years = { '1ba': '1ste bachelor', '2ba': '2de bachelor', '3ba': '3de bachelor' };
  const fades = new Set();
  const create = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const countText = amount => `${amount} ${amount === 1 ? 'vraag' : 'vragen'}`;
  const timestamp = value => Number.isFinite(Date.parse(value)) ? Date.parse(value) : 0;
  const integer = value => Number.isSafeInteger(value) && value >= 0 ? value : 0;

  function shuffle(items) {
    const result = items.slice();
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function fade(element) {
    element.getAnimations?.().forEach(animation => animation.cancel());
    element.hidden = false;
    if (reducedMotion.matches || !element.animate) return;
    const animation = element.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'ease-out' });
    fades.add(animation);
    animation.finished.catch(() => {}).finally(() => fades.delete(animation));
  }

  reducedMotion.addEventListener?.('change', () => {
    if (reducedMotion.matches) fades.forEach(animation => animation.finish());
  });

  function checkmark() {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 64 64');
    svg.setAttribute('class', 'vinkje vinkje-klein');
    svg.setAttribute('aria-hidden', 'true');
    const circle = document.createElementNS(ns, 'circle');
    circle.setAttribute('cx', '32');
    circle.setAttribute('cy', '32');
    circle.setAttribute('r', '30');
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', 'M20 33 l9 9 l17 -18');
    svg.append(circle, path);
    return svg;
  }

  function progressBar(good, total) {
    const bar = create('span', 'voortgang-balk');
    const percentage = total ? Math.min(100, good / total * 100) : 0;
    bar.classList.toggle('is-afgerond', total > 0 && good === total);
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-label', 'Goed beantwoord');
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', String(total || 1));
    bar.setAttribute('aria-valuenow', String(good));
    const fill = create('span');
    fill.style.width = `${percentage}%`;
    bar.append(fill);
    return bar;
  }

  function readData(raw) {
    if (!raw || typeof raw.id !== 'string' || !/^[a-z0-9_-]+$/i.test(raw.id) || !years[raw.jaar] || typeof raw.naam !== 'string' || !raw.naam.trim() || !Array.isArray(raw.hoofdstukken) || !Array.isArray(raw.vragen)) return null;
    const chapters = new Set();
    for (const chapter of raw.hoofdstukken) {
      if (!chapter || typeof chapter.id !== 'string' || !chapter.id || chapters.has(chapter.id) || typeof chapter.naam !== 'string' || !chapter.naam.trim()) return null;
      chapters.add(chapter.id);
    }
    const invalidQuestion = question => {
      if (!question || !chapters.has(question.h) || typeof question.q !== 'string' || !question.q.trim() || typeof question.u !== 'string' || !Array.isArray(question.o)) return true;
      const multiple = Array.isArray(question.a);
      const answers = multiple ? question.a : [question.a];
      return question.o.length < 2 || question.o.length > (multiple ? 10 : 5) || question.o.some(option => typeof option !== 'string' || !option.trim()) || new Set(question.o.map(option => option.trim())).size !== question.o.length || !answers.length || new Set(answers).size !== answers.length || answers.some(index => !Number.isInteger(index) || index < 0 || index >= question.o.length) || (question.kies !== undefined && question.kies !== 'fout');
    };
    if (raw.vragen.some(invalidQuestion)) return null;
    const hardQuestions = Array.isArray(raw.hardVragen) && !raw.hardVragen.some(invalidQuestion) ? raw.hardVragen : [];
    return {
      ...raw,
      vragen: raw.vragen.map((question, id) => ({ ...question, id })),
      hardVragen: hardQuestions.map((question, id) => ({ ...question, id: `hard:${id}` })),
      hacks: (Array.isArray(raw.hacks) ? raw.hacks : []).filter(item => item && (item.h === 'algemeen' || chapters.has(item.h)) && typeof item.t === 'string'),
      theorie: (Array.isArray(raw.theorie) ? raw.theorie : []).filter(item => item && (item.h === 'algemeen' || chapters.has(item.h)) && typeof item.kop === 'string' && Array.isArray(item.items) && item.items.every(point => typeof point === 'string'))
    };
  }

  function initialize() {
    const byId = id => document.getElementById(id);
    const data = readData(window.BES_VAK);
    if (!data) {
      byId('vak-fout').textContent = 'Dit vak kan niet worden geladen. Ga terug naar het jaar en probeer later opnieuw.';
      byId('vak-fout').hidden = false;
      byId('vak-tabs').hidden = true;
      byId('paneel-oefenen').hidden = true;
      return;
    }

    const hasLevels = Boolean(document.querySelector('main.vak-pagina[data-niveaus]'));
    const showLevelStep = hasLevels && data.hardVragen.length > 0;
    const levels = hasLevels ? ['normaal', 'hard'] : ['normaal'];
    const levelLabel = value => value === 'hard' ? 'Hard mode' : 'Normaal';
    const modeLabel = value => value === 'simulatie' ? 'Examensimulatie' : 'Examen Training';
    const courseKey = value => value === 'hard' ? `${data.id}__hard` : data.id;
    const questionsFor = value => value === 'hard' && hasLevels ? data.hardVragen : data.vragen;
    const countsFor = value => Object.fromEntries(data.hoofdstukken.map(chapter => [chapter.id, questionsFor(value).filter(question => question.h === chapter.id).length]));
    const selections = new Map(levels.map(value => [value, new Set(questionsFor(value).map(question => question.h))]));
    const banks = new Map(levels.map(value => [value, new Map()]));
    let level = 'normaal';
    let counts = countsFor(level);
    const chapterNames = Object.fromEntries(data.hoofdstukken.map(chapter => [chapter.id, chapter.naam]));
    let selected = selections.get(level);
    // Hard mode en oefenen met tijd horen bij Plus (assets/plan.js). Tot het plan bekend is, staan ze op slot.
    let plusOk = false;
    // Foutenlijst (Plus en Pro, supabase/fouten.sql): open fouten van dit vak, als sleutels. ?fouten=1 begint meteen met oefenen.
    let openFouten = new Set();
    let foutenUitUrl = new URLSearchParams(window.location.search).get('fouten') === '1';
    let context = null;
    let authGeneration = 0;
    let mode = 'training';
    let session = null;
    let screen = 'keuzes';
    let currentTab = 'paneel-oefenen';
    let chapterFromUrl = new URL(window.location.href).searchParams.get('hoofdstuk');
    let lastRun = null;
    let loggedSyncError = false;
    let lastSyncSent = 0;
    let timed = false;
    let secondsPerQuestion = 75;
    let clockTimer = 0;
    const choiceHint = create('p', 'vak-hint vraag-keuze-hint');
    choiceHint.id = 'vraag-keuze-hint';
    choiceHint.hidden = true;
    byId('opties').before(choiceHint);
    const checkAnswer = create('button', 'knop', 'Controleer →');
    checkAnswer.id = 'controleer-antwoord';
    checkAnswer.type = 'button';
    checkAnswer.hidden = true;
    byId('volgende-vraag').before(checkAnswer);

    const steps = ['modus', ...(showLevelStep ? ['niveau'] : []), 'tijd', 'hoofdstukken'];
    steps.forEach((name, index) => {
      byId(`stap-${name}`).querySelector('.keuze-stap').textContent = `Stap ${index + 1}`;
    });

    function revealStep(name, scroll = true) {
      const step = byId(`stap-${name}`);
      if (step.hidden) {
        step.hidden = false;
        if (!reducedMotion.matches) {
          step.classList.add('is-nieuw');
          step.addEventListener('animationend', () => step.classList.remove('is-nieuw'), { once: true });
        }
      }
      if (scroll) scrollNaar(step);
    }

    function chooseMode(value) {
      setMode(value);
      revealStep(showLevelStep ? 'niveau' : 'tijd');
    }

    // Melding onder de keuze als iemand zonder Plus Hard mode of Met tijd kiest, met een link naar Abonnement.
    function toonPlusSlot(stap) {
      const plek = byId(stap === 'niveau' ? 'niveau-uitleg' : 'tijd-keuzes');
      if (!plek) return;
      let melding = byId('plus-slot-' + stap);
      if (!melding) {
        melding = create('p', 'vak-hint plus-slot');
        melding.id = 'plus-slot-' + stap;
        melding.setAttribute('role', 'status');
        plek.after(melding);
      }
      const link = create('a', '', 'Probeer Plus een maand');
      link.href = '../../abonnement.html';
      melding.replaceChildren(stap === 'niveau' ? 'Hard mode zit in Plus. ' : 'Oefenen met tijd zit in Plus. ', link, '.');
    }

    function markeerPlus() {
      byId('niveau-keuzes')?.querySelector('[data-niveau="hard"]')?.classList.toggle('met-plus', !plusOk && data.hardVragen.length > 0);
      byId('tijd-keuzes')?.querySelector('[data-tijd="met"]')?.classList.toggle('met-plus', !plusOk);
      if (plusOk) { byId('plus-slot-niveau')?.remove(); byId('plus-slot-tijd')?.remove(); }
    }

    // Korte vaste sleutel per vraag: hash van de vraagtekst, met h: voor Hard mode en n: voor Normaal.
    function vraagSleutel(question) {
      let hash = 0x811c9dc5;
      for (const teken of question.q) { hash ^= teken.codePointAt(0); hash = Math.imul(hash, 0x01000193) >>> 0; }
      return (String(question.id).startsWith('hard:') ? 'h:' : 'n:') + hash.toString(16).padStart(8, '0');
    }

    const foutVragen = () => questionsFor(level).filter(question => openFouten.has(vraagSleutel(question)));

    function toonFoutenKnop() {
      const vragen = plusOk ? foutVragen() : [];
      let blok = byId('fouten-blok');
      if (!vragen.length) { if (blok) blok.hidden = true; return; }
      if (!blok) {
        blok = create('div', 'kaart fouten-blok');
        blok.id = 'fouten-blok';
        const tekst = create('div', 'fouten-tekst');
        tekst.append(create('p', 'kaart-titel', 'Je foutenlijst'), create('p', 'kaart-sub'));
        const knop = create('button', 'knop-secundair', 'Oefen je fouten');
        knop.type = 'button';
        knop.addEventListener('click', () => {
          const lijst = foutVragen();
          if (!lijst.length) return;
          setMode('training');
          start(shuffle(lijst), 'training', level, 0);
        });
        blok.append(tekst, knop);
        byId('vak-instellingen').prepend(blok);
      }
      blok.querySelector('.kaart-sub').textContent = `${countText(vragen.length)}${hasLevels ? ` in ${levelLabel(level)}` : ''} die je fout had en nog niet goed beantwoordde.`;
      blok.hidden = false;
    }

    async function laadFouten() {
      const client = BES.auth?.client;
      const plan = BES.plan ? await BES.plan() : null;
      plusOk = Boolean(plan && (plan.plan === 'plus' || plan.plan === 'pro'));
      markeerPlus();
      const owner = context?.owner;
      if (!plusOk || !owner || !client) { openFouten = new Set(); toonFoutenKnop(); return; }
      const { data: rijen, error } = await client.from('fouten').select('sleutel').eq('user_id', owner).eq('vak', data.id).eq('opgelost', false);
      if (error || context?.owner !== owner) return;
      openFouten = new Set((rijen || []).map(rij => rij.sleutel));
      toonFoutenKnop();
      if (foutenUitUrl && screen === 'keuzes') {
        foutenUitUrl = false;
        const url = new URL(window.location.href);
        url.searchParams.delete('fouten');
        window.history.replaceState(window.history.state, '', url);
        if (!foutVragen().length && hasLevels && data.hardVragen.some(question => openFouten.has(vraagSleutel(question)))) setLevel(level === 'hard' ? 'normaal' : 'hard');
        const lijst = foutVragen();
        if (lijst.length) { setMode('training'); start(shuffle(lijst), 'training', level, 0); }
      }
    }

    // Na een ronde: foute antwoorden op de lijst, goede eraf. Alleen met Plus of Pro; de database controleert dat ook.
    function bewaarFouten(answers, correct) {
      const client = BES.auth?.client;
      if (!plusOk || !context.owner || !client) return;
      const fout = new Map();
      const goed = new Set();
      answers.forEach(entry => {
        const sleutel = vraagSleutel(entry.question);
        if (correct(entry)) goed.add(sleutel);
        else fout.set(sleutel, { s: sleutel, h: entry.question.h });
      });
      fout.forEach((_, sleutel) => goed.delete(sleutel));
      if (!fout.size && !goed.size) return;
      fout.forEach((_, sleutel) => openFouten.add(sleutel));
      goed.forEach(sleutel => openFouten.delete(sleutel));
      toonFoutenKnop();
      client.rpc('fouten_bijwerken', { p_vak: data.id, p_fout: [...fout.values()], p_goed: [...goed] }).then(() => {}, () => {});
    }

    function chooseLevel(value) {
      if (value === 'hard' && !plusOk) { toonPlusSlot('niveau'); return; }
      setLevel(value);
      revealStep('tijd');
    }

    function setTime(value, reveal = false) {
      if (value === 'met' && !plusOk) { toonPlusSlot('tijd'); return; }
      timed = value === 'met';
      byId('tijd-keuzes').querySelectorAll('[data-tijd]').forEach(button => {
        const active = (button.dataset.tijd === 'met') === timed;
        button.setAttribute('aria-checked', String(active));
        button.tabIndex = active ? 0 : -1;
      });
      byId('tijd-instellingen').hidden = !timed;
      updateStart();
      if (reveal) {
        revealStep('hoofdstukken', false);
        revealStep('start', false);
        scrollNaar(timed ? byId('tijd-instellingen') : byId('stap-hoofdstukken'));
      }
    }

    function stopClock() {
      window.clearInterval(clockTimer);
      clockTimer = 0;
    }

    function timeExpired() {
      if (!session || screen !== 'oefenen' || session.endedAt !== null || !session.durationMs) return false;
      if (Date.now() < session.startedAt + session.durationMs) return false;
      finish(true);
      return true;
    }

    function updateClock() {
      if (!session || screen !== 'oefenen' || session.endedAt !== null || !session.durationMs) return;
      if (timeExpired()) return;
      const seconds = Math.max(0, Math.ceil((session.startedAt + session.durationMs - Date.now()) / 1000));
      const clock = byId('tijdklok');
      const text = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
      if (clock.textContent !== text) clock.textContent = text;
      clock.classList.toggle('is-bijna-om', seconds <= 60);
      // Bij een sprong over beide grenzen meldt de klok alleen de meest dringende waarschuwing.
      const warnings = [300, 60].filter(limit => session.durationMs >= limit * 1000 && seconds <= limit && !session.warnings.has(limit));
      if (warnings.length) {
        warnings.forEach(limit => session.warnings.add(limit));
        byId('tijd-melding').textContent = warnings.includes(60) ? 'Nog 1 minuut' : 'Nog 5 minuten';
      }
    }

    function cleanProgress(raw) {
      const result = Object.create(null);
      data.hoofdstukken.forEach(chapter => {
        const record = raw?.[chapter.id];
        if (!record || !timestamp(record.bijgewerkt)) return;
        const answered = integer(record.beantwoord);
        const total = integer(record.laatstTotaal);
        result[chapter.id] = {
          beantwoord: answered,
          goed: Math.min(answered, integer(record.goed)),
          laatstGoed: Math.min(total, integer(record.laatstGoed)),
          laatstTotaal: total,
          bijgewerkt: new Date(timestamp(record.bijgewerkt)).toISOString()
        };
      });
      return result;
    }

    function cleanSimulation(raw) {
      if (!raw || !integer(raw.totaal) || !timestamp(raw.bijgewerkt)) return null;
      return { goed: Math.min(integer(raw.goed), raw.totaal), totaal: raw.totaal, bijgewerkt: new Date(timestamp(raw.bijgewerkt)).toISOString() };
    }

    function newContext(owner, value, chapters = {}, simulation = null) {
      return { owner, level: value, chapters: cleanProgress(chapters), simulation: cleanSimulation(simulation), pending: new Map(), timer: 0, sending: false, loaded: !owner };
    }

    levels.forEach(value => {
      const bank = banks.get(value);
      let stored = null;
      try { stored = JSON.parse(window.localStorage.getItem(`bes_voortgang_${courseKey(value)}`)); } catch {}
      if (stored && typeof stored === 'object') {
        if (stored.profielen && typeof stored.profielen === 'object') {
          Object.values(stored.profielen).forEach(profile => {
            if (!profile || typeof profile !== 'object' || !(profile.eigenaar === null || typeof profile.eigenaar === 'string')) return;
            bank.set(profile.eigenaar, newContext(profile.eigenaar, value, profile.hoofdstukken, profile.laatsteSimulatie));
          });
        }
        const owner = typeof stored.eigenaar === 'string' ? stored.eigenaar : null;
        const active = newContext(owner, value, stored.hoofdstukken || stored, stored.laatsteSimulatie);
        bank.set(owner, active);
        if (value === level) context = active;
      } else {
        const guest = newContext(null, value);
        bank.set(null, guest);
        if (value === level) context = guest;
      }
    });

    function save(target = context) {
      try {
        const profiles = Object.fromEntries([...banks.get(target.level)].map(([owner, profile]) => [owner === null ? 'gast' : `account:${owner}`, {
          eigenaar: owner, hoofdstukken: profile.chapters, laatsteSimulatie: profile.simulation
        }]));
        window.localStorage.setItem(`bes_voortgang_${courseKey(target.level)}`, JSON.stringify({ eigenaar: target.owner, hoofdstukken: target.chapters, laatsteSimulatie: target.simulation, profielen: profiles }));
      } catch {}
    }

    function syncError() {
      if (loggedSyncError) return;
      loggedSyncError = true;
      console.info('Voortgang wordt op dit toestel bewaard; synchroniseren is nu niet beschikbaar.');
    }

    function scheduleSync(target = context) {
      if (!target.owner || !target.loaded || !target.pending.size || target.sending || target.timer || target.owner !== context.owner || !BES.auth?.client) return;
      const delay = Math.max(0, 2000 - (Date.now() - lastSyncSent));
      target.timer = window.setTimeout(() => {
        target.timer = 0;
        flush(target);
      }, delay);
    }

    async function flush(target) {
      if (target.owner !== context.owner || !target.owner || !target.loaded || target.sending || !target.pending.size || !BES.auth?.client) return;
      if (Date.now() - lastSyncSent < 2000) { scheduleSync(target); return; }
      const generation = authGeneration;
      const batch = [...target.pending.entries()];
      const rows = batch.map(([chapter, record]) => ({
        user_id: target.owner, vak: courseKey(target.level), hoofdstuk: chapter,
        beantwoord: record.beantwoord, goed: record.goed,
        laatst_goed: record.laatstGoed, laatst_totaal: record.laatstTotaal, bijgewerkt: record.bijgewerkt
      }));
      target.sending = true;
      lastSyncSent = Date.now();
      let succeeded = false;
      try {
        const { error } = await BES.auth.client.from('voortgang').upsert(rows, { onConflict: 'user_id,vak,hoofdstuk' });
        if (error) throw error;
        succeeded = true;
        if (generation !== authGeneration || target.owner !== context.owner) return;
        batch.forEach(([chapter, record]) => {
          if (target.pending.get(chapter)?.bijgewerkt === record.bijgewerkt) target.pending.delete(chapter);
        });
      } catch { syncError(); }
      finally {
        target.sending = false;
        if (succeeded) scheduleSync(target);
      }
    }

    async function loadRemote(target, generation) {
      const client = BES.auth?.client;
      if (!target.owner || !client) { target.loaded = true; return; }
      try {
        const { data: rows, error } = await client.from('voortgang').select('hoofdstuk,beantwoord,goed,laatst_goed,laatst_totaal,bijgewerkt').eq('user_id', target.owner).eq('vak', courseKey(target.level));
        if (error) throw error;
        if (generation !== authGeneration || target.owner !== context.owner) return;
        const remote = cleanProgress(Object.fromEntries((rows || []).map(row => [row.hoofdstuk, {
          beantwoord: row.beantwoord, goed: row.goed, laatstGoed: row.laatst_goed, laatstTotaal: row.laatst_totaal, bijgewerkt: row.bijgewerkt
        }])));
        data.hoofdstukken.forEach(({ id }) => {
          const local = target.chapters[id];
          if (remote[id] && (!local || timestamp(remote[id].bijgewerkt) > timestamp(local.bijgewerkt))) {
            target.chapters[id] = remote[id];
            target.pending.delete(id);
          } else if (local && (!remote[id] || timestamp(local.bijgewerkt) > timestamp(remote[id].bijgewerkt))) {
            target.pending.set(id, local);
          }
        });
        save(target);
        if (target === context) renderChapters();
      } catch { syncError(); }
      finally {
        if (generation === authGeneration && target.owner === context.owner) {
          target.loaded = true;
          scheduleSync(target);
        }
      }
    }

    function setAccount(user) {
      const owner = user?.id || null;
      if (owner === context.owner && context.authReady) return;
      const previous = context;
      authGeneration += 1;
      banks.forEach((bank, value) => {
        bank.forEach(profile => { window.clearTimeout(profile.timer); profile.timer = 0; });
        if (!bank.has(owner)) bank.set(owner, newContext(owner, value));
        const target = bank.get(owner);
        const guest = bank.get(null);
        if (owner && !previous.owner && guest) {
          Object.entries(guest.chapters).forEach(([chapter, record]) => {
            if (!target.chapters[chapter] || timestamp(record.bijgewerkt) > timestamp(target.chapters[chapter].bijgewerkt)) target.chapters[chapter] = { ...record };
          });
          if (guest.simulation && (!target.simulation || timestamp(guest.simulation.bijgewerkt) > timestamp(target.simulation.bijgewerkt))) target.simulation = { ...guest.simulation };
          guest.chapters = {};
          guest.simulation = null;
          guest.pending.clear();
        }
        target.authReady = true;
        target.loaded = !owner;
        save(target);
      });
      context = banks.get(level).get(owner);
      if (previous !== context) {
        stopClock();
        session = null;
        lastRun = null;
        if (screen !== 'keuzes') showScreen('keuzes');
      }
      renderChapters();
      renderSimulation();
      updateStart();
      banks.forEach(bank => loadRemote(bank.get(owner), authGeneration));
      // Vanaf het weekoverzicht: ?hoofdstuk=<id> begint meteen een training van dat hoofdstuk.
      if (owner && chapterFromUrl && data.hoofdstukken.some(chapter => chapter.id === chapterFromUrl)) {
        const questions = data.vragen.filter(question => question.h === chapterFromUrl);
        chapterFromUrl = null;
        setLevel('normaal');
        setMode('training');
        start(questions, 'training', 'normaal', 0);
        const url = new URL(window.location.href);
        url.searchParams.delete('hoofdstuk');
        window.history.replaceState(window.history.state, '', url);
      }
      laadFouten();
    }

    function setLevel(value) {
      if (!hasLevels || !levels.includes(value) || (value === 'hard' && !data.hardVragen.length) || screen !== 'keuzes') return;
      if (level !== value) {
        const previous = context;
        level = value;
        counts = countsFor(level);
        selected = selections.get(level);
        const bank = banks.get(level);
        if (!bank.has(previous.owner)) bank.set(previous.owner, newContext(previous.owner, level));
        context = bank.get(previous.owner);
        context.authReady = previous.authReady;
        if (context.authReady) {
          save();
          if (context.loaded) scheduleSync(context);
        }
      }
      byId('niveau-keuzes')?.querySelectorAll('[data-niveau]').forEach(button => {
        const active = button.dataset.niveau === level;
        button.disabled = button.dataset.niveau === 'hard' && !data.hardVragen.length;
        if (button.dataset.niveau === 'hard') button.classList.toggle('komt-binnenkort', button.disabled);
        button.setAttribute('aria-checked', String(active));
        button.tabIndex = active ? 0 : -1;
        button.classList.toggle('is-gekozen', active);
      });
      if (byId('niveau-uitleg')) {
        byId('niveau-uitleg').textContent = !data.hardVragen.length
          ? 'Hard mode komt binnenkort voor dit vak. Oefen nu met Normaal.'
          : level === 'hard'
            ? `Eerste set: ${countText(data.hardVragen.length)} waarin je kennis toepast en begrippen combineert. Alleen hoofdstukken met Hard mode-vragen zijn beschikbaar.`
            : 'Oefen met de bestaande vragen. Hard mode heeft een eigen vragenreeks en aparte voortgang.';
      }
      if (byId('voortgang-niveau')) byId('voortgang-niveau').textContent = `Voortgang: ${levelLabel(level)}`;
      toonFoutenKnop();
      const simulationDescription = byId('modus-keuzes').querySelector('[data-modus="simulatie"] .kaart-sub');
      if (simulationDescription) simulationDescription.textContent = `${countText(Math.min(20, questionsFor(level).length))}, uitslag en uitleg aan het einde.`;
      renderChapters();
      renderSimulation();
      updateStart();
    }

    function renderChapters() {
      const list = byId('hoofdstukken');
      const focused = document.activeElement?.dataset.hoofdstuk;
      list.replaceChildren();
      data.hoofdstukken.forEach(chapter => {
        const total = counts[chapter.id];
        const chosen = hasLevels && mode === 'simulatie' ? Boolean(total) : selected.has(chapter.id);
        const record = context.authReady || !context.owner ? context.chapters[chapter.id] : null;
        const complete = Boolean(record?.laatstTotaal && record.laatstGoed === record.laatstTotaal);
        const row = create('button', 'hoofdstuk kaart');
        row.type = 'button';
        row.dataset.hoofdstuk = chapter.id;
        row.setAttribute('role', 'checkbox');
        row.setAttribute('aria-checked', String(chosen));
        row.disabled = !total || mode === 'simulatie';
        row.classList.toggle('is-gekozen', chosen);
        row.classList.toggle('is-afgerond', complete);
        row.classList.toggle('is-leeg', !total);
        const checkbox = create('span', 'vinkvak', chosen ? '✓' : '');
        checkbox.setAttribute('aria-hidden', 'true');
        const body = create('span', 'hoofdstuk-inhoud');
        const top = create('span', 'hoofdstuk-boven');
        top.append(create('span', 'hoofdstuk-kop', chapter.naam), create('span', 'hoofdstuk-aantal', total ? countText(total) : level === 'hard' ? 'Nog geen Hard mode-vragen' : 'Nog geen vragen'));
        const bottom = create('span', 'hoofdstuk-voortgang');
        const progressText = !record ? 'Nog niet geoefend' : `${record.laatstGoed} van ${record.laatstTotaal} goed${complete ? ' · Afgerond ✓' : ''}`;
        bottom.append(progressBar(record?.laatstGoed || 0, record?.laatstTotaal || 0), create('span', 'voortgang-tekst', progressText));
        body.append(top, bottom);
        row.append(checkbox, body);
        row.addEventListener('click', () => {
          const aangevinkt = !selected.has(chapter.id);
          if (aangevinkt) selected.add(chapter.id);
          else selected.delete(chapter.id);
          renderChapters();
          updateStart();
        });
        list.append(row);
      });
      if (focused) [...list.children].find(row => row.dataset.hoofdstuk === focused)?.focus({ preventScroll: true });
    }

    function renderSimulation() {
      const result = context.authReady || !context.owner ? context.simulation : null;
      byId('laatste-simulatie').hidden = !result;
      byId('laatste-simulatie').textContent = result ? `Laatste simulatie${hasLevels ? ` (${levelLabel(level)})` : ''}: ${result.goed} van ${result.totaal}` : '';
    }

    function updateStart() {
      const emptySelection = mode === 'training' && !selected.size;
      const pool = questionsFor(level);
      const amount = mode === 'simulatie' ? Math.min(20, pool.length) : pool.filter(question => selected.has(question.h)).length;
      // Hard mode heeft weinig vragen per hoofdstuk: een training vraagt daar minstens 8 vragen (nu 4 hoofdstukken)
      const minimumHard = 8;
      const tooFewHard = level === 'hard' && mode === 'training' && selected.size > 0 && amount > 0 && amount < minimumHard && pool.length >= minimumHard;
      byId('start-oefening').disabled = emptySelection || !amount || tooFewHard || !context.authReady;
      byId('start-hint').hidden = !(emptySelection || tooFewHard);
      byId('start-hint').textContent = emptySelection
        ? 'Kies minstens één hoofdstuk.'
        : tooFewHard ? `Kies voor Hard mode minstens ${minimumHard} vragen, dus meer hoofdstukken (nu ${countText(amount)}).` : '';
      const chapters = mode === 'simulatie' ? 'Alle beschikbare hoofdstukken' : selected.size
        ? data.hoofdstukken.filter(chapter => selected.has(chapter.id)).map(chapter => chapter.naam).join(', ')
        : 'Nog geen hoofdstukken gekozen';
      const minutes = Math.ceil(amount * secondsPerQuestion / 60);
      const duration = `${minutes} ${minutes === 1 ? 'minuut' : 'minuten'}`;
      const perQuestion = secondsPerQuestion < 60 ? `${secondsPerQuestion} sec per vraag`
        : `${Math.floor(secondsPerQuestion / 60)} min${secondsPerQuestion % 60 ? ` ${secondsPerQuestion % 60}` : ''} per vraag`;
      byId('tijd-waarde').textContent = perQuestion;
      byId('tijd-per-vraag').setAttribute('aria-valuetext', perQuestion);
      byId('tijd-totaal').textContent = `${countText(amount)}, ${duration}`;
      const summary = [['Modus', modeLabel(mode)], ['Niveau', levelLabel(level)], ['Tijd', timed ? `${duration}, ${perQuestion}` : 'Zonder tijd'], ['Hoofdstukken', chapters]];
      byId('keuze-samenvatting').replaceChildren(...summary.flatMap(([label, value]) => [create('dt', '', label), create('dd', '', value)]));
      byId('keuze-aantal').textContent = `${countText(amount)}${mode === 'simulatie' ? ' · Uitslag en uitleg aan het einde.' : ' · Uitleg na ieder antwoord.'}`;
      byId('simulatie-uitleg').textContent = `De simulatie kiest ${countText(amount)} uit alle beschikbare hoofdstukken op ${levelLabel(level)}. Je krijgt je uitslag en uitleg aan het einde.`;
    }

    function setMode(value) {
      mode = value;
      const simulation = mode === 'simulatie';
      byId('modus-keuzes').querySelectorAll('[data-modus]').forEach(button => {
        button.setAttribute('aria-checked', String(button.dataset.modus === mode));
        button.tabIndex = button.dataset.modus === mode ? 0 : -1;
        button.classList.toggle('is-gekozen', button.dataset.modus === mode);
      });
      byId('hoofdstuk-selectie').classList.toggle('is-gedimd', simulation);
      byId('simulatie-uitleg').hidden = !simulation;
      byId('kies-alles').disabled = simulation;
      byId('kies-niets').disabled = simulation;
      renderChapters();
      updateStart();
    }

    function showScreen(value) {
      if (value !== 'oefenen') stopClock();
      screen = value;
      byId('stop-bevestiging').hidden = true;
      // Tijdens het oefenen alleen de vraag en Stop in beeld; bij een simulatie ook zonder navigatiebalk.
      document.documentElement.classList.toggle('is-oefenen', value === 'oefenen');
      document.documentElement.classList.toggle('is-examen', value === 'oefenen' && session?.mode === 'simulatie');
      [['keuzes', 'vak-keuzes'], ['oefenen', 'oefenscherm'], ['einde', 'eindscherm']].forEach(([name, id]) => {
        byId(id).hidden = name !== value;
        if (name === value) fade(byId(id));
      });
    }

    function start(questions, runMode = mode, runLevel = level, runSeconds = timed ? secondsPerQuestion : 0) {
      if (!questions.length || !context.authReady || runLevel !== level) return;
      stopClock();
      session = {
        mode: runMode, level: runLevel, owner: context, index: 0,
        secondsPerQuestion: runSeconds, startedAt: Date.now(), durationMs: questions.length * runSeconds * 1000,
        endedAt: null, warnings: new Set(),
        questions: shuffle(questions).map(question => {
          const answers = Array.isArray(question.a) ? question.a : [question.a];
          return { question, options: shuffle(question.o.map((text, index) => ({ text, correct: answers.includes(index) }))), pending: new Set(), selected: null };
        }),
        chapters: Object.fromEntries(data.hoofdstukken.map(({ id }) => [id, { answered: 0, good: 0, total: questions.filter(question => question.h === id).length }]))
      };
      byId('tijdklok').hidden = !runSeconds;
      byId('tijdklok').textContent = '';
      byId('tijdklok').classList.remove('is-bijna-om');
      byId('tijd-melding').textContent = '';
      if (hasLevels && byId('niveau-status')) byId('niveau-status').textContent = `${modeLabel(runMode)} · ${levelLabel(runLevel)}`;
      showScreen('oefenen');
      renderQuestion();
      if (runSeconds) {
        updateClock();
        clockTimer = window.setInterval(updateClock, 250);
      }
    }

    function renderQuestion() {
      if (!session) return;
      const current = session.questions[session.index];
      byId('vraag-teller').textContent = `Vraag ${session.index + 1} van ${session.questions.length} · ${chapterNames[current.question.h]}`;
      byId('vraag-tekst').textContent = current.question.q;
      byId('vraag-balk').setAttribute('aria-valuemin', '0');
      byId('vraag-balk').setAttribute('aria-valuemax', String(session.questions.length));
      byId('vraag-balk').setAttribute('aria-valuenow', String(session.index));
      byId('vraag-balk').querySelector('span').style.width = `${session.index / session.questions.length * 100}%`;
      byId('simulatie-melding').hidden = session.mode !== 'simulatie';
      byId('uitleg').hidden = true;
      byId('uitleg-tekst').textContent = '';
      byId('volgende-vraag').hidden = true;
      byId('volgende-vraag').textContent = session.index === session.questions.length - 1 ? 'Bekijk je uitslag →' : 'Volgende →';
      checkAnswer.hidden = true;
      const multiple = Array.isArray(current.question.a);
      choiceHint.hidden = !multiple;
      const amount = multiple ? current.question.a.length : 1;
      choiceHint.textContent = multiple ? (current.question.kies === 'fout' ? (amount === 1 ? 'Kies 1 fout antwoord.' : `Kies de ${amount} foute antwoorden.`) : `Kies ${amount} ${amount === 1 ? 'antwoord' : 'antwoorden'}.`) : '';
      if (multiple) byId('opties').setAttribute('aria-describedby', choiceHint.id);
      else byId('opties').removeAttribute('aria-describedby');
      byId('opties').replaceChildren();
      current.options.forEach((option, index) => {
        const button = create('button', multiple ? 'optie optie-meervoudig' : 'optie');
        button.type = 'button';
        button.setAttribute('aria-keyshortcuts', String((index + 1) % 10));
        if (multiple) {
          button.setAttribute('role', 'checkbox');
          button.setAttribute('aria-checked', 'false');
        }
        const letter = create('span', 'optie-letter', multiple ? '' : String.fromCharCode(65 + index));
        letter.setAttribute('aria-hidden', 'true');
        button.append(letter, create('span', 'optie-tekst', option.text));
        button.addEventListener('click', () => answer(index));
        byId('opties').append(button);
      });
      fade(byId('opties'));
      byId('vraag-tekst').focus({ preventScroll: true });
      byId('oefenscherm').scrollIntoView({ block: 'start', behavior: 'instant' });
    }

    function answer(index) {
      if (!session || screen !== 'oefenen' || currentTab !== 'paneel-oefenen' || !byId('stop-bevestiging').hidden) return;
      if (timeExpired()) return;
      const current = session.questions[session.index];
      if (current.selected !== null || !current.options[index]) return;
      if (Array.isArray(current.question.a)) {
        if (current.pending.has(index)) current.pending.delete(index);
        else current.pending.add(index);
        [...byId('opties').children].forEach((button, optionIndex) => {
          const chosen = current.pending.has(optionIndex);
          button.classList.toggle('is-gekozen', chosen);
          button.setAttribute('aria-checked', String(chosen));
          button.querySelector('.optie-letter').textContent = chosen ? '✓' : '';
        });
        checkAnswer.hidden = current.pending.size !== current.question.a.length;
      } else {
        current.pending = new Set([index]);
        confirmAnswer();
      }
    }

    function correctAnswer(entry) {
      return entry.selected !== null && entry.options.every((option, index) => option.correct === entry.selected.includes(index));
    }

    function confirmAnswer() {
      if (!session || screen !== 'oefenen' || currentTab !== 'paneel-oefenen' || !byId('stop-bevestiging').hidden) return;
      if (timeExpired()) return;
      const current = session.questions[session.index];
      const expected = Array.isArray(current.question.a) ? current.question.a.length : 1;
      if (current.selected !== null || current.pending.size !== expected) return;
      current.selected = [...current.pending];
      checkAnswer.hidden = true;
      const training = session.mode === 'training';
      [...byId('opties').children].forEach((button, optionIndex) => {
        const chosen = current.selected.includes(optionIndex);
        button.disabled = true;
        if (!training) {
          button.classList.toggle('is-gekozen', chosen);
          if (chosen) button.setAttribute('aria-label', `${current.options[optionIndex].text}, gekozen`);
        } else if (current.options[optionIndex].correct) {
          button.classList.add('is-goed');
          button.querySelector('.optie-letter').replaceChildren(checkmark());
          button.setAttribute('aria-label', `${current.options[optionIndex].text}, juiste keuze`);
        } else if (chosen) {
          button.classList.add('is-fout');
          button.setAttribute('aria-label', `${current.options[optionIndex].text}, onjuiste keuze`);
        }
      });
      byId('vraag-balk').setAttribute('aria-valuenow', String(session.index + 1));
      byId('vraag-balk').querySelector('span').style.width = `${(session.index + 1) / session.questions.length * 100}%`;
      if (training) {
        byId('uitleg-tekst').textContent = current.question.u;
        fade(byId('uitleg'));
        recordAnswer(current.question.h, correctAnswer(current));
      }
      fade(byId('volgende-vraag'));
      byId('volgende-vraag').focus({ preventScroll: true });
    }

    function recordAnswer(chapter, correct) {
      if (session.owner !== context) return;
      const run = session.chapters[chapter];
      run.answered += 1;
      run.good += correct ? 1 : 0;
      const previous = context.chapters[chapter];
      const record = {
        beantwoord: (previous?.beantwoord || 0) + 1,
        goed: (previous?.goed || 0) + (correct ? 1 : 0),
        laatstGoed: run.good, laatstTotaal: run.total,
        bijgewerkt: new Date(Math.max(Date.now(), timestamp(previous?.bijgewerkt) + 1)).toISOString()
      };
      context.chapters[chapter] = record;
      context.pending.set(chapter, record);
      save();
      renderChapters();
      scheduleSync();
    }

    function next() {
      if (!session || screen !== 'oefenen' || session.questions[session.index].selected === null || !byId('stop-bevestiging').hidden) return;
      if (timeExpired()) return;
      if (session.index === session.questions.length - 1) finish();
      else { session.index += 1; renderQuestion(); }
    }

    function finish(expired = false) {
      if (!session || session.owner !== context || screen !== 'oefenen' || session.endedAt !== null) return;
      stopClock();
      const now = Date.now();
      expired = expired || Boolean(session.durationMs && now >= session.startedAt + session.durationMs);
      session.endedAt = session.durationMs ? Math.min(now, session.startedAt + session.durationMs) : now;
      const answers = session.questions;
      if (expired) {
        answers.filter(entry => entry.selected === null).forEach(entry => {
          entry.unanswered = true;
          entry.selected = [];
          entry.pending.clear();
          if (session.mode === 'training') recordAnswer(entry.question.h, false);
        });
      }
      byId('tijd-om').hidden = !expired;
      byId('tijd-resultaat').hidden = !session.durationMs;
      byId('tijd-resultaat').textContent = session.durationMs
        ? `Je deed er ${Math.ceil(Math.max(0, session.endedAt - session.startedAt) / 60000)} minuten over van de ${Math.ceil(session.durationMs / 60000)}.` : '';
      const correct = correctAnswer;
      const good = answers.filter(correct).length;
      const name = typeof BES.naamOphalen === 'function' ? BES.naamOphalen() : '';
      byId('score-kop').textContent = `${good} van ${answers.length} goed.`;
      byId('score-tekst').textContent = name ? `Goed gewerkt, ${name}. Je bent weer een stap verder.` : 'Goed gewerkt. Je bent weer een stap verder.';
      if (hasLevels && byId('score-niveau')) byId('score-niveau').textContent = `${modeLabel(session.mode)} · ${levelLabel(session.level)}`;
      byId('score-hoofdstukken').replaceChildren();
      data.hoofdstukken.forEach(chapter => {
        const group = answers.filter(entry => entry.question.h === chapter.id);
        if (!group.length) return;
        const amount = group.filter(correct).length;
        const row = create('div', 'score-rij');
        const top = create('div', 'score-boven');
        top.append(create('span', '', chapter.naam), create('span', '', `${amount} van ${group.length}`));
        row.append(top, progressBar(amount, group.length));
        byId('score-hoofdstukken').append(row);
      });
      lastRun = { mode: session.mode, level: session.level, secondsPerQuestion: session.secondsPerQuestion, questions: answers.map(entry => entry.question), wrong: answers.filter(entry => !correct(entry)).map(entry => entry.question) };
      byId('fouten-opnieuw').hidden = !lastRun.wrong.length;
      const simulation = session.mode === 'simulatie';
      byId('simulatie-overzicht').hidden = !simulation;
      byId('simulatie-overzicht').open = false;
      byId('overzicht-vragen').replaceChildren();
      if (simulation) {
        context.simulation = { goed: good, totaal: answers.length, bijgewerkt: new Date().toISOString() };
        save();
        renderSimulation();
        answers.forEach((entry, index) => {
          const item = create('article', 'overzicht-vraag kaart');
          item.append(create('h3', '', `${index + 1}. ${entry.question.q}`));
          if (entry.unanswered) item.append(create('p', 'antwoord-fout', 'Niet beantwoord.'));
          if (Array.isArray(entry.question.a)) {
            entry.options.forEach((option, optionIndex) => {
              const chosen = entry.selected.includes(optionIndex);
              if (!chosen && !option.correct) return;
              const label = chosen ? (option.correct ? 'Juiste keuze' : 'Onjuiste keuze') : 'Niet gekozen, wel nodig';
              item.append(create('p', option.correct ? 'antwoord-goed' : 'antwoord-fout', `${label}: ${option.text}`));
            });
          } else {
            if (!entry.unanswered) item.append(create('p', correct(entry) ? 'antwoord-goed' : 'antwoord-fout', `Jouw antwoord: ${entry.options[entry.selected[0]].text}`));
            item.append(create('p', '', `Juiste antwoord: ${entry.question.o[entry.question.a]}`));
          }
          item.append(create('p', '', entry.question.u));
          byId('overzicht-vragen').append(item);
        });
      }
      renderComit(answers, correct);
      bewaarSessie(good, answers.length);
      bewaarFouten(answers, correct);
      showScreen('einde');
      byId('score-kop').focus({ preventScroll: true });
      byId('eindscherm').scrollIntoView({ block: 'start', behavior: 'instant' });
      scheduleSync();
    }

    // Eén rij per afgeronde ronde in de tabel sessies (voor de inzichten op Profiel). Alleen de score, geen antwoorden.
    function bewaarSessie(goed, totaal) {
      const owner = context.owner;
      const client = BES.auth?.client;
      if (!owner || !client || !session || !totaal) return;
      client.from('sessies').insert({ user_id: owner, vak: data.id, niveau: session.level || 'normaal', modus: session.mode, goed, totaal }).then(() => {}, () => {});
    }

    // Comit-basis zonder AI: sterke en zwakke hoofdstukken uit deze ronde, plus één tip met een knop.
    function renderComit(answers, correct) {
      const kaart = byId('comit');
      if (!kaart) return;
      const perHoofdstuk = data.hoofdstukken.map(chapter => {
        const group = answers.filter(entry => entry.question.h === chapter.id);
        return { chapter, totaal: group.length, goed: group.filter(correct).length };
      }).filter(item => item.totaal);
      const sterk = perHoofdstuk.filter(item => item.goed === item.totaal);
      const zwak = perHoofdstuk.filter(item => item.goed < item.totaal).sort((a, b) => (a.goed / a.totaal) - (b.goed / b.totaal));
      const namen = lijst => lijst.map(item => item.chapter.naam);
      const opsomming = lijst => lijst.length <= 1 ? lijst.join('') : lijst.slice(0, -1).join(', ') + ' en ' + lijst[lijst.length - 1];
      const regels = [];
      let tip = '';
      let knopTekst = '';
      let knopActie = null;
      if (!zwak.length) {
        regels.push(perHoofdstuk.length === 1 ? `Alles goed in ${perHoofdstuk[0].chapter.naam}.` : `Alles goed: ${opsomming(namen(sterk))}.`);
        const hardKan = hasLevels && session.level !== 'hard' && data.hardVragen.length >= 8;
        tip = hardKan ? 'Klaar voor een stap verder? Probeer dezelfde stof in Hard mode.' : 'Kies een volgend hoofdstuk, of doe deze ronde over een paar dagen nog eens; dan blijft het zitten.';
        knopTekst = 'Terug naar het vak';
        knopActie = () => { showScreen('keuzes'); scrollNaar(byId('vak-keuzes')); };
      } else {
        if (sterk.length) regels.push(`Sterk: ${opsomming(namen(sterk))}.`);
        const eerste = zwak[0];
        regels.push(`Nog even oefenen: ${eerste.chapter.naam}, ${eerste.goed} van ${eerste.totaal} goed${zwak.length > 1 ? `, en ook ${opsomming(namen(zwak.slice(1, 3)))}` : ''}.`);
        const vragen = questionsFor(session.level).filter(question => question.h === eerste.chapter.id);
        if (session.mode === 'simulatie') tip = `Doe ${eerste.chapter.naam} nog eens in Training. Daar krijg je bij elke vraag meteen uitleg.`;
        else if (eerste.goed / eerste.totaal < .5) tip = `Lees eerst de theorie van ${eerste.chapter.naam} en doe het hoofdstuk daarna opnieuw.`;
        else tip = `Bijna. Doe ${eerste.chapter.naam} nog één keer, dan zit het.`;
        knopTekst = `Oefen ${eerste.chapter.naam} →`;
        knopActie = () => start(vragen, 'training', lastRun.level, lastRun.secondsPerQuestion);
      }
      byId('comit-regels').replaceChildren(...regels.map(regel => create('p', '', regel)));
      byId('comit-tip').textContent = tip;
      const knop = byId('comit-knop');
      knop.textContent = knopTekst;
      knop.onclick = knopActie;
    }

    function renderContent() {
      const hacks = byId('hacks-inhoud');
      const theory = byId('theorie-inhoud');
      hacks.replaceChildren();
      theory.replaceChildren();
      // Algemene leertips staan op leren.html; de link staat boven de tips van dit vak
      const algemeen = create('p', 'hacks-algemeen');
      const algemeenLink = create('a', 'tekstlink', 'Algemene leertips: slim leren, focus en hulp →');
      algemeenLink.href = '../../leren.html';
      algemeen.append(algemeenLink);
      hacks.append(algemeen);
      if (!data.hacks.length) hacks.append(create('p', 'gedimde-tekst', 'Voor dit vak zijn er nog geen studie-hacks.'));
      if (!data.theorie.length) theory.append(create('p', 'gedimde-tekst', 'Voor dit vak staat nog geen theorie klaar.'));
      // Hacks en theorie met h: 'algemeen' horen bij het hele vak en komen bovenaan
      const groepen = [{ id: 'algemeen', naam: 'Voor het hele vak' }, ...data.hoofdstukken];
      groepen.forEach(chapter => {
        const tips = data.hacks.filter(item => item.h === chapter.id);
        if (tips.length) {
          const section = create('section', 'hack-groep');
          section.append(create('h2', '', chapter.id === 'algemeen' ? 'Slim leren' : chapter.naam));
          tips.forEach(item => {
            const row = create('div', 'hack-regel kaart');
            const tick = create('span', 'hack-vink', '✓');
            tick.setAttribute('aria-hidden', 'true');
            const tekst = create('div', 'hack-tekst');
            if (typeof item.kop === 'string' && item.kop.trim()) tekst.append(create('strong', '', item.kop.trim()));
            tekst.append(create('p', '', item.t));
            row.append(tick, tekst);
            section.append(row);
          });
          hacks.append(section);
        }
        const blocks = data.theorie.filter(item => item.h === chapter.id);
        if (blocks.length) {
          const section = create('section', 'theorie-groep');
          section.append(create('h2', '', chapter.id === 'algemeen' ? 'Algemeen' : chapter.naam));
          blocks.forEach(item => {
            const card = create('article', 'theorie-kaart kaart');
            const list = create('ul');
            item.items.forEach(point => list.append(create('li', '', point)));
            card.append(create('h3', '', item.kop), list);
            section.append(card);
          });
          theory.append(section);
        }
      });
    }

    function selectTab(tab, focus = false) {
      currentTab = tab.getAttribute('aria-controls');
      byId('vak-tabs').querySelectorAll('[role="tab"]').forEach(button => {
        const active = button === tab;
        button.setAttribute('aria-selected', String(active));
        button.tabIndex = active ? 0 : -1;
        button.classList.toggle('is-actief', active);
        const panel = byId(button.getAttribute('aria-controls'));
        panel.hidden = !active;
        if (active) fade(panel);
      });
      if (focus) tab.focus();
    }

    document.title = `${data.naam} | Berie's Exam Space`;
    byId('vak-jaar').textContent = years[data.jaar];
    byId('vak-naam').textContent = data.naam;
    byId('vak-aantallen').textContent = `${countText(data.vragen.length)} over ${data.hoofdstukken.length} ${data.hoofdstukken.length === 1 ? 'hoofdstuk' : 'hoofdstukken'}.`;
    byId('vak-terug').dataset.terug = `../../jaar-${data.jaar}.html`;
    byId('vak-terug').href = `../../jaar-${data.jaar}.html`;
    if (!data.vragen.length) {
      byId('vak-instellingen').hidden = true;
      const empty = byId('vak-leeg');
      empty.replaceChildren(create('p', '', 'Voor dit vak staan nog geen vragen klaar.'));
      const back = create('a', 'terug', '← Terug naar het jaar');
      back.href = `../../jaar-${data.jaar}.html`;
      empty.append(back);
      empty.hidden = false;
    }

    const tabs = [...byId('vak-tabs').querySelectorAll('[role="tab"]')];
    tabs.forEach(tab => tab.addEventListener('click', () => selectTab(tab)));
    byId('vak-tabs').addEventListener('keydown', event => {
      const index = tabs.indexOf(document.activeElement);
      if (index < 0) return;
      const target = event.key === 'ArrowRight' ? (index + 1) % tabs.length : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null;
      if (target === null) return;
      event.preventDefault();
      selectTab(tabs[target], true);
    });
    const modeButtons = [...byId('modus-keuzes').querySelectorAll('[data-modus]')];
    modeButtons.forEach(button => button.addEventListener('click', () => chooseMode(button.dataset.modus)));
    byId('modus-keuzes').addEventListener('keydown', event => {
      const current = modeButtons.indexOf(document.activeElement);
      if (current < 0 || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const index = event.key === 'Home' ? 0 : event.key === 'End' ? modeButtons.length - 1 : (current + 1) % modeButtons.length;
      chooseMode(modeButtons[index].dataset.modus);
      modeButtons[index].focus({ preventScroll: true });
    });
    if (hasLevels && byId('niveau-keuzes')) {
      const levelButtons = [...byId('niveau-keuzes').querySelectorAll('[data-niveau]')];
      levelButtons.forEach(button => button.addEventListener('click', () => {
        if (button.disabled) return;
        chooseLevel(button.dataset.niveau);
      }));
      byId('niveau-keuzes').addEventListener('keydown', event => {
        const enabled = levelButtons.filter(button => !button.disabled);
        const current = enabled.indexOf(document.activeElement);
        if (current < 0 || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const step = ['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1;
        const index = event.key === 'Home' ? 0 : event.key === 'End' ? enabled.length - 1 : (current + step + enabled.length) % enabled.length;
        chooseLevel(enabled[index].dataset.niveau);
        enabled[index].focus({ preventScroll: true });
      });
      setLevel('normaal');
    }
    markeerPlus();
    if (BES.plan) BES.plan().then((p) => { plusOk = p.plan === 'plus' || p.plan === 'pro'; markeerPlus(); });
    const timeButtons = [...byId('tijd-keuzes').querySelectorAll('[data-tijd]')];
    timeButtons.forEach(button => button.addEventListener('click', () => setTime(button.dataset.tijd, true)));
    byId('tijd-keuzes').addEventListener('keydown', event => {
      const current = timeButtons.indexOf(document.activeElement);
      if (current < 0 || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const index = event.key === 'Home' ? 0 : event.key === 'End' ? timeButtons.length - 1 : (current + 1) % timeButtons.length;
      setTime(timeButtons[index].dataset.tijd, true);
      timeButtons[index].focus({ preventScroll: true });
    });
    byId('tijd-per-vraag').addEventListener('input', event => {
      secondsPerQuestion = Number(event.target.value);
      updateStart();
    });
    byId('kies-alles').addEventListener('click', () => { data.hoofdstukken.forEach(({ id }) => { if (counts[id]) selected.add(id); }); renderChapters(); updateStart(); });
    byId('kies-niets').addEventListener('click', () => { selected.clear(); renderChapters(); updateStart(); });
    byId('start-oefening').addEventListener('click', () => {
      const pool = questionsFor(level);
      const questions = mode === 'simulatie' ? shuffle(pool).slice(0, 20) : pool.filter(question => selected.has(question.h));
      start(questions);
    });
    byId('volgende-vraag').addEventListener('click', next);
    checkAnswer.addEventListener('click', confirmAnswer);
    byId('stop-oefening').addEventListener('click', () => { if (timeExpired()) return; fade(byId('stop-bevestiging')); byId('stop-nee').focus(); });
    byId('stop-nee').addEventListener('click', () => { byId('stop-bevestiging').hidden = true; byId('stop-oefening').focus(); });
    byId('stop-ja').addEventListener('click', () => { if (timeExpired()) return; session = null; showScreen('keuzes'); byId('start-oefening').focus(); scheduleSync(); });
    byId('fouten-opnieuw').addEventListener('click', () => { if (lastRun) start(lastRun.wrong, 'training', lastRun.level, lastRun.secondsPerQuestion); });
    byId('opnieuw').addEventListener('click', () => {
      if (!lastRun) return;
      const questions = lastRun.mode === 'simulatie' ? shuffle(questionsFor(lastRun.level)).slice(0, 20) : lastRun.questions;
      start(questions, lastRun.mode, lastRun.level, lastRun.secondsPerQuestion);
    });
    window.addEventListener('focus', updateClock);
    document.addEventListener('visibilitychange', updateClock);
    byId('terug-vak').addEventListener('click', () => { session = null; showScreen('keuzes'); byId('start-oefening').focus(); });
    document.addEventListener('keydown', event => {
      if (!session || screen !== 'oefenen' || currentTab !== 'paneel-oefenen' || event.repeat || event.ctrlKey || event.metaKey || event.altKey || !byId('stop-bevestiging').hidden) return;
      const target = event.target;
      if (target.closest?.('input, textarea, select, [contenteditable="true"]')) return;
      if (/^[0-9]$/.test(event.key)) { event.preventDefault(); answer(event.key === '0' ? 9 : Number(event.key) - 1); }
      else if (event.key === 'Enter' && !target.closest?.('a, button, summary, [role="tab"], [role="radio"], [role="checkbox"]')) {
        event.preventDefault();
        if (!checkAnswer.hidden) confirmAnswer();
        else next();
      }
    });

    renderChapters();
    renderSimulation();
    renderContent();
    setMode('training');
    setTime('zonder');
    let authEvents = 0;
    window.addEventListener('bes:auth', event => { authEvents += 1; setAccount(event.detail?.user); });
    const initialEvents = authEvents;
    Promise.resolve(BES.auth?.gereed).then(() => BES.auth?.gebruiker?.()).then(user => {
      if (initialEvents === authEvents) setAccount(user);
    }).catch(() => { if (initialEvents === authEvents) setAccount(null); });
    BES.vak = {
      get niveau() { return level; },
      get voortgang() { return structuredClone(context.chapters); },
      get laatsteSimulatie() { return context.simulation ? { ...context.simulation } : null; },
      schud: shuffle
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
