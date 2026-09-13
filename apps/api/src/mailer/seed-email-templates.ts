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
    subject: 'Coolest Projects {{year}}: Bevestig jouw registratie',
    contentPlain: `Hallo {{registration.firstname}},

We zijn ontzettend blij dat je wil deelnemen aan Coolest Projects Belgium {{year}}!
{{#if registration.email_guardian}}
Je ouders hebben deze mail ook gekregen. Jij of je ouders moeten je deelname bevestigen.
{{/if}}
Klik op de activatielink om je registratie te bevestigen. Doe dit binnen de 2 dagen, zodat je deelname zeker is.

Werkt de knop niet? Kopieer dan deze link volledig in je browser: {{url}}

Vragen? Contacteer ons via info@coderdojobelgium.be

Coolest Projects Team Belgium`,
    contentRich: `<p>Hallo {{registration.firstname}},</p>
<p>We zijn ontzettend blij dat je wil deelnemen aan Coolest Projects Belgium {{year}}!</p>
{{#if registration.email_guardian}}
<p>Je ouders hebben deze mail ook gekregen. Jij of je ouders moeten je deelname bevestigen.</p>
{{/if}}
<p>Klik op de <a href="{{url}}">activatielink</a> om je registratie te bevestigen. Doe dit binnen de 2 dagen, zodat je deelname zeker is.</p>
<p>Werkt de knop niet? Kopieer dan deze link volledig in je browser: {{url}}</p>
<p>Vragen? Contacteer ons via <a href="mailto:info@coderdojobelgium.be">info@coderdojobelgium.be</a></p>
<p>Coolest Projects Team Belgium</p>`,
  },
  en: {
    subject: 'Coolest Projects {{year}}: Please confirm your registration',
    contentPlain: `Hi {{registration.firstname}},

We're very pleased that you want to participate in the next Coolest Projects Belgium {{year}}!
{{#if registration.email_guardian}}
Your parents also received this mail. Either you or they need to confirm your participation.
{{/if}}
Click the activation link to confirm your registration. Make sure to do this within 2 days to secure your participation.

Button not working? Copy and paste this full link into your browser: {{url}}

Questions? Contact us at info@coderdojobelgium.be

Coolest Projects Team Belgium`,
    contentRich: `<p>Hi {{registration.firstname}},</p>
<p>We're very pleased that you want to participate in the next Coolest Projects Belgium {{year}}!</p>
{{#if registration.email_guardian}}
<p>Your parents also received this mail. Either you or they need to confirm your participation.</p>
{{/if}}
<p>Click the <a href="{{url}}">activation link</a> to confirm your registration. Make sure to do this within 2 days to secure your participation.</p>
<p>Button not working? Copy and paste this full link into your browser: {{url}}</p>
<p>Questions? Contact us at <a href="mailto:info@coderdojobelgium.be">info@coderdojobelgium.be</a></p>
<p>Coolest Projects Team Belgium</p>`,
  },
  fr: {
    subject: 'Coolest Projects {{year}}: Merci de confirmer ton inscription',
    contentPlain: `Salut {{registration.firstname}},

Nous sommes très heureux de voir que tu participes à la prochaine édition de Coolest Projects Belgium {{year}} !
{{#if registration.email_guardian}}
Tes parents ont aussi reçu ce mail. Toi ou tes parents devez confirmer ta participation.
{{/if}}
Clique sur le lien d'activation pour confirmer ton inscription. Fais-le dans les 2 jours pour garantir ta participation.

Le bouton ne fonctionne pas ? Copie et colle ce lien complet dans ton navigateur : {{url}}

Des questions ? Contacte-nous à info@coderdojobelgium.be

Coolest Projects Team Belgium`,
    contentRich: `<p>Salut {{registration.firstname}},</p>
<p>Nous sommes très heureux de voir que tu participes à la prochaine édition de Coolest Projects Belgium {{year}} !</p>
{{#if registration.email_guardian}}
<p>Tes parents ont aussi reçu ce mail. Toi ou tes parents devez confirmer ta participation.</p>
{{/if}}
<p>Clique sur le <a href="{{url}}">lien d'activation</a> pour confirmer ton inscription. Fais-le dans les 2 jours pour garantir ta participation.</p>
<p>Le bouton ne fonctionne pas ? Copie et colle ce lien complet dans ton navigateur : {{url}}</p>
<p>Des questions ? Contacte-nous à <a href="mailto:info@coderdojobelgium.be">info@coderdojobelgium.be</a></p>
<p>Coolest Projects Team Belgium</p>`,
  },
};

