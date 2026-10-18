// Génère les 7 workflows n8n de la plateforme Toulouse Way (v2)
const fs = require('fs'), crypto = require('crypto');
const path = require('path');
process.chdir(path.join(__dirname, '..')); // all paths below are relative to the repository root

const { template } = require('./build-pages');
const SEED = require('../seed/seed.js');
const LIB = fs.readFileSync('src/lib.js', 'utf8');
const src = f => fs.readFileSync(`src/nodes/${f}.js`, 'utf8');
const withLib = body => LIB + '\n' + body;
const SHEET_ID = process.env.TW_SHEET_ID || 'YOUR_GOOGLE_SHEET_ID'; // set TW_SHEET_ID to build with your own Sheet
const DOC = { __rl: true, mode: 'id', value: SHEET_ID };
const tab = v => ({ __rl: true, mode: 'name', value: v });
const GS = { googleSheetsOAuth2Api: { id: '', name: 'Google Sheets – Toulouse Way' } };
const GM = { gmailOAuth2: { id: '', name: 'Gmail – Toulouse Way' } };
const uuid = () => crypto.randomUUID();
let Y = 0; // positions

function W(name, nodes, links, notes) {
  const conn = {};
  for (const [a, b, out = 0] of links) {
    if (!nodes.find(n => n.name === a) || !nodes.find(n => n.name === b)) throw new Error(`${name}: lien ${a} -> ${b}`);
    conn[a] ??= { main: [] }; while (conn[a].main.length <= out) conn[a].main.push([]);
    conn[a].main[out].push({ node: b, type: 'main', index: 0 });
  }
  return { name, nodes: [...(notes || []), ...nodes], connections: conn, active: false,
    settings: { executionOrder: 'v1', timezone: 'Europe/Paris', saveManualExecutions: true }, pinData: {}, meta: { templateCredsSetupCompleted: false }, tags: [] };
}
const N = (name, type, v, parameters, pos, extra = {}) => ({ parameters, id: uuid(), name, type, typeVersion: v, position: pos, ...extra });
const note = (content, pos, w = 560, h = 260) => N('Note ' + uuid().slice(0, 4), 'n8n-nodes-base.stickyNote', 1, { content, width: w, height: h }, pos);
const code = (name, js, pos, lib = true) => N(name, 'n8n-nodes-base.code', 2, { jsCode: lib ? withLib(js) : js }, pos);
const read = (name, sheet, pos, opt = {}) => N(name, 'n8n-nodes-base.googleSheets', 4.5, {
  documentId: DOC, sheetName: tab(sheet), ...(opt.filter ? { filtersUI: { values: [opt.filter] } } : {}), options: {}
}, pos, { credentials: GS, executeOnce: true, alwaysOutputData: opt.always !== false });
const write = (name, op, sheet, pos, match) => N(name, 'n8n-nodes-base.googleSheets', 4.5, {
  operation: op, documentId: DOC, sheetName: tab(sheet),
  columns: { mappingMode: 'autoMapInputData', value: {}, matchingColumns: match ? [match] : [], schema: [] }, options: {}
}, pos, { credentials: GS });
const gmail = (name, pos) => N(name, 'n8n-nodes-base.gmail', 2.1, {
  sendTo: '={{ $json.to }}', subject: '={{ $json.sujet }}', emailType: 'html', message: '={{ $json.html }}',
  options: { appendAttribution: false, senderName: '={{ $json.from_name }}', replyTo: '={{ $json.reply_to }}' }
}, pos, { credentials: GM, webhookId: uuid() });
const hook = (name, method, path, pos, auth) => N(name, 'n8n-nodes-base.webhook', 2, {
  httpMethod: method, path, responseMode: 'responseNode', ...(auth ? { authentication: 'headerAuth' } : {}), options: {}
}, pos, { webhookId: uuid(), ...(auth ? { credentials: { httpHeaderAuth: { id: '', name: 'Espace gestion – Toulouse Way' } } } : {}) });
const respond = (name, pos, body = '={{ $json.body }}', ctype = 'text/html; charset=utf-8') => N(name, 'n8n-nodes-base.respondToWebhook', 1.1, {
  respondWith: 'text', responseBody: body,
  options: { responseHeaders: { entries: [{ name: 'Content-Type', value: ctype }, { name: 'Cache-Control', value: 'no-store' }] } }
}, pos);
const ifn = (name, left, op, right, pos) => N(name, 'n8n-nodes-base.if', 2.2, {
  conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 },
    conditions: [{ id: uuid(), leftValue: left, rightValue: right, operator: op }], combinator: 'and' }, options: {}
}, pos);
const isTrue = { type: 'boolean', operation: 'true', singleValue: true };
const eq = { type: 'string', operation: 'equals' };
const pageCode = (name, file, page, pos) => code(name, `const TPL = ${JSON.stringify(template(page))};\n` + src(file), pos);
const emitList = (name, from, key, pos) => code(name, `const v = $('${from}').first().json.${key};\nreturn (Array.isArray(v) ? v : (v ? [v] : [])).map(x => ({ json: x }));`, pos, false);
const OUT = {};

