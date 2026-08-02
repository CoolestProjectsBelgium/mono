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
  ];
}
