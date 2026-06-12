# Lista de Mejoras — Simple Finance Tracker App

## Contexto

App de seguimiento financiero personal: React 19 + TypeScript (strict), arquitectura limpia (capas domain / application / infrastructure), AWS Cognito + API Gateway, React Query, PWA, bilingüe (es/en), moneda fija MXN. La base es sólida y bien estructurada. Esta lista organiza mejoras por área y prioridad para guiar el trabajo futuro. No es un plan de implementación de un cambio único — es un backlog priorizado del que el usuario puede elegir.

---

## Prioridad Alta — Calidad y robustez

### 1. ESLint + Prettier (no existen hoy)

- No hay `.eslintrc` ni `.prettierrc`. Solo TS strict.
- Añadir ESLint (typescript-eslint, react-hooks, jsx-a11y) + Prettier + `.editorconfig`.
- Scripts `lint` / `format` en `package.json`.

### 2. CI ejecuta tests y lint

- `.github/workflows/deploy.yml` solo hace build + deploy a GitHub Pages. **No corre tests ni lint.**
- Añadir job que ejecute `vitest run`, `tsc --noEmit`, `eslint`, y Playwright e2e antes del deploy.
- Reporte de cobertura como artefacto.

### 3. Cobertura de tests (huecos)

- Falta cobertura: contextos (`AuthContext`, `ThemeContext`, `LanguageContext`), `LocalStorageAdapter`, recuperación de `ErrorBoundary`, enforcement de permisos read-only / view-as, `finance.worker.ts`.
- Solo 1 archivo e2e (`tests/e2e/finance.spec.ts`) con flujos básicos — ampliar.

### 4. Notificaciones de error al usuario (toasts)

- Errores de red/mutación se loguean a consola pero no se muestran en UI (salvo algunos modales).
- Añadir sistema de toast/notificación global. Considerar logger global (Sentry-like).
- `ErrorBoundary.tsx` tiene `@ts-nocheck` — quitar y tipar bien.

---

## Prioridad Media — Seguridad y accesibilidad

### 5. Enforcement read-only en servidor (no solo cliente)

- Guards de `viewAs` son client-side: `console.error + Promise.resolve()` silencioso (`application/useFinanceQueries.ts`).
- Verificar/garantizar que el backend valida `checkAccess` en TODA mutación, no solo lectura. Riesgo: cliente malicioso muta directo.

### 6. Generación de IDs robusta

- `window.crypto.randomUUID()` con fallback a `Date.now().toString()` — el fallback no es resistente a colisiones.
- Usar polyfill UUID adecuado o garantizar `crypto.randomUUID`.

### 7. Validación / sanitización de input

- No hay validación visible en cliente (se confía 100% en API). Añadir validación de nombres/montos (longitud, formato numérico, NaN).

### 8. Accesibilidad (a11y) — mínima hoy

- Casi sin ARIA. Solo un `aria-label` en `MobileNav`.
- Añadir: `aria-label` en botones solo-icono, `aria-expanded`/`aria-haspopup` en modales/dropdowns, HTML semántico (`<main>`, `<nav>`, `<section>`), gestión de focus/trap en modales, skip-to-content.
- Asociar labels a campos de formulario en modales.

---

## Prioridad Media — Features de producto faltantes

(Funciones que un finance tracker normalmente tiene)

### 9. Soporte multi-moneda

- Moneda fija MXN (`Intl.NumberFormat('es-MX', ... 'MXN')` en `utils/format.ts`).
- El `Money` value object ya existe — extenderlo con currency. Selector de moneda por usuario.

### 10. Export / Import de datos

- Sin CSV/JSON export ni import. Añadir backup/restore manual y export de snapshots/items.

### 11. Filtrado y reportes por rango de fechas

- Snapshots y charts existen, pero sin filtro por periodo. Añadir selector de rango en History/Analysis.

### 12. Transacciones recurrentes

- Solo entradas únicas. Añadir programación de items recurrentes.

### 13. Metas / objetivos de ahorro

- Sin goals/targets. Añadir metas con progreso visual.

### 14. Operaciones en lote

- Sin bulk edit/delete de items.

### 15. Recuperación de contraseña

- No hay flujo self-service de reset de password (Cognito lo soporta) — añadir página.

---

## Prioridad Baja — Rendimiento y pulido

### 16. Lazy-load de modales

- `SharingManagerModal`, `CategoriesManagerModal` siempre importados. Lazy-load para reducir bundle inicial.

### 17. Debounce de escrituras localStorage

- Lectura/escritura en cada cambio sin debounce.

### 18. Monitoreo de tamaño de bundle

- Añadir análisis de bundle (rollup-plugin-visualizer) y presupuesto.

### 19. Web worker subutilizado

- `finance.worker.ts` existe; verificar uso real o remover si muerto.

### 20. Playwright multi-navegador

- Solo Chromium configurado. Añadir Firefox/WebKit.

---

## Verificación

Para cualquier mejora elegida:

1. `npm run dev` (puerto 3000) y validar manualmente el flujo afectado.
2. `npx vitest run` para unit/integration; `npx playwright test` para e2e.
3. `npx tsc --noEmit` para chequeo de tipos (strict).
4. Tras añadir ESLint: `npm run lint`.
5. Probar modo offline/PWA y modo view-as (read-only) cuando aplique.