// ───── 1. Pages publiques et espace gestion ─────
OUT['1_pages'] = W('Toulouse Way – 1. Pages (formulaire, agenda, espace gestion)', [
  hook('Webhook demande', 'GET', 'tw-demande', [0, 0]), read('Paramètres (demande)', 'Parametres', [220, 0]), read('Listes (demande)', 'Listes', [440, 0]),
  pageCode('Page demande', 'page_demande', 'demande', [660, 0]), respond('Répondre (demande)', [880, 0], '={{ $json.html }}'),
  hook('Webhook agenda', 'GET', 'tw-agenda', [0, 220]), read('Paramètres (agenda)', 'Parametres', [220, 220]), read('Sessions (agenda)', 'Sessions', [440, 220]),
  read('Inscriptions (agenda)', 'Inscriptions', [660, 220]), pageCode('Page agenda', 'page_agenda', 'agenda', [880, 220]), respond('Répondre (agenda)', [1100, 220], '={{ $json.html }}'),
  hook('Webhook gestion', 'GET', 'tw-gestion', [0, 440]), read('Paramètres (gestion)', 'Parametres', [220, 440]),
  pageCode('Page gestion', 'page_gestion', 'admin', [440, 440]), respond('Répondre (gestion)', [660, 440], '={{ $json.html }}'),
], [
  ['Webhook demande', 'Paramètres (demande)'], ['Paramètres (demande)', 'Listes (demande)'], ['Listes (demande)', 'Page demande'], ['Page demande', 'Répondre (demande)'],
  ['Webhook agenda', 'Paramètres (agenda)'], ['Paramètres (agenda)', 'Sessions (agenda)'], ['Sessions (agenda)', 'Inscriptions (agenda)'], ['Inscriptions (agenda)', 'Page agenda'], ['Page agenda', 'Répondre (agenda)'],
  ['Webhook gestion', 'Paramètres (gestion)'], ['Paramètres (gestion)', 'Page gestion'], ['Page gestion', 'Répondre (gestion)'],
], [note('## 1. Pages\nAffiche les 3 pages, aux couleurs définies dans l’onglet **Parametres** :\n- `/webhook/tw-demande` : formulaire de demande de mise en relation (FR/EN, `?lang=en`)\n- `/webhook/tw-agenda` : agenda public et inscriptions\n- `/webhook/tw-gestion` : espace gestion (données protégées par l’API, workflow 7)', [-40, -320], 620, 250)]);

