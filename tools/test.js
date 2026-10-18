const fs = require('fs');
const path = require('path');
process.chdir(path.join(__dirname, '..')); // all paths below are relative to the repository root

const S = JSON.parse(JSON.stringify(require('../seed/seed.js')));
// Example sessions are moved relative to today so that date-based rules (past sessions, reminders) are tested reliably
const inDays = n => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
for (const [id, n] of [['S-001', 3], ['S-002', 1], ['S-003', 20]]) { const x = S.Sessions.find(s => s.id === id); if (x) x.date = inDays(n); }
const WF = {}; for (const f of fs.readdirSync('workflows')) WF[f.replace('.json', '')] = JSON.parse(fs.readFileSync('workflows/' + f));
const codeOf = (wf, name) => { const n = WF[wf].nodes.find(n => n.name === name); if (!n) throw new Error('nœud ' + name); return n.parameters.jsCode; };
function run(wf, name, nodes, input = []) {
  const $ = n => { if (!(n in nodes)) throw new Error(`${name} → nœud non fourni : ${n}`); const a = nodes[n].map(j => ({ json: j })); return { all: () => a, first: () => a[0] }; };
  return new Function('$', '$input', codeOf(wf, name))($, { all: () => input.map(j => ({ json: j })) }).map(x => x.json);
}
let ok = 0, ko = 0; const t = (c, m) => c ? ok++ : (ko++, console.log('ÉCHEC :', m));
fs.mkdirSync('build/emails', { recursive: true });
const rows = n => S[n].map((r, i) => ({ ...r, row_number: i + 2 }));

// ---- Pages
let r = run('1_pages', 'Page demande', { 'Paramètres (demande)': S.Parametres, 'Listes (demande)': S.Listes, 'Webhook demande': [{ query: { lang: 'en' } }] })[0];
t(r.html.includes('"lang":"en"') && r.html.includes('ing-aero') && !r.html.includes('/*__DATA__*/null'), 'page demande');
fs.writeFileSync('build/emails/page_demande_en.html', r.html);
r = run('1_pages', 'Page agenda', { 'Paramètres (agenda)': S.Parametres, 'Sessions (agenda)': rows('Sessions'), 'Inscriptions (agenda)': rows('Inscriptions'), 'Webhook agenda': [{ query: { session: 'S-001' } }] })[0];
t(r.html.includes('"restantes":11') && !r.html.includes('meet.example.com'), 'page agenda (places, lien visio masqué)');
fs.writeFileSync('build/emails/page_agenda.html', r.html);
r = run('1_pages', 'Page gestion', { 'Paramètres (gestion)': S.Parametres, 'Webhook gestion': [{}] })[0];
t(r.html.includes('"api":"tw-api"'), 'page gestion');
fs.writeFileSync('build/emails/page_gestion.html', r.html);

// ---- Demande
const dnodes = body => ({ 'Paramètres (demande)': S.Parametres, 'Listes (demande)': S.Listes, 'Templates (demande)': S.Templates, 'Webhook demande': [{ body }] });
const good = { prenom: 'Karim', nom: 'Test', email: 'K@Ex.org', langues: ['ar', 'fr', 'xx'], metiers: ['dev', 'data'], consentement: true, ville: 'Toulouse' };
r = run('2_formulaires', 'Vérifier la demande', dnodes(good))[0];
t(r.ok && r.row.langues === 'ar,fr' && r.row.email === 'k@ex.org' && r.row.statut === 'Nouveau', 'demande valide');
t(r.emails.length === 2 && r.emails[0].html.includes('dir="rtl"') && r.emails[0].sujet.includes('لقد') && r.emails[0].sujet.includes('/'), 'accusé multilingue AR+FR');
fs.writeFileSync('build/emails/email_demande_recue.html', r.emails[0].html);
t(Object.keys(r.row).join() === S.COLS.Demandeurs.join(), 'colonnes Demandeurs');
t(!run('2_formulaires', 'Vérifier la demande', dnodes({ ...good, metiers: [] }))[0].ok, 'demande sans métier refusée');
t(!run('2_formulaires', 'Vérifier la demande', dnodes({ ...good, email: 'x' }))[0].ok, 'email invalide refusé');
t(!run('2_formulaires', 'Vérifier la demande', dnodes({ ...good, consentement: false }))[0].ok, 'sans consentement refusé');
r = run('2_formulaires', 'Vérifier la demande', dnodes({ ...good, langues: ['ja'] }))[0];
t(r.ok && r.emails[0].html.includes('Merci pour votre confiance'), 'langue sans traduction → français');