---

# Mejoras Visuales / UI

La UI actual ya está pulida: fuente Inter, dark mode, `hover-lift`, animaciones (`fadeIn`, `scaleIn`, shimmer), heatmap en History, charts Recharts con gradientes, glassmorphism parcial. Base sólida. Estas mejoras suben el nivel de pulido y personalidad.

## Alta — impacto visual grande, esfuerzo bajo/medio

### V1. Sistema de color con design tokens (CSS variables)

- Hoy colores hardcoded como strings semánticos (`green`/`red`/`blue` en `domain/defaults.ts`) + clases Tailwind dispersas en cada componente (`StatCard.tsx` mapea manualmente emerald/rose/blue/amber).
- Definir tokens CSS (`--color-positive`, `--color-negative`, `--surface`, `--surface-elevated`, etc.) en `index.css` + extender `tailwind.config.js`. Una sola fuente de verdad para light/dark.
- Beneficio: consistencia, theming futuro (ej. más temas), menos duplicación.

### V2. Empty states con personalidad

- Hoy: solo texto gris itálico ("emptyList") en `CategoryTable.tsx` y `HistoryTable.tsx`. Sin icono ni ilustración.
- Añadir empty state con icono Lucide grande (ej. `PiggyBank`, `Inbox`), título + subtítulo + CTA ("Añade tu primer movimiento"). Componente reutilizable `<EmptyState />`.

### V3. Skeleton screens reales en carga

- Existe clase `.skeleton` (shimmer) pero las tablas usan solo spinner `Loading.tsx`.
- Reemplazar spinner por skeletons que imiten la estructura (filas de category, stat cards) durante fetch de React Query. Reduce CLS percibido, se siente más rápido.

### V4. StatCard más expresivo

- Hoy: icono + label + valor con `tabular-nums` y counter animado. Bien.
- Añadir: mini indicador de tendencia (flecha ▲▼ + % vs snapshot anterior) usando datos de History; micro-sparkline opcional. Da contexto de un vistazo.

## Media — pulido de interacción

### V5. Micro-interacciones consistentes

- Hover states inconsistentes: unos usan `.hover-lift`, otros solo color. Estandarizar: lift + shadow + leve borde de acento en todas las cards interactivas. Tokens de transición unificados.

### V6. Transiciones de página

- Hoy `animate-in fade-in duration-500` simple. Añadir transición coherente entre tabs (Dashboard/History/Charts) — fade+slide sutil direccional. Considerar `View Transitions API` (nativa, barata).

### V7. Charts diferenciados y más ricos

- Ambos charts en `AnalysisPage.tsx` comparten estilo casi idéntico. Diferenciar paleta por métrica.
- Añadir: línea de referencia (promedio/meta), etiquetas en últimos puntos, gradientes más ricos, tooltip con delta vs punto previo, estados vacíos del chart.

### V8. History heatmap más legible

- Badges de colores por percentil funcionan pero saturan. Alternativa: fondo de fila con gradiente suave de heatmap + sparkline mini por fila, o barras inline proporcionales. Más escaneable.

### V9. Modales con animación escalonada

- Hoy solo `zoom-in-95`. Añadir stagger del contenido (header → body → footer) y backdrop blur progresivo. Focus-trap (también cubre a11y #8 de la lista anterior).

## Baja — detalles finos

### V10. Jerarquía tipográfica afinada

- Inter ya cargado. Explorar pesos variables (Inter var), mejor escala tipográfica, números tabulares en todos los montos (ya parcial).

### V11. Scrollbar y detalles de marca

- Scrollbar webkit custom existe (6px). Extender a Firefox (`scrollbar-width`/`scrollbar-color`), animar en hover.

### V12. Toques de gradiente / glassmorphism consistentes

- `backdrop-blur` usado en dropdowns pero inconsistente. Aplicar header sticky con blur translúcido, sutiles gradientes en cards de KPI según signo (verde/rojo tenue).

### V13. Branding visual

- Logo/icono actual SVG simple. Refinar identidad: paleta de marca, icono app PWA más distintivo, favicon, splash screen PWA.

### V14. Modo de densidad / accesibilidad visual

- Toggle compacto/cómodo para tablas. Respetar `prefers-reduced-motion` (desactivar animaciones). Verificar contraste WCAG AA en badges heatmap (amber sobre claro puede fallar).

## Verificación visual

1. `npm run dev` y revisar en desktop + mobile (DevTools responsive) en light y dark.
2. Validar `prefers-reduced-motion` y `prefers-color-scheme`.
3. Lighthouse (Performance + Accessibility) antes/después.
4. Revisar CLS y tiempo percibido de carga con skeletons.
5. Probar charts y heatmap con datasets vacío / pequeño / grande.

---

## Nota

Esta es una lista de backlog, no un cambio único. Para mejoras de código recomiendo empezar por **#1, #2, #3** (lint + CI + tests). Para mejoras visuales, **V1 (tokens) + V2 (empty states) + V3 (skeletons)** dan el mayor salto de pulido con esfuerzo razonable. Siguiente paso: elegir items concretos y hacer plan de implementación detallado de cada uno.
