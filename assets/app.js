(() => {
  'use strict';

  const root = document.documentElement;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const needsPageFade = !('CSSViewTransitionRule' in window) || window.location.protocol === 'file:';

  if (needsPageFade && !motion.matches) root.classList.add('page-fade');

  window.naamOpslaan = naam => {
    try {
      window.localStorage.setItem('bes_naam', naam);
      return true;
    } catch {
      return false;
    }
  };

  window.naamOphalen = () => {
    try {
      return window.localStorage.getItem('bes_naam');
    } catch {
      return null;
    }
  };

  window.jaarOpslaan = jaar => {
    try {
      window.localStorage.setItem('bes_jaar', jaar);
      return true;
    } catch {
      return false;
    }
  };

  window.jaarOphalen = () => {
    try {
      return window.localStorage.getItem('bes_jaar');
    } catch {
      return null;
    }
  };

  window.BES = Object.assign(window.BES || {}, {
    naamOpslaan: window.naamOpslaan,
    naamOphalen: window.naamOphalen,
    jaarOpslaan: window.jaarOpslaan,
    jaarOphalen: window.jaarOphalen
  });

  const revealPage = () => root.classList.add('page-ready');

  const setupNavigation = () => {
    const navigation = document.querySelector('nav.navigation, nav.nav-vol');
    if (!navigation) return;

    const menuButton = navigation.querySelector('.menu-toggle');
    const menu = navigation.querySelector('.navigation-links');
    const mobile = window.matchMedia('(max-width: 767px)');
    let scrollFrame = 0;

    const updateScroll = () => {
      navigation.classList.toggle('is-zwevend', window.scrollY > 24);
      scrollFrame = 0;
    };

    window.addEventListener('scroll', () => {
      if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScroll);
    }, { passive: true });
    window.addEventListener('pageshow', updateScroll);
    updateScroll();

    if (!menuButton || !menu) return;

    const closeMenu = (restoreFocus = false) => {
      const wasOpen = navigation.classList.contains('menu-open');
      navigation.classList.remove('menu-open');
      menuButton.setAttribute('aria-expanded', 'false');
      if (wasOpen && restoreFocus && mobile.matches) menuButton.focus();
    };

    menuButton.addEventListener('click', () => {
      if (!mobile.matches) return;
      const open = !navigation.classList.contains('menu-open');
      navigation.classList.toggle('menu-open', open);
      menuButton.setAttribute('aria-expanded', String(open));
    });

    menu.addEventListener('click', event => {
      if (event.target.closest('a')) closeMenu(menu.contains(document.activeElement));
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && navigation.classList.contains('menu-open')) {
        event.preventDefault();
        closeMenu(true);
      }
    });

    document.addEventListener('click', event => {
      if (!navigation.contains(event.target)) closeMenu(menu.contains(document.activeElement));
    });

    document.addEventListener('focusin', event => {
      if (!navigation.contains(event.target)) closeMenu();
    });

    mobile.addEventListener('change', () => {
      const focusedLink = menu.contains(document.activeElement);
      const focusedToggle = document.activeElement === menuButton;
      closeMenu();
      if (mobile.matches && focusedLink) menuButton.focus();
      if (!mobile.matches && focusedToggle) navigation.querySelector('.brand')?.focus();
    });

    window.addEventListener('pageshow', () => closeMenu());
    closeMenu();
  };

  const setupLinks = () => {
    document.querySelectorAll('[data-terug]').forEach(element => {
      const link = element.tagName === 'A' ? element : document.createElement('a');
      if (link !== element) {
        Array.from(element.attributes).forEach(attribute => {
          if (!['type', 'role', 'disabled'].includes(attribute.name)) {
            link.setAttribute(attribute.name, attribute.value);
          }
        });
      }
      link.href = element.dataset.terug;
      link.classList.add('terug');
      link.textContent = `\u2190 ${element.dataset.terugTekst || 'Terug'}`;
      if (link !== element) element.replaceWith(link);
    });

    document.querySelectorAll('a[href][target="_blank"]').forEach(link => {
      try {
        const target = new URL(link.getAttribute('href'), document.baseURI);
        const internal = window.location.protocol === 'file:'
          ? target.protocol === 'file:'
          : target.origin === window.location.origin;
        if (internal) link.removeAttribute('target');
      } catch {
        return;
      }
    });
  };

  const setupSignature = () => {
    const paths = Array.from(document.querySelectorAll('.signature path'));
    if (!paths.length) return;

    const animations = [];
    const cancelAnimations = () => animations.splice(0).forEach(animation => animation.cancel());
    const showSignature = () => {
      cancelAnimations();
      paths.forEach(path => {
        path.style.strokeDasharray = 'none';
        path.style.strokeDashoffset = '0';
      });
    };

    const lengths = paths.map(path => path.getTotalLength());
    const totalLength = lengths.reduce((sum, length) => sum + length, 0);
    const updateSignature = () => {
      if (motion.matches || !Element.prototype.animate || !totalLength) {
        showSignature();
        return;
      }

      cancelAnimations();
      const writeDuration = 4000;
      const holdDuration = 2000;
      const eraseDuration = 3000;
      const emptyDuration = 1000;
      const eraseStart = writeDuration + holdDuration;
      const cycleDuration = eraseStart + eraseDuration + emptyDuration;
      let completedLength = 0;

      paths.forEach((path, index) => {
        path.removeAttribute('pathLength');
        path.style.strokeDasharray = `${lengths[index]} ${lengths[index]}`;
        path.style.strokeDashoffset = String(lengths[index]);
      });

      const startTime = document.timeline.currentTime;
      paths.forEach((path, index) => {
        const length = lengths[index];
        const start = completedLength / totalLength;
        completedLength += length;
        const end = completedLength / totalLength;
        const animation = path.animate([
          { offset: 0, strokeDashoffset: String(length) },
          { offset: start * writeDuration / cycleDuration, strokeDashoffset: String(length) },
          { offset: end * writeDuration / cycleDuration, strokeDashoffset: '0' },
          { offset: (eraseStart + (1 - end) * eraseDuration) / cycleDuration, strokeDashoffset: '0' },
          { offset: (eraseStart + (1 - start) * eraseDuration) / cycleDuration, strokeDashoffset: String(length) },
          { offset: 1, strokeDashoffset: String(length) }
        ], { duration: cycleDuration, iterations: Infinity, easing: 'linear', fill: 'both' });
        if (startTime !== null) animation.startTime = startTime;
        animations.push(animation);
      });
    };

    updateSignature();
    motion.addEventListener('change', updateSignature);
  };

  // Getekende muisaanwijzer, overgenomen uit Helder (app.js). Alleen bij een echte muis; touch toont niets.
  const setupCursor = () => {
    if (document.querySelector('.cursor-dot')) return;
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    dot.setAttribute('aria-hidden', 'true');
    dot.setAttribute('popover', 'manual');
    if (typeof dot.showPopover !== 'function') return;
    document.body.append(dot);
    let currentDialog = null;
    let releaseTimer;
    const clear = () => {
      clearTimeout(releaseTimer);
      dot.classList.remove('is-pressed', 'is-releasing', 'over-control');
      document.documentElement.classList.remove('ball-cursor');
      if (dot.matches(':popover-open')) dot.hidePopover();
      currentDialog = null;
    };
    const updatePointer = event => {
      if (event.pointerType !== 'mouse') { clear(); return; }
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest('input, textarea, [contenteditable="true"], select')) { clear(); return; }
      const dialog = document.querySelector('dialog[open]');
      // Reinsert above a newly opened modal in the browser's top layer.
      if (dialog !== currentDialog && dot.matches(':popover-open')) dot.hidePopover();
      currentDialog = dialog;
      dot.style.left = `${event.clientX}px`;
      dot.style.top = `${event.clientY}px`;
      const control = target.closest('button, a, [role="button"]');
      dot.classList.toggle('over-control', !!control && !control.matches(':disabled, [aria-disabled="true"]'));
      try {
        if (!dot.matches(':popover-open')) dot.showPopover();
        document.documentElement.classList.add('ball-cursor');
      } catch { clear(); }
    };
    document.addEventListener('pointermove', updatePointer, { passive: true });
    document.addEventListener('pointerout', event => { if (!event.relatedTarget) clear(); });
    document.addEventListener('pointerdown', event => {
      updatePointer(event);
      if (event.pointerType !== 'mouse' || event.button !== 0 || !dot.matches(':popover-open')) return;
      clearTimeout(releaseTimer);
      dot.classList.remove('is-releasing');
      dot.classList.add('is-pressed');
    }, { passive: true });
    document.addEventListener('pointerup', event => {
      if (event.pointerType !== 'mouse' || event.button !== 0 || !dot.classList.contains('is-pressed')) return;
      dot.classList.remove('is-pressed');
      dot.classList.add('is-releasing');
      releaseTimer = setTimeout(() => dot.classList.remove('is-releasing'), 300);
    }, { passive: true });
    document.addEventListener('pointercancel', clear);
    document.addEventListener('keydown', clear);
    document.addEventListener('visibilitychange', () => { if (document.hidden) clear(); });
    window.addEventListener('blur', clear);
  };

  const initialize = () => {
    try {
      setupNavigation();
      setupLinks();
      setupSignature();
      setupCursor();
    } finally {
      revealPage();
    }
  };

  motion.addEventListener('change', () => {
    if (motion.matches) root.classList.remove('page-fade');
  });
  window.addEventListener('pageshow', revealPage);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
