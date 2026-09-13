# Coolest Projects : e-mails (FR)

E-mails système corrigés (prêts à l'emploi).

## E-mails corrigés (prêts à l'emploi)

### Confirmer l'inscription (`registration`)

**Subject:** Coolest Projects {{year}}: Merci de confirmer ton inscription

```
Salut {{registration.firstname}},

Nous sommes très heureux de voir que tu participes à la prochaine édition de Coolest Projects Belgium {{year}} !
{{#if registration.email_guardian}}
Tes parents ont aussi reçu ce mail. Toi ou tes parents devez confirmer ta participation.
{{/if}}
Clique sur le lien d'activation pour confirmer ton inscription. Fais-le dans les 2 jours pour garantir ta participation.

Le bouton ne fonctionne pas ? Copie et colle ce lien complet dans ton navigateur : {{url}}

Des questions ? Contacte-nous à info@coderdojobelgium.be

Coolest Projects Team Belgium
```

### Bienvenue (propriétaire) (`welcomeOwner`)

**Subject:** Coolest Projects {{year}}: Bienvenue

```
Salut {{user.firstname}},

Tu as activé avec succès ton projet '{{project.title}}' !

Utilise le lien 'Accéder à mon projet' pour ouvrir ta page. Tu peux y :
- modifier tes données personnelles (sauf l'e-mail, l'âge, ...)
- modifier le nom et la description de ton projet
- inviter des co-participants via le bouton 'CO-WORKERS' (max. 3)

Seul le ou la propriétaire du projet peut modifier le projet.

Le bouton ne fonctionne pas ? Copie et colle ce lien complet dans ton navigateur : {{url}}

Des questions ? Contacte-nous à info@coderdojobelgium.be

Coolest Projects Team Belgium
```

### Bienvenue (co-participant) (`welcomeCoWorker`)

**Subject:** Coolest Projects {{year}}: Bienvenue

```
Salut {{user.firstname}},

Tu as bien rejoint le projet '{{project.title}}'.

Seul le ou la propriétaire du projet peut modifier le projet. Utilise le lien 'Accéder à mon projet' pour ouvrir ta page. Tu peux y :
- afficher les informations du projet
- quitter le projet et créer le tien

Le bouton ne fonctionne pas ? Copie et colle ce lien complet dans ton navigateur : {{url}}

Des questions ? Contacte-nous à info@coderdojobelgium.be

Coolest Projects Team Belgium
```

### Liste d'attente (`waiting`)

**Subject:** Coolest Projects {{year}}: Bienvenue sur la liste d'attente

```
Salut {{registration.firstname}},

Nous sommes très heureux de voir que tu participes à la prochaine édition de Coolest Projects Belgium {{year}} !
{{#if registration.email_guardian}}
Tes parents reçoivent également ce courrier.
{{/if}}
Tu es sur la liste d'attente : cela signifie que tu recevras un mail d'activation dès qu'une place se libère.

Des questions ? Contacte-nous à info@coderdojobelgium.be

Bonne chance, {{registration.firstname}} !

Coolest Projects Team Belgium
```

### Lien de connexion (`ask4Token`)

**Subject:** Coolest Projects {{year}}: Ton lien de connexion

```
Salut {{user.firstname}},

Utilise le lien 'Accéder à mon projet' pour ouvrir ton projet.

Le bouton ne fonctionne pas ? Copie et colle ce lien complet dans ton navigateur : {{url}}

Des questions ? Contacte-nous à info@coderdojobelgium.be

Coolest Projects Team Belgium
```

### E-mail déjà enregistrée (`emailExists`)

**Subject:** Coolest Projects {{year}}: Attention, une inscription à Coolest Projects avec ton adresse mail est déjà enregistrée.

```
Salut,

Attention ! Une inscription à Coolest Projects avec ton adresse mail est déjà enregistrée.

Si tu as essayé de t'inscrire, sache que tu es déjà associé à un Coolest Project. Vérifie ta boîte mail pour trouver le mail d'activation ou de bienvenue afin d'accéder à ton projet et à tes informations personnelles.

Si ton lien ne fonctionne plus, utilise le bouton "Connexion" sur la page principale pour recevoir un nouvel accès via ton adresse e-mail.

Si tu n'as pas fait de nouvelle demande d'inscription toi-même, tu peux ignorer ce courriel en toute sécurité. Il n'y a aucun risque pour la prise en compte de ton enregistrement. Ne partage jamais les liens que tu as reçus de notre part avec quelqu'un d'autre.

Des questions ? Contacte-nous à info@coderdojobelgium.be

Coolest Projects Team Belgium
```
