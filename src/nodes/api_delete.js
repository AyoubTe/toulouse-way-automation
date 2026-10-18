// Repère la ligne à supprimer
const b = $('Webhook API').first().json.body || {};
const id = String(b.id || '');
const r = $('Lire l’onglet').all().map(i => i.json).find(x => String(x.id) === id);
if (!r || !r.row_number) return [{ json: { ok: false, body: JSON.stringify({ ok: false, message: 'Élément introuvable, il a peut-être déjà été supprimé.' }) } }];
return [{ json: { ok: true, row_number: r.row_number, body: JSON.stringify({ ok: true }) } }];
