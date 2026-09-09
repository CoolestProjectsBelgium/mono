export interface SeedEmailTemplateRow {
  eventId: number;
  template: string;
  language: string;
  subject: string;
  contentPlain: string;
  contentRich: string;
}

const registrationTemplates: Record<
  'en' | 'nl' | 'fr',
  { subject: string; contentPlain: string; contentRich: string }
> = {
  nl: {
    subject: 'Coolest Projects {{year}}: Bevestig jouw registratie aub',
    contentPlain: `Hallo {{registration.firstname}},

We zijn ontzettend blij dat je wil deelnemen aan Coolest Projects Belgium {{year}}!
{{#if registration.email_guardian}}
Je ouders hebben deze mail ook gekregen. Jij of je ouders moeten je deelname bevestigen.
{{/if}}
Kopieer en plak deze link tussen "..."

"{{url}}"

 in de browser om uw project te activeren.

Zorg ervoor dat je je deze activatie binnen de 2 dagen doet, om je deelname te bevestigen.

Indien je hier nog vragen bij zou hebben, lees dan zeker onze FAQ https://coolestprojects.be/faq-nl/ eens na op onze website.

Coolest Projects Team Belgium`,
    contentRich: `<p>Hallo {{registration.firstname}},</p>
<p>We zijn ontzettend blij dat je wil deelnemen aan Coolest Projects Belgium {{year}}!</p>
{{#if registration.email_guardian}}
<p>Je ouders hebben deze mail ook gekregen. Jij of je ouders moeten je deelname bevestigen.</p>
{{/if}}
<p>LET OP: Om jouw registratie te bevestigen, dien je op de <a href="{{url}}">activatielink</a> te klikken.</p>
<p>Als de bovenstaande link niet werkt in je email programma, copieer en plak dan de volgende url volledig in een browser scherm: {{url}}</p>
<p>Zorg ervoor dat u binnen 2 dagen op deze activatie link klikt om zeker te zijn van je deelname.</p>
<p>Indien je hier nog vragen bij zou hebben, lees dan zeker onze FAQ <a href="https://coolestprojects.be/faq-nl/">https://coolestprojects.be/faq-nl/</a> eens na op onze website.</p>
<p>Coolest Projects Team Belgium</p>`,
  },
  en: {
    subject: 'Coolest Projects {{year}}: Please confirm your registration',
    contentPlain: `Hi {{registration.firstname}},

We're very pleased that you want to participate in the next Coolest Projects Belgium {{year}}!
{{#if registration.email_guardian}}
Your parents also received this mail. Either you or them need to confirm your participation.
{{/if}}
Cat & paste this link between "..."

"{{url}}"

into your browser to activate your project.

If you have any more questions, please check out the FAQ https://coolestprojects.be/en/faq-en/ section on our website!

Coolest Project Team Belgium`,
    contentRich: `<p>Hi {{registration.firstname}},</p>
<p>We're very pleased that you want to participate in the next Coolest Projects Belgium {{year}}!</p>
{{#if registration.email_guardian}}
<p>Your parents also received this mail. Either you or them need to confirm your participation.</p>
{{/if}}
<p>To confirm your registration, click the <a href="{{url}}">activation link</a>. Make sure to click this activation link within 2 days to ensure your participation.</p>
<p>If the above link does not work in your email client, please copy and paste this full url in a browser window: {{url}}</p>
<p>If you have any more questions, please check out the FAQ <a href="https://coolestprojects.be/en/faq-en/">https://coolestprojects.be/en/faq-en/</a> section on our website!</p>
<p>Coolest Project Team Belgium</p>`,
  },
  fr: {
    subject: 'Coolest Projects {{year}}: Merci de confirmer ton inscription',
    contentPlain: `Salut {{registration.firstname}},

Nous sommes très heureux⸱ses de voir que tu participes à la prochaine édition de Coolest Projects Belgium {{year}}!
{{#if registration.email_guardian}}
Tes parents ont aussi reçu ce mail. L'un d'entre vous doit confirmer ta participation.
{{/if}}
Copie et colle ce lien entre "..."

"{{url}}"

dans ton navigateur.

Assurez-vous de cliquer sur ce lien d'activation dans les 2 jours pour garantir votre participation.

Si tu as d'autres questions, tu peux consulter la section FAQ https://coolestprojects.be/fr/faq-fr/ sur notre site web.

Coolest Projects Team Belgium`,
    contentRich: `<p>Salut {{registration.firstname}},</p>
<p>Nous sommes très heureux⸱ses de voir que tu participes à la prochaine édition de Coolest Projects Belgium {{year}}!</p>
{{#if registration.email_guardian}}
<p>Tes parents ont aussi reçu ce mail. L'un d'entre vous doit confirmer ta participation.</p>
{{/if}}
<p>ATTENTION: Pour valider ton inscription, clique sur le <a href="{{url}}">lien d'activation</a>. Assure-toi de cliquer sur ce lien d'activation dans les 2 jours pour confirmer ta participation.</p>
<p>Si le lien ci-dessus ne fonctionne pas dans votre programme de messagerie, copiez et collez complètement l'URL suivante dans une fenêtre de navigateur: {{url}}</p>
<p>Si tu as d'autres questions, tu peux consulter la section FAQ <a href="https://coolestprojects.be/fr/faq-fr/">https://coolestprojects.be/fr/faq-fr/</a> sur notre site web.</p>
<p>Coolest Projects Team Belgium</p>`,
  },
};

const welcomeOwnerTemplates: Record<
  'en' | 'nl' | 'fr',
  { subject: string; contentPlain: string; contentRich: string }
