// Date chaque rappel envoyé, pour ne jamais l'envoyer deux fois
const quand = TW.nowParis();
return $('Préparer les rappels').all().map(x => ({ json: { id: x.json.id, [x.json.col]: quand } }));
