// Edge Function "mollie-webhook": Mollie meldt hier elke statuswijziging van een betaling (ook maandbetalingen en
// terugbetalingen). Zetten via de Supabase-editor, met JWT-controle UIT (Mollie stuurt geen Supabase-sessie mee).
// SQL: supabase/mollie.sql. Sleutel: MOLLIE_API_KEY bij Edge Functions, Secrets.
//
// Mollie stuurt alleen "id=tr_..." (application/x-www-form-urlencoded). We vertrouwen daar niets van: de betaling wordt
// altijd zelf bij Mollie opgehaald, en alleen die gegevens tellen. Mollie kan dezelfde melding vaker sturen; alles is
// daarom herhaalbaar (mollie_verwerk zet een plan maar één keer aan, een abonnement wordt maar één keer gemaakt, en elke
// POST naar Mollie heeft een Idempotency-Key). Een maandbetaling die niets aanzette (na herroepen of van een oud
// abonnement) gaat helemaal terug; bij een terugboeking via de bank stopt het plan en het Mollie-abonnement.
// Antwoord: altijd 200 met een lege inhoud, ook voor onbekende nummers. Alleen als Mollie zelf of de database niet
// bereikbaar is 503, zodat Mollie het later opnieuw probeert (tot 10 keer in 26 uur).
// Nooit de sleutel of persoonsgegevens loggen, alleen statuscodes.
import { createClient } from 'npm:@supabase/supabase-js@2';

const MOLLIE = 'https://api.mollie.com/v2';
// Prijzen per maand, inclusief btw (gelijk aan de Edge Function mollie).
const PRIJS: Record<string, string> = { plus: '2.99', pro: '9.99' };
const NAAM: Record<string, string> = { plus: 'Plus', pro: 'Pro' };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// deno-lint-ignore no-explicit-any
type Obj = Record<string, any>;

type MailBijlage = { filename: string; content: string };

