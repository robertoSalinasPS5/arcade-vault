# SPEC 01 — MVP visual: las cinco pantallas de Arcade
> **Estado:** Implementado
> **Depende de:** —
> **Fecha:** 2026-11-18
> **Objetivo:** Portar a rutas reales del App Router las cinco pantallas del prototipo de `references/templates/` (biblioteca, detalle, reproductor, acceso y salón de la fama) con datos mock y sin ningún juego real.

## Por qué existe esta spec

El prototipo de `references/templates/` es un HTML con React UMD, Babel en el navegador y un router casero por `location.hash`.
La app de Next solo tiene una portada provisional (`app/page.tsx`), aunque el tema visual ya está portado entero en `app/globals.css`.
Esta spec convierte el prototipo en la base navegable del producto, para que las specs siguientes (juegos reales, backend, rankings reales) tengan dónde enchufarse.

## Alcance

**Dentro:**

- Datos mock tipados en `lib/games.ts`: `GAMES`, `CATS`, `seededScores()` y una función `getGame(id)`.
- Estado de usuario y puntuaciones simulado con `localStorage` (`av_user`, `av_scores`), igual que el prototipo.
- Barra de navegación (`Nav`) con panel móvil, contador decorativo `CRÉDITOS · 03` y pie de página, presentes en todas las rutas.
- Pantalla **Biblioteca** en `/`: hero, buscador por nombre, chips de categoría, rejilla de tarjetas con efecto *tilt* y estado "NO HAY RESULTADOS".
- Pantalla **Detalle** en `/juegos/[id]`: portada, etiquetas, descripción larga, franja de estadísticas, botones JUGAR AHORA y VOLVER AL VAULT, y ranking mock de 10 filas.
- Pantalla **Reproductor** en `/juegos/[id]/jugar`: HUD, pantalla CRT con la arena decorativa y una partida simulada (puntuación que sube con un intervalo, PAUSA/REANUDAR, FIN, modal de fin de juego, GUARDAR PUNTUACIÓN y JUGAR DE NUEVO).
- Pantalla **Acceso** en `/acceso`: pestañas INICIAR SESIÓN / CREAR CUENTA, formulario sin validación real, JUGAR COMO INVITADO y botones sociales decorativos.
- Pantalla **Salón de la Fama** en `/salon?juego=<id>`: pestaña por juego, podio, tabla de 12 filas y fila "TU MEJOR MARCA" con valores mock si hay usuario.
- Página 404 propia (`app/not-found.tsx`) en el tema neón, usada por ids de juego inexistentes y por cualquier ruta desconocida.
- `metadata` con título propio en cada ruta.

**Fuera de alcance (para specs futuras):**

- Cualquier juego real: el reproductor solo simula la partida.
- Backend, base de datos, API routes o Server Actions.
- Autenticación real: sin contraseñas comprobadas, sin OAuth (GOOGLE y GITHUB no hacen nada).
- Mostrar en los rankings las puntuaciones guardadas en `av_scores`.
- Menú desplegable de usuario: pulsar el nombre cierra la sesión directamente, como en el prototipo.
- Créditos funcionales: `CRÉDITOS · 03` es texto fijo.
- Tests automáticos.

## Modelo de datos

```ts
// lib/games.ts — datos mock portados de references/templates/data.jsx
export type Category = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
export type AccentColor = "cyan" | "magenta" | "yellow" | "green";

export type Game = {
  id: string;        // slug usado en la URL: "bloque-buster", "caida"…
  title: string;
  short: string;
  long: string;
  cat: Category;
  cover: `cover-${string}`; // clase CSS ya definida en app/globals.css
  color: AccentColor;
  best: number;
  plays: string;     // ya formateado: "12.4K"
};

export type ScoreRow = { rank: number; name: string; score: number; date: string }; // date "DD/MM/2026"

export const CATS = ["TODOS", "ARCADE", "PUZZLE", "SHOOTER", "VERSUS"] as const;
export const GAMES: Game[];                                   // los 8 juegos del prototipo, sin cambios
export function getGame(id: string): Game | undefined;
export function seededScores(seed: number, count?: number): ScoreRow[]; // mismo algoritmo y semillas que el prototipo
```