// ───── 2. Formulaires : demandes et inscriptions ─────
OUT['2_formulaires'] = W('Toulouse Way – 2. Réception des demandes et des inscriptions', [
  hook('Webhook demande', 'POST', 'tw-demande-envoi', [0, 0]), read('Paramètres (demande)', 'Parametres', [220, 0]), read('Listes (demande)', 'Listes', [440, 0]),
  read('Templates (demande)', 'Templates', [660, 0]), code('Vérifier la demande', src('valider_demande'), [880, 0]),
  ifn('Demande valide ?', '={{ $json.ok }}', isTrue, '', [1100, 0]),
  respond('Refuser (demande)', [1340, 120], '={{ JSON.stringify($json.response) }}', 'application/json'),
  emitList('Ligne demandeur', 'Vérifier la demande', 'row', [1340, -60]), write('Enregistrer la demande', 'append', 'Demandeurs', [1560, -60]),
  respond('Confirmer (demande)', [1780, -60], "={{ JSON.stringify($('Vérifier la demande').first().json.response) }}", 'application/json'),
  emitList('Emails (demande)', 'Vérifier la demande', 'emails', [2000, -60]), gmail('Envoyer (demande)', [2220, -60]),

  hook('Webhook inscription', 'POST', 'tw-inscription-envoi', [0, 400]), read('Paramètres (inscription)', 'Parametres', [220, 400]), read('Templates (inscription)', 'Templates', [440, 400]),
  read('Sessions (inscription)', 'Sessions', [660, 400]), read('Inscriptions (inscription)', 'Inscriptions', [880, 400]), code("Vérifier inscription", src('valider_inscription'), [1100, 400]),
  ifn('Inscription valide ?', '={{ $json.ok }}', isTrue, '', [1320, 400]),
  respond('Refuser (inscription)', [1560, 520], '={{ JSON.stringify($json.response) }}', 'application/json'),
  emitList('Ligne inscription', "Vérifier inscription", 'row', [1560, 340]), write("Enregistrer l'inscription", 'append', 'Inscriptions', [1780, 340]),
  respond('Confirmer (inscription)', [2000, 340], `={{ JSON.stringify($('Vérifier inscription').first().json.response) }}`, 'application/json'),
  emitList('Emails (inscription)', "Vérifier inscription", 'emails', [2220, 340]), gmail('Envoyer (inscription)', [2440, 340]),
], [
  ['Webhook demande', 'Paramètres (demande)'], ['Paramètres (demande)', 'Listes (demande)'], ['Listes (demande)', 'Templates (demande)'], ['Templates (demande)', 'Vérifier la demande'],
  ['Vérifier la demande', 'Demande valide ?'], ['Demande valide ?', 'Ligne demandeur', 0], ['Demande valide ?', 'Refuser (demande)', 1],
  ['Ligne demandeur', 'Enregistrer la demande'], ['Enregistrer la demande', 'Confirmer (demande)'], ['Confirmer (demande)', 'Emails (demande)'], ['Emails (demande)', 'Envoyer (demande)'],
  ['Webhook inscription', 'Paramètres (inscription)'], ['Paramètres (inscription)', 'Templates (inscription)'], ['Templates (inscription)', 'Sessions (inscription)'], ['Sessions (inscription)', 'Inscriptions (inscription)'],
  ['Inscriptions (inscription)', "Vérifier inscription"], ["Vérifier inscription", 'Inscription valide ?'], ['Inscription valide ?', 'Ligne inscription', 0], ['Inscription valide ?', 'Refuser (inscription)', 1],
  ['Ligne inscription', "Enregistrer l'inscription"], ["Enregistrer l'inscription", 'Confirmer (inscription)'], ['Confirmer (inscription)', 'Emails (inscription)'], ['Emails (inscription)', 'Envoyer (inscription)'],
], [note('## 2. Réception des formulaires\n**Demande** : vérifie, enregistre dans *Demandeurs* (statut Nouveau), envoie l’accusé de réception **dans les langues choisies** et prévient le gestionnaire.\n\n**Inscription** : vérifie la session (publiée, à venir, places, doublon), enregistre dans *Inscriptions*, envoie la confirmation (FR/EN) avec lien d’annulation et prévient le gestionnaire.', [-40, -340], 640, 270)]);

