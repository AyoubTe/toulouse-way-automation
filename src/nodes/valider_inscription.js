// Vérifie l'inscription (session publiée, places, doublon), prépare la ligne et les emails
const P = TW.params($('Paramètres (inscription)').all().map(i => i.json));
const T = $('Templates (inscription)').all().map(i => i.json);
const sessions = $('Sessions (inscription)').all().map(i => i.json);
const ins = $('Inscriptions (inscription)').all().map(i => i.json).filter(i => i.id);
const b = $('Webhook inscription').first().json.body || {};
const clean = (v, n) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n || 200);
const fail = (code, message) => [{ json: { ok: false, response: { ok: false, code, message } } }];
const email = clean(b.email, 120).toLowerCase();
const lang = b.langue === 'en' ? 'en' : 'fr';
if (!clean(b.prenom) || !clean(b.nom) || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || b.consentement !== true) return fail('invalide', 'Champs invalides.');
const s = sessions.find(x => String(x.id) === String(b.session_id));
if (!s || TW.norm(s.publie) !== 'oui' || TW.isoDate(s.date) < TW.todayParis()) return fail('introuvable', 'Session indisponible.');
const actifs = ins.filter(i => String(i.session_id) === String(s.id) && !['Annulé', 'Absent'].includes(i.statut));
if (actifs.some(i => TW.norm(i.email) === email)) return fail('deja_inscrit', 'Déjà inscrit.');
const places = Number(s.places) || 0;
if (places && actifs.length >= places) return fail('complet', 'Session complète.');

const row = {
  id: TW.uid('I'), session_id: String(s.id), prenom: clean(b.prenom, 80), nom: clean(b.nom, 80), email, telephone: clean(b.telephone, 30),
  langue: lang, date_inscription: TW.nowParis(), statut: 'Inscrit', token: TW.token(), rappel_J3: '', rappel_J1: '', date_reponse: ''
};
const base = { from_name: P.nom_asso, reply_to: P.email_gestionnaire };
const e1 = TW.email(T, 'inscription_confirmee', [lang], {
  prenom: row.prenom, titre: TW.sessionTitle(s, lang), details_session: TW.detailsSession(P, s, lang),
  lien_annuler: TW.link(P, 'tw-presence', { t: row.token, a: 'annuler' })
}, P);
const n = actifs.length + 1;
const e2 = TW.email(T, 'gestionnaire_nouvelle_inscription', ['fr'], {
  nom_complet: `${row.prenom} ${row.nom}`, email, titre: s.titre, nb_inscrits: n, places_info: places ? `sur ${places} places` : '',
  details_session: TW.detailsSession(P, s, 'fr'), lien_admin: TW.link(P, 'tw-gestion') + '#sessions'
}, P);
return [{ json: { ok: true, row, response: { ok: true }, emails: [
  { ...base, to: row.email, sujet: e1.sujet, html: e1.html },
  { ...base, to: P.email_gestionnaire, sujet: e2.sujet, html: e2.html }
] } }];
