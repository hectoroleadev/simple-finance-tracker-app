# SPEC 01 — Rebrand del color de acento: de verde esmeralda a pizarra (slate)

> **Status:** Implemented · **Depends on:** — · **Date:** 2026-06-27
> **Objective:** Cambiar el color de marca/acento de la app (verde esmeralda) y el icono a pizarra/grafito minimalista, conservando el verde solo para su rol semántico de "positivo".

---

## Context — por qué existe este spec

El verde esmeralda (`#10b981` / `emerald-*`) cumple hoy **dos roles distintos** en la app:

1. **Marca/acento interactivo:** icono PWA, `theme-color`, botones CTA, anillos de foco y botones de login.
2. **Semántica "positivo":** `--color-positive`, color de ingresos/ahorros/ganancias y de estados de éxito, pareja del rojo "negativo".

El usuario quiere una identidad más sobria y "confiable de finanzas" usando **pizarra (slate)**, pero la convención verde-sube/rojo-baja debe permanecer. Por eso el cambio **separa los dos roles en dos tokens** en vez de un find/replace ciego: `brand` (slate) para identidad/interacción y `positive` (emerald) para semántica financiera positiva. Así el rebrand no recolorea los montos positivos y, a futuro, cada color se cambia en un solo lugar.

Decisiones ya tomadas por el usuario:

- Color nuevo de marca: **pizarra/slate** — claro `#475569` (slate-600) / oscuro `#94a3b8` (slate-400).
- El verde **se mantiene** para positivos (ingresos/ganancias/éxito); el rojo de negativos no cambia.
- Enfoque **tokenizado** en Tailwind (no reemplazo disperso).

---

## Scope

**In:**

- Definir tokens de color en `tailwind.config.js`: `brand` (= paleta slate) y `positive` (= paleta emerald), más variable CSS `--color-brand` (claro/oscuro) en `index.css`.
- Reclasificar cada uso de `emerald-*` en su token correcto (`brand-*` o `positive-*`) conservando el número de tono y la estructura light/dark.
- Migrar a `brand-*` (slate) los usos **de marca/interactivos**: botones CTA en modo oscuro (`DashboardPage`, `ErrorBoundary`, `CategoriesManagerModal` botón), anillos de foco y botones de `LoginPage` y `ConfirmSignupPage`, e icono de globo de `MobileNav`.
- Migrar a `positive-*` (emerald, sin cambio visual) los usos **semántico-positivos**: `StatCard` (KPI verde + trend), `ToastContainer` éxito, `MainLayout` (dot `fresh` + patrimonio positivo), `HistoryTable`, `CategoryTable`, `ItemHistoryModal`, `useSnapshot`, `AnalysisPage`, badge `POSITIVE` de `CategoriesManagerModal`.
- Rediseñar `public/icon.svg`: fondo slate oscuro (sin cambio) + barras/línea/puntos/flecha de verde → escala slate (monocromo).
- Actualizar `theme-color` de marca: `index.html` (meta) y `vite.config.ts` (`theme_color` del manifiesto PWA) de `#10b981` → slate.
- Manejar los hex literales `#10b981`: los de gráficas/positivos quedan verdes (sin cambio); los de marca pasan a slate.

**Out of scope (para futuros specs):**

- Cambiar los acentos **azules** existentes (anillos de foco azules en `MainLayout`, hover de tarjetas, `--color-neutral`, highlight) — no son verdes; fuera de "cambiar el verde".
- Tocar `--color-negative` (rojo) o `--color-warning` (ámbar).
- Generar nuevos assets PNG/ICO (`favicon.ico`, `apple-touch-icon.png` referenciados en `vite.config.ts` pero ausentes en `public/`).
- Rediseño tipográfico, de layout o de cualquier componente más allá del color.

---

## Data model

Este feature **no introduce nuevas estructuras de datos**. Solo añade tokens de color (config Tailwind + variables CSS) y reasigna clases utilitarias existentes.

Tokens objetivo (ilustrativo, no código final):

```js
// tailwind.config.js → theme.extend.colors
brand: colors.slate,     // identidad/interacción
positive: colors.emerald // semántica financiera positiva
```

```css
/* index.css */
:root  { --color-brand: #475569; } /* slate-600 */
.dark  { --color-brand: #94a3b8; } /* slate-400 */
/* --color-positive (#10b981 / #34d399) permanece sin cambios */
```

---

## Implementation plan

Cada paso deja la app compilando y funcional.

