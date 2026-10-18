// Vérifie la demande reçue du formulaire, prépare la ligne et les emails
const P = TW.params($('Paramètres (demande)').all().map(i => i.json));
const L = $('Listes (demande)').all().map(i => i.json);
const T = $('Templates (demande)').all().map(i => i.json);
const b = $('Webhook demande').first().json.body || {};
const clean = (v, n) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n || 200);
const codes = type => new Set(L.filter(r => TW.norm(r.type) === type).map(r => TW.norm(r.code)));
const arr = v => (Array.isArray(v) ? v : TW.list(v)).map(x => TW.norm(x));
const langues = [...new Set(arr(b.langues))].filter(c => codes('langue').has(c));
const metiers = [...new Set(arr(b.metiers))].filter(c => codes('metier').has(c)).slice(0, 5);
const email = clean(b.email, 120).toLowerCase();
const fail = message => [{ json: { ok: false, response: { ok: false, code: 'invalide', message } } }];
if (!clean(b.prenom) || !clean(b.nom)) return fail('Prénom et nom obligatoires.');
if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return fail('Email invalide.');
if (!langues.length || !metiers.length) return fail('Choisissez au moins une langue et un métier.');
if (b.consentement !== true) return fail('Consentement requis.');

const row = {
  id: TW.uid('D'), date_demande: TW.todayParis(), prenom: clean(b.prenom, 80), nom: clean(b.nom, 80), email,
  telephone: clean(b.telephone, 30), ville: clean(b.ville, 80), langues: langues.join(','), metiers: metiers.join(','),
  parcours: clean(b.parcours, 800), statut: 'Nouveau', contacts_proposes: '', date_mise_en_relation: '', notes: ''
};
const base = { from_name: P.nom_asso, reply_to: P.email_gestionnaire };
const e1 = TW.email(T, 'demande_recue', langues, { prenom: row.prenom }, P);
const e2 = TW.email(T, 'gestionnaire_nouvelle_demande', ['fr'], {
  nom_complet: `${row.prenom} ${row.nom}`, details_demandeur: TW.detailsDemandeur(P, row, 'fr', L, true), lien_admin: TW.link(P, 'tw-gestion') + '#demandes'
}, P);
return [{ json: { ok: true, row, response: { ok: true }, emails: [
  { ...base, to: row.email, sujet: e1.sujet, html: e1.html },
  { ...base, to: P.email_gestionnaire, sujet: e2.sujet, html: e2.html }
] } }];
