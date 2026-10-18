// Données initiales de la base Toulouse Way (paramètres, listes, templates, exemples)
const COLS = {
  Parametres: ['id', 'valeur', 'description'],
  Listes: ['id', 'type', 'code', 'libelle_fr', 'libelle_en', 'libelle_natif', 'groupe', 'ordre'],
  Templates: ['id', 'cle', 'langue', 'description', 'sujet', 'contenu'],
  Sessions: ['id', 'type', 'titre', 'titre_en', 'description', 'description_en', 'date', 'heure_debut', 'heure_fin', 'lieu', 'lien_visio', 'places', 'intervenant', 'infos_pratiques', 'publie'],
  Inscriptions: ['id', 'session_id', 'prenom', 'nom', 'email', 'telephone', 'langue', 'date_inscription', 'statut', 'token', 'rappel_J3', 'rappel_J1', 'date_reponse'],
  Demandeurs: ['id', 'date_demande', 'prenom', 'nom', 'email', 'telephone', 'ville', 'langues', 'metiers', 'parcours', 'statut', 'contacts_proposes', 'date_mise_en_relation', 'notes'],
  Contacts: ['id', 'prenom', 'nom', 'email', 'telephone', 'entreprise', 'poste', 'ville', 'langues', 'metiers', 'langue_contact', 'accord_partage', 'disponible', 'nb_mises_en_relation', 'derniere_mise_en_relation', 'notes'],
  MisesEnRelation: ['id', 'date', 'token', 'token_contact', 'statut', 'score', 'raisons', 'demandeur_id', 'demandeur_nom', 'contact_id', 'contact_nom', 'date_decision', 'historique']
};

const Parametres = [
  ['nom_asso', 'Toulouse Way', "Nom affiché dans les emails et les pages"],
  ['slogan', 'Mieux vivre ici, ensemble', 'Phrase affichée en pied des emails et des pages'],
  ['couleur_principale', '#F26716', 'Couleur des boutons et des accents (code hexadécimal)'],
  ['couleur_encre', '#12343B', 'Couleur du texte et du pied de page'],
  ['logo_url', 'https://www.toulouseway.org/assets/logo.png', 'Adresse publique du logo (PNG ou JPG)'],
  ['site_url', 'https://www.toulouseway.org', "Site de l'association"],
  ['email_gestionnaire', 'contact@toulouseway.org', 'Reçoit les notifications (nouvelles demandes, inscriptions, annulations)'],
  ['n8n_url', 'https://VOTRE-INSTANCE-N8N.fr', 'Adresse publique de n8n, sans / final'],
  ['signature', "L'équipe Toulouse Way", 'Signature des emails'],
  ['pied_de_page', 'Toulouse Way · Association loi 1901 · contact@toulouseway.org', 'Mentions en bas des emails'],
  ['score_minimum', '50', "Score minimum pour proposer un contact (un métier en commun = 50 points)"],
  ['max_propositions', '3', 'Nombre maximum de contacts proposés par demande']
].map(([id, valeur, description]) => ({ id, valeur, description }));

