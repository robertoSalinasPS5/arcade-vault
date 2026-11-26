# SPEC 02 — Pantallas Home y Acerca de
> **Estado:** Implementado
> **Depende de:** SPEC 01
> **Fecha:** 2026-11-26
> **Objetivo:** Portar la landing (Home) y la pantalla Acerca de con contacto de `references/templates/home-about/` a las rutas `/` y `/acerca`, moviendo la biblioteca a `/juegos`.

## Por qué existe esta spec

La referencia `references/templates/home-about/` añade dos pantallas al prototipo: una landing que pasa a ser la portada del sitio y una pantalla Acerca de con formulario de contacto.
En esa referencia el logo lleva a la Home y la barra tiene dos enlaces nuevos, "Inicio" y "Acerca de".
Hoy la biblioteca de la SPEC 01 ocupa `/`, así que hay que moverla para dejar sitio a la landing.

## Alcance

**Dentro:**

- Mover la biblioteca de `/` a `/juegos`, con el mismo contenido y comportamiento que en la SPEC 01.
- Pantalla **Home** en `/`, portada de `home.jsx` en este orden:
  - hero con siluetas pixel flotantes, título de tres líneas y los botones EXPLORAR JUEGOS y CREAR CUENTA;
  - `// 01 ¿POR QUÉ ARCADE VAULT?` con 4 tarjetas;
  - `// 02 JUEGOS DISPONIBLES AHORA` con los 6 primeros juegos de `GAMES`;
  - franja de estadísticas;
  - `// 03 ACTIVIDAD EN VIVO` con las últimas puntuaciones y el top de jugadores;
  - `// 04 PRECIOS` con la tarjeta del plan y el FAQ;
  - CTA final ¿LISTO PARA JUGAR?.
- Pantalla **Acerca de** en `/acerca`, portada de `about.jsx`:
  - hero con la misión y tres destacados;
  - divisor de píxeles animados;
  - bloque de contacto con formulario.
- Formulario de contacto simulado, como en el prototipo:
  - **Validación:** si algún campo está vacío, el formulario hace la animación `shake`.
  - **Éxito:** si los tres tienen texto, muestra la terminal `VAULT-OS // TERMINAL`.
  - **Reinicio:** ENVIAR OTRO MENSAJE vacía el formulario.
- Animación de aparición al hacer scroll (`.reveal` → `.reveal.in` con `IntersectionObserver`, umbral `0.12`). Con `prefers-reduced-motion: reduce` las secciones se muestran sin animar.
- Barra de navegación:
  - **Logo:** lleva a `/`.
  - **Enlaces, en este orden:** Inicio (`/`), Biblioteca (`/juegos`), Salón de la Fama (`/salon`), Acerca de (`/acerca`). Aparecen tanto en la barra como en el panel móvil.
- Redirigir a `/juegos` los enlaces de la SPEC 01 que hoy apuntan a `/`. La 404 sigue llevando a `/`.
- Las clases CSS nuevas de `references/templates/home-about/styles.css`, añadidas tal cual a `app/globals.css`.
- `metadata` propia en `/acerca` y en `/juegos`.

**Fuera de alcance (para specs futuras):**

- Envío real del formulario de contacto: ni backend, ni correo, ni `mailto:`, ni guardado en `localStorage`.
- Datos reales en ACTIVIDAD EN VIVO y TOP JUGADORES · HOY: son listas fijas copiadas de la referencia.
- Ajustar los textos de la referencia a los datos reales del catálogo. Se copian literal: "12+ JUEGOS" y "Arkanoid, Tetris, Snake".
- Que CREAR CUENTA o EMPEZAR GRATIS abran directamente la pestaña CREAR CUENTA de `/acceso`.
- Redirecciones desde la antigua URL de la biblioteca: `/` pasa a ser la Home sin aviso.
- Tests automáticos.

## Modelo de datos

Esta feature no introduce datos persistentes ni cambia `lib/games.ts` ni `lib/storage.ts`.
Reutiliza `GAMES` de la SPEC 01 para el carrusel de la Home (`GAMES.slice(0, 6)`).

El resto son constantes estáticas, locales al archivo que las pinta y copiadas literal de la referencia:

