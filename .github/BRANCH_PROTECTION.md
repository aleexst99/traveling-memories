# Branch Protection Rules

## Configuración recomendada

Para evitar que código roto llegue a `main` o `dev`, configura estas reglas en GitHub:

**GitHub → Settings → Branches → Add rule**

### Rama `main`

| Opción | Valor |
|--------|-------|
| Branch name pattern | `main` |
| Require status checks to pass before merging | ✅ |
| Status checks requeridos | `Tests`, `Build (producción)` |
| Require branches to be up to date | ✅ |
| Do not allow bypassing the above settings | ✅ |

### Rama `dev`

| Opción | Valor |
|--------|-------|
| Branch name pattern | `dev` |
| Require status checks to pass before merging | ✅ |
| Status checks requeridos | `Tests`, `Build (staging)` |
| Require branches to be up to date | ✅ |

## Efecto

Con estas reglas activas:
- No se puede hacer merge a `main`/`dev` si los tests fallan
- No se puede hacer push directo a `main` (solo vía PR)
- Vercel solo despliega código que ha pasado la CI