const langues = [
  ['fr', 'Français', 'French', 'Français'], ['en', 'Anglais', 'English', 'English'], ['ar', 'Arabe', 'Arabic', 'العربية'],
  ['es', 'Espagnol', 'Spanish', 'Español'], ['pt', 'Portugais', 'Portuguese', 'Português'], ['it', 'Italien', 'Italian', 'Italiano'],
  ['de', 'Allemand', 'German', 'Deutsch'], ['ru', 'Russe', 'Russian', 'Русский'], ['uk', 'Ukrainien', 'Ukrainian', 'Українська'],
  ['tr', 'Turc', 'Turkish', 'Türkçe'], ['zh', 'Chinois', 'Chinese', '中文'], ['fa', 'Persan', 'Persian', 'فارسی'],
  ['hi', 'Hindi', 'Hindi', 'हिन्दी'], ['ro', 'Roumain', 'Romanian', 'Română'], ['pl', 'Polonais', 'Polish', 'Polski'], ['ja', 'Japonais', 'Japanese', '日本語']
];
const metiers = [
  ['Aéronautique et spatial', 'Aerospace', [['ing-aero', 'Ingénieur·e aéronautique', 'Aerospace engineer'], ['ing-embarque', 'Ingénieur·e systèmes embarqués', 'Embedded systems engineer'], ['tech-aero', 'Technicien·ne maintenance aéronautique', 'Aircraft maintenance technician'], ['qualite', 'Qualité, certification', 'Quality and certification']]],
  ['Numérique', 'Digital and IT', [['dev', 'Développeur·se logiciel', 'Software developer'], ['data', 'Data analyst, data scientist', 'Data analyst, data scientist'], ['cyber', 'Cybersécurité', 'Cybersecurity'], ['pm-it', 'Chef·fe de projet IT', 'IT project manager'], ['ux', 'Design UX/UI', 'UX/UI design']]],
  ['Santé', 'Healthcare', [['medecin', 'Médecin', 'Doctor'], ['infirmier', 'Infirmier·ère', 'Nurse'], ['pharma', 'Pharmacie, biotech', 'Pharmacy, biotech'], ['aide-soin', 'Aide-soignant·e', 'Care assistant']]],
  ['Recherche et enseignement', 'Research and education', [['chercheur', 'Chercheur·se', 'Researcher'], ['enseignant', 'Enseignant·e', 'Teacher'], ['langues', 'Formation en langues', 'Language trainer']]],
  ['Commerce et gestion', 'Business and management', [['commercial', 'Commercial·e, business developer', 'Sales, business developer'], ['marketing', 'Marketing, communication', 'Marketing, communications'], ['finance', 'Comptabilité, finance', 'Accounting, finance'], ['rh', 'Ressources humaines', 'Human resources'], ['supply', 'Achats, supply chain', 'Purchasing, supply chain'], ['juriste', 'Juriste', 'Legal']]],
  ['Industrie et bâtiment', 'Industry and construction', [['tech-indus', 'Technicien·ne industriel·le', 'Industrial technician'], ['genie-civil', 'Ingénieur·e génie civil', 'Civil engineer'], ['electricien', 'Électricien·ne', 'Electrician']]],
  ['Hôtellerie et restauration', 'Hospitality', [['cuisine', 'Cuisine', 'Cooking, kitchen'], ['salle', 'Service en salle, accueil', 'Front of house, hospitality']]],
  ['Autres', 'Other', [['traduction', 'Traduction, interprétariat', 'Translation, interpreting'], ['social', 'Travail social, associatif', 'Social work, non-profit'], ['creation', "Création d'entreprise", 'Starting a business']]]
];
const Listes = [];
langues.forEach(([code, fr, en, natif], i) => Listes.push({ id: `L-${code}`, type: 'langue', code, libelle_fr: fr, libelle_en: en, libelle_natif: natif, groupe: '', ordre: i + 1 }));
let o = 0;
for (const [g, gen, items] of metiers) for (const [code, fr, en] of items) Listes.push({ id: `M-${code}`, type: 'metier', code, libelle_fr: fr, libelle_en: en, libelle_natif: '', groupe: `${g} | ${gen}`, ordre: ++o });

// ---------------- Templates ----------------
const T = [];
const add = (cle, langue, description, sujet, contenu) => T.push({ id: `${cle}|${langue}`, cle, langue, description, sujet, contenu: contenu.trim() });