// ───── 3. Recherche de contacts ─────
OUT['3_matching'] = W('Toulouse Way – 3. Recherche de contacts (toutes les heures)', [
  N('Toutes les heures', 'n8n-nodes-base.scheduleTrigger', 1.2, { rule: { interval: [{ field: 'hours', hoursInterval: 1 }] } }, [0, 0]),
  read('Demandes nouvelles', 'Demandeurs', [220, 0], { filter: { lookupColumn: 'statut', lookupValue: 'Nouveau' }, always: false }),
  read('Paramètres', 'Parametres', [440, 0]), read('Listes', 'Listes', [660, 0]), read('Templates', 'Templates', [880, 0]),
  read('Contacts', 'Contacts', [1100, 0]), read('Mises en relation', 'MisesEnRelation', [1320, 0]),
  code('Calculer les propositions', src('matching'), [1540, 0]),
  emitList('Propositions', 'Calculer les propositions', 'lignes', [1780, -160]), write('Enregistrer les propositions', 'append', 'MisesEnRelation', [2000, -160]),
  emitList('Statuts des demandes', 'Calculer les propositions', 'majDem', [1780, 0]), write('Mettre à jour les demandes', 'update', 'Demandeurs', [2000, 0], 'id'),
  emitList('Email au gestionnaire', 'Calculer les propositions', 'email', [1780, 160]), gmail('Envoyer au gestionnaire', [2000, 160]),
], [
  ['Toutes les heures', 'Demandes nouvelles'], ['Demandes nouvelles', 'Paramètres'], ['Paramètres', 'Listes'], ['Listes', 'Templates'], ['Templates', 'Contacts'], ['Contacts', 'Mises en relation'],
  ['Mises en relation', 'Calculer les propositions'], ['Calculer les propositions', 'Propositions'], ['Calculer les propositions', 'Statuts des demandes'], ['Calculer les propositions', 'Email au gestionnaire'],
  ['Propositions', 'Enregistrer les propositions'], ['Statuts des demandes', 'Mettre à jour les demandes'], ['Email au gestionnaire', 'Envoyer au gestionnaire'],
], [note('## 3. Recherche de contacts\nToutes les heures : pour chaque demande **Nouveau**, classe les contacts disponibles (métier commun obligatoire, langue commune, ville, charge du contact).\nEnregistre les propositions « À valider » et envoie au gestionnaire un email avec les boutons **Valider / Refuser**.', [-40, -320], 620, 220)]);

// ───── 4. Décisions de mise en relation ─────
OUT['4_decisions'] = W('Toulouse Way – 4. Décisions de mise en relation (gestionnaire et contacts)', [
  hook('Webhook décision', 'GET', 'tw-decision', [0, 0]),
  read('Paramètres', 'Parametres', [220, 0]), read('Templates', 'Templates', [440, 0]), read('Listes', 'Listes', [660, 0]),
  read('Mises en relation', 'MisesEnRelation', [880, 0]), read('Demandeurs', 'Demandeurs', [1100, 0]), read('Contacts', 'Contacts', [1320, 0]),
  code('Décider', src('decision'), [1540, 0]),
  emitList('Proposition à jour', 'Décider', 'mer', [1780, -240]), write('Mettre à jour la proposition', 'update', 'MisesEnRelation', [2000, -240], 'id'),
  emitList('Demande à jour', 'Décider', 'dem', [1780, -80]), write('Mettre à jour la demande', 'update', 'Demandeurs', [2000, -80], 'id'),
  emitList('Contact à jour', 'Décider', 'con', [1780, 80]), write('Mettre à jour le contact', 'update', 'Contacts', [2000, 80], 'id'),
  N('Répondre', 'n8n-nodes-base.respondToWebhook', 1.1, { respondWith: 'text', responseBody: '={{ $json.body }}',
    options: { responseHeaders: { entries: [{ name: 'Content-Type', value: '={{ $json.contentType }}' }, { name: 'Cache-Control', value: 'no-store' }] } } }, [1780, 240]),
  emitList('Emails (décision)', 'Décider', 'emails', [1780, 400]), gmail('Envoyer (décision)', [2000, 400]),
], [
  ['Webhook décision', 'Paramètres'], ['Paramètres', 'Templates'], ['Templates', 'Listes'], ['Listes', 'Mises en relation'], ['Mises en relation', 'Demandeurs'], ['Demandeurs', 'Contacts'], ['Contacts', 'Décider'],
  ['Décider', 'Proposition à jour'], ['Décider', 'Demande à jour'], ['Décider', 'Contact à jour'], ['Décider', 'Répondre'], ['Décider', 'Emails (décision)'],
  ['Proposition à jour', 'Mettre à jour la proposition'], ['Demande à jour', 'Mettre à jour la demande'], ['Contact à jour', 'Mettre à jour le contact'], ['Emails (décision)', 'Envoyer (décision)'],
], [note("## 4. Décisions\nUn seul lien `/webhook/tw-decision?t=…&a=…` pour :\n- le **gestionnaire** : valider ou refuser une proposition ;\n- le **contact** sans accord permanent : accepter ou refuser de partager ses coordonnées.\n\nContact avec *accord_partage = Oui* → les coordonnées sont échangées dès la validation. Sinon → email d'accord au contact, puis échange s'il accepte. Le gestionnaire est prévenu de chaque réponse.", [-40, -380], 660, 300)]);