```ts
// lib/storage.ts — mock de persistencia en localStorage
export type User = { name: string };                          // nombre en mayúsculas, máx. 10 caracteres
export type ScoreEntry = { game: string; score: number; name: string; at: number }; // at = Date.now()

// Claves exactas, compatibles con el prototipo:
//   "av_user"   → JSON de User, o ausente si no hay sesión
//   "av_scores" → JSON de ScoreEntry[]
```

Convenciones:

- Las semillas de los rankings son las del prototipo: detalle `id.length * 17 + 3` (10 filas), salón `id.length * 23 + 7` (12 filas).
- Los números se muestran con `toLocaleString("es-ES")`.
- El usuario vive en un Context de React (`components/user-provider.tsx`) que lee `av_user` **después de montar**, para que el HTML del servidor y el primer render del cliente coincidan.
- Todo acceso a `localStorage` va dentro de `try/catch`; si falla, la app sigue funcionando sin persistir.

## Plan de implementación

1. **Datos mock.** Crear `lib/games.ts` con los tipos, `GAMES`, `CATS`, `getGame()` y `seededScores()` portados de `data.jsx`. Prueba manual: `npx tsc --noEmit` pasa.
2. **Estado de usuario.** Crear `lib/storage.ts` (leer/escribir `av_user`, añadir a `av_scores`) y `components/user-provider.tsx` (`"use client"`, Context con `user`, `login(user)`, `logout()` y `saveScore(entry)`, más un hook `useUser()`). Envolver `{children}` con el provider en `app/layout.tsx`. Prueba manual: la portada provisional sigue cargando sin errores de hidratación.
3. **Navegación y pie.** Crear `components/nav.tsx` (`"use client"`, `Link` de `next/link`, enlace activo con `usePathname()`: Biblioteca está activa en `/` y en `/juegos/*`, y Salón en `/salon`), con el panel móvil y el botón de sesión. Añadir `<Nav />`, `<main className="av-main">` y el pie `© 2026 ARCADE VAULT · HECHO CON PIXELES Y NEÓN · v2.6.0` en `app/layout.tsx`. Prueba manual: la barra aparece y el menú hamburguesa abre y cierra el panel en móvil.
4. **Biblioteca.** Crear `components/game-card.tsx` (tilt con el ratón; la tarjeta y JUGAR enlazan a `/juegos/[id]`) y `components/library.tsx` (`"use client"`, búsqueda y chips). Sustituir la portada provisional de `app/page.tsx`. Prueba manual: filtrar por "ARCADE" muestra 4 juegos y buscar "zzz" muestra NO HAY RESULTADOS.
5. **Página 404.** Crear `app/not-found.tsx` con el tema neón y un enlace VOLVER AL VAULT a `/`. Prueba manual: `/no-existe` muestra la 404.
6. **Detalle.** Crear `app/juegos/[id]/page.tsx` (Server Component, `generateStaticParams` con los 8 ids, `notFound()` si `getGame` devuelve `undefined`, `generateMetadata` con el título del juego) y `components/leaderboard.tsx`. Prueba manual: `/juegos/caida` muestra CAÍDA con 10 filas y `/juegos/xyz` muestra la 404.
7. **Reproductor.** Crear `app/juegos/[id]/jugar/page.tsx` (servidor: valida el id y genera los params estáticos) y `components/game-player.tsx` (`"use client"`, la simulación, el HUD, la CRT y el modal de `reproductor.jsx`; GUARDAR PUNTUACIÓN llama a `saveScore`). SALIR vuelve a `/juegos/[id]` y VOLVER AL VAULT va a `/`. Prueba manual: PAUSA congela la puntuación, FIN abre el modal y guardar añade una entrada a `av_scores`.
8. **Acceso.** Crear `app/acceso/page.tsx` y `components/auth-form.tsx` (`"use client"`). Enviar el formulario hace `login({ name: (usuario || "PLAYER1").toUpperCase().slice(0, 10) })` y navega a `/`. JUGAR COMO INVITADO hace `logout()` y navega a `/`. Prueba manual: entrar como `px_kai` muestra `PX_KAI ▾` en la barra.
9. **Salón de la Fama.** Crear `app/salon/page.tsx` y `components/hall-of-fame.tsx` (`"use client"`, lee `?juego=` con `useSearchParams()` dentro de un `<Suspense>`, y cada pestaña cambia el parámetro con `router.replace`). Un `juego` ausente o desconocido usa el primer juego. Prueba manual: `/salon?juego=rocas` abre la pestaña ROCAS, y con sesión iniciada aparece la fila TU MEJOR MARCA.
10. **Metadata y limpieza.** Dar a cada ruta un `title` (p. ej. `Biblioteca · Arcade Vault`) y quitar el comentario de portada provisional. Prueba manual: `npm run lint` y `npm run build` pasan.

