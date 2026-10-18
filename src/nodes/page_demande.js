// Construit la page publique du formulaire de demande
const P = TW.params($('Paramètres (demande)').all().map(i => i.json));
const q = $('Webhook demande').first().json.query || {};
const L = $('Listes (demande)').all().map(i => i.json).filter(r => r.code).sort((a, b) => (+a.ordre || 0) - (+b.ordre || 0));
const data = {
  P: { nom_asso: P.nom_asso, slogan: P.slogan, logo_url: P.logo_url, site_url: P.site_url, couleur_principale: P.couleur_principale, couleur_encre: P.couleur_encre },
  lang: q.lang === 'en' ? 'en' : 'fr',
  langues: L.filter(r => TW.norm(r.type) === 'langue').map(r => ({ code: TW.norm(r.code), fr: r.libelle_fr, en: r.libelle_en, natif: r.libelle_natif })),
  metiers: L.filter(r => TW.norm(r.type) === 'metier').map(r => ({ code: String(r.code).trim(), fr: r.libelle_fr, en: r.libelle_en, groupe: r.groupe })),
  submit: 'tw-demande-envoi', agenda: 'tw-agenda'
};
return [{ json: { html: TPL.split('/*__DATA__*/null').join(JSON.stringify(data).replace(/</g, '\\u003c')) } }];
