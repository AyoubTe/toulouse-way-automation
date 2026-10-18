// Assemble les pages HTML (CSS + composants + bibliothèque) en modèles prêts à injecter
const fs = require('fs');
const path = require('path');
process.chdir(path.join(__dirname, '..')); // all paths below are relative to the repository root

const rd = f => fs.readFileSync(f, 'utf8');
const sub = (s, key, val) => s.split(key).join(val);   // remplacement littéral (pas de motifs $)
function template(name) {
  let h = rd(`src/pages/${name}.html`);
  h = sub(h, '/*__CSS__*/', rd('src/pages/base.css'));
  h = sub(h, '/*__MS__*/', rd('src/pages/ms.js'));
  h = sub(h, '/*__LIB__*/', rd('src/lib.js'));
  return h;
}
const inject = (tpl, data) => sub(tpl, '/*__DATA__*/null', JSON.stringify(data).replace(/</g, '\\u003c'));
module.exports = { template, inject };
if (require.main === module) {
  const S = JSON.parse(JSON.stringify(require('../seed/seed.js')));
  const inDays = n => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
  for (const [id, n] of [['S-001', 3], ['S-002', 1], ['S-003', 20]]) { const x = S.Sessions.find(s => s.id === id); if (x) x.date = inDays(n); }
  eval(rd('src/lib.js') + ';global.TW=TW');
  const P = TW.params(S.Parametres); const base = 'https://n8n.example.org/webhook/';
  const brand = { nom_asso: P.nom_asso, slogan: P.slogan, logo_url: P.logo_url, site_url: P.site_url, couleur_principale: P.couleur_principale, couleur_encre: P.couleur_encre };
  fs.mkdirSync('build/preview', { recursive: true });
  const langues = S.Listes.filter(l => l.type === 'langue').map(l => ({ code: l.code, fr: l.libelle_fr, en: l.libelle_en, natif: l.libelle_natif }));
  const metiers = S.Listes.filter(l => l.type === 'metier').map(l => ({ code: l.code, fr: l.libelle_fr, en: l.libelle_en, groupe: l.groupe }));
  for (const lang of ['fr', 'en']) {
    fs.writeFileSync(`build/preview/demande_${lang}.html`, inject(template('demande'), { P: brand, lang, langues, metiers, submit: base + 'tw-demande-envoi', agenda: base + 'tw-agenda' }));
    const sessions = S.Sessions.map(s => Object.assign({}, s, { date: TW.isoDate(s.date), restantes: s.id === 'S-002' ? 3 : s.places - 1 }));
    fs.writeFileSync(`build/preview/agenda_${lang}.html`, inject(template('agenda'), { P: brand, lang, sessions, submit: base + 'tw-inscription-envoi', focus: '' }));
  }
  fs.writeFileSync('build/preview/admin.html', inject(template('admin'), { P: brand, api: base + 'tw-api', mer: base + 'tw-mer', demande: base + 'tw-demande', agenda: base + 'tw-agenda' }));
  console.log('previews ok');
}
