import json
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.worksheet.datavalidation import DataValidation
import os, subprocess
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
subprocess.run(['node', 'seed/seed.js'], check=True)
S = json.load(open('seed/seed.json'))
F = "Arial"; ink = "12343B"; orange = "F26716"
wb = Workbook(); ws = wb.active; ws.title = "Mode d'emploi"
lines = [
 ("Toulouse Way – base de données de la plateforme (version 2)", 15, True),
 ("Importez ce fichier dans Google Drive puis ouvrez-le avec Google Sheets. Gardez les noms d'onglets et d'en-têtes tels quels.", 11, True),
 ("Au quotidien, tout se gère depuis l'espace gestion (formulaires, contacts, sessions, templates). Le Sheet reste la base de données.", 11, False),
 ("", 11, False),
 ("Parametres : identité visuelle (couleurs, logo), email du gestionnaire, adresse de n8n, réglages du matching.", 11, False),
 ("Listes : langues et métiers proposés dans le formulaire de demande. Ajoutez une ligne pour en créer un nouveau.", 11, False),
 ("Templates : textes de tous les emails, une ligne par email et par langue. {{prenom}} = variable, **texte** = gras, [[Texte|lien_x]] = bouton.", 11, False),
 ("Sessions : formations et événements (type Formation ou Événement). publie = Oui pour apparaître dans l'agenda public.", 11, False),
 ("Inscriptions : rempli par le formulaire d'inscription. Statuts : Inscrit, Confirmé, Annulé, Présent, Absent.", 11, False),
 ("Demandeurs : rempli par le formulaire de demande. Statuts : Nouveau, Proposé, À traiter manuellement, Mis en relation, En emploi, Archivé.", 11, False),
 ("Contacts : accord_partage = Oui si la personne accepte que ses coordonnées soient transmises sans être consultée à chaque fois.", 11, False),
 ("MisesEnRelation : rempli automatiquement. Statuts : À valider, En attente du contact, Envoyée, Refusée, Refusée par le contact.", 11, False),
 ("", 11, False),
 ("Les lignes « Exemple » sont fictives : supprimez-les après vos tests.", 11, True),
]
for t, size, b in lines:
    ws.append([t]); ws.cell(ws.max_row, 1).font = Font(name=F, size=size, bold=b, color=ink)
ws.column_dimensions["A"].width = 130

VAL = {
 'Sessions': {'type': ['Formation', 'Événement'], 'publie': ['Oui', 'Non']},
 'Inscriptions': {'statut': ['Inscrit', 'Confirmé', 'Annulé', 'Présent', 'Absent'], 'langue': ['fr', 'en']},
 'Demandeurs': {'statut': ['Nouveau', 'Proposé', 'À traiter manuellement', 'Mis en relation', 'En emploi', 'Archivé']},
 'Contacts': {'accord_partage': ['Oui', 'Non'], 'disponible': ['Oui', 'Non'], 'langue_contact': ['fr', 'en']},
 'MisesEnRelation': {'statut': ['À valider', 'En attente du contact', 'Envoyée', 'Refusée', 'Refusée par le contact']},
 'Listes': {'type': ['langue', 'metier']},
}
WIDE = {'contenu': 90, 'description': 50, 'sujet': 45, 'parcours': 45, 'titre': 34, 'titre_en': 34, 'lieu': 40, 'infos_pratiques': 40,
        'description_en': 40, 'email': 30, 'raisons': 40, 'historique': 50, 'valeur': 45, 'groupe': 34, 'libelle_fr': 32, 'libelle_en': 32, 'token': 34, 'token_contact': 34}
for name in ['Parametres', 'Listes', 'Templates', 'Sessions', 'Inscriptions', 'Demandeurs', 'Contacts', 'MisesEnRelation']:
    cols = S['COLS'][name]; sh = wb.create_sheet(name); sh.append(cols)
    for c in sh[1]:
        c.font = Font(name=F, bold=True, color="FFFFFF"); c.fill = PatternFill("solid", fgColor=ink)
    for r in S[name]:
        sh.append([("" if r.get(c) is None else r.get(c)) for c in cols])
    for row in sh.iter_rows(min_row=2):
        for c in row:
            c.font = Font(name=F); c.alignment = Alignment(vertical="top", wrap_text=(cols[c.column-1] in ('contenu', 'parcours', 'description')))
            if isinstance(c.value, str) and cols[c.column-1] in ('telephone', 'date', 'date_demande', 'date_inscription', 'heure_debut', 'heure_fin'):
                c.number_format = '@'
    for i, col in enumerate(cols):
        sh.column_dimensions[sh.cell(1, i+1).column_letter].width = WIDE.get(col, max(13, len(col) + 3))
    sh.freeze_panes = "B2"
    for col, opts in VAL.get(name, {}).items():
        L = sh.cell(1, cols.index(col) + 1).column_letter
        dv = DataValidation(type="list", formula1='"' + ",".join(opts) + '"', allow_blank=True); sh.add_data_validation(dv); dv.add(f"{L}2:{L}2000")
    sh.sheet_properties.tabColor = orange if name in ('Sessions', 'Demandeurs', 'Contacts') else ink
wb.save('template/Toulouse_Way_base.xlsx'); print('ok')
