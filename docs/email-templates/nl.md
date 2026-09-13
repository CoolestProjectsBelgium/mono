# Coolest Projects: e-mails (NL)

Gecorrigeerde systeemmails (klaar voor gebruik), kritische review en de originele mails als referentie.

## Gecorrigeerde mails (klaar voor gebruik)

### Bevestig registratie (`registration`)

**Subject:** Coolest Projects {{year}}: Bevestig jouw registratie

```
Hallo {{registration.firstname}},

We zijn ontzettend blij dat je wil deelnemen aan Coolest Projects Belgium {{year}}!
{{#if registration.email_guardian}}
Je ouders hebben deze mail ook gekregen. Jij of je ouders moeten je deelname bevestigen.
{{/if}}
Klik op de activatielink om je registratie te bevestigen. Doe dit binnen de 2 dagen, zodat je deelname zeker is.

Werkt de knop niet? Kopieer dan deze link volledig in je browser: {{url}}

Vragen? Contacteer ons via info@coderdojobelgium.be

Coolest Projects Team Belgium
```

### Welkom (projecteigenaar) (`welcomeOwner`)

**Subject:** Coolest Projects {{year}}: Welkom

```
Hallo {{user.firstname}},

Jouw project met titel '{{project.title}}' werd succesvol geactiveerd!

Gebruik de link 'Ga naar mijn project' om je pagina te openen. Via deze weg kan je:
- je persoonlijke gegevens aanpassen (uitgezonderd e-mail, leeftijd, ...)
- je projectnaam en beschrijving aanpassen
- medewerkers uitnodigen voor je project via de knop 'CO-WORKERS' (max. 3)

Enkel de projecteigenaar kan info over het project aanpassen.

Werkt de knop niet? Kopieer dan deze link volledig in je browser: {{url}}

Vragen? Contacteer ons via info@coderdojobelgium.be

Veel succes, {{user.firstname}}!

Coolest Projects Team Belgium
```

### Welkom (co-worker) (`welcomeCoWorker`)

**Subject:** Coolest Projects {{year}}: Welkom

```
Hoi {{user.firstname}},

Je bent met succes medewerker geworden van het project met de titel '{{project.title}}'.

Enkel de projecteigenaar kan info over het project aanpassen. Gebruik de link 'Ga naar mijn project' om je pagina te openen. Via deze weg kan je:
- de projectinformatie bekijken
- je projectdeelname verwijderen en een eigen project aanmaken

Werkt de knop niet? Kopieer dan deze link volledig in je browser: {{url}}

Vragen? Contacteer ons via info@coderdojobelgium.be

Coolest Projects Team Belgium
```

### Wachtlijst (`waiting`)

**Subject:** Coolest Projects {{year}}: Welkom op de wachtlijst

```
Hallo {{registration.firstname}},

We zijn ontzettend blij dat je wil deelnemen aan Coolest Projects Belgium {{year}}!
{{#if registration.email_guardian}}
Je ouders ontvangen deze e-mail ook.
{{/if}}
We hebben het maximum aantal projecten bereikt, dus je staat op de wachtlijst. Komt er een plek vrij, dan krijg je een activatiemail om je registratie af te ronden.

Vragen? Contacteer ons via info@coderdojobelgium.be

Veel succes, {{registration.firstname}}!

Coolest Projects Team Belgium
```

### Login link (`ask4Token`)

**Subject:** Coolest Projects {{year}}: Jouw login link

```
Hallo {{user.firstname}},

Gebruik de link 'Ga naar mijn project' om je pagina te openen.

Werkt de knop niet? Kopieer dan deze link volledig in je browser: {{url}}

Vragen? Contacteer ons via info@coderdojobelgium.be

Coolest Projects Team Belgium
```

### E-mail bestaat al (`emailExists`)

**Subject:** Coolest Projects {{year}}: Let op, er was een aanvullende registratie met jouw e-mailadres.

```
Hallo,

Let op, er was een aanvullende registratie met jouw e-mailadres.

Als je jezelf probeerde te registreren: je hebt al een Coolest Project. Controleer je e-mail voor de activatie- of bevestigingsmail om toegang te krijgen tot je project en gebruikersinformatie.

Werkt je link niet meer? Gebruik dan de Login-knop op de hoofdpagina om een nieuwe login-token voor je e-mailadres aan te vragen.

Heb je zelf geen nieuw registratieverzoek gedaan? Dan kan je deze e-mail gerust negeren. Er is geen risico dat je inschrijving is overgenomen. Deel nooit links die je van ons ontving met iemand anders.

Vragen? Contacteer ons via info@coderdojobelgium.be

Coolest Projects Team Belgium
```