```ts
// app/page.tsx — contenido fijo de la Home
type Accent = "cyan" | "magenta" | "yellow" | "green";
type Feature = { icon: "GAMEPAD" | "FREE" | "TROPHY" | "ROCKET"; title: string; desc: string; color: Accent };
type Stat = { n: string; u: string; s: string };                                  // "12+", "JUEGOS", "Y CONTANDO"
type Tick = { player: string; game: string; score: number; ago: string; color: Accent }; // 7 filas
type TopPlayer = { rank: number; player: string; score: number };                // 5 filas

// app/acerca/page.tsx
type Highlight = { icon: "HEART" | "BROWSER" | "PLANT"; text: string; color: "magenta" | "cyan" | "green" };

// components/contact-form.tsx — estado local, se pierde al salir de la página
type ContactDraft = { name: string; email: string; msg: string };
// sent: string | null → nombre con el que se envió; null mientras se muestra el formulario
```

Convenciones:

- Los números se muestran con `toLocaleString("es-ES")`, igual que en la SPEC 01.
- La barra de cada fila del top mide `100 - i * 16` % de ancho, como en la referencia.

## Plan de implementación

1. **CSS.**
   - Añadir al final de `app/globals.css` las reglas nuevas de `references/templates/home-about/styles.css`: las líneas 928–1725 que no existen en `references/templates/styles.css`.
   - Añadir `@media (prefers-reduced-motion: reduce) { .reveal { opacity: 1; transform: none; transition: none; } }`.
   - Prueba manual: `npm run build` pasa y las pantallas de la SPEC 01 se ven igual.
2. **Biblioteca a `/juegos`.**
   - Crear `app/juegos/page.tsx` con el contenido actual de `app/page.tsx` (hero ARCADE VAULT + `<Library />`) y el título `Biblioteca · Arcade Vault`.
   - En `components/nav.tsx`, el enlace Biblioteca pasa a `/juegos` y queda activo en `/juegos` y en `/juegos/*`.
   - Cambiar a `/juegos` estos enlaces:
     - VOLVER AL VAULT en `app/juegos/[id]/page.tsx` y en `components/game-player.tsx`;
     - VOLVER A LA BIBLIOTECA en `components/hall-of-fame.tsx`;
     - los dos `router.push("/")` de `components/auth-form.tsx`.
   - `/` sigue mostrando temporalmente la biblioteca.
   - Prueba manual: `/juegos` muestra los 8 juegos y VOLVER AL VAULT del detalle lleva a `/juegos`.
3. **Ilustraciones pixel.**
   - Crear `components/pixel-art.tsx`, sin `"use client"`, con `FloatingSilhouettes`, `FeatureIcon({ kind })` y `HighlightIcon({ kind })`.
   - Los SVG se portan 1:1 de `home.jsx` y `about.jsx`, con `aria-hidden` en lo decorativo.
   - Prueba manual: `npx tsc --noEmit` pasa.
4. **Aparición al hacer scroll.**
   - Crear `components/reveal-on-scroll.tsx` (`"use client"`), que no pinta nada.
   - Al montar observa los `.reveal` de la página, les añade `in` al entrar en pantalla y desconecta el observer al desmontar.
   - Prueba manual: `npm run lint` pasa sin avisos de `react-hooks`.
5. **Home, primera mitad.**
   - Sustituir `app/page.tsx` por la Home: hero, `// 01` y `// 02` con `components/mini-card.tsx`. Cada mini-tarjeta es un `Link` a `/juegos/<id>`.
   - Destinos: EXPLORAR JUEGOS lleva a `/juegos`, CREAR CUENTA a `/acceso` y VER TODOS LOS JUEGOS → a `/juegos`.
   - Añadir el enlace "Inicio" a la barra y al panel móvil, activo solo en `/`. El logo pasa a llevar a `/`.
   - Prueba manual: `/` muestra el hero y 6 mini-tarjetas, y la de CAÍDA lleva a `/juegos/caida`.
6. **Home, segunda mitad.**
   - Añadir a `app/page.tsx` las estadísticas, `// 03 ACTIVIDAD EN VIVO`, `// 04 PRECIOS` y el CTA final.
   - Destinos: VER SALÓN → lleva a `/salon`, EMPEZAR GRATIS → a `/acceso` e INSERTAR MONEDA → a `/juegos`.
   - Montar `<RevealOnScroll />` en la página.
   - Prueba manual: al bajar, cada sección aparece con el desvanecido, y el top muestra 5 filas con las tres primeras destacadas.
7. **Acerca de.**
   - Crear `app/acerca/page.tsx`, Server Component con título `Acerca de · Arcade Vault`. Lleva el hero, los tres destacados, el divisor de 24 píxeles y el bloque de introducción de contacto, con `<RevealOnScroll />`.
   - El formulario queda como hueco vacío hasta el paso 8.
   - Añadir el enlace "Acerca de" a la barra y al panel móvil, activo en `/acerca`.
   - Prueba manual: `/acerca` carga y el enlace activo es "Acerca de".
