// Plan van het account: Free, Plus of Pro (supabase/abonnementen.sql). Eén keer per pagina opgehaald.
// Gebruik: const p = await BES.plan();  p.plan is 'free', 'plus' of 'pro'. Na een wijziging: BES.plan(true).
// Laden na auth.js. Zonder account of zonder verbinding geldt Free.
window.BES = window.BES || {};

(() => {
  'use strict';

  const BES = window.BES;
  const leeg = { plan: 'free', status: null, geldig_tot: null, proef_plus: false, proef_pro: false, ingelogd: false };
  const rang = { free: 0, plus: 1, pro: 2 };
  let belofte = null;

  BES.plan = (opnieuw) => {
    if (belofte && !opnieuw) return belofte;
    belofte = (async () => {
      const auth = BES.auth;
      if (!auth) return { ...leeg };
      const user = await auth.gebruiker().catch(() => null);
      if (!user || !auth.client) return { ...leeg };
      try {
        const { data, error } = await auth.client.rpc('mijn_abonnement');
        if (error || !data) return { ...leeg, ingelogd: true };
        return { ...leeg, ...data, ingelogd: true };
      } catch {
        return { ...leeg, ingelogd: true };
      }
    })();
    return belofte;
  };

  // Heeft dit account minstens dit plan? BES.heeftPlan('plus') is ook waar bij Pro.
  BES.heeftPlan = async (nodig) => (rang[(await BES.plan()).plan] || 0) >= (rang[nodig] || 0);

  BES.planNaam = (plan) => ({ free: 'Free', plus: 'Plus', pro: 'Pro' })[plan] || 'Free';

  BES.planDatum = (iso) => {
    try { return new Intl.DateTimeFormat('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso)); } catch { return ''; }
  };
})();