// 1. Accusé de réception de la demande (langues du demandeur)
const DR = 'Demandeur · accusé de réception de la demande de mise en relation';
add('demande_recue', 'fr', DR, 'Nous avons bien reçu votre demande', `Bonjour {{prenom}},

Merci pour votre confiance ! Votre demande de mise en relation est bien enregistrée.

Notre équipe recherche maintenant dans notre réseau les personnes les plus à même de vous aider. Nous revenons vers vous par email dès qu'une mise en relation est possible.

À très vite,`);
add('demande_recue', 'en', DR, 'We have received your request', `Hello {{prenom}},

Thank you for reaching out! Your networking request has been recorded.

Our team is now looking through our network for the people best placed to help you. We will email you as soon as an introduction is possible.

Speak soon,`);
add('demande_recue', 'ar', DR, 'لقد استلمنا طلبك', `مرحبًا {{prenom}}،

شكرًا لثقتك بنا! تم تسجيل طلبك للتواصل بنجاح.

يبحث فريقنا الآن في شبكتنا عن الأشخاص الأنسب لمساعدتك. سنراسلك عبر البريد الإلكتروني فور توفر إمكانية التعارف.

إلى اللقاء قريبًا،`);
add('demande_recue', 'es', DR, 'Hemos recibido tu solicitud', `Hola {{prenom}}:

¡Gracias por tu confianza! Tu solicitud de puesta en contacto ha quedado registrada.

Nuestro equipo está buscando en nuestra red a las personas que mejor pueden ayudarte. Te escribiremos en cuanto sea posible ponerte en contacto con alguien.

¡Hasta pronto!`);
add('demande_recue', 'pt', DR, 'Recebemos o seu pedido', `Olá {{prenom}},

Obrigado pela sua confiança! O seu pedido de contacto foi registado.

A nossa equipa está a procurar na nossa rede as pessoas mais indicadas para o ajudar. Enviaremos um email assim que for possível apresentá-lo a alguém.

Até breve,`);
add('demande_recue', 'it', DR, 'Abbiamo ricevuto la tua richiesta', `Ciao {{prenom}},

grazie per la fiducia! La tua richiesta di messa in contatto è stata registrata.

Il nostro team sta cercando nella nostra rete le persone più adatte ad aiutarti. Ti scriveremo non appena sarà possibile metterti in contatto con qualcuno.

A presto,`);
add('demande_recue', 'de', DR, 'Wir haben Ihre Anfrage erhalten', `Hallo {{prenom}},

vielen Dank für Ihr Vertrauen! Ihre Anfrage zur Vernetzung wurde erfasst.

Unser Team sucht jetzt in unserem Netzwerk nach den Personen, die Ihnen am besten weiterhelfen können. Wir melden uns per E-Mail, sobald ein Kontakt möglich ist.

Bis bald,`);
add('demande_recue', 'ru', DR, 'Мы получили ваш запрос', `Здравствуйте, {{prenom}}!

Спасибо за доверие! Ваш запрос на знакомство зарегистрирован.

Наша команда ищет в нашей сети людей, которые лучше всего смогут вам помочь. Мы напишем вам, как только знакомство станет возможным.

До скорой встречи,`);
add('demande_recue', 'uk', DR, 'Ми отримали ваш запит', `Вітаємо, {{prenom}}!

Дякуємо за довіру! Ваш запит на знайомство зареєстровано.

Наша команда шукає у своїй мережі людей, які найкраще зможуть вам допомогти. Ми напишемо вам, щойно знайомство стане можливим.

До зустрічі,`);
add('demande_recue', 'tr', DR, 'Talebinizi aldık', `Merhaba {{prenom}},

Bize güvendiğiniz için teşekkürler! Tanışma talebiniz kaydedildi.

Ekibimiz şimdi ağımızda size en iyi yardımcı olabilecek kişileri arıyor. Bir tanıştırma mümkün olur olmaz size e-posta göndereceğiz.

Yakında görüşmek üzere,`);
add('demande_recue', 'zh', DR, '我们已收到您的申请', `{{prenom}}，您好：

感谢您的信任！您的对接申请已成功登记。

我们的团队正在网络中为您寻找最合适的人选。一旦可以为您牵线，我们会第一时间发邮件通知您。

期待与您再联系，`);
add('demande_recue', 'fa', DR, 'درخواست شما را دریافت کردیم', `سلام {{prenom}}،

از اعتماد شما سپاسگزاریم! درخواست آشنایی شما ثبت شد.

تیم ما اکنون در شبکهٔ خود به دنبال افرادی است که بهتر از همه می‌توانند به شما کمک کنند. به محض فراهم شدن امکان آشنایی، از طریق ایمیل به شما خبر می‌دهیم.

به امید دیدار،`);

