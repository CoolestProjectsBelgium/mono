# Coolest Projects: emails (EN)

Corrected system emails (ready to use), critical review and the original emails for reference.

## Corrected emails (ready to use)

### Confirm registration (`registration`)

**Subject:** Coolest Projects {{year}}: Please confirm your registration

```
Hi {{registration.firstname}},

We're very pleased that you want to participate in the next Coolest Projects Belgium {{year}}!
{{#if registration.email_guardian}}
Your parents also received this mail. Either you or they need to confirm your participation.
{{/if}}
Click the activation link to confirm your registration. Make sure to do this within 2 days to secure your participation.

Button not working? Copy and paste this full link into your browser: {{url}}

Questions? Contact us at info@coderdojobelgium.be

Coolest Projects Team Belgium
```

### Welcome (project owner) (`welcomeOwner`)

**Subject:** Coolest Projects {{year}}: Welcome

```
Hi {{user.firstname}},

You have successfully activated your project '{{project.title}}'!

Use the 'Go to my project' link to open your page. There you can:
- change your personal data (except email, age, ...)
- change your project name and description
- invite co-workers to your project via the 'CO-WORKERS' button (max. 3)

Only the project owner can make changes to the project.

Button not working? Copy and paste this full link into your browser: {{url}}

Questions? Contact us at info@coderdojobelgium.be

Coolest Projects Team Belgium
```

### Welcome (co-worker) (`welcomeCoWorker`)

**Subject:** Coolest Projects {{year}}: Welcome

```
Hi {{user.firstname}},

You have successfully joined the project '{{project.title}}' as a co-worker.

Only the project owner can make changes to the project. Use the 'Go to my project' link to open your page. There you can:
- view the project information
- leave the project and create your own

Button not working? Copy and paste this full link into your browser: {{url}}

Questions? Contact us at info@coderdojobelgium.be

Coolest Projects Team Belgium
```

### Waiting list (`waiting`)

**Subject:** Coolest Projects {{year}}: Welcome to the waiting list

```
Hi {{registration.firstname}},

We're very pleased that you want to participate in the next Coolest Projects Belgium {{year}}!
{{#if registration.email_guardian}}
Your parents also received this mail.
{{/if}}
You are on the waiting list. This means you will receive an activation mail as soon as a spot becomes available.

Questions? Contact us at info@coderdojobelgium.be

Good luck, {{registration.firstname}}!

Coolest Projects Team Belgium
```

### Login link (`ask4Token`)

**Subject:** Coolest Projects {{year}}: Your login link

```
Hi {{user.firstname}},

Use the 'Go to my project' link to open your project.

Button not working? Copy and paste this full link into your browser: {{url}}

Questions? Contact us at info@coderdojobelgium.be

Coolest Projects Team Belgium
```

### Email already exists (`emailExists`)

**Subject:** Coolest Projects {{year}}: Attention please, there was an additional registration with your email address.

```
Hi,

Attention please, there was an additional registration with your email address.

If you tried to register yourself, please note that you already have a Coolest Project. Check your email folder for the activation or confirmation email to access your project and user information.

If your link no longer works, use the Login button on the main page to request a new login token for your email address.

If you did not make a new registration request yourself, you can safely ignore this mail. There is no risk that your registration has been taken over. Never share links that you received from us with anyone else.

Questions? Contact us at info@coderdojobelgium.be

Coolest Projects Team Belgium
```
