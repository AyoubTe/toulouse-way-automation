// Traite un clic : décision du gestionnaire (valider/refuser) ou réponse du contact (accepter/refuser)
const P = TW.params($('Paramètres').all().map(i => i.json));
const T = $('Templates').all().map(i => i.json);
const L = $('Listes').all().map(i => i.json);
const MER = $('Mises en relation').all().map(i => i.json).filter(m => m.id);
const DEM = $('Demandeurs').all().map(i => i.json).filter(d => d.id);
const CON = $('Contacts').all().map(i => i.json).filter(c => c.id);
const q = $('Webhook décision').first().json.query || {};
const json = q.format === 'json', t = String(q.t || ''), a = String(q.a || '');
const now = TW.nowParis(), today = TW.todayParis();
const out = { mer: null, dem: null, con: null, emails: [] };
const base = { from_name: P.nom_asso, reply_to: P.email_gestionnaire };
const admin = TW.link(P, 'tw-gestion') + '#demandes';

function reply(ok, title, paras, lang, tone) {
  const body = json ? JSON.stringify({ ok, message: [title].concat(paras || []).join(' ') })
    : TW.page(P, { title, paras, lang: lang || 'fr', tone: tone || (ok ? 'ok' : 'warn') });
  return [{ json: Object.assign({ body, contentType: json ? 'application/json' : 'text/html; charset=utf-8' }, out) }];
}
const hist = (m, txt) => (m.historique ? m.historique + '\n' : '') + `${now} – ${txt}`;

const m = t.length >= 16 ? MER.find(x => x.token === t) || MER.find(x => x.token_contact === t) : null;
if (!m) return reply(false, 'Lien non valide', ["Ce lien n'existe pas ou a été copié de façon incomplète."], 'fr', 'err');
const role = m.token === t ? 'gestionnaire' : 'contact';
const d = DEM.find(x => x.id === m.demandeur_id), c = CON.find(x => x.id === m.contact_id);
const cl = TW.norm(c && c.langue_contact) === 'en' ? 'en' : 'fr';
const TXT = {
  fr: { doneT: 'Merci pour votre réponse', already: 'Vous avez déjà répondu à cette demande. Merci !', accT: 'Merci, c’est noté !', accP: `Vos coordonnées ont été transmises à ${d ? d.prenom : 'la personne'}, qui va vous contacter prochainement.`, refT: 'Réponse enregistrée', refP: "Aucune information n'a été transmise. Merci d'avoir pris le temps de répondre." },
  en: { doneT: 'Thank you for your answer', already: 'You have already answered this request. Thank you!', accT: 'Thank you, all set!', accP: `Your contact details have been shared with ${d ? d.prenom : 'the person'}, who will get in touch soon.`, refT: 'Answer recorded', refP: 'No information has been shared. Thank you for taking the time to reply.' }
}[cl];

// Envoi des coordonnées croisées (demandeur ← contact, contact ← demandeur)
function introduce() {
  const e1 = TW.email(T, 'mise_en_relation_demandeur', TW.list(d.langues), { prenom: d.prenom, contact_prenom: c.prenom, details_contact: TW.detailsContact(P, c) }, P);
  const e2 = TW.email(T, 'mise_en_relation_contact', [cl], { prenom: c.prenom, demandeur_prenom: d.prenom, details_demandeur: TW.detailsDemandeur(P, d, cl, L, true) }, P);
  out.emails.push({ ...base, to: d.email, sujet: e1.sujet, html: e1.html }, { ...base, to: c.email, sujet: e2.sujet, html: e2.html });
  out.dem = { id: d.id, statut: 'Mis en relation', date_mise_en_relation: today };
  out.con = { id: c.id, nb_mises_en_relation: (Number(c.nb_mises_en_relation) || 0) + 1, derniere_mise_en_relation: today };
}

