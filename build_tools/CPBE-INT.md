# CDJ web INT — Level27 deploy

Published to `public_html/cdj-web-int` on the static PHP components:

| Env | Component | SSH user | Path |
|-----|-----------|----------|------|
| dev | `static-dev` | `vd35113` | `public_html/cdj-web-int` |
| prod | `static-prod` | `vd35114` | `public_html/cdj-web-int` |

```bash
npm run archive-cpbe
npm run deploy -- --app cdj-web-int --env prod
```

Photos are gitignored; `archive-cpbe` must run before deploy so pack can include `apps/cdj-web-int/images/`.
