// Construit la page publique de l'agenda (sessions publiées à venir, places restantes)
const P = TW.params($('Paramètres (agenda)').all().map(i => i.json));
const q = $('Webhook agenda').first().json.query || {};
const today = TW.todayParis();
const ins = $('Inscriptions (agenda)').all().map(i => i.json);
const sessions = $('Sessions (agenda)').all().map(i => i.json)
  .filter(s => s.id && TW.norm(s.publie) === 'oui' && TW.isoDate(s.date) >= today)
  .map(s => {
    const actifs = ins.filter(i => String(i.session_id) === String(s.id) && !['Annulé', 'Absent'].includes(i.statut)).length;
    const places = Number(s.places) || 0;
    return { id: String(s.id), type: s.type || 'Formation', titre: s.titre, titre_en: s.titre_en, description: s.description, description_en: s.description_en,
      date: TW.isoDate(s.date), heure_debut: s.heure_debut || '', heure_fin: s.heure_fin || '', lieu: s.lieu || '', lien_visio: s.lien_visio ? 'oui' : '',
      intervenant: s.intervenant || '', places, restantes: places ? Math.max(0, places - actifs) : 0 };
  });
const data = {
  P: { nom_asso: P.nom_asso, slogan: P.slogan, logo_url: P.logo_url, site_url: P.site_url, couleur_principale: P.couleur_principale, couleur_encre: P.couleur_encre },
  lang: q.lang === 'en' ? 'en' : 'fr', sessions, submit: 'tw-inscription-envoi', focus: q.session ? String(q.session) : ''
};
return [{ json: { html: TPL.split('/*__DATA__*/null').join(JSON.stringify(data).replace(/</g, '\\u003c')) } }];
