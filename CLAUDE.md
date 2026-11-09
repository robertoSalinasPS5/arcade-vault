# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Qué es

Arcade Vault: plataforma web para jugar juegos arcade online y competir por la mayor puntuación.
Ahora mismo es el esqueleto recién generado por `create-next-app` (`app/page.tsx` y
`app/layout.tsx` siguen siendo los de plantilla); el producto real está diseñado en
`references/templates/` y aún no se ha portado.

**Excepción a las convenciones de `../CLAUDE.md`**: este proyecto *no* es JS vanilla. Es
Next.js 16 (App Router) + React 19 + TypeScript estricto + Tailwind v4, con `package.json`,
npm y ESLint. Lo que sí se mantiene: textos de UI, README y commits en español.

## Comandos

```bash
npm run dev     # servidor de desarrollo (Turbopack) en http://localhost:3000
npm run build   # build de producción; también hace el type-check de TS
npm run lint    # ESLint (flat config: next core-web-vitals + typescript)
npx tsc --noEmit  # type-check sin build
```

No hay suite de tests ni framework de testing configurado. Verificar un cambio = `npm run lint`,
`npm run build` y probarlo en el navegador con `npm run dev`.

## Next.js 16: no fiarse de la memoria

`AGENTS.md` (importado arriba) obliga a leer `node_modules/next/dist/docs/` antes de escribir
código de Next — esta versión tiene APIs y convenciones distintas a las de entrenamiento.
`next dev` regenera ese bloque en `AGENTS.md`; no lo borres.

`next.config.ts` activa opciones que cambian cómo se escribe el código, consúltalas en los docs:

- `cacheComponents: true` — modelo de caché de Cache Components (`"use cache"`, Suspense para
  datos dinámicos); afecta a cómo se hace data fetching en Server Components.
- `partialPrefetching: true` y `experimental.agentFeedback: true`.
- Tailwind v4 se procesa vía la regla de Turbopack `@tailwindcss/turbopack` sobre `*.css`
  (no hay `tailwind.config` ni PostCSS config); el tema se define con `@theme` en
  `app/globals.css`.
- `LayoutProps<"/">` / `PageProps` son helpers de tipos globales generados por Next (en
  `.next/types`), no imports.

Alias de imports: `@/*` → raíz del proyecto.

## `references/templates/`: el diseño de referencia

Prototipo HTML completo (abrir `references/templates/Arcade Vault.html`) hecho con React 18 UMD
+ Babel en el navegador. Es la especificación visual y funcional a portar a Next; **no es código
de la app** — no lo importes ni lo modifiques, reescríbelo como componentes TSX.

- `app.jsx` — router casero por `location.hash` (JSON serializado) con 5 pantallas:
  `biblioteca` (catálogo con filtro por categoría), `detalle` (ficha del juego), `player`
  (reproductor con HUD, pausa, fin de partida y guardado de puntuación), `auth` (login/registro)
  y `salon` (salón de la fama / rankings). En Next cada una debería ser una ruta real del App Router.
- Estado global en `App`: usuario en `localStorage["av_user"]`, puntuaciones en
  `localStorage["av_scores"]`. No hay backend.
- `data.jsx` — datos mock: `GAMES` (id, título, descripciones, `cat`, clase de portada `cover-*`,
  color de acento, récord, partidas), `CATS` y `seededScores()` (rankings pseudoaleatorios
  deterministas por semilla).
- `reproductor.jsx` simula la partida (la puntuación sube con un `setInterval`); los juegos
  reales aún no existen.
- `styles.css` — tema retro-neón: variables CSS (`--bg`, `--ink`, `--cyan`, `--magenta`,
  `--yellow`, `--green`, `--gold/silver/bronze`…), fuentes `Press Start 2P` (`--pixel`) y
  `JetBrains Mono` (`--mono`), clases `av-*`, `btn`, `cover-*`. Al portar, llevar estas variables
  al `@theme` de Tailwind en vez de copiar el CSS tal cual.

## Flujo de trabajo

El proyecto se desarrolla con *Spec Driven Design* usando las skills `/spec` y `/spec-impl` de
`Klerith/fernando-skills`, instaladas en el proyecto: viven en `.agents/skills/` (versionadas,
fijadas en `skills-lock.json`) y `.claude/skills/` son symlinks hacia ellas. Para actualizarlas,
`npx skills@latest add Klerith/fernando-skills`; no edites los `SKILL.md` a mano.

- `/spec` solo escribe la spec en `specs/NN-slug.md` en estado `Borrador`/`Draft`; pasarla a
  `Aprobado` lo hace el usuario, nunca el agente.
- `/spec-impl NN-slug` solo implementa specs aprobadas, crea su propia rama `spec-NN-slug`
  (controlado por `AutoCreateBranch` en `specs/.spec-config.yml`), avanza paso a paso pausando
  para revisar el diff y no hace commit salvo petición explícita.
- Las ramas de configuración/infraestructura fuera de specs siguen el patrón `NN-nombre`
  (p. ej. `01-config`).