> = {
  nl: {
    subject: 'Coolest Projects {{year}}: Welkom!',
    contentPlain: `Hallo {{user.firstname}},

Jouw project met titel '{{project.title}}' werd succesvol geactiveerd!

Kopieer en plak deze link tussen "..."

"{{url}}"

 in de browser. Via deze weg kan je aanpassingen doen aan je project, je persoonlijke info aanvullen of aanpassen en/of co-workers uitnodigen (max. 3),

Enkel de project-eigenaar kan info over het project aanpassen. Jij kan Go2MyProject gebruiken om de registratiepagina te openen en je persoonlijke informatie aan te vullen en/of aan te passen.

Indien je hier nog vragen bij zou hebben, lees dan zeker onze FAQ https://coolestprojects.be/faq-nl/ eens na op onze website.

Veel succes, {{user.firstname}}

Coolest Projects Team Belgium`,
    contentRich: `<p>Hallo {{user.firstname}},</p>
<p>Jouw project met titel '{{project.title}}' werd succesvol geactiveerd!</p>
<p>Gebruik deze link <a href="{{url}}">Go2MyProject</a> om je pagina te openen. Via deze weg kan je aanpassingen doen aan je project, je persoonlijke info aanvullen of aanpassen en/of co-workers uitnodigen (max. 3)</p>
<p>Enkel de project-eigenaar kan info over het project aanpassen.</p>
<p>Als de bovenstaande link niet werkt in je email programma, copieer en plak dan de volgende url volledig in een browser scherm: {{url}}</p>
<ul>
<li>Je persoonlijke gegevens aanpassen (uitgezonderd e-mail, leeftijd, etc.)</li>
<li>Projectnaam en beschrijving aanpassen</li>
<li>Medewerkers uitnodigen voor je project door op de knop 'CO-WORKERS' te klikken</li>
</ul>
<p>Indien je hier nog vragen bij zou hebben, lees dan zeker onze FAQ <a href="https://coolestprojects.be/faq-nl/">https://coolestprojects.be/faq-nl/</a> eens na op onze website.</p>
<p>Veel succes, {{user.firstname}}</p>
<p>Coolest Projects Team Belgium</p>`,
  },
  en: {
    subject: 'Coolest Projects {{year}}: Welcome',
    contentPlain: `Hi {{user.firstname}},

You were successfully added to the project with the title '{{project.title}}'.

If you want to make changes on your project or if you would like to invite co-workers on your project
please Cat & paste this link between "..."

"{{url}}"

into your browser to activate your project.

Only the project owner can make changes to the project.

If you have any more questions, please check out the FAQ https://coolestprojects.be/en/faq-en/ section on our website.

Coolest Project Team Belgium`,
    contentRich: `<p>Hi {{user.firstname}},</p>
<p>You were successfully added to the project with the title '{{project.title}}'.</p>
<p>If you want to make changes on your project or if you would like to invite co-workers on your project please use the following link <a href="{{url}}">Go2MyProject</a> to open your page.</p>
<p>Only the project owner can make changes to the project.</p>
<p>If the above link does not work in your email client, please copy and paste this full url in a browser window: {{url}}</p>
<ul>
<li>Change your personal data (except the e-mail address, age, ...)</li>
<li>Change your project name and description</li>
<li>Invite co-workers to your project by clicking the button 'CO-WORKERS'</li>
</ul>
<p>If you have any more questions, please check out the FAQ <a href="https://coolestprojects.be/en/faq-en/">https://coolestprojects.be/en/faq-en/</a> section on our website.</p>
<p>Coolest Project Team Belgium</p>`,
  },
  fr: {
    subject: 'Coolest Projects {{year}}: Bienvenue',
    contentPlain: `Salut {{user.firstname}},

Tu as activé avec succès le projet portant le titre '{{project.title}}'.

Si tu souhaites modifier ton projet, ajuster tes informations personnelles ou inviter des co-participant.e.s (max. 3), copie et colle ce lien entre "..."

"{{url}}"

dans ton navigateur.

Seul le propriétaire du projet peut apporter des modifications au projet.

Si tu as d'autres questions, tu peux consulter la section FAQ https://coolestprojects.be/fr/faq-fr/ sur notre site web.

Coolest Projects Team Belgium`,
    contentRich: `<p>Salut {{user.firstname}},</p>
<p>Tu as activé avec succès le projet portant le titre '{{project.title}}'.</p>
<p>Si tu souhaites modifier ton projet ou inviter des co-participant⸱es, merci d'utiliser ce lien <a href="{{url}}">Go2MyProject</a> pour ouvrir ta page.</p>
<p>Seul⸱e le ou la propriétaire du projet peut effectuer des modifications au projet.</p>
<p>Si le lien ci-dessus ne fonctionne pas dans votre programme de messagerie, copiez et collez complètement l'URL suivante dans une fenêtre de navigateur: {{url}}</p>
<ul>
<li>Modifier tes données personnelles (sauf l'email, l'âge ,...)</li>
<li>Modifier le nom et la description de ton projet</li>
<li>Inviter des collaborateur⸱ices en appuyant sur le bouton "CO-WORKERS" (max. 3)</li>
</ul>
<p>Si tu as d'autres questions, tu peux consulter la section FAQ <a href="https://coolestprojects.be/fr/faq-fr/">https://coolestprojects.be/fr/faq-fr/</a> sur notre site web.</p>
<p>Coolest Projects Team Belgium</p>`,
  },
};

const welcomeCoWorkerTemplates: Record<
  'en' | 'nl' | 'fr',
  { subject: string; contentPlain: string; contentRich: string }