1. **Tokens.** En `tailwind.config.js` añadir `brand` (slate) y `positive` (emerald) a `theme.extend.colors` (importando la paleta default de Tailwind y preservando el `slate.750` actual). En `index.css` añadir `--color-brand` en `:root` y `.dark`. Verificación: `npm run build` compila; clases `brand-*`/`positive-*` disponibles.
2. **Marca — assets/meta.** Cambiar `theme-color` en `index.html:12` y `theme_color` en `vite.config.ts:31` de `#10b981` a slate (`#475569`). Verificación: meta y manifiesto muestran slate.
3. **Marca — icono.** Reescribir gradientes/puntos/flecha verdes de `public/icon.svg` a escala slate (barras `#475569→#94a3b8`, línea `#94a3b8→#cbd5e1`, puntos `#cbd5e1`/blanco, flecha `#cbd5e1`); conservar fondo `#0f172a→#1e293b` y grid `#334155`. Verificación: icono se ve monocromo slate, sin verde.
4. **Marca — componentes interactivos.** Reemplazar `emerald-*` → `brand-*` (mismo tono, misma estructura light/dark) en: `pages/DashboardPage.tsx`, `pages/LoginPage.tsx`, `pages/ConfirmSignupPage.tsx`, `components/ErrorBoundary.tsx`, botón de `components/CategoriesManagerModal.tsx`, e icono globo de `components/MobileNav.tsx`. Verificación: botones/foco/login se ven slate; positivos siguen verdes.
5. **Semántica — positivos a token.** Reemplazar `emerald-*` → `positive-*` (sin cambio visual) en: `components/StatCard.tsx`, `components/ToastContainer.tsx`, `layouts/MainLayout.tsx`, `components/HistoryTable.tsx`, `components/CategoryTable.tsx`, `components/ItemHistoryModal.tsx`, `hooks/useSnapshot.ts`, `pages/AnalysisPage.tsx`, y el badge `POSITIVE` de `components/CategoriesManagerModal.tsx`. Los hex `#10b981` semántico-positivos (gráficas/`HistoryTable`) quedan en verde. Verificación: capturas idénticas a antes en montos positivos.
6. **Verificación final.** `npm run typecheck`, `npm run lint`, `npm run test:run` y `npm run build` pasan. Búsqueda `grep -r "emerald" --include=*.tsx --include=*.ts` no devuelve usos de marca residuales.

---

## Acceptance criteria

- [ ] `tailwind.config.js` expone `brand` (slate) y `positive` (emerald); `--color-brand` existe en `:root` y `.dark` de `index.css`.
- [ ] El icono PWA (`public/icon.svg`) no contiene ningún hex verde; se ve monocromo slate.
- [ ] `index.html` y `vite.config.ts` declaran `theme-color`/`theme_color` en slate, no `#10b981`.
- [ ] Botones CTA, anillos de foco y pantallas de login/signup se ven slate (sin verde).
- [ ] Montos/estados positivos (ingresos, ahorros, patrimonio positivo, dot `fresh`, toast de éxito, badge `POSITIVE`, ganancias en Análisis) siguen verdes, visualmente sin cambios.
- [ ] El rojo de negativos y el ámbar de avisos no cambian.
- [ ] `npm run typecheck`, `npm run lint`, `npm run test:run` y `npm run build` pasan sin errores.
- [ ] No queda ningún `emerald-*` usado como color de marca/interacción (solo, opcionalmente, vía token `positive`).

---

## Decisions

- **Sí:** dos tokens (`brand` slate + `positive` emerald). Separa identidad de semántica y evita recolorear positivos por accidente.
- **No:** find/replace global `emerald → slate`. Rompería la convención verde-sube/rojo-baja.
- **Sí:** `brand = colors.slate` (alias de la paleta default). Cambiar la marca a futuro = una línea.
- **Sí:** migrar también los positivos a `positive-*` aunque sea sin cambio visual. Hace explícita la distinción y blinda el rebrand; churn mecánico, cubierto por tests/typecheck.
- **No:** tocar los acentos azules (foco/hover/neutral). El pedido fue "cambiar el verde"; el azul es otro spec si se quiere unificar.
- **Sí:** `theme-color` = `#475569` (slate-600), alineado con el tono de marca elegido; ajustable a slate-700/800 si se prefiere más oscuro en la barra del navegador.
- **Decisión menor:** el globo de idioma de `MobileNav` pasa a slate (es chrome, no semántica). Puede revertirse a un acento sutil si se prefiere.

---

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Botones CTA en slate pierden vivacidad y parecen secundarios/deshabilitados | Es el efecto minimalista buscado; si hace falta, usar tonos más profundos (`brand-700/800` claro, `brand-600/500` oscuro) para el CTA primario. |
| Barras slate del icono con bajo contraste sobre fondo slate oscuro | Usar tonos claros (`slate-300/400`) para barras/línea y punto superior blanco; validar el render a 192/512 px. |
| Clasificar mal un `emerald` (marca vs positivo) y recolorear un monto positivo | Revisión por pasos (4 = marca, 5 = positivos) con diff; criterio: si expresa dinero-sube/éxito/frescura → `positive`. |
| Token Tailwind no resuelve la paleta default en este setup (Tailwind v4 + `@config`) | Verificar en el paso 1 con `npm run build` antes de migrar usos. |

---

## What is **not** in this spec

- Acentos azules (foco, hover de tarjetas, `--color-neutral`, highlight).
- Rojo de negativos y ámbar de avisos.
- Assets PNG/ICO nuevos (`favicon.ico`, `apple-touch-icon.png`).
- Cualquier cambio de layout, tipografía o componentes ajeno al color.

Cada uno, si llega, va en su propio spec.