// ---- Inscription
const inodes = (body, ins) => ({ 'Paramètres (inscription)': S.Parametres, 'Templates (inscription)': S.Templates, 'Sessions (inscription)': rows('Sessions'), 'Inscriptions (inscription)': ins || rows('Inscriptions'), 'Webhook inscription': [{ body }] });
const ib = { session_id: 'S-001', prenom: 'Lina', nom: 'T', email: 'lina@ex.org', langue: 'en', consentement: true };
r = run('2_formulaires', "Vérifier inscription", inodes(ib))[0];
t(r.ok && r.row.token.length === 32 && r.emails[0].sujet.startsWith('Registration confirmed: French-style CV') && r.emails[0].html.includes('tw-presence?t='), 'inscription EN');
t(Object.keys(r.row).join() === S.COLS.Inscriptions.join(), 'colonnes Inscriptions');
t(r.emails[1].html.includes('2</strong>') || r.emails[1].sujet.includes('(2 inscrits)'), 'notif gestionnaire nb inscrits');
fs.writeFileSync('build/emails/email_inscription.html', r.emails[0].html);
t(run('2_formulaires', "Vérifier inscription", inodes({ ...ib, email: 'AMINA.exemple@example.org' }))[0].response.code === 'deja_inscrit', 'doublon');
const full = Array.from({ length: 12 }, (_, k) => ({ id: 'X' + k, session_id: 'S-001', email: k + '@x.org', statut: 'Inscrit' }));
t(run('2_formulaires', "Vérifier inscription", inodes(ib, full))[0].response.code === 'complet', 'complet');
t(run('2_formulaires', "Vérifier inscription", inodes({ ...ib, session_id: 'NOPE' }))[0].response.code === 'introuvable', 'introuvable');

// ---- Matching
r = run('3_matching', 'Calculer les propositions', { 'Paramètres': S.Parametres, 'Listes': S.Listes, 'Templates': S.Templates, 'Demandes nouvelles': S.Demandeurs, 'Contacts': S.Contacts, 'Mises en relation': [{}] })[0];
console.log(r.lignes.map(l => `  ${l.demandeur_nom} → ${l.contact_nom} : ${l.score} (${l.raisons})`).join('\n'));
t(r.lignes.length === 3 && r.lignes.every(l => l.statut === 'À valider'), '3 propositions');
t(Object.keys(r.lignes[0]).join() === S.COLS.MisesEnRelation.join(), 'colonnes MER');
t(r.majDem.every(d => d.statut === 'Proposé'), 'statuts Proposé');
fs.writeFileSync('build/emails/email_propositions.html', r.email.html);
const MER = r.lignes.map((l, i) => ({ ...l, row_number: i + 2 }));
r = run('3_matching', 'Calculer les propositions', { 'Paramètres': S.Parametres, 'Listes': S.Listes, 'Templates': S.Templates, 'Demandes nouvelles': S.Demandeurs, 'Contacts': S.Contacts, 'Mises en relation': MER })[0];
t(r.lignes.length === 0 && r.majDem.every(d => d.statut === 'À traiter manuellement'), 'pas de re-proposition');

