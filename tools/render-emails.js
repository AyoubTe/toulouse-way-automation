// Renders every email template with sample data into build/emails/<key>_<lang>.html (used for documentation screenshots)
const path = require('path');
process.chdir(path.join(__dirname, '..'));
const fs = require('fs');
eval(fs.readFileSync('src/lib.js', 'utf8') + ';global.TW=TW');
const S = JSON.parse(JSON.stringify(require('../seed/seed.js')));
const P = TW.params(S.Parametres);
const s = S.Sessions[0], d = S.Demandeurs[0], c = S.Contacts[0];
const prop = TW.box(P, `<b>Karim Exemple</b> → Julie Exemple <span style="color:#4A6266">(score 75)</span><br><span style="font-size:14px;color:#4A6266">métier commun : Développeur·se logiciel · langue commune : Français, Anglais · même ville</span><br>${TW.button(P, 'Valider', '#')}${TW.button(P, 'Refuser', '#', true)}`);
const vars = lang => ({
  prenom: 'Karim', contact_prenom: c.prenom, demandeur_prenom: d.prenom, titre: TW.sessionTitle(s, lang),
  details_session: TW.detailsSession(P, s, lang), details_contact: TW.detailsContact(P, c),
  details_demandeur: TW.detailsDemandeur(P, d, lang, S.Listes, false), liste_propositions: prop,
  nom_complet: 'Karim Exemple', email: d.email, nb_inscrits: 8, places_info: 'sur 12 places', moment: 'en réponse au rappel de la veille',
  nb: 2, nb_demandes: 1, contact_nom: 'Pierre Exemple', demandeur_nom: 'Lucía Ejemplo', reponse: 'accepté',
  suite: 'Les coordonnées ont été échangées automatiquement.', lien_accepter: '#', lien_refuser: '#', lien_annuler: '#', lien_confirmer: '#', lien_agenda: '#', lien_admin: '#'
});
fs.mkdirSync('build/emails', { recursive: true });
const jobs = [['demande_recue', ['ar', 'fr', 'en']], ['mise_en_relation_demandeur', ['ar', 'fr', 'en']], ['mise_en_relation_contact', ['en']], ['accord_contact', ['fr']],
  ['inscription_confirmee', ['en']], ['rappel_j3', ['fr']], ['rappel_j1', ['en']], ['annulation_participant', ['en']],
  ['gestionnaire_nouvelle_demande', ['fr']], ['gestionnaire_propositions', ['fr']], ['gestionnaire_reponse_contact', ['fr']], ['gestionnaire_nouvelle_inscription', ['fr']], ['gestionnaire_annulation', ['fr']]];
for (const [key, langs] of jobs) {
  const e = TW.email(S.Templates, key, langs, vars(langs[langs.length - 1]), P);
  fs.writeFileSync(`build/emails/${key}.html`, e.html);
}
for (const [name, o] of [['page_validated', { title: 'Mise en relation envoyée', paras: ['Karim et Julie ont chacun reçu les coordonnées de l’autre.'] }],
  ['page_contact_consent', { title: 'Thank you, all set!', paras: ['Your contact details have been shared with Lucía, who will get in touch soon.'], lang: 'en' }],
  ['page_confirmed', { title: 'Attendance confirmed, thank you!', paras: ['French-style CV workshop – Sunday 18 October 2026, 14:00', 'We look forward to seeing you.'], lang: 'en' }],
  ['page_cancelled', { title: 'Cancellation recorded', paras: ['Multicultural afterwork – Friday 16 October 2026, 18:30', 'Thank you for letting us know: your seat can now go to someone else.'], lang: 'en', cta: { label: 'See the calendar', url: '#' } }]])
  fs.writeFileSync(`build/emails/${name}.html`, TW.page(P, o));
console.log('emails rendered:', fs.readdirSync('build/emails').length);
