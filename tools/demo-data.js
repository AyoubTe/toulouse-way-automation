// Fictitious demo data for the management space screenshots (build/demo.json)
const path = require('path');
process.chdir(path.join(__dirname, '..'));
const fs = require('fs');
const S = JSON.parse(JSON.stringify(require('../seed/seed.js')));
const inDays = n => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
const dates = { 'S-001': 3, 'S-002': 1, 'S-003': 20 };
for (const x of S.Sessions) x.date = inDays(dates[x.id] ?? 10);
S.Sessions.push({ id: 'S-000', type: 'Événement', titre: 'Pique-nique de rentrée', titre_en: 'Back-to-school picnic', date: inDays(-28), heure_debut: '12:00', places: 30, publie: 'Oui', lieu: 'Prairie des Filtres, Toulouse' });
const names = [['Amina', 'Exemple'], ['John', 'Example'], ['Lina', 'Test'], ['Omar', 'Essai'], ['Mei', 'Demo'], ['Ana', 'Prueba'], ['Ivan', 'Test'], ['Sofia', 'Demo'], ['Yuki', 'Test'], ['Ali', 'Essai'], ['Eva', 'Demo'], ['Tom', 'Test']];
const ins = [];
for (const [sid, n, mix] of [['S-001', 9, 'cca'], ['S-002', 23, 'caaax'], ['S-003', 4, 'a'], ['S-000', 21, 'pppppppa']]) for (let k = 0; k < n; k++) {
  const p = names[k % names.length], st = { c: 'Confirmé', a: 'Inscrit', x: 'Annulé', p: 'Présent' }[mix[k % mix.length]];
  ins.push({ id: `I-${sid}-${k}`, session_id: sid, prenom: p[0], nom: p[1], email: `${p[0].toLowerCase()}${k}@example.org`, langue: k % 3 ? 'fr' : 'en', statut: sid === 'S-000' && st === 'Inscrit' ? 'Absent' : st,
    token: 't'.repeat(32), date_inscription: inDays(-5), rappel_J3: sid === 'S-001' ? inDays(0) + ' 09:00' : '', rappel_J1: '' });
}
S.Inscriptions = ins;
S.Demandeurs.push({ id: 'D-X', date_demande: inDays(-12), prenom: 'Paulo', nom: 'Test', email: 'paulo@example.org', langues: 'pt,en', metiers: 'ing-aero', statut: 'Mis en relation', ville: 'Toulouse' },
  { id: 'D-Y', date_demande: inDays(-2), prenom: 'Nadia', nom: 'Essai', email: 'nadia@example.org', langues: 'ar,fr', metiers: 'juriste', statut: 'À traiter manuellement', ville: 'Toulouse' },
  { id: 'D-Z', date_demande: inDays(-30), prenom: 'Chen', nom: 'Demo', email: 'chen@example.org', langues: 'zh,en', metiers: 'data', statut: 'En emploi', ville: 'Blagnac' });
S.MisesEnRelation = [
  { id: 'MER-1', date: inDays(-1), token: 'tok1', statut: 'À valider', score: 75, raisons: 'métier commun : Développeur·se logiciel · langue commune : Français, Anglais · même ville', demandeur_id: 'D-EX1', demandeur_nom: 'Karim Exemple', contact_id: 'C-EX1', contact_nom: 'Julie Exemple', historique: '' },
  { id: 'MER-2', date: inDays(-1), token: 'tok2', statut: 'À valider', score: 65, raisons: 'métier commun : Data analyst, data scientist · langue commune : Arabe, Anglais', demandeur_id: 'D-EX1', demandeur_nom: 'Karim Exemple', contact_id: 'C-EX3', contact_nom: 'Sara Example' },
  { id: 'MER-3', date: inDays(-12), token: 'tok3', statut: 'Envoyée', score: 75, raisons: 'métier commun', demandeur_id: 'D-X', demandeur_nom: 'Paulo Test', contact_id: 'C-EX2', contact_nom: 'Pierre Exemple', date_decision: inDays(-11) },
  { id: 'MER-4', date: inDays(-2), token: 'tok4', statut: 'En attente du contact', score: 75, raisons: 'métier commun : Ingénieur·e aéronautique · langue commune : Espagnol · même ville', demandeur_id: 'D-EX2', demandeur_nom: 'Lucía Ejemplo', contact_id: 'C-EX2', contact_nom: 'Pierre Exemple' }];
fs.mkdirSync('build', { recursive: true });
const data = {}; for (const k of Object.keys(S.COLS)) data[k] = S[k];
fs.writeFileSync('build/demo.json', JSON.stringify(data));
console.log('demo data ok');