// 2. Mise en relation : email au demandeur avec les coordonnées du contact (langues du demandeur)
const MD = 'Demandeur · coordonnées du contact après validation';
add('mise_en_relation_demandeur', 'fr', MD, 'Votre mise en relation avec {{contact_prenom}}', `Bonjour {{prenom}},

Bonne nouvelle : **{{contact_prenom}}** a accepté d'échanger avec vous. Voici ses coordonnées :

{{details_contact}}

N'hésitez pas à le ou la contacter dans les prochains jours : présentez-vous en quelques lignes et précisez ce que vous recherchez.

Tenez-nous au courant de la suite, cela nous aide à améliorer notre réseau.`);
add('mise_en_relation_demandeur', 'en', MD, 'Your introduction to {{contact_prenom}}', `Hello {{prenom}},

Good news: **{{contact_prenom}}** has agreed to talk with you. Here are their contact details:

{{details_contact}}

Feel free to get in touch over the next few days: introduce yourself in a few lines and explain what you are looking for.

Please let us know how it goes, it helps us improve our network.`);
add('mise_en_relation_demandeur', 'ar', MD, 'تعارفك مع {{contact_prenom}}', `مرحبًا {{prenom}}،

خبر سار: وافق **{{contact_prenom}}** على التواصل معك. إليك بيانات الاتصال:

{{details_contact}}

لا تتردد في التواصل خلال الأيام القادمة: عرّف بنفسك في بضعة أسطر ووضّح ما تبحث عنه.

أخبرنا بما يحدث بعد ذلك، فهذا يساعدنا على تحسين شبكتنا.`);
add('mise_en_relation_demandeur', 'es', MD, 'Tu puesta en contacto con {{contact_prenom}}', `Hola {{prenom}}:

Buenas noticias: **{{contact_prenom}}** ha aceptado conversar contigo. Estos son sus datos de contacto:

{{details_contact}}

No dudes en escribirle en los próximos días: preséntate en pocas líneas y explica lo que buscas.

Cuéntanos cómo te va, nos ayuda a mejorar nuestra red.`);
add('mise_en_relation_demandeur', 'pt', MD, 'O seu contacto com {{contact_prenom}}', `Olá {{prenom}},

Boas notícias: **{{contact_prenom}}** aceitou falar consigo. Eis os seus contactos:

{{details_contact}}

Não hesite em contactar nos próximos dias: apresente-se em poucas linhas e explique o que procura.

Conte-nos como correu, isso ajuda-nos a melhorar a nossa rede.`);
add('mise_en_relation_demandeur', 'it', MD, 'La tua messa in contatto con {{contact_prenom}}', `Ciao {{prenom}},

buone notizie: **{{contact_prenom}}** ha accettato di parlare con te. Ecco i suoi contatti:

{{details_contact}}

Non esitare a scrivere nei prossimi giorni: presentati in poche righe e spiega cosa stai cercando.

Facci sapere come va, ci aiuta a migliorare la nostra rete.`);
add('mise_en_relation_demandeur', 'de', MD, 'Ihr Kontakt zu {{contact_prenom}}', `Hallo {{prenom}},

gute Nachrichten: **{{contact_prenom}}** ist bereit, sich mit Ihnen auszutauschen. Hier sind die Kontaktdaten:

{{details_contact}}

Melden Sie sich gern in den nächsten Tagen: Stellen Sie sich in wenigen Zeilen vor und erklären Sie, was Sie suchen.

Erzählen Sie uns, wie es weitergeht – das hilft uns, unser Netzwerk zu verbessern.`);
add('mise_en_relation_demandeur', 'ru', MD, 'Ваше знакомство с {{contact_prenom}}', `Здравствуйте, {{prenom}}!

Хорошая новость: **{{contact_prenom}}** согласился(-ась) пообщаться с вами. Вот контактные данные:

{{details_contact}}

Свяжитесь в ближайшие дни: представьтесь в нескольких строках и расскажите, что вы ищете.

Сообщите нам, как всё прошло — это помогает нам развивать нашу сеть.`);
add('mise_en_relation_demandeur', 'uk', MD, 'Ваше знайомство з {{contact_prenom}}', `Вітаємо, {{prenom}}!

Гарна новина: **{{contact_prenom}}** погодився(-лася) поспілкуватися з вами. Ось контактні дані:

{{details_contact}}

Зв'яжіться найближчими днями: представтеся в кількох рядках і розкажіть, що ви шукаєте.

Розкажіть нам, як усе пройшло — це допомагає нам розвивати нашу мережу.`);
add('mise_en_relation_demandeur', 'tr', MD, '{{contact_prenom}} ile tanışmanız', `Merhaba {{prenom}},

Güzel haber: **{{contact_prenom}}** sizinle görüşmeyi kabul etti. İletişim bilgileri:

{{details_contact}}

Önümüzdeki günlerde iletişime geçmekten çekinmeyin: kendinizi birkaç satırla tanıtın ve ne aradığınızı anlatın.

Nasıl geçtiğini bize bildirin, bu ağımızı geliştirmemize yardımcı olur.`);
add('mise_en_relation_demandeur', 'zh', MD, '为您引荐 {{contact_prenom}}', `{{prenom}}，您好：

好消息：**{{contact_prenom}}** 已同意与您交流。以下是联系方式：

{{details_contact}}

欢迎在接下来几天内主动联系：用几句话介绍自己，并说明您在寻找什么。

请告诉我们后续进展，这有助于我们完善网络。`);
add('mise_en_relation_demandeur', 'fa', MD, 'آشنایی شما با {{contact_prenom}}', `سلام {{prenom}}،

خبر خوب: **{{contact_prenom}}** پذیرفته است که با شما گفت‌وگو کند. اطلاعات تماس:

{{details_contact}}

در چند روز آینده با ایشان تماس بگیرید: در چند خط خود را معرفی کنید و توضیح دهید به دنبال چه هستید.

ما را از ادامهٔ کار باخبر کنید؛ این به بهبود شبکهٔ ما کمک می‌کند.`);