// ---- Décisions
const dec = (q, mer) => run('4_decisions', 'Décider', { 'Paramètres': S.Parametres, 'Templates': S.Templates, 'Listes': S.Listes, 'Mises en relation': mer || MER, 'Demandeurs': S.Demandeurs, 'Contacts': S.Contacts, 'Webhook décision': [{ query: q }] })[0];
const mJulie = MER.find(m => m.contact_id === 'C-EX1'), mPierre = MER.find(m => m.contact_id === 'C-EX2');
r = dec({ t: mJulie.token, a: 'valider' });
t(r.mer.statut === 'Envoyée' && r.emails.length === 2 && r.dem.statut === 'Mis en relation' && r.con.nb_mises_en_relation === 1, 'valider, accord Oui → échange direct');
t(r.emails[0].to === 'karim.exemple@example.org' && r.emails[0].html.includes('julie.exemple@example.com') && r.emails[0].html.includes('dir="rtl"'), 'email demandeur multilingue avec coordonnées');
t(r.emails[1].html.includes('karim.exemple@example.org'), 'email contact avec coordonnées demandeur');
fs.writeFileSync('build/emails/email_mise_en_relation_demandeur.html', r.emails[0].html); fs.writeFileSync('build/emails/page_decision.html', r.body);
r = dec({ t: mPierre.token, a: 'valider' });
t(r.mer.statut === 'En attente du contact' && r.mer.token_contact.length === 32 && r.emails.length === 1 && r.emails[0].to === 'pierre.exemple@example.com' && !r.dem, 'valider, accord Non → demande d’accord');
t(!r.emails[0].html.includes('lucia.ejemplo@example.org'), 'demande d’accord sans coordonnées du demandeur');
fs.writeFileSync('build/emails/email_accord_contact.html', r.emails[0].html);
const MER2 = MER.map(m => m.id === mPierre.id ? { ...m, ...r.mer } : m);
r = dec({ t: MER2.find(m => m.id === mPierre.id).token_contact, a: 'accepter' }, MER2);
t(r.mer.statut === 'Envoyée' && r.emails.length === 3 && r.emails[2].to === 'contact@toulouseway.org' && r.dem.statut === 'Mis en relation', 'contact accepte');
t(r.emails[0].html.includes('lang="es"'), 'demandeur hispanophone reçoit l’espagnol');
fs.writeFileSync('build/emails/page_contact_accepte.html', r.body);
r = dec({ t: MER2.find(m => m.id === mPierre.id).token_contact, a: 'refuser' }, MER2);
t(r.mer.statut === 'Refusée par le contact' && r.emails.length === 1 && r.emails[0].sujet.includes('refusé'), 'contact refuse');
r = dec({ t: mJulie.token, a: 'refuser' }); t(r.mer.statut === 'Refusée' && !r.emails.length, 'gestionnaire refuse');
r = dec({ t: mJulie.token, a: 'valider', format: 'json' }, MER.map(m => m.id === mJulie.id ? { ...m, statut: 'Envoyée' } : m));
t(r.contentType === 'application/json' && JSON.parse(r.body).ok === false && !r.mer, 'déjà traitée (json)');
r = dec({ t: 'x'.repeat(32), a: 'valider' }); t(!r.mer && r.body.includes('Lien non valide'), 'jeton inconnu');

// ---- Présence
const pres = (q, ins) => run('5_presence', 'Traiter la réponse', { 'Paramètres': S.Parametres, 'Templates': S.Templates, 'Sessions': S.Sessions, 'Inscriptions': ins || S.Inscriptions, 'Webhook présence': [{ query: q }] })[0];
r = pres({ t: S.Inscriptions[0].token, a: 'confirmer' }); t(r.maj.statut === 'Confirmé' && !r.emails.length, 'confirmer');
r = pres({ t: S.Inscriptions[1].token, a: 'annuler' }); t(r.maj.statut === 'Annulé' && r.emails.length === 2 && r.emails[0].sujet.startsWith('Cancellation') && r.emails[1].to === 'contact@toulouseway.org', 'annuler (EN) + gestionnaire');
fs.writeFileSync('build/emails/page_annulation.html', r.body);
r = pres({ t: S.Inscriptions[1].token, a: 'annuler' }, S.Inscriptions.map((i, k) => k === 1 ? { ...i, statut: 'Annulé' } : i)); t(!r.maj, 'déjà annulée');

