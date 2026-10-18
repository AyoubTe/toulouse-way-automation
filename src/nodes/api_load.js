// Renvoie toutes les données à l'espace gestion
const pick = n => $(n).all().map(i => { const r = { ...i.json }; delete r.row_number; return r; }).filter(r => Object.values(r).some(v => v !== '' && v !== null && v !== undefined));
const data = {};
for (const s of ['Parametres', 'Listes', 'Templates', 'Sessions', 'Inscriptions', 'Demandeurs', 'Contacts', 'MisesEnRelation']) data[s] = pick('Lire ' + s);
return [{ json: { body: JSON.stringify({ ok: true, data }) } }];