// 3. Email au contact (FR / EN selon la langue du contact)
const MC = 'Contact · présentation du demandeur après mise en relation';
add('mise_en_relation_contact', 'fr', MC, 'Mise en relation : {{demandeur_prenom}} va vous contacter', `Bonjour {{prenom}},

Merci d'accepter de donner un peu de votre temps ! Nous avons transmis vos coordonnées à **{{demandeur_prenom}}**, qui devrait vous contacter prochainement. Voici sa présentation :

{{details_demandeur}}

Un échange de 20 à 30 minutes suffit souvent à ouvrir une porte. Merci pour votre engagement.`);
add('mise_en_relation_contact', 'en', MC, 'Introduction: {{demandeur_prenom}} will get in touch', `Hello {{prenom}},

Thank you for offering some of your time! We have shared your contact details with **{{demandeur_prenom}}**, who should reach out soon. Here is a short introduction:

{{details_demandeur}}

A 20 to 30 minute conversation is often enough to open a door. Thank you for your support.`);

// 4. Demande d'accord au contact (accord_partage = Non)
const AC = "Contact · demande d'accord avant de partager ses coordonnées";
add('accord_contact', 'fr', AC, "{{demandeur_prenom}} aimerait échanger avec vous", `Bonjour {{prenom}},

Une personne accompagnée par Toulouse Way souhaiterait échanger avec vous. Avant de lui transmettre vos coordonnées, nous avons besoin de votre accord.

{{details_demandeur}}

[[J'accepte de partager mes coordonnées|lien_accepter]] [[Je préfère refuser|lien_refuser]]

Votre réponse n'engage à rien d'autre qu'un premier échange. Vous pourrez toujours décliner plus tard.`);
add('accord_contact', 'en', AC, '{{demandeur_prenom}} would like to talk with you', `Hello {{prenom}},

Someone supported by Toulouse Way would like to talk with you. Before sharing your contact details, we need your consent.

{{details_demandeur}}

[[I agree to share my details|lien_accepter]] [[I'd rather not|lien_refuser]]

Saying yes only commits you to a first conversation. You can always decline later.`);

