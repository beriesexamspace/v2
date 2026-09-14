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

  const revealPage = () => root.classList.add('page-ready');

  const setupNavigation = () => {
    const navigation = document.querySelector('nav.navigation');
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

  const initialize = () => {
    try {
      setupNavigation();
      setupLinks();
      setupSignature();
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