8. **Formulario de contacto.**
   - Crear `components/contact-form.tsx` (`"use client"`) con los campos NOMBRE, CORREO ELECTRÓNICO y MENSAJE.
   - Al enviar:
     - **Algún campo vacío:** activa `shake` durante 400 ms. El temporizador se limpia al desmontar.
     - **Los tres con texto:** muestra la terminal con `GRACIAS, <NOMBRE EN MAYÚSCULAS>.`.
   - ENVIAR OTRO MENSAJE vacía el formulario y vuelve a él.
   - Prueba manual: enviar vacío hace la animación, y enviar con datos muestra la terminal.
9. **Metadata y comprobaciones.**
   - Revisar que `/`, `/juegos` y `/acerca` tienen títulos distintos y que no queda ningún enlace a `/` que debiera ir a `/juegos`.
   - Prueba manual: `npm run lint` y `npm run build` pasan.

## Criterios de aceptación

**Build y estructura**

- [ ] `npm run lint` termina sin errores.
- [ ] `npm run build` termina sin errores, y `/`, `/juegos` y `/acerca` aparecen como rutas estáticas.
- [ ] Ninguna ruta muestra errores ni avisos de hidratación en la consola del navegador.
- [ ] Ningún archivo de `app/`, `components/` ni `lib/` importa nada de `references/`.

**Biblioteca y enlaces movidos**

- [ ] `/juegos` muestra la biblioteca con los 8 juegos, el buscador y los chips de la SPEC 01.
- [ ] VOLVER AL VAULT en el detalle y en el reproductor lleva a `/juegos`.
- [ ] VOLVER A LA BIBLIOTECA en el salón lleva a `/juegos`.
- [ ] Iniciar sesión y JUGAR COMO INVITADO en `/acceso` llevan a `/juegos`.
- [ ] El botón de la 404 lleva a `/`.

**Barra de navegación**

- [ ] La barra muestra Inicio, Biblioteca, Salón de la Fama y Acerca de, en ese orden. El logo lleva a `/`.
- [ ] El enlace activo es:
  - Inicio en `/`;
  - Biblioteca en `/juegos`, `/juegos/<id>` y `/juegos/<id>/jugar`;
  - Salón de la Fama en `/salon`;
  - Acerca de en `/acerca`.
- [ ] Con 375 px de ancho, el panel del botón ≡ muestra los cuatro enlaces y navega con ellos.

**Home**

- [ ] `/` muestra el título de tres líneas `EL ARCADE` / `CLÁSICO ESTÁ` / `DE VUELTA` y 8 siluetas flotantes.
- [ ] En el hero, EXPLORAR JUEGOS lleva a `/juegos` y CREAR CUENTA a `/acceso`.
- [ ] `// 02` muestra exactamente 6 mini-tarjetas, de BLOQUE BUSTER a ROCAS, y cada una lleva a `/juegos/<id>` de su juego.
- [ ] TOP JUGADORES · HOY muestra 5 filas, de `#01 NEONFOX 312.840` a `#05 GLITCHA 138.900`, y VER SALÓN → lleva a `/salon`.
- [ ] Botones de precios y CTA final:
  - EMPEZAR GRATIS → lleva a `/acceso`;
  - INSERTAR MONEDA → lleva a `/juegos`.

**Animación de aparición**

- [ ] Al cargar `/`, las secciones con `.reveal` que quedan por debajo de la pantalla empiezan ocultas y aparecen al hacer scroll hasta ellas.
- [ ] Con `prefers-reduced-motion: reduce` activado, todas las secciones `.reveal` se ven sin hacer scroll.

**Acerca de**

- [ ] `/acerca` muestra ACERCA DE ARCADE VAULT, los tres destacados y el bloque CONTÁCTANOS.
- [ ] Enviar el formulario con algún campo vacío hace la animación `shake` y no muestra la terminal.
- [ ] Enviar con nombre `px_kai`, un correo y un mensaje muestra la terminal con `GRACIAS, PX_KAI.`.
- [ ] ENVIAR OTRO MENSAJE vuelve al formulario con los tres campos vacíos.

**Metadatos**

- [ ] `/`, `/juegos` y `/acerca` tienen un `<title>` distinto.

**Comparación con la referencia**