// 5. Inscriptions et rappels (FR / EN)
add('inscription_confirmee', 'fr', 'Participant · confirmation d’inscription', 'Inscription confirmée : {{titre}}', `Bonjour {{prenom}},

Votre inscription est bien prise en compte. Nous avons hâte de vous retrouver !

{{details_session}}

Nous vous enverrons un rappel 3 jours avant, puis la veille.

Un empêchement ? Libérez votre place en un clic pour qu'une autre personne puisse en profiter.

[[Annuler mon inscription|lien_annuler]]`);
add('inscription_confirmee', 'en', 'Participant · registration confirmation', 'Registration confirmed: {{titre}}', `Hello {{prenom}},

Your registration is confirmed. We look forward to seeing you!

{{details_session}}

We will send you a reminder 3 days before, then the day before.

Can't make it? Free up your seat in one click so someone else can join.

[[Cancel my registration|lien_annuler]]`);
add('rappel_j3', 'fr', 'Participant · rappel 3 jours avant, avec confirmation de présence', 'Dans 3 jours : {{titre}} – confirmez votre présence', `Bonjour {{prenom}},

Plus que 3 jours avant **{{titre}}** ! Pouvez-vous nous confirmer votre présence ?

{{details_session}}

[[Je confirme ma présence|lien_confirmer]] [[Je ne pourrai pas venir|lien_annuler]]

Votre réponse nous aide à bien organiser la séance et à proposer les places libérées.`);
add('rappel_j3', 'en', 'Participant · 3-day reminder with attendance confirmation', 'In 3 days: {{titre}} – please confirm', `Hello {{prenom}},

Only 3 days to go until **{{titre}}**! Can you confirm you will attend?

{{details_session}}

[[Yes, I'll be there|lien_confirmer]] [[I can't make it|lien_annuler]]

Your answer helps us organise the session and offer freed-up seats to others.`);
add('rappel_j1', 'fr', 'Participant · rappel la veille, avec confirmation de présence', 'C’est demain : {{titre}}', `Bonjour {{prenom}},

C'est demain ! Voici les informations pratiques pour **{{titre}}** :

{{details_session}}

[[Je confirme ma présence|lien_confirmer]] [[Je ne pourrai pas venir|lien_annuler]]

À demain !`);
add('rappel_j1', 'en', 'Participant · day-before reminder with attendance confirmation', 'Tomorrow: {{titre}}', `Hello {{prenom}},

It's tomorrow! Here are the practical details for **{{titre}}**:

{{details_session}}

[[Yes, I'll be there|lien_confirmer]] [[I can't make it|lien_annuler]]

See you tomorrow!`);
add('annulation_participant', 'fr', 'Participant · confirmation d’annulation', 'Annulation enregistrée : {{titre}}', `Bonjour {{prenom}},

Votre annulation pour **{{titre}}** est bien enregistrée. Merci de nous avoir prévenus, votre place pourra profiter à quelqu'un d'autre.

Retrouvez nos prochaines formations et événements sur notre agenda :

[[Voir l'agenda|lien_agenda]]`);
add('annulation_participant', 'en', 'Participant · cancellation confirmation', 'Cancellation recorded: {{titre}}', `Hello {{prenom}},

Your cancellation for **{{titre}}** has been recorded. Thank you for letting us know, your seat can now go to someone else.

Find our upcoming trainings and events on our calendar:

[[See the calendar|lien_agenda]]`);