> = {
  nl: {
    subject: 'Coolest Projects {{year}}: Welkom!',
    contentPlain: `Hoi {{user.firstname}},

Je bent met succes medewerker geworden van het project met de titel '{{project.title}}'.

Enkel de project-eigenaar kan info over het project aanpassen.
Gebruik deze link Go2MyProject om je pagina te openen.

Kopieer en plak deze link tussen "..."

"{{url}}"

 in de browser.

Indien je hier nog vragen bij zou hebben, lees dan zeker onze FAQ https://coolestprojects.be/faq-nl/ eens na op onze website.

Coolest Projects Team Belgium`,
    contentRich: `<p>Hoi {{user.firstname}},</p>
<p>Je bent met succes medewerker geworden van het project met de titel '{{project.title}}'.</p>
<p>Enkel de project-eigenaar kan info over het project aanpassen. Gebruik deze link <a href="{{url}}">Go2MyProject</a> om je pagina te openen.</p>
<p>Als de bovenstaande link niet werkt in je email programma, copieer en plak dan de volgende url volledig in een browser scherm: {{url}}</p>
<ul>
<li>De projectinformatie bekijken</li>
<li>Je project deelname verwijderen en een eigen project aanmaken</li>
</ul>
<p>Indien je hier nog vragen bij zou hebben, lees dan zeker onze FAQ <a href="https://coolestprojects.be/faq-nl/">https://coolestprojects.be/faq-nl/</a> eens na op onze website.</p>
<p>Coolest Projects Team Belgium</p>`,
  },
  en: {
    subject: 'Coolest Projects {{year}}: Welcome',
    contentPlain: `Hi {{user.firstname}},

You have successfully joined the project with the title '{{project.title}}' as coworker.

Only the project owner can make changes to the project.
Please use the following link Go2MyProject to open your page.

Please, Cat & paste the link between "..." into your browser to open your project

"{{url}}"

If you have any more questions, please check out the FAQ https://coolestprojects.be/en/faq-en/ section on our website.

Coolest Project Team Belgium`,
    contentRich: `<p>Hi {{user.firstname}},</p>
<p>You have successfully joined the project with the title '{{project.title}}' as coworker.</p>
<p>Only the project owner can make changes to the project. Please use the following link <a href="{{url}}">Go2MyProject</a> to open your page.</p>
<p>If the above link does not work in your email client, please copy and paste this full url in a browser window: {{url}}</p>
<ul>
<li>View the project information</li>
<li>Leave the project and create your own</li>
</ul>
<p>If you have any more questions, please check out the FAQ <a href="https://coolestprojects.be/en/faq-en/">https://coolestprojects.be/en/faq-en/</a> section on our website.</p>
<p>Coolest Project Team Belgium</p>`,
  },
  fr: {
    subject: 'Coolest Projects {{year}}: Bienvenue',
    contentPlain: `Salut {{user.firstname}},

Vous avez été ajouté avec succès au projet avec le titre '{{project.title}}'.

Seul⸱e le propriétaire du projet peut apporter des modifications au projet.

copiez et collez ce lien entre "..."

"{{url}}"

dans ton navigateur.

Si tu as d'autres questions, tu peux consulter la section FAQ https://coolestprojects.be/fr/faq-fr/ sur notre site web.

Coolest Projects Team Belgium`,
    contentRich: `<p>Salut {{user.firstname}},</p>
<p>Vous avez été ajouté avec succès au projet avec le titre '{{project.title}}'.</p>
<p>Seul⸱e le propriétaire du projet peut apporter des modifications au projet. Tu peux utiliser ce lien <a href="{{url}}">Go2MyProject</a> pour ouvrir la page d'inscription et mettre à jour tes informations personnelles.</p>
<p>Si le lien ci-dessus ne fonctionne pas dans votre programme de messagerie, copiez et collez complètement l'URL suivante dans une fenêtre de navigateur: {{url}}</p>
<ul>
<li>Afficher les informations du projet</li>
<li>Quittez le projet et créez le tiens</li>
</ul>
<p>Si tu as d'autres questions, tu peux consulter la section FAQ <a href="https://coolestprojects.be/fr/faq-fr/">https://coolestprojects.be/fr/faq-fr/</a> sur notre site web.</p>
<p>Coolest Projects Team Belgium</p>`,
  },
};

const waitingTemplates: Record<
  'en' | 'nl' | 'fr',
  { subject: string; contentPlain: string; contentRich: string }
> = {
  nl: {
    subject: 'Coolest Projects {{year}}: Welkom op de wachtlijst',
    contentPlain: `Hallo {{registration.firstname}},

We zijn ontzettend blij dat je wil deelnemen aan Coolest Projects Belgium {{year}}!
{{#if registration.email_guardian}}
Je ouders zullen deze e-mail ook ontvangen.
{{/if}}
Maar we hebben het maximum aantal projecten bereikt. Je staat dus op de wachtlijst.
Als er een plek vrijkomt, krijg je een activatiemail om je registratie af te ronden.

Veel succes, {{registration.firstname}}.

Coolest Projects Team Belgium`,
    contentRich: `<p>Hallo {{registration.firstname}},</p>
<p>We zijn ontzettend blij dat je wil deelnemen aan Coolest Projects Belgium {{year}}!</p>
{{#if registration.email_guardian}}
<p>Je ouders zullen deze e-mail ook ontvangen.</p>
{{/if}}
<p>Maar we hebben het maximum aantal projecten bereikt. Je staat dus op de wachtlijst. Als er een plek vrijkomt, krijg je een activatiemail om je registratie af te ronden.</p>
<p>Veel succes, {{registration.firstname}}.</p>
<p>Coolest Projects Team Belgium</p>`,
  },
  en: {
    subject: 'Coolest Projects {{year}}: Welcome to the waiting list',
    contentPlain: `Hi {{registration.firstname}},

We're very pleased that you want to participate in the next Coolest Projects Belgium {{year}}!
{{#if registration.email_guardian}}
Your parents will also receive this mail.
{{/if}}
You are on a waiting list, this means that you will receive an activation mail as soon as a spot becomes available.

Good luck, {{registration.firstname}}.

Coolest Projects Team Belgium`,
    contentRich: `<p>Hi {{registration.firstname}},</p>
<p>We're very pleased that you want to participate in the next Coolest Projects Belgium {{year}}!</p>
{{#if registration.email_guardian}}
<p>Your parents will also receive this mail.</p>
{{/if}}
<p>You are on a waiting list, this means that you will receive an activation mail as soon as a spot becomes available.</p>
<p>Good luck, {{registration.firstname}}.</p>
<p>Coolest Projects Team Belgium</p>`,
  },
  fr: {
    subject: "Coolest Projects {{year}}: Bienvenu sur la liste d'attente",
    contentPlain: `Salut {{registration.firstname}},

Nous sommes très heureux⸱ses de voir que tu participes à la prochaine édition de Coolest Projects Belgium {{year}}!
{{#if registration.email_guardian}}
Vos parents recevront également ce courrier.
{{/if}}
Tu es sur une liste d'attente, cela signifie que tu recevras un mail d'activation lorsqu'une place sera disponible.

Bonne chance, {{registration.firstname}}.

Coolest Projects Team Belgium`,
    contentRich: `<p>Salut {{registration.firstname}},</p>
<p>Nous sommes très heureux⸱ses de voir que tu participes à la prochaine édition de Coolest Projects Belgium {{year}}!</p>
{{#if registration.email_guardian}}
<p>Vos parents recevront également ce courrier.</p>
{{/if}}
<p>Tu es sur une liste d'attente, cela signifie que tu recevras un mail d'activation lorsqu'une place sera disponible.</p>
<p>Bonne chance, {{registration.firstname}}.</p>
<p>Coolest Projects Team Belgium</p>`,
  },
};

