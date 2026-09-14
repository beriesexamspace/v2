(() => {
  'use strict';

  const BES = window.BES = window.BES || {};
  const config = window.BES_CONFIG || {};
  const scriptPath = document.currentScript?.getAttribute('src') || 'assets/auth.js';
  const pagePrefix = scriptPath.split('assets/auth.js')[0];
  let client = null;
  let currentUser = null;
  let recoveryUserId = null;
  let initializationError = null;
  let renderTimer = 0;
  let signingOut = false;

  const messages = {
    unavailable: 'Accounts zijn nog niet ingeschakeld. Je kunt wel gewoon oefenen.',
    duplicate: 'Dit e-mailadres heeft al een account. Log in.',
    invalid_credentials: 'E-mail of wachtwoord klopt niet.',
    rate_limit: 'Even wachten, probeer het over een minuut opnieuw.',
    network: 'Even geen verbinding. Probeer het opnieuw.',
    invalid_email: 'Dit e-mailadres klopt niet. Controleer het en probeer het opnieuw.',
    weak_password: 'Je wachtwoord is te kort. Kies minimaal 8 tekens.',
    same_password: 'Dit is je huidige wachtwoord. Kies een ander wachtwoord.',
    recovery_invalid: 'Deze link is verlopen. Vraag een nieuwe aan.',
    confirmation_required: 'Je account kan nog niet direct inloggen. Probeer later opnieuw.',
    unknown: 'Dit is niet gelukt. Probeer het opnieuw.'
  };

  function failure(code) {
    const error = new Error(messages[code] || messages.unknown);
    error.code = code in messages ? code : 'unknown';
    return error;
  }

  function readableError(error) {
    const code = String(error?.code || '').toLowerCase();
    const message = String(error?.message || '').toLowerCase();
    if (code in messages && error.message === messages[code]) return error;
    if (error?.status === 429 || /rate_limit|too_many_requests/.test(code) || /rate limit|too many requests/.test(message)) return failure('rate_limit');
    if (/user_already_exists|email_exists/.test(code) || /already registered|already been registered/.test(message)) return failure('duplicate');
    if (code === 'invalid_credentials' || /invalid login credentials/.test(message)) return failure('invalid_credentials');
    if (/email_address_invalid|validation_failed/.test(code) && /email/.test(message)) return failure('invalid_email');
    if (code === 'weak_password' || /password should be at least|password is too short/.test(message)) return failure('weak_password');
    if (code === 'same_password') return failure('same_password');
    if (/session_not_found|session_expired|otp_expired|refresh_token_not_found/.test(code)) return failure('recovery_invalid');
    if (code === 'email_not_confirmed') return failure('confirmation_required');
    if (window.navigator.onLine === false || error?.name === 'AuthRetryableFetchError' || error instanceof TypeError || /failed to fetch|network|load failed|fetch failed/.test(message)) return failure('network');
    return failure('unknown');
  }

  const cleanName = value => typeof value === 'string'
    ? Array.from(value.normalize('NFC').replace(/[^\p{L}\p{M}\p{Nd} '\u2019-]/gu, '')).slice(0, 24).join('').trim()
    : '';

  function clearName() {
    try { window.localStorage.removeItem('bes_naam'); } catch {}
  }

  function renderAccount() {
    document.querySelectorAll('a.pill.login-button').forEach(link => {
      link.textContent = currentUser ? 'Uitloggen' : 'Inloggen →';
      link.setAttribute('href', currentUser ? '#' : pagePrefix + 'inloggen.html');
      link.toggleAttribute('data-account-uitloggen', Boolean(currentUser));
    });
    document.querySelectorAll('[data-account-opties]').forEach(element => { element.hidden = Boolean(currentUser); });
    document.querySelectorAll('[data-account-sessie]').forEach(element => {
      element.hidden = !currentUser;
      const link = element.querySelector('[data-account-uitloggen]');
      if (link && currentUser) {
        const name = cleanName(currentUser.user_metadata?.naam);
        link.textContent = name ? `Je bent ingelogd als ${name}. Uitloggen` : 'Je bent ingelogd. Uitloggen';
      }
    });
  }

  function setUser(user, clearGuestName = false) {
    currentUser = user || null;
    if (currentUser) {
      const name = cleanName(currentUser.user_metadata?.naam);
      if (name) BES.naamOpslaan?.(name);
      else clearName();
    } else if (clearGuestName) {
      clearName();
    }
    window.clearTimeout(renderTimer);
    renderTimer = window.setTimeout(() => {
      renderAccount();
      window.dispatchEvent(new CustomEvent('bes:auth', { detail: { user: currentUser } }));
    }, 0);
  }

  async function requireClient() {
    if (!auth.beschikbaar) throw failure('unavailable');
    await auth.gereed;
    return client;
  }

  async function request(operation) {
    try {
      const activeClient = await requireClient();
      const result = await operation(activeClient.auth);
      if (result.error) throw result.error;
      return result.data;
    } catch (error) {
      throw readableError(error);
    }
  }

  const auth = BES.auth = {
    beschikbaar: false,
    gereed: Promise.resolve(null),
    get client() { return client; },

    async gebruiker() {
      await auth.gereed;
      return currentUser;
    },

    async aanmelden(naam, email, wachtwoord) {
      const name = cleanName(naam);
      if (!name) throw failure('unknown');
      if (String(wachtwoord).length < 8) throw failure('weak_password');
      const data = await request(api => api.signUp({
        email: String(email).trim(),
        password: wachtwoord,
        options: { data: { naam: name } }
      }));
      if (data?.user?.identities?.length === 0) throw failure('duplicate');
      if (!data?.session || !data?.user) throw failure('confirmation_required');
      setUser(data.user);
      return data.user;
    },

    async inloggen(email, wachtwoord) {
      const data = await request(api => api.signInWithPassword({ email: String(email).trim(), password: wachtwoord }));
      if (!data?.session || !data?.user) throw failure('invalid_credentials');
      recoveryUserId = null;
      setUser(data.user);
      return data.user;
    },

    async uitloggen() {
      await request(api => api.signOut());
      recoveryUserId = null;
      setUser(null, true);
      window.location.assign(pagePrefix + 'index.html');
    },

    async herstelMail(email) {
      const redirectTo = new URL(pagePrefix + 'wachtwoord.html', window.location.href).href;
      await request(api => api.resetPasswordForEmail(String(email).trim(), { redirectTo }));
    },

    async herstelGeldig() {
      await auth.gereed;
      if (initializationError && ['network', 'rate_limit'].includes(initializationError.code)) throw initializationError;
      return Boolean(auth.beschikbaar && currentUser && recoveryUserId === currentUser.id);
    },

    async nieuwWachtwoord(wachtwoord) {
      await requireClient();
      if (!await auth.herstelGeldig()) throw failure('recovery_invalid');
      if (String(wachtwoord).length < 8) throw failure('weak_password');
      const data = await request(api => api.updateUser({ password: wachtwoord }));
      if (!data?.user) throw failure('recovery_invalid');
      recoveryUserId = null;
      setUser(data.user);
      return data.user;
    }
  };

  const filled = value => typeof value === 'string' && value.trim() && !/[\[\]]/.test(value);
  let validUrl = false;
  try { validUrl = /^https?:$/.test(new URL(config.supabaseUrl).protocol); } catch {}

  if (validUrl && filled(config.supabaseUrl) && filled(config.supabaseAnonKey) && typeof window.supabase?.createClient === 'function') {
    try {
      client = window.supabase.createClient(config.supabaseUrl.trim(), config.supabaseAnonKey.trim());
      auth.beschikbaar = true;
      client.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY') recoveryUserId = session?.user?.id || null;
        if (event === 'SIGNED_OUT' || !session || (recoveryUserId && session.user?.id !== recoveryUserId)) recoveryUserId = null;
        setUser(session?.user, event === 'SIGNED_OUT');
      });
      auth.gereed = (async () => {
        try {
          const initialized = await client.auth.initialize();
          if (initialized.error) initializationError = readableError(initialized.error);
          const { data, error } = await client.auth.getSession();
          if (error) initializationError = readableError(error);
          else setUser(data?.session?.user);
        } catch (error) { initializationError = readableError(error); }
        await new Promise(resolve => window.setTimeout(resolve, 0));
        return currentUser;
      })();
    } catch {
      auth.beschikbaar = false;
      client = null;
    }
  }

  if (!auth.beschikbaar) console.info('Accounts zijn nog niet ingeschakeld; de client is niet aangemaakt.');

  const initializeView = () => {
    renderAccount();
    document.addEventListener('click', async event => {
      const link = event.target.closest?.('[data-account-uitloggen]');
      if (!link || !currentUser) return;
      event.preventDefault();
      if (signingOut) return;
      signingOut = true;
      link.setAttribute('aria-disabled', 'true');
      const errorHost = link.closest('nav') || document.querySelector('nav.navigation, nav.nav-vol') || document.querySelector('[data-account-sessie]') || link.parentElement;
      const previousError = document.querySelector('[data-account-fout]');
      if (previousError) previousError.remove();
      try {
        await auth.uitloggen();
      } catch (error) {
        const message = document.createElement('p');
        message.className = 'auth-error account-fout';
        message.setAttribute('data-account-fout', '');
        message.setAttribute('role', 'status');
        message.textContent = `${readableError(error).message} `;
        const retry = document.createElement('a');
        retry.href = '#';
        retry.setAttribute('data-account-uitloggen', '');
        retry.textContent = 'Opnieuw uitloggen';
        message.append(retry);
        if (errorHost.tagName === 'NAV') errorHost.insertAdjacentElement('afterend', message);
        else errorHost.append(message);
      } finally {
        signingOut = false;
        link.removeAttribute('aria-disabled');
      }
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeView, { once: true });
  else initializeView();
})();