if (role === 'gestionnaire') {
  if (m.statut !== 'À valider') return reply(false, 'Déjà traitée', [`Cette proposition a déjà été traitée (statut : ${m.statut}).`]);
  if (a === 'refuser') {
    out.mer = { id: m.id, statut: 'Refusée', date_decision: now, historique: hist(m, 'refusée par le gestionnaire') };
    return reply(true, 'Proposition refusée', [`Aucun email n'a été envoyé à ${m.contact_nom}.`]);
  }
  if (a !== 'valider') return reply(false, 'Action inconnue', ['Utilisez les boutons Valider ou Refuser.'], 'fr', 'err');
  if (!d || !c) return reply(false, 'Fiche introuvable', ['Le demandeur ou le contact a été supprimé de la base.'], 'fr', 'err');
  if (TW.norm(c.accord_partage) === 'oui') {
    introduce();
    out.mer = { id: m.id, statut: 'Envoyée', date_decision: now, historique: hist(m, 'validée, coordonnées échangées') };
    return reply(true, 'Mise en relation envoyée', [`${d.prenom} et ${c.prenom} ont chacun reçu les coordonnées de l'autre.`]);
  }
  const tc = TW.token();
  const e = TW.email(T, 'accord_contact', [cl], {
    prenom: c.prenom, demandeur_prenom: d.prenom, details_demandeur: TW.detailsDemandeur(P, d, cl, L, false),
    lien_accepter: TW.link(P, 'tw-decision', { t: tc, a: 'accepter' }), lien_refuser: TW.link(P, 'tw-decision', { t: tc, a: 'refuser' })
  }, P);
  out.emails.push({ ...base, to: c.email, sujet: e.sujet, html: e.html });
  out.mer = { id: m.id, statut: 'En attente du contact', token_contact: tc, date_decision: now, historique: hist(m, "validée, demande d'accord envoyée au contact") };
  return reply(true, "Demande d'accord envoyée", [`${c.prenom} n'a pas donné d'accord permanent : il ou elle reçoit un email pour accepter ou refuser. Vous serez prévenu·e de sa réponse.`]);
}

// Réponse du contact
if (m.statut !== 'En attente du contact') return reply(true, TXT.doneT, [TXT.already], cl);
if (!d || !c) return reply(false, TXT.doneT, [TXT.already], cl);
if (a === 'accepter') {
  introduce();
  out.mer = { id: m.id, statut: 'Envoyée', date_decision: now, historique: hist(m, 'acceptée par le contact, coordonnées échangées') };
  const g = TW.email(T, 'gestionnaire_reponse_contact', ['fr'], { contact_nom: m.contact_nom, demandeur_nom: m.demandeur_nom, reponse: 'accepté', suite: 'Les coordonnées ont été échangées automatiquement.', lien_admin: admin }, P);
  out.emails.push({ ...base, to: P.email_gestionnaire, sujet: g.sujet, html: g.html });
  return reply(true, TXT.accT, [TXT.accP], cl);
}
if (a === 'refuser') {
  out.mer = { id: m.id, statut: 'Refusée par le contact', date_decision: now, historique: hist(m, 'refusée par le contact') };
  const autres = MER.filter(x => x.demandeur_id === d.id && x.id !== m.id && ['À valider', 'En attente du contact', 'Envoyée'].includes(x.statut));
  if (!autres.length && d.statut === 'Proposé') out.dem = { id: d.id, statut: 'À traiter manuellement' };
  const g = TW.email(T, 'gestionnaire_reponse_contact', ['fr'], { contact_nom: m.contact_nom, demandeur_nom: m.demandeur_nom, reponse: 'refusé',
    suite: autres.length ? "D'autres propositions sont encore en cours pour cette demande." : 'Plus aucune proposition en cours : la demande est passée « À traiter manuellement ». Remettez-la sur « Nouveau » pour relancer la recherche.', lien_admin: admin }, P);
  out.emails.push({ ...base, to: P.email_gestionnaire, sujet: g.sujet, html: g.html });
  return reply(true, TXT.refT, [TXT.refP], cl);
}
return reply(false, TXT.doneT, [TXT.already], cl);
