// Construit l'espace gestion (les données arrivent ensuite par l'API protégée)
const P = TW.params($('Paramètres (gestion)').all().map(i => i.json));
const data = {
  P: { nom_asso: P.nom_asso, slogan: P.slogan, logo_url: P.logo_url, site_url: P.site_url, couleur_principale: P.couleur_principale, couleur_encre: P.couleur_encre },
  api: 'tw-api', mer: 'tw-decision',
  demande: P.n8n_url && !/VOTRE-INSTANCE/.test(P.n8n_url) ? TW.link(P, 'tw-demande') : 'tw-demande',
  agenda: P.n8n_url && !/VOTRE-INSTANCE/.test(P.n8n_url) ? TW.link(P, 'tw-agenda') : 'tw-agenda'
};
return [{ json: { html: TPL.split('/*__DATA__*/null').join(JSON.stringify(data).replace(/</g, '\\u003c')) } }];
