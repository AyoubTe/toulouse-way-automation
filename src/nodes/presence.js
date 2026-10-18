// Traite un clic du participant : confirmer sa présence ou annuler
const P = TW.params($('Paramètres').all().map(i => i.json));
const T = $('Templates').all().map(i => i.json);
const S = $('Sessions').all().map(i => i.json);
const INS = $('Inscriptions').all().map(i => i.json).filter(i => i.id);
const q = $('Webhook présence').first().json.query || {};
const t = String(q.t || ''), a = String(q.a || '');
const out = { maj: null, emails: [] };
const base = { from_name: P.nom_asso, reply_to: P.email_gestionnaire };
const i = t.length >= 16 ? INS.find(x => x.token === t) : null;
const lang = i && i.langue === 'en' ? 'en' : 'fr';
const X = {
  fr: { bad: 'Lien non valide', badP: "Ce lien n'existe pas ou a été copié de façon incomplète.", past: 'Session terminée', pastP: 'Cette session a déjà eu lieu.',
    cancelled: 'Inscription déjà annulée', cancelledP: 'Votre annulation avait déjà été enregistrée.', confT: 'Présence confirmée, merci !', confP: 'Nous avons hâte de vous voir.',
    annT: 'Annulation enregistrée', annP: 'Merci de nous avoir prévenus : votre place peut maintenant profiter à quelqu’un d’autre.', agenda: "Voir l'agenda" },
  en: { bad: 'Invalid link', badP: 'This link does not exist or was copied incompletely.', past: 'Session over', pastP: 'This session has already taken place.',
    cancelled: 'Already cancelled', cancelledP: 'Your cancellation had already been recorded.', confT: 'Attendance confirmed, thank you!', confP: 'We look forward to seeing you.',
    annT: 'Cancellation recorded', annP: 'Thank you for letting us know: your seat can now go to someone else.', agenda: 'See the calendar' }
}[lang];
const page = (title, paras, tone, cta) => [{ json: Object.assign({ body: TW.page(P, { title, paras, lang, tone, cta }) }, out) }];
if (!i) return page(X.bad, [X.badP], 'err');
const s = S.find(x => String(x.id) === String(i.session_id)) || {};
const titre = TW.sessionTitle(s, lang) || '';
const when = [TW.longDate(TW.isoDate(s.date), lang), s.heure_debut].filter(Boolean).join(', ');
if (TW.isoDate(s.date) && TW.isoDate(s.date) < TW.todayParis()) return page(X.past, [X.pastP], 'warn');
if (i.statut === 'Annulé') return page(X.cancelled, [X.cancelledP], 'warn', { label: X.agenda, url: TW.link(P, 'tw-agenda', { lang }) });
if (a === 'confirmer') {
  out.maj = { id: i.id, statut: 'Confirmé', date_reponse: TW.nowParis() };
  return page(X.confT, [`${titre} – ${when}`, X.confP], 'ok');
}
if (a === 'annuler') {
  out.maj = { id: i.id, statut: 'Annulé', date_reponse: TW.nowParis() };
  const e1 = TW.email(T, 'annulation_participant', [lang], { prenom: i.prenom, titre, lien_agenda: TW.link(P, 'tw-agenda', { lang }) }, P);
  const restants = INS.filter(x => String(x.session_id) === String(i.session_id) && x.id !== i.id && !['Annulé', 'Absent'].includes(x.statut)).length;
  const places = Number(s.places) || 0;
  const moment = i.rappel_J1 ? 'en réponse au rappel de la veille' : i.rappel_J3 ? 'en réponse au rappel J-3' : "depuis l'email de confirmation";
  const e2 = TW.email(T, 'gestionnaire_annulation', ['fr'], { nom_complet: `${i.prenom || ''} ${i.nom || ''}`.trim(), email: i.email, titre: s.titre || titre, moment,
    nb_inscrits: restants, places_info: places ? `sur ${places} places` : '', lien_admin: TW.link(P, 'tw-gestion') + '#sessions' }, P);
  out.emails.push({ ...base, to: i.email, sujet: e1.sujet, html: e1.html }, { ...base, to: P.email_gestionnaire, sujet: e2.sujet, html: e2.html });
  return page(X.annT, [`${titre} – ${when}`, X.annP], 'ok', { label: X.agenda, url: TW.link(P, 'tw-agenda', { lang }) });
}
return page(X.bad, [X.badP], 'err');