const ask4TokenTemplates: Record<
  'en' | 'nl' | 'fr',
  { subject: string; contentPlain: string; contentRich: string }
> = {
  nl: {
    subject: 'Coolest Projects {{year}}: Jouw login link',
    contentPlain: `Hallo {{user.firstname}},

Gebruik Go2MyProject om jouw pagina te openen: {{url}}

Kopieer en plak deze link tussen "..."

"{{url}}"

 in de browser om je project te openen.

Coolest Projects Team Belgium`,
    contentRich: `<p>Hallo {{user.firstname}},</p>
<p><a href="{{url}}">Gebruik Go2MyProject om jouw pagina te openen.</a></p>
<p>Als de bovenstaande link niet werkt in je email programma, copieer en plak dan de volgende url volledig in een browser scherm: {{url}}</p>
<p>Coolest Projects Team Belgium</p>`,
  },
  en: {
    subject: 'Coolest Projects {{year}}: Receive a token to login into your project',
    contentPlain: `Hi {{user.firstname}},

Please, use the following link to open your project in your browser {{url}} .

Please, Cat & paste the link between "..." into your browser to open your project

"{{url}}"

Coolest Project Team Belgium`,
    contentRich: `<p>Hi {{user.firstname}},</p>
<p>Please, use the following link to open your project in your browser <a href="{{url}}">Go2MyProject</a>.</p>
<p>If the above link does not work in your email client, please copy and paste this full url in a browser window: {{url}}</p>
<p>Coolest Project Team Belgium</p>`,
  },
  fr: {
    subject: 'Coolest Projects {{year}}: Ton lien de connexion',
    contentPlain: `Salut {{user.firstname}},

Merci d'utiliser le lien suivant pour ouvrir ton navigateur et accéder à ton projet : Go2MyProject

copiez et collez ce lien entre "..."

"{{url}}"

dans ton navigateur.

Coolest Projects Team Belgium`,
    contentRich: `<p>Salut {{user.firstname}},</p>
<p>Merci d'utiliser le lien suivant pour ouvrir ton navigateur et accéder à ton projet : <a href="{{url}}">Go2MyProject</a></p>
<p>Si le lien ci-dessus ne fonctionne pas dans votre programme de messagerie, copiez et collez complètement l'URL suivante dans une fenêtre de navigateur: {{url}}</p>
<p>Coolest Projects Team Belgium</p>`,
  },
};

const emailExistsTemplates: Record<
  'en' | 'nl' | 'fr',
  { subject: string; contentPlain: string; contentRich: string }
