// Rappels J-3 et J-1 avec boutons « Je confirme » / « Je ne pourrai pas venir »
const P = TW.params($('Paramètres').all().map(i => i.json));
const T = $('Templates').all().map(i => i.json);
const S = {}; for (const s of $('Sessions').all().map(i => i.json)) if (s.id) S[String(s.id)] = s;
const today = TW.todayParis();
const out = [];
for (const i of $('Inscriptions').all().map(x => x.json)) {
  if (!i.id || !i.email || !['Inscrit', 'Confirmé', ''].includes(String(i.statut || '').trim())) continue;
  const s = S[String(i.session_id)]; if (!s) continue;
  const iso = TW.isoDate(s.date); if (!iso) continue;
  const n = TW.daysBetween(today, iso);
  const regle = n === 3 ? { cle: 'rappel_j3', col: 'rappel_J3' } : n === 1 ? { cle: 'rappel_j1', col: 'rappel_J1' } : null;
  if (!regle || String(i[regle.col] || '').trim()) continue;
  const lang = i.langue === 'en' ? 'en' : 'fr';
  const e = TW.email(T, regle.cle, [lang], {
    prenom: i.prenom, titre: TW.sessionTitle(s, lang), details_session: TW.detailsSession(P, s, lang),
    lien_confirmer: TW.link(P, 'tw-presence', { t: i.token, a: 'confirmer' }), lien_annuler: TW.link(P, 'tw-presence', { t: i.token, a: 'annuler' })
  }, P);
  out.push({ json: { id: i.id, col: regle.col, to: i.email, sujet: e.sujet, html: e.html, from_name: P.nom_asso, reply_to: P.email_gestionnaire } });
}
return out;