const welcomeOwnerTemplates: Record<
  'en' | 'nl' | 'fr',
  { subject: string; contentPlain: string; contentRich: string }
> = {
  nl: {
    subject: 'Coolest Projects {{year}}: Welkom',
    contentPlain: `Hallo {{user.firstname}},

Jouw project met titel '{{project.title}}' werd succesvol geactiveerd!

Gebruik de link 'Ga naar mijn project' om je pagina te openen. Via deze weg kan je:
- je persoonlijke gegevens aanpassen (uitgezonderd e-mail, leeftijd, ...)
- je projectnaam en beschrijving aanpassen
- medewerkers uitnodigen voor je project via de knop 'CO-WORKERS' (max. 3)

Enkel de projecteigenaar kan info over het project aanpassen.

Werkt de knop niet? Kopieer dan deze link volledig in je browser: {{url}}

Vragen? Contacteer ons via info@coderdojobelgium.be

Veel succes, {{user.firstname}}!

Coolest Projects Team Belgium`,
    contentRich: `<p>Hallo {{user.firstname}},</p>
<p>Jouw project met titel '{{project.title}}' werd succesvol geactiveerd!</p>
<p>Gebruik de link <a href="{{url}}">Ga naar mijn project</a> om je pagina te openen. Via deze weg kan je:</p>
<ul>
<li>je persoonlijke gegevens aanpassen (uitgezonderd e-mail, leeftijd, ...)</li>
<li>je projectnaam en beschrijving aanpassen</li>
<li>medewerkers uitnodigen voor je project via de knop 'CO-WORKERS' (max. 3)</li>
</ul>
<p>Enkel de projecteigenaar kan info over het project aanpassen.</p>
<p>Werkt de knop niet? Kopieer dan deze link volledig in je browser: {{url}}</p>
<p>Vragen? Contacteer ons via <a href="mailto:info@coderdojobelgium.be">info@coderdojobelgium.be</a></p>
<p>Veel succes, {{user.firstname}}!</p>
<p>Coolest Projects Team Belgium</p>`,
  },
  en: {
    subject: 'Coolest Projects {{year}}: Welcome',
    contentPlain: `Hi {{user.firstname}},

You have successfully activated your project '{{project.title}}'!

Use the 'Go to my project' link to open your page. There you can:
- change your personal data (except email, age, ...)
- change your project name and description
- invite co-workers to your project via the 'CO-WORKERS' button (max. 3)

Only the project owner can make changes to the project.

Button not working? Copy and paste this full link into your browser: {{url}}

Questions? Contact us at info@coderdojobelgium.be

Coolest Projects Team Belgium`,
    contentRich: `<p>Hi {{user.firstname}},</p>
<p>You have successfully activated your project '{{project.title}}'!</p>
<p>Use the <a href="{{url}}">Go to my project</a> link to open your page. There you can:</p>
<ul>
<li>change your personal data (except email, age, ...)</li>
<li>change your project name and description</li>
<li>invite co-workers to your project via the 'CO-WORKERS' button (max. 3)</li>
</ul>
<p>Only the project owner can make changes to the project.</p>
<p>Button not working? Copy and paste this full link into your browser: {{url}}</p>
<p>Questions? Contact us at <a href="mailto:info@coderdojobelgium.be">info@coderdojobelgium.be</a></p>
<p>Coolest Projects Team Belgium</p>`,
  },
  fr: {
    subject: 'Coolest Projects {{year}}: Bienvenue',
    contentPlain: `Salut {{user.firstname}},

Tu as activé avec succès ton projet '{{project.title}}' !

Utilise le lien 'Accéder à mon projet' pour ouvrir ta page. Tu peux y :
- modifier tes données personnelles (sauf l'e-mail, l'âge, ...)
- modifier le nom et la description de ton projet
- inviter des co-participants via le bouton 'CO-WORKERS' (max. 3)

Seul le ou la propriétaire du projet peut modifier le projet.

Le bouton ne fonctionne pas ? Copie et colle ce lien complet dans ton navigateur : {{url}}

Des questions ? Contacte-nous à info@coderdojobelgium.be

Coolest Projects Team Belgium`,
    contentRich: `<p>Salut {{user.firstname}},</p>
<p>Tu as activé avec succès ton projet '{{project.title}}' !</p>
<p>Utilise le lien <a href="{{url}}">Accéder à mon projet</a> pour ouvrir ta page. Tu peux y :</p>
<ul>
<li>modifier tes données personnelles (sauf l'e-mail, l'âge, ...)</li>
<li>modifier le nom et la description de ton projet</li>
<li>inviter des co-participants via le bouton 'CO-WORKERS' (max. 3)</li>
</ul>
<p>Seul le ou la propriétaire du projet peut modifier le projet.</p>
<p>Le bouton ne fonctionne pas ? Copie et colle ce lien complet dans ton navigateur : {{url}}</p>
<p>Des questions ? Contacte-nous à <a href="mailto:info@coderdojobelgium.be">info@coderdojobelgium.be</a></p>
<p>Coolest Projects Team Belgium</p>`,
  },
};