> = {
  nl: {
    subject:
      'Coolest Projects {{year}}: Let op, er was een aanvullende registratie met jouw e-mailadres.',
    contentPlain: `Hallo,

Let op, er was een aanvullende registratie met jouw e-mailadres.

Als je jezelf probeert te registreren, houd er dan rekening mee dat je al een Coolest Project hebt. Controleer je e-mail om de activering te vinden of de bevestigingsmail voor toegang tot je project en gebruikersinformatie.

Als je link niet meer werkt, gebruik dan de Login-knop op de hoofdpagina om een nieuwe Login-token voor je e-mailadres aan te vragen.

Als je zelf geen nieuw registratieverzoek hebt gedaan, kan je deze e-mail gerust negeren. Er is geen risico dat je inschrijving is overgenomen. Deel nooit links die je van ons hebt ontvangen met iemand anders.

Coolest Projects Team Belgium`,
    contentRich: `<p>Hallo,</p>
<p>Let op, er was een aanvullende registratie met jouw e-mailadres.</p>
<p>Als je jezelf probeert te registreren, houd er dan rekening mee dat je al een Coolest Project hebt. Controleer je e-mail om de activering te vinden of de bevestigingsmail voor toegang tot je project en gebruikersinformatie.</p>
<p>Als je link niet meer werkt, gebruik dan de Login-knop op de hoofdpagina om een nieuwe Login-token voor je e-mailadres aan te vragen.</p>
<p>Als je zelf geen nieuw registratieverzoek hebt gedaan, kan je deze e-mail gerust negeren. Er is geen risico dat je inschrijving is overgenomen. Deel nooit links die je van ons hebt ontvangen met iemand anders.</p>
<p>Coolest Projects Team Belgium</p>`,
  },
  en: {
    subject:
      'Coolest Projects {{year}}: Attention please, there was an additional registration with your email address.',
    contentPlain: `Hi,

Attention please, there was an additional registration with your email address.

If you tried to register yourself, please note that you already have a Coolest Project. Check your email folder to find the activation or the confirmation e-mail to access your project and user information.

If your link is not working anymore please use the Login button on the main page to ask for a new Login token for your email address.

If your did not make a new registration request yourself, you can safely ignore this mail. There is no risk that your registration has been taken over. Never share links that you received from us with anyone else.

Coolest Projects Team Belgium`,
    contentRich: `<p>Hi,</p>
<p>Attention please, there was an additional registration with your email address.</p>
<p>If you tried to register yourself, please note that you already have a Coolest Project. Check your email folder to find the activation or the confirmation e-mail to access your project and user information.</p>
<p>If your link is not working anymore please use the Login button on the main page to ask for a new Login token for your email address.</p>
<p>If your did not make a new registration request yourself, you can safely ignore this mail. There is no risk that your registration has been taken over. Never share links that you received from us with anyone else.</p>
<p>Coolest Projects Team Belgium</p>`,
  },
  fr: {
    subject:
      "Coolest Projects {{year}}: Attention ! Une inscription à Coolest Projects avec ton adresse mail est déjà enregistrée.",
    contentPlain: `Salut,

Attention ! Une inscription à Coolest Projects avec ton adresse mail est déjà enregistrée.

Si tu as essayé de t'inscrire, sache que tu es déjà associé à un Coolest Project. Vérifie ta boîte mail afin de trouver le mail d'activation ou le mail de bienvenue pour accéder à ton projet ainsi qu'à tes informations personnelles.

Si ton lien ne fonctionne plus, tu peux utiliser le bouton "Connexion" sur la page principale afin de recevoir un nouvel accès via votre adresse e-mail.

Si tu n'as pas fait de nouvelle demande d´inscription toi-même, tu peux ignorer ce courriel en toute sécurité. Il n'y a aucun risque pour la prise en compte de votre enregistrement. Ne partage jamais les liens que tu as reçus de notre part avec quelqu´un d´autre.

Coolest Projects Team Belgium`,
    contentRich: `<p>Salut,</p>
<p>Attention ! Une inscription à Coolest Projects avec ton adresse mail est déjà enregistrée.</p>
<p>Si tu as essayé de t'inscrire, sache que tu es déjà associé à un Coolest Project. Vérifie ta boîte mail afin de trouver le mail d'activation ou le mail de bienvenue pour accéder à ton projet ainsi qu'à tes informations personnelles.</p>
<p>Si ton lien ne fonctionne plus, tu peux utiliser le bouton "Connexion" sur la page principale afin de recevoir un nouvel accès via votre adresse e-mail.</p>
<p>Si tu n'as pas fait de nouvelle demande d´inscription toi-même, tu peux ignorer ce courriel en toute sécurité. Il n'y a aucun risque pour la prise en compte de votre enregistrement. Ne partage jamais les liens que tu as reçus de notre part avec quelqu´un d´autre.</p>
<p>Coolest Projects Team Belgium</p>`,
  },
};

const dailyReminderTemplates: Record<
  'en' | 'nl' | 'fr',
  { subject: string; contentPlain: string; contentRich: string }
> = {
  nl: {
    subject: 'Coolest Projects {{year}}: Nog actie nodig voor jouw deelname',
    contentPlain: `Hallo {{user.firstname}},

Een korte herinnering over jouw deelname aan Coolest Projects Belgium {{year}}:
{{#if noProject}}
- Je hebt nog geen project aangemaakt. Maak er snel een aan zodat je kan deelnemen!
{{/if}}
{{#if noPhoto}}
- Je project heeft nog geen foto. Voeg er snel een toe.
{{/if}}
{{#if deadlineApproaching}}
- De deadline om je project in orde te brengen nadert binnenkort!
{{/if}}
Kopieer en plak deze link tussen "..."

"{{url}}"

 in de browser om je project te openen.

Indien je hier nog vragen bij zou hebben, lees dan zeker onze FAQ https://coolestprojects.be/faq-nl/ eens na op onze website.

Coolest Projects Team Belgium`,
    contentRich: `<p>Hallo {{user.firstname}},</p>
<p>Een korte herinnering over jouw deelname aan Coolest Projects Belgium {{year}}:</p>
<ul>
{{#if noProject}}
<li>Je hebt nog geen project aangemaakt. Maak er snel een aan zodat je kan deelnemen!</li>
{{/if}}
{{#if noPhoto}}
<li>Je project heeft nog geen foto. Voeg er snel een toe.</li>
{{/if}}
{{#if deadlineApproaching}}
<li>De deadline om je project in orde te brengen nadert binnenkort!</li>
{{/if}}
</ul>
<p><a href="{{url}}">Gebruik Go2MyProject om jouw pagina te openen.</a></p>
<p>Als de bovenstaande link niet werkt in je email programma, copieer en plak dan de volgende url volledig in een browser scherm: {{url}}</p>
<p>Indien je hier nog vragen bij zou hebben, lees dan zeker onze FAQ <a href="https://coolestprojects.be/faq-nl/">https://coolestprojects.be/faq-nl/</a> eens na op onze website.</p>
<p>Coolest Projects Team Belgium</p>`,
  },
  en: {
    subject: 'Coolest Projects {{year}}: A few things still need your attention',
    contentPlain: `Hi {{user.firstname}},

A quick reminder about your participation in Coolest Projects Belgium {{year}}:
{{#if noProject}}
- You haven't created a project yet. Create one soon so you can take part!
{{/if}}
{{#if noPhoto}}
- Your project doesn't have a photo yet. Please add one soon.
{{/if}}
{{#if deadlineApproaching}}
- The deadline to get your project ready is coming up soon!
{{/if}}
Please, Cat & paste the link between "..." into your browser to open your project

"{{url}}"

If you have any more questions, please check out the FAQ https://coolestprojects.be/en/faq-en/ section on our website.

Coolest Project Team Belgium`,
    contentRich: `<p>Hi {{user.firstname}},</p>
<p>A quick reminder about your participation in Coolest Projects Belgium {{year}}:</p>
<ul>
{{#if noProject}}
<li>You haven't created a project yet. Create one soon so you can take part!</li>
{{/if}}
{{#if noPhoto}}
<li>Your project doesn't have a photo yet. Please add one soon.</li>
{{/if}}
{{#if deadlineApproaching}}
<li>The deadline to get your project ready is coming up soon!</li>
{{/if}}
</ul>
<p>Please, use the following link to open your project in your browser <a href="{{url}}">Go2MyProject</a>.</p>
<p>If the above link does not work in your email client, please copy and paste this full url in a browser window: {{url}}</p>
<p>If you have any more questions, please check out the FAQ <a href="https://coolestprojects.be/en/faq-en/">https://coolestprojects.be/en/faq-en/</a> section on our website.</p>
<p>Coolest Project Team Belgium</p>`,
  },
  fr: {
    subject: 'Coolest Projects {{year}}: Il reste des actions à faire pour ta participation',
    contentPlain: `Salut {{user.firstname}},

Un petit rappel concernant ta participation à Coolest Projects Belgium {{year}}:
{{#if noProject}}
- Tu n'as pas encore créé de projet. Crées-en un rapidement pour pouvoir participer!
{{/if}}
{{#if noPhoto}}
- Ton projet n'a pas encore de photo. Ajoutes-en une rapidement.
{{/if}}
{{#if deadlineApproaching}}
- La date limite pour finaliser ton projet approche!
{{/if}}
copiez et collez ce lien entre "..."

"{{url}}"

dans ton navigateur.

Si tu as d'autres questions, tu peux consulter la section FAQ https://coolestprojects.be/fr/faq-fr/ sur notre site web.

Coolest Projects Team Belgium`,
    contentRich: `<p>Salut {{user.firstname}},</p>
<p>Un petit rappel concernant ta participation à Coolest Projects Belgium {{year}}:</p>
<ul>
{{#if noProject}}
<li>Tu n'as pas encore créé de projet. Crées-en un rapidement pour pouvoir participer!</li>
{{/if}}
{{#if noPhoto}}
<li>Ton projet n'a pas encore de photo. Ajoutes-en une rapidement.</li>
{{/if}}
{{#if deadlineApproaching}}
<li>La date limite pour finaliser ton projet approche!</li>
{{/if}}
</ul>
<p>Merci d'utiliser le lien suivant pour ouvrir ton navigateur et accéder à ton projet : <a href="{{url}}">Go2MyProject</a></p>
<p>Si le lien ci-dessus ne fonctionne pas dans votre programme de messagerie, copiez et collez complètement l'URL suivante dans une fenêtre de navigateur: {{url}}</p>
<p>Si tu as d'autres questions, tu peux consulter la section FAQ <a href="https://coolestprojects.be/fr/faq-fr/">https://coolestprojects.be/fr/faq-fr/</a> sur notre site web.</p>
<p>Coolest Projects Team Belgium</p>`,
  },
};