## Criterios de aceptación

- [ ] `npm run lint` termina sin errores.
- [ ] `npm run build` termina sin errores y `/`, `/juegos/[id]` y `/juegos/[id]/jugar` aparecen como rutas prerenderizadas.
- [ ] Ninguna ruta muestra errores ni avisos de hidratación en la consola del navegador.
- [ ] Ningún archivo de `app/`, `components/` ni `lib/` importa nada de `references/`.
- [ ] `/` muestra los 8 juegos. El chip ARCADE deja 4, PUZZLE 1, SHOOTER 2 y VERSUS 1.
- [ ] Buscar "ser" en la biblioteca deja solo SERPENTINA. Buscar "zzz" muestra NO HAY RESULTADOS.
- [ ] Pulsar una tarjeta o su botón JUGAR lleva a `/juegos/<id>` de ese juego.
- [ ] `/juegos/gloton` muestra GLOTÓN, `96.400` como mejor global y un ranking de 10 filas, con las tres primeras destacadas (oro, plata y bronce).
- [ ] `/juegos/no-existe` y `/juegos/no-existe/jugar` muestran la 404 neón.
- [ ] En el reproductor la puntuación sube sola. PAUSA la congela y muestra EN PAUSA, y REANUDAR la reanuda.
- [ ] FIN abre el modal con la puntuación final. GUARDAR PUNTUACIÓN muestra `▸ PUNTUACIÓN GUARDADA_` y añade un objeto `{ game, score, name, at }` a `localStorage["av_scores"]`.
- [ ] JUGAR DE NUEVO pone puntuación 0, 3 vidas y nivel 01, y cierra el modal.
- [ ] Iniciar sesión en `/acceso` como `px_kai` redirige a `/`, y la barra muestra `PX_KAI ▾`. Recargar la página conserva la sesión.
- [ ] Pulsar `PX_KAI ▾` cierra la sesión: la barra vuelve a mostrar "Iniciar Sesión" y `av_user` desaparece de `localStorage`.
- [ ] La pestaña CREAR CUENTA muestra el campo de correo electrónico, y el botón principal cambia a CREAR Y JUGAR.
- [ ] En el reproductor, el HUD muestra el nombre del usuario si hay sesión y `INVITADO` si no la hay.
- [ ] `/salon` abre la pestaña BLOQUE BUSTER. Pulsar otra pestaña actualiza `?juego=` en la URL y cambia el podio y la tabla.
- [ ] La fila TU MEJOR MARCA del salón solo aparece con sesión iniciada.
- [ ] El enlace activo de la barra es "Biblioteca" en `/`, `/juegos/<id>` y `/juegos/<id>/jugar`, y "Salón de la Fama" en `/salon`.
- [ ] Con un ancho de 375 px, los enlaces desaparecen de la barra, aparece el botón ≡ y su panel lateral navega a las tres secciones.
- [ ] Cada ruta tiene un `<title>` distinto.