// 6. Notifications au gestionnaire (FR)
add('gestionnaire_nouvelle_demande', 'fr', 'Gestionnaire · nouvelle demande de mise en relation', 'Nouvelle demande : {{nom_complet}}', `Bonjour,

Une nouvelle demande de mise en relation vient d'arriver.

{{details_demandeur}}

La recherche de contacts se lance automatiquement dans l'heure. Vous recevrez les propositions à valider.

[[Ouvrir l'espace gestion|lien_admin]]`);
add('gestionnaire_nouvelle_inscription', 'fr', 'Gestionnaire · nouvelle inscription', 'Nouvelle inscription : {{titre}} ({{nb_inscrits}} inscrits)', `Bonjour,

**{{nom_complet}}** ({{email}}) vient de s'inscrire.

{{details_session}}

Inscrits à ce jour : **{{nb_inscrits}}** {{places_info}}

[[Voir les inscriptions|lien_admin]]`);
add('gestionnaire_annulation', 'fr', 'Gestionnaire · annulation par un participant', 'Annulation : {{nom_complet}} – {{titre}}', `Bonjour,

**{{nom_complet}}** ({{email}}) a annulé sa participation à **{{titre}}** ({{moment}}).

Inscrits restants : **{{nb_inscrits}}** {{places_info}}

[[Voir les inscriptions|lien_admin]]`);
add('gestionnaire_propositions', 'fr', 'Gestionnaire · propositions de mise en relation à valider', '{{nb}} mise(s) en relation à valider', `Bonjour,

La recherche automatique a trouvé **{{nb}}** proposition(s) pour {{nb_demandes}} nouvelle(s) demande(s).

{{liste_propositions}}

Validez ou refusez en un clic, ou depuis l'espace gestion.

[[Ouvrir l'espace gestion|lien_admin]]`);
add('gestionnaire_reponse_contact', 'fr', "Gestionnaire · réponse d'un contact à une demande d'accord", '{{contact_nom}} a {{reponse}} la mise en relation', `Bonjour,

**{{contact_nom}}** a **{{reponse}}** d'être mis·e en relation avec **{{demandeur_nom}}**.

{{suite}}

[[Ouvrir l'espace gestion|lien_admin]]`);