const registrationReminderTemplates: Record<
  'en' | 'nl' | 'fr',
  { subject: string; contentPlain: string; contentRich: string }
> = {
  nl: {
    subject: 'Coolest Projects {{year}}: Vergeet niet je registratie te bevestigen',
    contentPlain: `Hallo {{registration.firstname}},

We zien dat je je nog niet hebt aangemeld voor Coolest Projects Belgium {{year}}. Zonder bevestiging kunnen we je plaats niet garanderen.
{{#if registration.email_guardian}}
Je ouders hebben deze mail ook gekregen.
{{/if}}
Kopieer en plak deze link tussen "..."

"{{url}}"

 in de browser om je registratie te bevestigen.

Indien je hier nog vragen bij zou hebben, lees dan zeker onze FAQ https://coolestprojects.be/faq-nl/ eens na op onze website.

Coolest Projects Team Belgium`,
    contentRich: `<p>Hallo {{registration.firstname}},</p>
<p>We zien dat je je nog niet hebt aangemeld voor Coolest Projects Belgium {{year}}. Zonder bevestiging kunnen we je plaats niet garanderen.</p>
{{#if registration.email_guardian}}
<p>Je ouders hebben deze mail ook gekregen.</p>
{{/if}}
<p>Om jouw registratie te bevestigen, dien je op de <a href="{{url}}">activatielink</a> te klikken.</p>
<p>Als de bovenstaande link niet werkt in je email programma, copieer en plak dan de volgende url volledig in een browser scherm: {{url}}</p>
<p>Indien je hier nog vragen bij zou hebben, lees dan zeker onze FAQ <a href="https://coolestprojects.be/faq-nl/">https://coolestprojects.be/faq-nl/</a> eens na op onze website.</p>
<p>Coolest Projects Team Belgium</p>`,
  },
  en: {
    subject: "Coolest Projects {{year}}: Don't forget to confirm your registration",
    contentPlain: `Hi {{registration.firstname}},

We noticed you haven't confirmed your registration for Coolest Projects Belgium {{year}} yet. Without confirmation we can't guarantee your spot.
{{#if registration.email_guardian}}
Your parents also received this mail.
{{/if}}
Cat & paste this link between "..."

"{{url}}"

into your browser to confirm your registration.

If you have any more questions, please check out the FAQ https://coolestprojects.be/en/faq-en/ section on our website!

Coolest Project Team Belgium`,
    contentRich: `<p>Hi {{registration.firstname}},</p>
<p>We noticed you haven't confirmed your registration for Coolest Projects Belgium {{year}} yet. Without confirmation we can't guarantee your spot.</p>
{{#if registration.email_guardian}}
<p>Your parents also received this mail.</p>
{{/if}}
<p>To confirm your registration, click the <a href="{{url}}">activation link</a>.</p>
<p>If the above link does not work in your email client, please copy and paste this full url in a browser window: {{url}}</p>
<p>If you have any more questions, please check out the FAQ <a href="https://coolestprojects.be/en/faq-en/">https://coolestprojects.be/en/faq-en/</a> section on our website!</p>
<p>Coolest Project Team Belgium</p>`,
  },
  fr: {
    subject: "Coolest Projects {{year}}: N'oublie pas de confirmer ton inscription",
    contentPlain: `Salut {{registration.firstname}},

Nous remarquons que tu n'as pas encore confirmé ton inscription à Coolest Projects Belgium {{year}}. Sans confirmation, nous ne pouvons pas garantir ta place.
{{#if registration.email_guardian}}
Tes parents ont aussi reçu ce mail.
{{/if}}
Copie et colle ce lien entre "..."

"{{url}}"

dans ton navigateur pour confirmer ton inscription.

Si tu as d'autres questions, tu peux consulter la section FAQ https://coolestprojects.be/fr/faq-fr/ sur notre site web.

Coolest Projects Team Belgium`,
    contentRich: `<p>Salut {{registration.firstname}},</p>
<p>Nous remarquons que tu n'as pas encore confirmé ton inscription à Coolest Projects Belgium {{year}}. Sans confirmation, nous ne pouvons pas garantir ta place.</p>
{{#if registration.email_guardian}}
<p>Tes parents ont aussi reçu ce mail.</p>
{{/if}}
<p>Pour valider ton inscription, clique sur le <a href="{{url}}">lien d'activation</a>.</p>
<p>Si le lien ci-dessus ne fonctionne pas dans votre programme de messagerie, copiez et collez complètement l'URL suivante dans une fenêtre de navigateur: {{url}}</p>
<p>Si tu as d'autres questions, tu peux consulter la section FAQ <a href="https://coolestprojects.be/fr/faq-fr/">https://coolestprojects.be/fr/faq-fr/</a> sur notre site web.</p>
<p>Coolest Projects Team Belgium</p>`,
  },
};