// ───── 5. Présence et annulation ─────
OUT['5_presence'] = W('Toulouse Way – 5. Confirmation de présence et annulation', [
  hook('Webhook présence', 'GET', 'tw-presence', [0, 0]),
  read('Paramètres', 'Parametres', [220, 0]), read('Templates', 'Templates', [440, 0]), read('Sessions', 'Sessions', [660, 0]), read('Inscriptions', 'Inscriptions', [880, 0]),
  code('Traiter la réponse', src('presence'), [1100, 0]),
  emitList('Inscription à jour', 'Traiter la réponse', 'maj', [1340, -120]), write("Mettre à jour l'inscription", 'update', 'Inscriptions', [1560, -120], 'id'),
  respond('Répondre', [1340, 40]),
  emitList('Emails (présence)', 'Traiter la réponse', 'emails', [1340, 200]), gmail('Envoyer (présence)', [1560, 200]),
], [
  ['Webhook présence', 'Paramètres'], ['Paramètres', 'Templates'], ['Templates', 'Sessions'], ['Sessions', 'Inscriptions'], ['Inscriptions', 'Traiter la réponse'],
  ['Traiter la réponse', 'Inscription à jour'], ['Traiter la réponse', 'Répondre'], ['Traiter la réponse', 'Emails (présence)'],
  ['Inscription à jour', "Mettre à jour l'inscription"], ['Emails (présence)', 'Envoyer (présence)'],
], [note('## 5. Présence et annulation\nReçoit les clics des boutons des emails : `a=confirmer` → statut **Confirmé** ; `a=annuler` → statut **Annulé**, email de confirmation au participant et **notification au gestionnaire**.', [-40, -300], 600, 200)]);

// ───── 6. Rappels ─────
OUT['6_rappels'] = W('Toulouse Way – 6. Rappels J-3 et J-1', [
  N('Chaque jour à 9h', 'n8n-nodes-base.scheduleTrigger', 1.2, { rule: { interval: [{ field: 'days', daysInterval: 1, triggerAtHour: 9, triggerAtMinute: 0 }] } }, [0, 0]),
  read('Paramètres', 'Parametres', [220, 0]), read('Templates', 'Templates', [440, 0]), read('Sessions', 'Sessions', [660, 0]), read('Inscriptions', 'Inscriptions', [880, 0]),
  code('Préparer les rappels', src('rappels'), [1100, 0]), gmail('Envoyer le rappel', [1320, 0]),
  code('Rappels envoyés', src('rappels_maj'), [1540, 0]), write('Marquer les rappels', 'update', 'Inscriptions', [1760, 0], 'id'),
], [
  ['Chaque jour à 9h', 'Paramètres'], ['Paramètres', 'Templates'], ['Templates', 'Sessions'], ['Sessions', 'Inscriptions'], ['Inscriptions', 'Préparer les rappels'],
  ['Préparer les rappels', 'Envoyer le rappel'], ['Envoyer le rappel', 'Rappels envoyés'], ['Rappels envoyés', 'Marquer les rappels'],
], [note('## 6. Rappels\nChaque jour à 9 h (Paris) : rappel **J-3** et **J-1** aux inscrits (statut Inscrit ou Confirmé), avec les boutons « Je confirme ma présence » / « Je ne pourrai pas venir ». Chaque envoi est daté dans *rappel_J3* / *rappel_J1*.', [-40, -300], 620, 200)]);

