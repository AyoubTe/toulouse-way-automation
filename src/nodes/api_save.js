// Prépare l'enregistrement d'une ligne (création ou modification) depuis l'espace gestion
const b = $('Webhook API').first().json.body || {};
const COLS = __COLS__;
const PREFIX = { Listes: 'L', Sessions: 'S', Inscriptions: 'I', Demandeurs: 'D', Contacts: 'C', MisesEnRelation: 'MER' };
const sheet = String(b.sheet || ''), src = b.row || {};
if (!COLS[sheet]) return [{ json: { ok: false, body: JSON.stringify({ ok: false, message: 'Onglet inconnu.' }) } }];
const row = {};
for (const c of COLS[sheet]) if (src[c] !== undefined && src[c] !== null) row[c] = typeof src[c] === 'string' ? src[c].slice(0, 20000) : src[c];
if (sheet === 'Templates') { if (!row.cle || !row.langue) return [{ json: { ok: false, body: JSON.stringify({ ok: false, message: 'Clé et langue obligatoires.' }) } }]; row.langue = TW.norm(row.langue); row.id = `${row.cle}|${row.langue}`; }
if (sheet === 'Parametres' && !row.id) return [{ json: { ok: false, body: JSON.stringify({ ok: false, message: 'Paramètre sans nom.' }) } }];
if (sheet === 'Listes' && row.code) row.code = String(row.code).trim().toLowerCase().replace(/\s+/g, '-');
if (!row.id) row.id = TW.uid(PREFIX[sheet] || 'X');
if (sheet === 'Contacts' && row.nb_mises_en_relation === undefined) row.nb_mises_en_relation = 0;
return [{ json: { ok: true, sheet, row, body: JSON.stringify({ ok: true, row }) } }];