- [ ] Con `references/templates/home-about/arcade-vault-standalone.html` servido en local, la comparación con Playwright de Home y Acerca de a 1440 px y 375 px no muestra diferencias de geometría ni de estilos. Las únicas diferencias admitidas son:
  - las debidas a animaciones (`float`, `blink`, `gridscroll`);
  - las del indicador de desarrollo de Next.

## Decisiones

- **Sí:** la Home en `/` y la biblioteca en `/juegos`. La landing es la entrada del sitio, como en la referencia, y `/juegos` encaja con `/juegos/[id]`.
- **No:** dejar la biblioteca en `/` y poner la Home en `/inicio`. El logo y la portada no coincidirían con la referencia.
- **Sí:** VOLVER AL VAULT, VOLVER A LA BIBLIOTECA y las redirecciones de `/acceso` van a `/juegos`. En el prototipo llevan a la biblioteca.
- **Sí:** la 404 lleva a `/`. Quien llega por un enlace roto entra por la portada.
- **Sí:** formulario de contacto simulado, como el prototipo. Así se pueden revisar los estados (vacío, error y enviado) sin decidir aún un canal de envío.
- **No:** guardar los mensajes en `localStorage`. Serían datos que nadie lee.
- **No:** `mailto:`. Exigiría un correo de destino real que no está decidido.
- **Sí:** copiar los textos literal de la referencia, aunque no cuadren con el catálogo ("12+ JUEGOS", "Arkanoid, Tetris, Snake"). Mantiene la fidelidad 1:1 de la SPEC 01. Cambiar el copy es una decisión de producto aparte.
- **Sí:** aparición al hacer scroll como el prototipo, con excepción para `prefers-reduced-motion`. Sigue el criterio del *tilt* de las tarjetas en la SPEC 01.
- **Sí:** las clases nuevas van a `app/globals.css` tal cual. Mismo criterio que la SPEC 01, y así la comparación píxel a píxel con la referencia es directa.
- **No:** un archivo CSS aparte. Seguiría siendo CSS global y solo partiría el tema en dos sitios.
- **No:** reescribir con utilidades de Tailwind. Supone mucho trabajo y riesgo de diferencias visuales.
- **Sí:** la Home y Acerca de son Server Components. Solo `RevealOnScroll` y `ContactForm` llevan `"use client"`, así ambas páginas se prerenderizan como estáticas.
- **Sí:** el contenido fijo (tarjetas, estadísticas, actividad, top y FAQ) vive como constantes en el archivo de cada página. Solo lo usa esa página y no merece un módulo en `lib/`.
- **Sí:** verificar con Playwright contra `arcade-vault-standalone.html`. Hace falta servirlo en local, y ese servidor lo arranca o autoriza el usuario.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Con `.reveal` a `opacity: 0`, una sección queda invisible si el observer no llega a ejecutarse (error de JS o hidratación fallida). | `RevealOnScroll` se monta en la propia página. Con `prefers-reduced-motion` el CSS muestra todo sin depender de JS. El criterio de "sin errores en consola" cubre el resto. |
| Las `@keyframes` `bounce`, `float` y `shake` de la referencia pueden chocar con las animaciones del tema de Tailwind v4. | Al portar el CSS, comprobar en el CSS servido que cada `@keyframes` aparece una sola vez. Si alguno choca, renombrarlo con prefijo `av-`, como ya se hizo con `av-pulse`. |
| Al mover la biblioteca, algún enlace a `/` que debía ir a `/juegos` se queda sin cambiar. | El paso 2 lista los enlaces exactos y el paso 9 busca en `app/` y `components/` cualquier `"/"` restante. |
| `.field` ya existe en `globals.css` (pantalla de acceso), y la referencia le añade estilos para `textarea`. | Las reglas nuevas solo añaden selectores. Comprobar con Playwright que `/acceso` no cambia. |
| El temporizador de `shake` sigue vivo si el usuario sale de `/acerca` durante la animación. | El componente limpia el `setTimeout` al desmontar. |
| No se puede servir `references/` para comparar, porque el modo automático bloquea el servidor estático. | El usuario arranca `python3 -m http.server` o autoriza el comando antes del criterio de comparación. |

## Lo que **no** entra en esta spec

- Envío real del formulario de contacto (backend, correo o `mailto:`).
- Actividad en vivo y top de jugadores con datos reales.
- Corregir los textos de la referencia para que cuadren con el catálogo.
- Abrir `/acceso` directamente en la pestaña CREAR CUENTA.
- Redirección desde la antigua biblioteca en `/`.
- Tests automáticos.

Cada uno de estos, si llega, va en su propia spec.