## Decisiones

- **Sí:** rutas en español (`/`, `/juegos/[id]`, `/juegos/[id]/jugar`, `/acceso`, `/salon`). Son coherentes con la UI y se pueden compartir, a diferencia del hash JSON del prototipo.
- **No:** rutas en inglés. La convención del proyecto es la UI en español.
- **Sí:** la pestaña del salón se guarda en `?juego=<id>`. Así un ranking concreto se puede enlazar sin crear 8 rutas.
- **No:** `/salon/[id]`. Añade segmentos sin aportar nada en un MVP con datos mock.
- **Sí:** simular la partida igual que el prototipo. Así se pueden revisar todos los estados de la pantalla (jugando, pausa, fin y guardado) sin tener un juego real.
- **No:** un reproductor estático. Dejaría sin validar el modal y el flujo de guardado.
- **Sí:** mock en `localStorage` con las claves `av_user` y `av_scores` del prototipo. Es lo mínimo para que login, logout y guardado se puedan probar de verdad.
- **No:** dejarlo sin estado ni un Context solo en memoria. Lo primero no se puede probar y lo segundo pierde la sesión al recargar.
- **Sí:** rankings solo con `seededScores()`. Mezclar `av_scores` en ellos es otra feature y va en su propia spec.
- **Sí:** una sola spec con pasos pequeños. Todo pertenece a la misma área (portar UI con datos mock) y cada paso deja la app funcionando.
- **No:** dividirla en dos specs. La separación sería artificial: las pantallas comparten datos, navegación y estado.
- **Sí:** `components/` + `lib/` en la raíz, con `"use client"` solo en lo interactivo. Las páginas siguen siendo Server Components y así se pueden prerenderizar.
- **No:** carpetas `_components/` por ruta. Varios componentes (`Nav`, `Leaderboard`, `GameCard`) se comparten entre pantallas.
- **Sí:** `notFound()` y una 404 neón para ids inexistentes. Redirigir en silencio ocultaría enlaces rotos.
- **Sí:** reutilizar las clases `av-*`, `btn` y `cover-*` que ya están en `app/globals.css`. El tema ya está portado 1:1 y reescribirlo en utilidades de Tailwind no aporta nada a esta spec.
- **Sí:** cerrar sesión con un clic en el nombre, como el prototipo. Un menú desplegable sería un componente que no existe en el diseño.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Errores de hidratación al leer `localStorage` durante el render | El provider empieza con `user = null` y lee `av_user` en un efecto tras montar. Durante un instante la barra muestra "Iniciar Sesión" aunque haya sesión; se acepta en el MVP. |
| `useSearchParams()` con `cacheComponents: true` hace fallar el build si no está dentro de `<Suspense>` | El salón envuelve su componente cliente en `<Suspense>`. Antes de implementar, consultar `node_modules/next/dist/docs/` sobre `useSearchParams`, `params` asíncronos y `generateStaticParams` en Next 16. |
| En Next 16, `params` es una `Promise` y las APIs pueden diferir de lo que se recuerda | Leer en los docs locales la guía de rutas dinámicas antes de los pasos 6 y 7. |
| `localStorage` no disponible (modo privado o bloqueado) | Todo acceso va en `try/catch`. La app funciona sin persistir. |
| El `setInterval` del reproductor sigue corriendo tras salir de la pantalla | El efecto limpia el intervalo al desmontar y al pausar o terminar, como en el prototipo. |

## Lo que **no** entra en esta spec

- Juegos reales jugables.
- Backend, base de datos o autenticación real (OAuth incluido).
- Rankings que incluyan las puntuaciones guardadas por el usuario.
- Menú desplegable de usuario y créditos funcionales.
- Tests automáticos.

Cada uno de estos, si llega, va en su propia spec.