// ---- Rappels (aujourd'hui = date réelle ; on recale les sessions)
eval(fs.readFileSync('src/lib.js', 'utf8') + ';global.TW=TW');
const plus = n => new Date(Date.parse(TW.todayParis() + 'T00:00:00Z') + n * 864e5).toISOString().slice(0, 10);
const sess = S.Sessions.map(s => ({ ...s, date: s.id === 'S-001' ? plus(3) : s.id === 'S-002' ? plus(1) : plus(10) }));
const insR = [...S.Inscriptions, { ...S.Inscriptions[0], id: 'I-C', email: 'c@x.org', statut: 'Annulé' }, { ...S.Inscriptions[1], id: 'I-D', email: 'd@x.org', rappel_J1: '2026-10-15' }];
r = run('6_rappels', 'Préparer les rappels', { 'Paramètres': S.Parametres, 'Templates': S.Templates, 'Sessions': sess, 'Inscriptions': insR });
t(r.length === 2 && r.find(x => x.col === 'rappel_J3') && r.find(x => x.col === 'rappel_J1'), 'J-3 et J-1, annulé et déjà envoyé ignorés');
t(r[0].html.includes('a=confirmer') && r[0].html.includes('a=annuler'), 'boutons de confirmation');
fs.writeFileSync('build/emails/email_rappel_j3.html', r.find(x => x.col === 'rappel_J3').html);
const mk = run('6_rappels', 'Rappels envoyés', { 'Préparer les rappels': r });
t(mk.length === 2 && mk[0].rappel_J3 && mk[0].id === 'I-EX1', 'marquage');

// ---- API
r = run('7_api', 'Assembler', Object.fromEntries(Object.keys(S.COLS).map(s => ['Lire ' + s, rows(s)])))[0];
t(JSON.parse(r.body).data.Templates.length === S.Templates.length && !('row_number' in JSON.parse(r.body).data.Sessions[0]), 'load');
const sv = body => run('7_api', "Préparer enregistrement", { 'Webhook API': [{ body }] })[0];
r = sv({ action: 'save', sheet: 'Contacts', row: { prenom: 'A', email: 'a@b.c', pirate: 'x' } });
t(r.ok && r.row.id.startsWith('C-') && !('pirate' in r.row) && r.row.nb_mises_en_relation === 0, 'save contact');
r = sv({ action: 'save', sheet: 'Templates', row: { cle: 'rappel_j1', langue: 'ES', sujet: 's', contenu: 'c' } }); t(r.row.id === 'rappel_j1|es', 'save template');
t(!sv({ action: 'save', sheet: 'Hack', row: {} }).ok, 'onglet refusé');
r = run('7_api', 'Trouver la ligne', { 'Webhook API': [{ body: { id: 'C-EX2' } }], 'Lire l’onglet': rows('Contacts') })[0]; t(r.ok && r.row_number === 3, 'delete → row_number');

// ---- Structure des workflows
for (const [k, w] of Object.entries(WF)) {
  const names = new Set(w.nodes.map(n => n.name));
  t(names.size === w.nodes.length, k + ' noms uniques');
  for (const [a, c] of Object.entries(w.connections)) { t(names.has(a), k + ' ' + a); for (const o of c.main) for (const l of o) t(names.has(l.node), k + ' → ' + l.node); }
  for (const n of w.nodes) {
    const txt = JSON.stringify(n.parameters);
    for (const m of txt.matchAll(/\$\(\\?["']([^"'\\]+)/g)) if (!m[1].startsWith('#')) t(names.has(m[1]), `${k}/${n.name} référence « ${m[1]} »`);
    if (n.type.endsWith('.code')) try { new Function('$', '$input', n.parameters.jsCode); ok++; } catch (e) { ko++; console.log('Syntaxe', k, n.name, e.message); }
  }
}
console.log(`\n${ok} vérifications OK, ${ko} échec(s)`);
