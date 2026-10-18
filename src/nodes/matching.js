// Recherche les meilleurs contacts pour chaque demande au statut « Nouveau »
const P = TW.params($('Paramètres').all().map(i => i.json));
const L = $('Listes').all().map(i => i.json);
const T = $('Templates').all().map(i => i.json);
const demandeurs = $('Demandes nouvelles').all().map(i => i.json).filter(d => d.id);
const contacts = $('Contacts').all().map(i => i.json).filter(c => c.id && c.email && TW.norm(c.disponible) !== 'non');
const deja = new Set($('Mises en relation').all().map(i => i.json).filter(m => m.demandeur_id).map(m => `${m.demandeur_id}|${m.contact_id}`));
const minScore = Number(P.score_minimum) || 50, maxProps = Number(P.max_propositions) || 3;
const today = TW.todayParis(), now = TW.nowParis();
const lab = (type, codes) => TW.libelles(L, type, codes.join(','), 'fr');

function score(d, c) {
  const dm = TW.list(d.metiers).map(TW.norm), cm = TW.list(c.metiers).map(TW.norm);
  const metiers = dm.filter(x => cm.includes(x));
  if (!metiers.length) return null;
  const dl = TW.list(d.langues).map(TW.norm), cl = TW.list(c.langues).map(TW.norm);
  const langues = dl.filter(x => cl.includes(x));
  let s = 50 + Math.min(30, (metiers.length - 1) * 15), raisons = [`métier commun : ${lab('metier', metiers)}`];
  if (langues.length) { s += 15; raisons.push(`langue commune : ${lab('langue', langues)}`); }
  if (TW.norm(d.ville) && TW.norm(d.ville) === TW.norm(c.ville)) { s += 10; raisons.push('même ville'); }
  s -= Math.min(10, 2 * (Number(c.nb_mises_en_relation) || 0));
  return { score: s, raisons: raisons.join(' · ') };
}

const lignes = [], majDem = [], blocs = [];
for (const d of demandeurs) {
  const top = contacts.filter(c => !deja.has(`${d.id}|${c.id}`)).map(c => ({ c, r: score(d, c) }))
    .filter(x => x.r && x.r.score >= minScore).sort((a, b) => b.r.score - a.r.score).slice(0, maxProps);
  const props = top.map(({ c, r }) => ({
    id: TW.uid('MER'), date: today, token: TW.token(), token_contact: '', statut: 'À valider', score: r.score, raisons: r.raisons,
    demandeur_id: d.id, demandeur_nom: `${d.prenom || ''} ${d.nom || ''}`.trim(), contact_id: c.id, contact_nom: `${c.prenom || ''} ${c.nom || ''}`.trim(),
    date_decision: '', historique: `${now} – proposée automatiquement (score ${r.score})`, _accord: TW.norm(c.accord_partage) === 'oui', _entreprise: c.entreprise || ''
  }));
  lignes.push(...props);
  majDem.push({ id: d.id, statut: props.length ? 'Proposé' : 'À traiter manuellement', contacts_proposes: props.map(p => p.contact_nom).join(', ') });
  // Bloc HTML pour l'email du gestionnaire
  let h = `<div style="font-size:17px;font-weight:700">${TW.esc(`${d.prenom || ''} ${d.nom || ''}`)}</div><div style="font-size:14px;color:#4A6266;margin-bottom:8px">${TW.esc(lab('metier', TW.list(d.metiers)))} · ${TW.esc(lab('langue', TW.list(d.langues)))}${d.ville ? ' · ' + TW.esc(d.ville) : ''}</div>`;
  if (!props.length) h += `<div style="color:#9A6212;font-weight:700">Aucun contact correspondant : demande passée « À traiter manuellement ».</div>`;
  for (const p of props) h += `<div style="border-top:1px dashed #D5DFE0;padding-top:10px;margin-top:10px"><b>${TW.esc(p.contact_nom)}</b>${p._entreprise ? ' · ' + TW.esc(p._entreprise) : ''} <span style="color:#4A6266">(score ${p.score})</span><br>
<span style="font-size:14px;color:#4A6266">${TW.esc(p.raisons)} · ${p._accord ? 'coordonnées partagées directement' : "le contact recevra d'abord une demande d'accord"}</span><br>
${TW.button(P, 'Valider', TW.link(P, 'tw-decision', { t: p.token, a: 'valider' }))}${TW.button(P, 'Refuser', TW.link(P, 'tw-decision', { t: p.token, a: 'refuser' }), true)}</div>`;
  blocs.push(TW.box(P, h));
}
const e = TW.email(T, 'gestionnaire_propositions', ['fr'], { nb: lignes.length, nb_demandes: demandeurs.length, liste_propositions: blocs.join(''), lien_admin: TW.link(P, 'tw-gestion') + '#demandes' }, P);
return [{ json: {
  lignes: lignes.map(({ _accord, _entreprise, ...r }) => r), majDem,
  email: { to: P.email_gestionnaire, sujet: e.sujet, html: e.html, from_name: P.nom_asso, reply_to: P.email_gestionnaire }
} }];