const notifyNewProjectOwnerTemplates: Record<
  'en' | 'nl' | 'fr',
  { subject: string; contentPlain: string; contentRich: string }
> = {
  nl: {
    subject: 'Coolest Projects {{year}}: Er is een nieuwe deelnemer toegevoegd aan je project',
    contentPlain: `Hallo {{user.firstname}},

Goed nieuws! {{coworker.firstname}} {{coworker.lastname}} heeft zich aangesloten bij jouw project '{{project.title}}'.

Kopieer en plak deze link tussen "..."

"{{url}}"

 in de browser om je project te openen.

Coolest Projects Team Belgium`,
    contentRich: `<p>Hallo {{user.firstname}},</p>
<p>Goed nieuws! {{coworker.firstname}} {{coworker.lastname}} heeft zich aangesloten bij jouw project '{{project.title}}'.</p>
<p><a href="{{url}}">Gebruik Go2MyProject om jouw pagina te openen.</a></p>
<p>Als de bovenstaande link niet werkt in je email programma, copieer en plak dan de volgende url volledig in een browser scherm: {{url}}</p>
<p>Coolest Projects Team Belgium</p>`,
  },
  en: {
    subject: 'Coolest Projects {{year}}: A new participant joined your project',
    contentPlain: `Hi {{user.firstname}},

Good news! {{coworker.firstname}} {{coworker.lastname}} has joined your project '{{project.title}}'.

Please, Cat & paste the link between "..." into your browser to open your project

"{{url}}"

Coolest Project Team Belgium`,
    contentRich: `<p>Hi {{user.firstname}},</p>
<p>Good news! {{coworker.firstname}} {{coworker.lastname}} has joined your project '{{project.title}}'.</p>
<p>Please, use the following link to open your project in your browser <a href="{{url}}">Go2MyProject</a>.</p>
<p>If the above link does not work in your email client, please copy and paste this full url in a browser window: {{url}}</p>
<p>Coolest Project Team Belgium</p>`,
  },
  fr: {
    subject: 'Coolest Projects {{year}}: Un⸱e nouveau⸱elle participant⸱e a rejoint ton projet',
    contentPlain: `Salut {{user.firstname}},

Bonne nouvelle! {{coworker.firstname}} {{coworker.lastname}} a rejoint ton projet '{{project.title}}'.

copiez et collez ce lien entre "..."

"{{url}}"

dans ton navigateur.

Coolest Projects Team Belgium`,
    contentRich: `<p>Salut {{user.firstname}},</p>
<p>Bonne nouvelle! {{coworker.firstname}} {{coworker.lastname}} a rejoint ton projet '{{project.title}}'.</p>
<p>Merci d'utiliser le lien suivant pour ouvrir ton navigateur et accéder à ton projet : <a href="{{url}}">Go2MyProject</a></p>
<p>Si le lien ci-dessus ne fonctionne pas dans votre programme de messagerie, copiez et collez complètement l'URL suivante dans une fenêtre de navigateur: {{url}}</p>
<p>Coolest Projects Team Belgium</p>`,
  },
};

const notifyProjectParticipantLeftTemplates: Record<
  'en' | 'nl' | 'fr',
  { subject: string; contentPlain: string; contentRich: string }