// ───── 7. API de l'espace gestion ─────
const COLS = JSON.stringify(SEED.COLS);
const SHEETS = Object.keys(SEED.COLS);
OUT['7_api'] = W("Toulouse Way – 7. API de l'espace gestion", [
  hook('Webhook API', 'POST', 'tw-api', [0, 0], true),
  ifn('Charger ?', '={{ $json.body.action }}', eq, 'load', [220, 0]),
  ...SHEETS.map((s, k) => read('Lire ' + s, s, [460 + 200 * k, -200])),
  code('Assembler', src('api_load'), [460 + 200 * SHEETS.length, -200], false),
  respond('Répondre (données)', [680 + 200 * SHEETS.length, -200], '={{ $json.body }}', 'application/json'),
  ifn('Enregistrer ?', '={{ $json.body.action }}', eq, 'save', [460, 120]),
  code("Préparer enregistrement", src('api_save').replace('__COLS__', COLS), [700, 40]),
  ifn('Enregistrement valide ?', '={{ $json.ok }}', isTrue, '', [920, 40]),
  emitList('Ligne', "Préparer enregistrement", 'row', [1140, -20]),
  N('Créer ou modifier', 'n8n-nodes-base.googleSheets', 4.5, { operation: 'appendOrUpdate', documentId: DOC, sheetName: tab("={{ $('Préparer enregistrement').first().json.sheet }}"),
    columns: { mappingMode: 'autoMapInputData', value: {}, matchingColumns: ['id'], schema: [] }, options: {} }, [1360, -20], { credentials: GS }),
  respond('Répondre (enregistré)', [1580, -20], "={{ $('Préparer enregistrement').first().json.body }}", 'application/json'),
  ifn('Supprimer ?', '={{ $json.body.action }}', eq, 'delete', [700, 320]),
  ifn('Onglet autorisé ?', '={{ $json.body.sheet }}', { type: 'string', operation: 'regex' }, `^(${SHEETS.join('|')})$`, [920, 260]),
  N('Lire l’onglet', 'n8n-nodes-base.googleSheets', 4.5, { documentId: DOC, sheetName: tab("={{ $('Webhook API').first().json.body.sheet }}"), options: {} }, [1140, 220], { credentials: GS, executeOnce: true, alwaysOutputData: true }),
  code('Trouver la ligne', src('api_delete'), [1360, 220], false),
  ifn('Ligne trouvée ?', '={{ $json.ok }}', isTrue, '', [1580, 220]),
  N('Supprimer la ligne', 'n8n-nodes-base.googleSheets', 4.5, { operation: 'delete', documentId: DOC, sheetName: tab("={{ $('Webhook API').first().json.body.sheet }}"),
    toDelete: 'rows', startIndex: '={{ $json.row_number }}', numberToDelete: 1 }, [1800, 180], { credentials: GS }),
  respond('Répondre (supprimé)', [2020, 180], '={"ok":true}', 'application/json'),
  respond('Répondre (erreur)', [1360, 480], '={{ typeof $json.body === "string" ? $json.body : JSON.stringify({ ok: false, message: "Action inconnue." }) }}', 'application/json'),
], [
  ['Webhook API', 'Charger ?'], ['Charger ?', 'Lire ' + SHEETS[0], 0], ...SHEETS.slice(1).map((s, k) => ['Lire ' + SHEETS[k], 'Lire ' + s]),
  ['Lire ' + SHEETS.at(-1), 'Assembler'], ['Assembler', 'Répondre (données)'],
  ['Charger ?', 'Enregistrer ?', 1], ['Enregistrer ?', "Préparer enregistrement", 0], ["Préparer enregistrement", 'Enregistrement valide ?'],
  ['Enregistrement valide ?', 'Ligne', 0], ['Enregistrement valide ?', 'Répondre (erreur)', 1], ['Ligne', 'Créer ou modifier'], ['Créer ou modifier', 'Répondre (enregistré)'],
  ['Enregistrer ?', 'Supprimer ?', 1], ['Supprimer ?', 'Onglet autorisé ?', 0], ['Supprimer ?', 'Répondre (erreur)', 1],
  ['Onglet autorisé ?', 'Lire l’onglet', 0], ['Onglet autorisé ?', 'Répondre (erreur)', 1], ['Lire l’onglet', 'Trouver la ligne'], ['Trouver la ligne', 'Ligne trouvée ?'],
  ['Ligne trouvée ?', 'Supprimer la ligne', 0], ['Ligne trouvée ?', 'Répondre (erreur)', 1], ['Supprimer la ligne', 'Répondre (supprimé)'],
], [note("## 7. API de l'espace gestion\nProtégée par l'identifiant Header Auth **Espace gestion – Toulouse Way** (en-tête `X-TW-Auth` = `identifiant:motdepasse`).\nActions : `load` (toutes les données), `save` (créer ou modifier une ligne de n'importe quel onglet), `delete` (supprimer une ligne).", [-40, -460], 680, 220)]);

fs.mkdirSync('workflows', { recursive: true });
for (const [k, w] of Object.entries(OUT)) fs.writeFileSync(`workflows/${k}.json`, JSON.stringify(w, null, 1));
console.log(Object.keys(OUT).map(k => `${k}: ${OUT[k].nodes.length} nodes, ${Math.round(fs.statSync(`workflows/${k}.json`).size / 1024)} Ko`).join('\n'));