const welcomeCoWorkerTemplates: Record<
  'en' | 'nl' | 'fr',
  { subject: string; contentPlain: string; contentRich: string }
> = {
  nl: {
    subject: 'Coolest Projects {{year}}: Welkom',
    contentPlain: `Hoi {{user.firstname}},

Je bent met succes medewerker geworden van het project met de titel '{{project.title}}'.

Enkel de projecteigenaar kan info over het project aanpassen. Gebruik de link 'Ga naar mijn project' om je pagina te openen. Via deze weg kan je:
- de projectinformatie bekijken
- je projectdeelname verwijderen en een eigen project aanmaken

Werkt de knop niet? Kopieer dan deze link volledig in je browser: {{url}}

Vragen? Contacteer ons via info@coderdojobelgium.be

Coolest Projects Team Belgium`,
    contentRich: `<p>Hoi {{user.firstname}},</p>
<p>Je bent met succes medewerker geworden van het project met de titel '{{project.title}}'.</p>
<p>Enkel de projecteigenaar kan info over het project aanpassen. Gebruik de link <a href="{{url}}">Ga naar mijn project</a> om je pagina te openen. Via deze weg kan je:</p>
<ul>
<li>de projectinformatie bekijken</li>
<li>je projectdeelname verwijderen en een eigen project aanmaken</li>
</ul>
<p>Werkt de knop niet? Kopieer dan deze link volledig in je browser: {{url}}</p>
<p>Vragen? Contacteer ons via <a href="mailto:info@coderdojobelgium.be">info@coderdojobelgium.be</a></p>
<p>Coolest Projects Team Belgium</p>`,
  },
  en: {
    subject: 'Coolest Projects {{year}}: Welcome',
    contentPlain: `Hi {{user.firstname}},

You have successfully joined the project '{{project.title}}' as a co-worker.

Only the project owner can make changes to the project. Use the 'Go to my project' link to open your page. There you can:
- view the project information
- leave the project and create your own

Button not working? Copy and paste this full link into your browser: {{url}}

Questions? Contact us at info@coderdojobelgium.be

Coolest Projects Team Belgium`,
    contentRich: `<p>Hi {{user.firstname}},</p>
<p>You have successfully joined the project '{{project.title}}' as a co-worker.</p>
<p>Only the project owner can make changes to the project. Use the <a href="{{url}}">Go to my project</a> link to open your page. There you can:</p>
<ul>
<li>view the project information</li>
<li>leave the project and create your own</li>
</ul>
<p>Button not working? Copy and paste this full link into your browser: {{url}}</p>
<p>Questions? Contact us at <a href="mailto:info@coderdojobelgium.be">info@coderdojobelgium.be</a></p>
<p>Coolest Projects Team Belgium</p>`,
  },
  fr: {
    subject: 'Coolest Projects {{year}}: Bienvenue',
    contentPlain: `Salut {{user.firstname}},

Tu as bien rejoint le projet '{{project.title}}'.

Seul le ou la propriétaire du projet peut modifier le projet. Utilise le lien 'Accéder à mon projet' pour ouvrir ta page. Tu peux y :
- afficher les informations du projet
- quitter le projet et créer le tien

Le bouton ne fonctionne pas ? Copie et colle ce lien complet dans ton navigateur : {{url}}

Des questions ? Contacte-nous à info@coderdojobelgium.be

Coolest Projects Team Belgium`,
    contentRich: `<p>Salut {{user.firstname}},</p>
<p>Tu as bien rejoint le projet '{{project.title}}'.</p>
<p>Seul le ou la propriétaire du projet peut modifier le projet. Utilise le lien <a href="{{url}}">Accéder à mon projet</a> pour ouvrir ta page. Tu peux y :</p>
<ul>
<li>afficher les informations du projet</li>
<li>quitter le projet et créer le tien</li>
</ul>
<p>Le bouton ne fonctionne pas ? Copie et colle ce lien complet dans ton navigateur : {{url}}</p>
<p>Des questions ? Contacte-nous à <a href="mailto:info@coderdojobelgium.be">info@coderdojobelgium.be</a></p>
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
Je ouders ontvangen deze e-mail ook.
{{/if}}
We hebben het maximum aantal projecten bereikt, dus je staat op de wachtlijst. Komt er een plek vrij, dan krijg je een activatiemail om je registratie af te ronden.

Vragen? Contacteer ons via info@coderdojobelgium.be

Veel succes, {{registration.firstname}}!

Coolest Projects Team Belgium`,
    contentRich: `<p>Hallo {{registration.firstname}},</p>
<p>We zijn ontzettend blij dat je wil deelnemen aan Coolest Projects Belgium {{year}}!</p>
{{#if registration.email_guardian}}
<p>Je ouders ontvangen deze e-mail ook.</p>
{{/if}}
<p>We hebben het maximum aantal projecten bereikt, dus je staat op de wachtlijst. Komt er een plek vrij, dan krijg je een activatiemail om je registratie af te ronden.</p>
<p>Vragen? Contacteer ons via <a href="mailto:info@coderdojobelgium.be">info@coderdojobelgium.be</a></p>
<p>Veel succes, {{registration.firstname}}!</p>
<p>Coolest Projects Team Belgium</p>`,
  },
  en: {
    subject: 'Coolest Projects {{year}}: Welcome to the waiting list',
    contentPlain: `Hi {{registration.firstname}},

We're very pleased that you want to participate in the next Coolest Projects Belgium {{year}}!
{{#if registration.email_guardian}}
Your parents also received this mail.
{{/if}}
You are on the waiting list. This means you will receive an activation mail as soon as a spot becomes available.

Questions? Contact us at info@coderdojobelgium.be

Good luck, {{registration.firstname}}!

Coolest Projects Team Belgium`,
    contentRich: `<p>Hi {{registration.firstname}},</p>
<p>We're very pleased that you want to participate in the next Coolest Projects Belgium {{year}}!</p>
{{#if registration.email_guardian}}
<p>Your parents also received this mail.</p>
{{/if}}
<p>You are on the waiting list. This means you will receive an activation mail as soon as a spot becomes available.</p>
<p>Questions? Contact us at <a href="mailto:info@coderdojobelgium.be">info@coderdojobelgium.be</a></p>
<p>Good luck, {{registration.firstname}}!</p>
<p>Coolest Projects Team Belgium</p>`,
  },
  fr: {
    subject: "Coolest Projects {{year}}: Bienvenue sur la liste d'attente",
    contentPlain: `Salut {{registration.firstname}},

Nous sommes très heureux de voir que tu participes à la prochaine édition de Coolest Projects Belgium {{year}} !
{{#if registration.email_guardian}}
Tes parents reçoivent également ce courrier.
{{/if}}
Tu es sur la liste d'attente : cela signifie que tu recevras un mail d'activation dès qu'une place se libère.

Des questions ? Contacte-nous à info@coderdojobelgium.be

Bonne chance, {{registration.firstname}} !

Coolest Projects Team Belgium`,
    contentRich: `<p>Salut {{registration.firstname}},</p>
<p>Nous sommes très heureux de voir que tu participes à la prochaine édition de Coolest Projects Belgium {{year}} !</p>
{{#if registration.email_guardian}}
<p>Tes parents reçoivent également ce courrier.</p>
{{/if}}
<p>Tu es sur la liste d'attente : cela signifie que tu recevras un mail d'activation dès qu'une place se libère.</p>
<p>Des questions ? Contacte-nous à <a href="mailto:info@coderdojobelgium.be">info@coderdojobelgium.be</a></p>
<p>Bonne chance, {{registration.firstname}} !</p>
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

Gebruik de link 'Ga naar mijn project' om je pagina te openen.

Werkt de knop niet? Kopieer dan deze link volledig in je browser: {{url}}

Vragen? Contacteer ons via info@coderdojobelgium.be

Coolest Projects Team Belgium`,
    contentRich: `<p>Hallo {{user.firstname}},</p>
<p>Gebruik de link <a href="{{url}}">Ga naar mijn project</a> om je pagina te openen.</p>
<p>Werkt de knop niet? Kopieer dan deze link volledig in je browser: {{url}}</p>
<p>Vragen? Contacteer ons via <a href="mailto:info@coderdojobelgium.be">info@coderdojobelgium.be</a></p>
<p>Coolest Projects Team Belgium</p>`,
  },
  en: {
    subject: 'Coolest Projects {{year}}: Your login link',
    contentPlain: `Hi {{user.firstname}},

Use the 'Go to my project' link to open your project.

Button not working? Copy and paste this full link into your browser: {{url}}

Questions? Contact us at info@coderdojobelgium.be

Coolest Projects Team Belgium`,
    contentRich: `<p>Hi {{user.firstname}},</p>
<p>Use the <a href="{{url}}">Go to my project</a> link to open your project.</p>
<p>Button not working? Copy and paste this full link into your browser: {{url}}</p>
<p>Questions? Contact us at <a href="mailto:info@coderdojobelgium.be">info@coderdojobelgium.be</a></p>
<p>Coolest Projects Team Belgium</p>`,
  },
  fr: {
    subject: 'Coolest Projects {{year}}: Ton lien de connexion',
    contentPlain: `Salut {{user.firstname}},

Utilise le lien 'Accéder à mon projet' pour ouvrir ton projet.

Le bouton ne fonctionne pas ? Copie et colle ce lien complet dans ton navigateur : {{url}}

Des questions ? Contacte-nous à info@coderdojobelgium.be

Coolest Projects Team Belgium`,
    contentRich: `<p>Salut {{user.firstname}},</p>
<p>Utilise le lien <a href="{{url}}">Accéder à mon projet</a> pour ouvrir ton projet.</p>
<p>Le bouton ne fonctionne pas ? Copie et colle ce lien complet dans ton navigateur : {{url}}</p>
<p>Des questions ? Contacte-nous à <a href="mailto:info@coderdojobelgium.be">info@coderdojobelgium.be</a></p>
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

Als je jezelf probeerde te registreren: je hebt al een Coolest Project. Controleer je e-mail voor de activatie- of bevestigingsmail om toegang te krijgen tot je project en gebruikersinformatie.

Werkt je link niet meer? Gebruik dan de Login-knop op de hoofdpagina om een nieuwe login-token voor je e-mailadres aan te vragen.

Heb je zelf geen nieuw registratieverzoek gedaan? Dan kan je deze e-mail gerust negeren. Er is geen risico dat je inschrijving is overgenomen. Deel nooit links die je van ons ontving met iemand anders.

Vragen? Contacteer ons via info@coderdojobelgium.be

Coolest Projects Team Belgium`,
    contentRich: `<p>Hallo,</p>
<p>Let op, er was een aanvullende registratie met jouw e-mailadres.</p>
<p>Als je jezelf probeerde te registreren: je hebt al een Coolest Project. Controleer je e-mail voor de activatie- of bevestigingsmail om toegang te krijgen tot je project en gebruikersinformatie.</p>
<p>Werkt je link niet meer? Gebruik dan de Login-knop op de hoofdpagina om een nieuwe login-token voor je e-mailadres aan te vragen.</p>
<p>Heb je zelf geen nieuw registratieverzoek gedaan? Dan kan je deze e-mail gerust negeren. Er is geen risico dat je inschrijving is overgenomen. Deel nooit links die je van ons ontving met iemand anders.</p>
<p>Vragen? Contacteer ons via <a href="mailto:info@coderdojobelgium.be">info@coderdojobelgium.be</a></p>
<p>Coolest Projects Team Belgium</p>`,
  },
  en: {
    subject:
      'Coolest Projects {{year}}: Attention please, there was an additional registration with your email address.',
    contentPlain: `Hi,

Attention please, there was an additional registration with your email address.

If you tried to register yourself, please note that you already have a Coolest Project. Check your email folder for the activation or confirmation email to access your project and user information.

If your link no longer works, use the Login button on the main page to request a new login token for your email address.

If you did not make a new registration request yourself, you can safely ignore this mail. There is no risk that your registration has been taken over. Never share links that you received from us with anyone else.

Questions? Contact us at info@coderdojobelgium.be

Coolest Projects Team Belgium`,
    contentRich: `<p>Hi,</p>
<p>Attention please, there was an additional registration with your email address.</p>
<p>If you tried to register yourself, please note that you already have a Coolest Project. Check your email folder for the activation or confirmation email to access your project and user information.</p>
<p>If your link no longer works, use the Login button on the main page to request a new login token for your email address.</p>
<p>If you did not make a new registration request yourself, you can safely ignore this mail. There is no risk that your registration has been taken over. Never share links that you received from us with anyone else.</p>
<p>Questions? Contact us at <a href="mailto:info@coderdojobelgium.be">info@coderdojobelgium.be</a></p>
<p>Coolest Projects Team Belgium</p>`,
  },
  fr: {
    subject:
      'Coolest Projects {{year}}: Attention, une inscription à Coolest Projects avec ton adresse mail est déjà enregistrée.',
    contentPlain: `Salut,

Attention ! Une inscription à Coolest Projects avec ton adresse mail est déjà enregistrée.

Si tu as essayé de t'inscrire, sache que tu es déjà associé à un Coolest Project. Vérifie ta boîte mail pour trouver le mail d'activation ou de bienvenue afin d'accéder à ton projet et à tes informations personnelles.

Si ton lien ne fonctionne plus, utilise le bouton "Connexion" sur la page principale pour recevoir un nouvel accès via ton adresse e-mail.

Si tu n'as pas fait de nouvelle demande d'inscription toi-même, tu peux ignorer ce courriel en toute sécurité. Il n'y a aucun risque pour la prise en compte de ton enregistrement. Ne partage jamais les liens que tu as reçus de notre part avec quelqu'un d'autre.

Des questions ? Contacte-nous à info@coderdojobelgium.be

Coolest Projects Team Belgium`,
    contentRich: `<p>Salut,</p>
<p>Attention ! Une inscription à Coolest Projects avec ton adresse mail est déjà enregistrée.</p>
<p>Si tu as essayé de t'inscrire, sache que tu es déjà associé à un Coolest Project. Vérifie ta boîte mail pour trouver le mail d'activation ou de bienvenue afin d'accéder à ton projet et à tes informations personnelles.</p>
<p>Si ton lien ne fonctionne plus, utilise le bouton "Connexion" sur la page principale pour recevoir un nouvel accès via ton adresse e-mail.</p>
<p>Si tu n'as pas fait de nouvelle demande d'inscription toi-même, tu peux ignorer ce courriel en toute sécurité. Il n'y a aucun risque pour la prise en compte de ton enregistrement. Ne partage jamais les liens que tu as reçus de notre part avec quelqu'un d'autre.</p>
<p>Des questions ? Contacte-nous à <a href="mailto:info@coderdojobelgium.be">info@coderdojobelgium.be</a></p>
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
    subject:
      'Coolest Projects {{year}}: A few things still need your attention',
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
    subject:
      'Coolest Projects {{year}}: Il reste des actions à faire pour ta participation',
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
    subject:
      'Coolest Projects {{year}}: Vergeet niet je registratie te bevestigen',
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
    subject:
      "Coolest Projects {{year}}: Don't forget to confirm your registration",
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
    subject:
      "Coolest Projects {{year}}: N'oublie pas de confirmer ton inscription",
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
    subject:
      'Coolest Projects {{year}}: Er is een nieuwe deelnemer toegevoegd aan je project',
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
    subject:
      'Coolest Projects {{year}}: Un⸱e nouveau⸱elle participant⸱e a rejoint ton projet',
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
    subject:
      'Coolest Projects {{year}}: Een deelnemer heeft je project verlaten',
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
    subject:
      'Coolest Projects {{year}}: Un⸱e participant⸱e a quitté ton projet',
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

export function buildSeedEmailTemplates(
  eventId: number,
): SeedEmailTemplateRow[] {
  return [
    ...rowsForTemplate(eventId, 'registration', registrationTemplates),
    ...rowsForTemplate(eventId, 'welcomeOwner', welcomeOwnerTemplates),
    ...rowsForTemplate(eventId, 'welcomeCoWorker', welcomeCoWorkerTemplates),
    ...rowsForTemplate(eventId, 'waiting', waitingTemplates),
    ...rowsForTemplate(eventId, 'ask4Token', ask4TokenTemplates),
    ...rowsForTemplate(eventId, 'emailExists', emailExistsTemplates),
    ...rowsForTemplate(eventId, 'dailyReminder', dailyReminderTemplates),
    ...rowsForTemplate(
      eventId,
      'registrationReminder',
      registrationReminderTemplates,
    ),
    ...rowsForTemplate(
      eventId,
      'notifyNewProjectOwner',
      notifyNewProjectOwnerTemplates,
    ),
    ...rowsForTemplate(
      eventId,
      'notifyProjectParticipantLeft',
      notifyProjectParticipantLeftTemplates,
    ),
    ...rowsForTemplate(eventId, 'accountDeleted', accountDeletedTemplates),
  ];
}