// ---------------- Données d'exemple ----------------
const Sessions = [
  { id: 'S-001', type: 'Formation', titre: 'Atelier CV à la française', titre_en: 'French-style CV workshop', description: 'Adapter son CV et sa lettre aux attentes des recruteurs français.', description_en: 'Adapt your CV and cover letter to what French recruiters expect.', date: '2026-10-18', heure_debut: '14:00', heure_fin: '16:30', lieu: 'Maison des associations, 81 rue Saint-Roch, Toulouse', lien_visio: '', places: 12, intervenant: 'Sophie (bénévole RH)', infos_pratiques: 'Apportez votre CV actuel, imprimé ou sur clé USB.', publie: 'Oui' },
  { id: 'S-002', type: 'Événement', titre: 'Afterwork multiculturel', titre_en: 'Multicultural afterwork', description: 'Rencontrer d’autres professionnels internationaux autour d’un verre.', description_en: 'Meet other international professionals over a drink.', date: '2026-10-16', heure_debut: '18:30', heure_fin: '21:00', lieu: 'Café des Arts, place Saint-Pierre, Toulouse', lien_visio: '', places: 40, intervenant: '', infos_pratiques: '', publie: 'Oui' },
  { id: 'S-003', type: 'Formation', titre: 'Réussir son entretien en français', titre_en: 'Acing a job interview in French', description: 'Simulations d’entretien et codes culturels.', description_en: 'Mock interviews and cultural codes.', date: '2026-11-05', heure_debut: '09:30', heure_fin: '12:00', lieu: 'En ligne', lien_visio: 'https://meet.example.com/tw-entretien', places: 10, intervenant: 'Marc', infos_pratiques: '', publie: 'Oui' }
];
const Inscriptions = [
  { id: 'I-EX1', session_id: 'S-001', prenom: 'Amina', nom: 'Exemple', email: 'amina.exemple@example.org', telephone: '', langue: 'fr', date_inscription: '2026-10-10', statut: 'Inscrit', token: 'exempletokenamina0000000000000001', rappel_J3: '', rappel_J1: '', date_reponse: '' },
  { id: 'I-EX2', session_id: 'S-002', prenom: 'John', nom: 'Example', email: 'john.example@example.org', telephone: '', langue: 'en', date_inscription: '2026-10-12', statut: 'Inscrit', token: 'exempletokenjohn00000000000000002', rappel_J3: '', rappel_J1: '', date_reponse: '' }
];
const Demandeurs = [
  { id: 'D-EX1', date_demande: '2026-10-14', prenom: 'Karim', nom: 'Exemple', email: 'karim.exemple@example.org', telephone: '06 00 00 00 02', ville: 'Toulouse', langues: 'ar,fr,en', metiers: 'dev,data', parcours: '5 ans de développement web à Casablanca, master en informatique.', statut: 'Nouveau', contacts_proposes: '', date_mise_en_relation: '', notes: '' },
  { id: 'D-EX2', date_demande: '2026-10-14', prenom: 'Lucía', nom: 'Ejemplo', email: 'lucia.ejemplo@example.org', telephone: '', ville: 'Blagnac', langues: 'es,en', metiers: 'ing-aero', parcours: 'Ingeniera aeronáutica, 3 años en Madrid.', statut: 'Nouveau', contacts_proposes: '', date_mise_en_relation: '', notes: '' }
];
const Contacts = [
  { id: 'C-EX1', prenom: 'Julie', nom: 'Exemple', email: 'julie.exemple@example.com', telephone: '06 00 00 00 10', entreprise: 'Studio numérique (fictif)', poste: 'CTO', ville: 'Toulouse', langues: 'fr,en', metiers: 'dev,pm-it', langue_contact: 'fr', accord_partage: 'Oui', disponible: 'Oui', nb_mises_en_relation: 0, derniere_mise_en_relation: '', notes: '' },
  { id: 'C-EX2', prenom: 'Pierre', nom: 'Exemple', email: 'pierre.exemple@example.com', telephone: '', entreprise: 'Avionneur (fictif)', poste: 'Responsable bureau d’études', ville: 'Blagnac', langues: 'fr,es', metiers: 'ing-aero,qualite', langue_contact: 'fr', accord_partage: 'Non', disponible: 'Oui', nb_mises_en_relation: 0, derniere_mise_en_relation: '', notes: '' },
  { id: 'C-EX3', prenom: 'Sara', nom: 'Example', email: 'sara.example@example.com', telephone: '', entreprise: 'Data lab (fictif)', poste: 'Lead data scientist', ville: 'Labège', langues: 'en,ar', metiers: 'data', langue_contact: 'en', accord_partage: 'Non', disponible: 'Oui', nb_mises_en_relation: 0, derniere_mise_en_relation: '', notes: '' }
];

module.exports = { COLS, Parametres, Listes, Templates: T, Sessions, Inscriptions, Demandeurs, Contacts, MisesEnRelation: [] };
if (require.main === module) {
  require('fs').writeFileSync(__dirname + '/seed.json', JSON.stringify(module.exports, null, 1));
  console.log('Templates:', T.length, 'Listes:', Listes.length);
}