> = {
  nl: {
    subject: 'Coolest Projects {{year}}: Een deelnemer heeft je project verlaten',
    contentPlain: `Hallo {{user.firstname}},

{{coworker.firstname}} {{coworker.lastname}} heeft je project '{{project.title}}' verlaten.

Kopieer en plak deze link tussen "..."

"{{url}}"

 in de browser om je project te openen.

Coolest Projects Team Belgium`,
    contentRich: `<p>Hallo {{user.firstname}},</p>
<p>{{coworker.firstname}} {{coworker.lastname}} heeft je project '{{project.title}}' verlaten.</p>
<p><a href="{{url}}">Gebruik Go2MyProject om jouw pagina te openen.</a></p>
<p>Als de bovenstaande link niet werkt in je email programma, copieer en plak dan de volgende url volledig in een browser scherm: {{url}}</p>
<p>Coolest Projects Team Belgium</p>`,
  },
  en: {
    subject: 'Coolest Projects {{year}}: A participant left your project',
    contentPlain: `Hi {{user.firstname}},

{{coworker.firstname}} {{coworker.lastname}} has left your project '{{project.title}}'.

Please, Cat & paste the link between "..." into your browser to open your project

"{{url}}"

Coolest Project Team Belgium`,
    contentRich: `<p>Hi {{user.firstname}},</p>
<p>{{coworker.firstname}} {{coworker.lastname}} has left your project '{{project.title}}'.</p>
<p>Please, use the following link to open your project in your browser <a href="{{url}}">Go2MyProject</a>.</p>
<p>If the above link does not work in your email client, please copy and paste this full url in a browser window: {{url}}</p>
<p>Coolest Project Team Belgium</p>`,
  },
  fr: {
    subject: 'Coolest Projects {{year}}: Un⸱e participant⸱e a quitté ton projet',
    contentPlain: `Salut {{user.firstname}},

{{coworker.firstname}} {{coworker.lastname}} a quitté ton projet '{{project.title}}'.

copiez et collez ce lien entre "..."

"{{url}}"

dans ton navigateur.

Coolest Projects Team Belgium`,
    contentRich: `<p>Salut {{user.firstname}},</p>
<p>{{coworker.firstname}} {{coworker.lastname}} a quitté ton projet '{{project.title}}'.</p>
<p>Merci d'utiliser le lien suivant pour ouvrir ton navigateur et accéder à ton projet : <a href="{{url}}">Go2MyProject</a></p>
<p>Si le lien ci-dessus ne fonctionne pas dans votre programme de messagerie, copiez et collez complètement l'URL suivante dans une fenêtre de navigateur: {{url}}</p>
<p>Coolest Projects Team Belgium</p>`,
  },
};

const accountDeletedTemplates: Record<
  'en' | 'nl' | 'fr',
  { subject: string; contentPlain: string; contentRich: string }
> = {
  nl: {
    subject: 'Coolest Projects {{year}}: Bedankt voor je deelname',
    contentPlain: `Hallo {{user.firstname}},

Je account voor Coolest Projects Belgium {{year}} werd verwijderd, zoals gevraagd.

Bedankt om deel te nemen, en het spijt ons je te zien vertrekken. We hopen je een volgende keer terug te zien!

Dit is de laatste e-mail die je van ons zal ontvangen.

Coolest Projects Team Belgium`,
    contentRich: `<p>Hallo {{user.firstname}},</p>
<p>Je account voor Coolest Projects Belgium {{year}} werd verwijderd, zoals gevraagd.</p>
<p>Bedankt om deel te nemen, en het spijt ons je te zien vertrekken. We hopen je een volgende keer terug te zien!</p>
<p>Dit is de laatste e-mail die je van ons zal ontvangen.</p>
<p>Coolest Projects Team Belgium</p>`,
  },
  en: {
    subject: 'Coolest Projects {{year}}: Thank you for taking part',
    contentPlain: `Hi {{user.firstname}},

Your account for Coolest Projects Belgium {{year}} has been deleted, as requested.

Thank you for taking part, and we're sorry to see you go. We hope to see you again next time!

This is the last email you will receive from us.

Coolest Project Team Belgium`,
    contentRich: `<p>Hi {{user.firstname}},</p>
<p>Your account for Coolest Projects Belgium {{year}} has been deleted, as requested.</p>
<p>Thank you for taking part, and we're sorry to see you go. We hope to see you again next time!</p>
<p>This is the last email you will receive from us.</p>
<p>Coolest Project Team Belgium</p>`,
  },
  fr: {
    subject: 'Coolest Projects {{year}}: Merci pour ta participation',
    contentPlain: `Salut {{user.firstname}},

Ton compte pour Coolest Projects Belgium {{year}} a été supprimé, comme demandé.

Merci d'avoir participé, et nous sommes désolé⸱es de te voir partir. Nous espérons te revoir une prochaine fois!

Ceci est le dernier e-mail que tu recevras de notre part.

Coolest Projects Team Belgium`,
    contentRich: `<p>Salut {{user.firstname}},</p>
<p>Ton compte pour Coolest Projects Belgium {{year}} a été supprimé, comme demandé.</p>
<p>Merci d'avoir participé, et nous sommes désolé⸱es de te voir partir. Nous espérons te revoir une prochaine fois!</p>
<p>Ceci est le dernier e-mail que tu recevras de notre part.</p>
<p>Coolest Projects Team Belgium</p>`,
  },
};

function rowsForTemplate(
  eventId: number,
  templateKey: string,
  templates: Record<
    'en' | 'nl' | 'fr',
    { subject: string; contentPlain: string; contentRich: string }
  >,
): SeedEmailTemplateRow[] {
  return (['en', 'nl', 'fr'] as const).map((language) => ({
    eventId,
    template: templateKey,
    language,
    ...templates[language],
  }));
}

export function buildSeedEmailTemplates(eventId: number): SeedEmailTemplateRow[] {
  return [
    ...rowsForTemplate(eventId, 'registration', registrationTemplates),
    ...rowsForTemplate(eventId, 'welcomeOwner', welcomeOwnerTemplates),
    ...rowsForTemplate(eventId, 'welcomeCoWorker', welcomeCoWorkerTemplates),
    ...rowsForTemplate(eventId, 'waiting', waitingTemplates),
    ...rowsForTemplate(eventId, 'ask4Token', ask4TokenTemplates),
    ...rowsForTemplate(eventId, 'emailExists', emailExistsTemplates),
    ...rowsForTemplate(eventId, 'dailyReminder', dailyReminderTemplates),
    ...rowsForTemplate(eventId, 'registrationReminder', registrationReminderTemplates),
    ...rowsForTemplate(eventId, 'notifyNewProjectOwner', notifyNewProjectOwnerTemplates),
    ...rowsForTemplate(eventId, 'notifyProjectParticipantLeft', notifyProjectParticipantLeftTemplates),
    ...rowsForTemplate(eventId, 'accountDeleted', accountDeletedTemplates),
  ];
}