// Beide functies worden los geplakt in de Supabase-editor, daarom staat deze mailhulp in beide bestanden.
// Een mailfout verandert nooit het resultaat van de abonnementsactie. Status 0 betekent een lokale fout of time-out.
async function stuurMail({ aan, onderwerp, tekst, html, sleutel, bijlagen }: {
  aan: string; onderwerp: string; tekst: string; html: string; sleutel: string; bijlagen?: MailBijlage[];
}): Promise<void> {
  try {
    const api = Deno.env.get('RESEND_API_KEY');
    const van = Deno.env.get('MAIL_VAN');
    if (!api || !van) { console.info('mail: niet ingesteld'); return; }
    if (!aan) { console.error('mail:', 0); return; }
    const antwoord = Deno.env.get('MAIL_ANTWOORD');
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${api}`, 'Content-Type': 'application/json', 'Idempotency-Key': sleutel },
      body: JSON.stringify({
        from: van, to: [aan], ...(antwoord ? { reply_to: antwoord } : {}), subject: onderwerp, text: tekst, html,
        ...(bijlagen?.length ? { attachments: bijlagen } : {}),
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) console.error('mail:', r.status);
  } catch { console.error('mail:', 0); }
}

const mailDatum = (op: string | Date) => new Intl.DateTimeFormat('nl-BE', {
  timeZone: 'Europe/Amsterdam', day: 'numeric', month: 'long', year: 'numeric',
}).format(new Date(op));
const mailAanhef = (user: Obj) => typeof user.user_metadata?.voornaam === 'string' && user.user_metadata.voornaam.trim()
  ? `Hallo ${user.user_metadata.voornaam.trim()},` : 'Hallo,';
const mailVeilig = (tekst: string) => tekst.replace(/[&<>"']/g, (teken) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[teken]!);
const mailHtml = (tekst: string) => '<!doctype html><html lang="nl"><body>' + tekst.split('\n\n')
  .map((alinea) => `<p>${mailVeilig(alinea).replace(/\n/g, '<br>')}</p>`).join('') + '</body></html>';

// herroep_tot sluit af bij Amsterdamse middernacht, 15 kalenderdagen na de contractdag.
// "Tot en met" is dus die dag + 14, ook over zomer-/wintertijd heen.
function mailHerroepTot(op: Date): string {
  const delen = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Amsterdam', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(op);
  const deel = (soort: string) => Number(delen.find((d) => d.type === soort)?.value);
  return mailDatum(new Date(Date.UTC(deel('year'), deel('month') - 1, deel('day') + 14, 12)));
}

// Letterlijke tekst uit voorwaarden.html. Bij wijzigingen beide exemplaren samen bijwerken.
const MODELFORMULIER = `Modelformulier voor herroeping

Vul dit formulier alleen in als je je abonnement wil herroepen. Mail het naar berie007yldrm@gmail.com.

Aan Berie's Exam Space, berie007yldrm@gmail.com. Berat Yildirim, KvK-nummer 42183092. Het adres komt hier voordat je iets kan betalen.
Ik herroep hierbij mijn overeenkomst voor de volgende dienst: abonnement [Plus of Pro] op Berie's Exam Space.
Afgesloten op [datum]
Naam [je naam]
Adres [je adres]
E-mailadres van je account [e-mailadres]
Handtekening [alleen als je dit formulier op papier stuurt]
Datum [datum]`;

async function voorwaardenBijlage(site: string): Promise<MailBijlage[]> {
  try {
    const r = await fetch(`${site}voorwaarden.html`, { signal: AbortSignal.timeout(5000) });
    if (!r.ok) { console.error('mail: voorwaarden', r.status); return []; }
    const bytes = new Uint8Array(await r.arrayBuffer());
    let inhoud = '';
    for (let i = 0; i < bytes.length; i += 8192) inhoud += String.fromCharCode(...bytes.subarray(i, i + 8192));
    return [{ filename: 'voorwaarden.html', content: btoa(inhoud) }];
  } catch { console.error('mail: voorwaarden', 0); return []; }
}

// eenmalig: Idempotency-Key bij een POST. Dezelfde aanvraag met dezelfde sleutel binnen een uur doet Mollie maar één keer
// (twee meldingen tegelijk: de tweede krijgt 409 en Mollie probeert die melding later opnieuw).
async function mollie(pad: string, methode = 'GET', inhoud?: unknown, eenmalig?: string): Promise<{ status: number; ok: boolean; data: Obj | null }> {
  const sleutel = Deno.env.get('MOLLIE_API_KEY');
  if (!sleutel) return { status: 0, ok: false, data: null };
  let r: Response;
  try {
    r = await fetch(MOLLIE + pad, {
      method: methode,
      headers: {
        Authorization: `Bearer ${sleutel}`,
        ...(inhoud ? { 'Content-Type': 'application/json' } : {}),
        ...(eenmalig ? { 'Idempotency-Key': eenmalig } : {}),
      },
      body: inhoud ? JSON.stringify(inhoud) : undefined,
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return { status: 0, ok: false, data: null };
  }
  let data: Obj | null = null;
  try { data = r.status === 204 ? null : await r.json(); } catch { data = null; }
  return { status: r.status, ok: r.ok, data };
}

// Mollie zelf onbereikbaar, sleutel fout of te druk: later opnieuw laten proberen.
const opnieuw = (status: number) => status === 0 || status === 401 || status === 409 || status === 429 || status >= 500;

// Datum (JJJJ-MM-DD, tijdzone Amsterdam) een maand na het gegeven moment; 31 januari wordt 28 of 29 februari,
// net als "+ interval '1 month'" in Postgres.
function datumPlusMaand(op: Date): string {
  const delen = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Amsterdam', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(op);
  const deel = (soort: string) => Number(delen.find((d) => d.type === soort)?.value);
  let jaar = deel('year');
  let maand = deel('month') + 1;
  const dag = deel('day');
  if (maand > 12) { maand = 1; jaar += 1; }
  const laatste = new Date(Date.UTC(jaar, maand, 0)).getUTCDate();
  return `${jaar}-${String(maand).padStart(2, '0')}-${String(Math.min(dag, laatste)).padStart(2, '0')}`;
}

// Abonnement bij Mollie stopzetten. Al gestopt of niet (meer) te vinden telt als gelukt.
async function stopAbonnement(klant: string, abonnement: string): Promise<boolean> {
  const pad = `/customers/${encodeURIComponent(klant)}/subscriptions/${encodeURIComponent(abonnement)}`;
  const r = await mollie(pad, 'DELETE');
  if (r.ok || r.status === 404 || r.status === 410) return true;
  if (r.status === 422) {
    const nu = await mollie(pad);
    return nu.status === 404 || ['canceled', 'completed'].includes(String(nu.data?.status));
  }
  return false;
}

Deno.serve(async (req) => {
  const leeg = (status = 200) => new Response(null, { status });
  if (req.method !== 'POST') return leeg();

  let id = '';
  try { id = new URLSearchParams(await req.text()).get('id') ?? ''; } catch { return leeg(); }
  // Alleen betalingen (tr_...). Mollie meldt ook maandbetalingen en terugbetalingen met het nummer van de betaling.
  if (!/^tr_[A-Za-z0-9]+$/.test(id)) return leeg();

  const url = Deno.env.get('SUPABASE_URL');
  const dienstSleutel = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SECRET_KEY');
  if (!url || !dienstSleutel || !Deno.env.get('MOLLIE_API_KEY')) {
    console.error('mollie-webhook: instellingen ontbreken');
    return leeg(503);
  }
  const beheer = createClient(url, dienstSleutel, { auth: { persistSession: false } });

  // De betaling zelf ophalen bij Mollie.
  const r = await mollie(`/payments/${id}`);
  if (opnieuw(r.status)) { console.error('mollie-webhook: Mollie niet bereikbaar', r.status); return leeg(503); }
  if (!r.ok || !r.data) return leeg();
  const p = r.data;

  const soort = p.sequenceType === 'first' ? 'eerste' : p.sequenceType === 'recurring' && p.subscriptionId ? 'maandelijks' : null;
  if (!soort) return leeg();
  const meta: Obj = p.metadata && typeof p.metadata === 'object' ? p.metadata : {};
  const plan = typeof meta.plan === 'string' && meta.plan in PRIJS ? meta.plan : null;
  const gebruiker = typeof meta.user_id === 'string' && UUID.test(meta.user_id) ? meta.user_id : null;
  if (soort === 'eerste' && (!plan || !gebruiker)) return leeg();
  const bedrag = Number(p.amount?.value ?? 0);
  // Proefmaand alleen als dat in de metadata staat EN het bedrag lager is dan de maandprijs.
  const proef = meta.proef === true && plan !== null && bedrag < Number(PRIJS[plan]);
  const status = String(p.status ?? '');

  const { data: v, error } = await beheer.rpc('mollie_verwerk', {
    p_id: id,
    p_user: gebruiker,
    p_plan: plan,
    p_soort: soort,
    p_bedrag: bedrag,
    p_valuta: String(p.amount?.currency ?? 'EUR'),
    p_status: status,
    p_terugbetaald: Number(p.amountRefunded?.value ?? 0),
    // Teruggeboekt via de bank (chargeback): de status blijft 'paid', alleen dit bedrag verandert.
    p_teruggeboekt: Number(p.amountChargedBack?.value ?? 0),
    p_betaald_op: p.paidAt ?? null,
    p_proef: proef,
    p_meteen: meta.meteen === true,
    p_klant: p.customerId ?? null,
    p_mandaat: p.mandateId ?? null,
    p_abonnement: p.subscriptionId ?? null,
  });
  if (error || !v) { console.error('mollie-webhook: verwerken mislukt'); return leeg(503); }

  // Teruggeboekt via de bank: het plan is gestopt (mollie_verwerk), nu ook het Mollie-abonnement stoppen.
  if (v.stop_abonnement === true) {
    const klant = String(p.customerId ?? v.klant_id ?? '');
    for (const sub of new Set([v.abonnement_id, p.subscriptionId].filter((s) => typeof s === 'string' && s))) {
      if (klant && !(await stopAbonnement(klant, sub))) { console.error('mollie-webhook: abonnement na terugboeking niet gestopt'); return leeg(503); }
    }
    return leeg();
  }

  // Maandbetaling die niets aanzette (na herroepen, van een oud abonnement, of zonder account): dat abonnement stoppen
  // en de betaling helemaal terugstorten. Herhaalbaar: wat bij Mollie al terug is, telt niet meer mee (amountRemaining).
  if (soort === 'maandelijks' && status === 'paid' && (v.uitkomst === 'genegeerd' || !v.user_id)) {
    const klant = String(p.customerId ?? '');
    if (klant && p.subscriptionId && !(await stopAbonnement(klant, String(p.subscriptionId)))) {
      console.error('mollie-webhook: los abonnement niet gestopt');
      return leeg(503);
    }
    const rest = Number(p.amountRemaining?.value ?? 0);
    if (rest > 0 && Number(p.amountChargedBack?.value ?? 0) === 0) {
      const terug = await mollie(`/payments/${id}/refunds`, 'POST', {
        amount: { currency: String(p.amountRemaining?.currency ?? 'EUR'), value: rest.toFixed(2) },
        description: "Berie's Exam Space, betaling zonder plan",
      }, `terug-${id}-${rest.toFixed(2)}`);
      if (!terug.ok) { console.error('mollie-webhook: terugstorten mislukt', terug.status); return leeg(opnieuw(terug.status) ? 503 : 200); }
      await beheer.rpc('mollie_terug', { p_id: id, p_bedrag: rest });
    }
    return leeg();
  }

  // Verder heeft alleen een geslaagde eerste betaling nog werk: terugstorten of het maandabonnement maken.
  if (soort !== 'eerste' || status !== 'paid') return leeg();

  // Er liep al zo'n plan (dubbel betaald): het hele bedrag terug, geen abonnement.
  if (v.uitkomst === 'dubbel') {
    const rest = Number(p.amountRemaining?.value ?? 0);
    if (rest > 0) {
      const terug = await mollie(`/payments/${id}/refunds`, 'POST', {
        amount: { currency: String(p.amountRemaining?.currency ?? 'EUR'), value: rest.toFixed(2) },
        description: "Berie's Exam Space, dubbele betaling",
      }, `terug-${id}-${rest.toFixed(2)}`);
      if (!terug.ok) { console.error('mollie-webhook: terugstorten mislukt', terug.status); return leeg(opnieuw(terug.status) ? 503 : 200); }
      await beheer.rpc('mollie_terug', { p_id: id, p_bedrag: rest });
    }
    return leeg();
  }

  // Geen abonnement (meer) als het plan intussen is opgezegd, herroepen of vervangen, of als er al iets terug is.
  if (!v.mag_abonnement || Number(p.amountRefunded?.value ?? 0) > 0 || Number(p.amountChargedBack?.value ?? 0) > 0) return leeg();
  const klant = String(p.customerId ?? v.klant_id ?? '');
  if (!klant || !plan || !gebruiker) return leeg();

  // Bestaat het abonnement voor deze eerste betaling al (eerdere melding)? Dan niet nog eens maken. Komen twee meldingen
  // tegelijk, dan zorgt de Idempotency-Key sub-<betaling> ervoor dat Mollie er toch maar één maakt.
  const lijst = await mollie(`/customers/${encodeURIComponent(klant)}/subscriptions?limit=250`);
  if (!lijst.ok) { console.error('mollie-webhook: abonnementen ophalen mislukt', lijst.status); return leeg(503); }
  const bestaande: Obj[] = Array.isArray(lijst.data?._embedded?.subscriptions) ? lijst.data._embedded.subscriptions : [];
  let sub = bestaande.find((s) => s?.metadata?.eerste === id) ?? null;

  if (!sub) {
    // Een vorig abonnement (ander plan, of opgezegd en opnieuw gestart) eerst stoppen: er loopt er altijd hoogstens één.
    const oud = typeof v.abonnement_id === 'string' && v.abonnement_id ? v.abonnement_id : null;
    if (oud && !(await stopAbonnement(klant, oud))) { console.error('mollie-webhook: oud abonnement niet gestopt'); return leeg(503); }
    // Eerste maandbetaling een maand na deze betaling: na de proefmaand, of na de betaalde eerste maand.
    const start = datumPlusMaand(new Date(p.paidAt ?? Date.now()));
    const nieuw = await mollie(`/customers/${encodeURIComponent(klant)}/subscriptions`, 'POST', {
      amount: { currency: 'EUR', value: PRIJS[plan] },
      interval: '1 month',
      startDate: start,
      description: `Berie's Exam Space ${NAAM[plan]}, per maand vanaf ${start}`,
      ...(p.mandateId ? { mandateId: p.mandateId } : {}),
      webhookUrl: `${url}/functions/v1/mollie-webhook`,
      metadata: { user_id: gebruiker, plan, eerste: id },
    }, `sub-${id}`);
    if (!nieuw.ok || !nieuw.data?.id) { console.error('mollie-webhook: abonnement maken mislukt', nieuw.status); return leeg(503); }
    sub = nieuw.data;
  }

  const { error: kFout } = await beheer.from('mollie_koppeling')
    .update({ abonnement_id: String(sub.id), mandaat_id: p.mandateId ?? undefined, plan, bijgewerkt: new Date().toISOString() })
    .eq('user_id', gebruiker);
  if (kFout) { console.error('mollie-webhook: koppeling niet bijgewerkt'); return leeg(503); }
  if (v.uitkomst === 'proef' || v.uitkomst === 'actief') {
    // Pas mailen als betaling, abonnement en koppeling klaar zijn. Ook fouten bij de mailvoorbereiding mogen
    // geen nieuwe betaalpoging veroorzaken. Een herhaalde webhook gebruikt dezelfde Resend-sleutel.
    try {
      if (!Deno.env.get('RESEND_API_KEY') || !Deno.env.get('MAIL_VAN')) {
        console.info('mail: niet ingesteld');
      } else {
        const { data: account, error: accountFout } = await beheer.auth.admin.getUserById(gebruiker);
        if (accountFout || !account?.user?.email) {
          console.error('mail:', 0);
        } else {
          const site = (Deno.env.get('SITE_URL') || 'https://beriesexamspace.com/v2/').replace(/\/?$/, '/');
          const prijs = `${PRIJS[plan].replace('.', ',')} euro`;
          const { data: abonnement, error: abonnementFout } = await beheer.from('abonnementen')
            .select('proef_tot, overeenkomst_op').eq('user_id', gebruiker).maybeSingle();
          if (abonnementFout || !abonnement) throw new Error('maildatum');
          // mollie_verwerk bewaart overeenkomst_op bij verwerking, mogelijk later dan paidAt.
          // Gebruik net als Profiel die bewaarde contractstart; alleen zonder die datum geldt de betaaldatum.
          const overeenkomstOp = new Date(abonnement.overeenkomst_op ?? p.paidAt);
          const eersteDatum = mailDatum(`${sub.startDate}T12:00:00Z`);
          let maand = 'Je eerste maand is betaald.';
          if (v.uitkomst === 'proef') {
            if (!abonnement.proef_tot) throw new Error('maildatum');
            maand = `Je proefmaand loopt tot ${mailDatum(abonnement.proef_tot)}.`;
          }
          const bijlagen = await voorwaardenBijlage(site);
          const tekst = `${mailAanhef(account.user)}\n\nJe abonnement op Berie's Exam Space is ${NAAM[plan]}. De prijs is ${prijs} per maand, inclusief btw.\n\n${maand} Daarna betaal je automatisch ${prijs} per maand, voor het eerst op ${eersteDatum}.\n\nOpzeggen kan altijd met één knop op je profiel: ${site}profiel.html#abonnement\n\nJe hebt 14 dagen bedenktijd, tot en met ${mailHerroepTot(overeenkomstOp)}. Herroepen kan met de knop "Hier de overeenkomst herroepen" op je profiel, of met het modelformulier hieronder.\n\n${MODELFORMULIER}\n\nAlle gegevens van Berie's Exam Space en de volledige voorwaarden staan ${bijlagen.length ? 'in de bijlage en ' : ''}op ${site}voorwaarden.html.`;
          const html = mailHtml(tekst).replace('</body>', `<p><a href="${mailVeilig(site + 'profiel.html#abonnement')}">Naar je profiel</a><br><a href="${mailVeilig(site + 'voorwaarden.html')}">Volledige voorwaarden</a></p></body>`);
          await stuurMail({
            aan: account.user.email, onderwerp: `Je abonnement op Berie's Exam Space: ${NAAM[plan]}`,
            tekst, html, sleutel: `mail-eerste-${id}`, bijlagen,
          });
        }
      }
    } catch { console.error('mail:', 0); }
  }
  return leeg();
});
