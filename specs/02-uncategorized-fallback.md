# SPEC 02 — Fallback "Sin categoría" para items huérfanos

> **Status:** Draft · **Depends on:** — · **Date:** 2026-06-27
> **Objective:** Evitar que un `FinanceItem` cuyo `category` no exista entre las categorías almacenadas desaparezca de los totales, agrupándolo en un bucket sintético "Sin categoría" visible pero sin afectar el balance.

---

## Context

El dashboard mostró ceros para el usuario `hector` porque sus items referenciaban ids de categoría inexistentes (slugs legacy `investments`/`debt`/… y un UUID huérfano) mientras las categorías almacenadas usan UUIDs nuevos. La app empata `item.category === category.id`; al no coincidir, los items quedaron fuera de todo total y se "perdieron" silenciosamente. Hace falta una guarda de integridad para que esto nunca vuelva a ocultar dinero. Detalle del incidente y backend compartido están en la memoria del proyecto.

> **Definición rápida:** este spec se guardó sin la fase de aclaración detallada (Phase 2), con defaults recomendados. Revisar y ajustar antes de aprobar.

---

## Scope

**In:**

- Detectar items cuyo `category` no corresponde a ninguna categoría conocida del usuario.
- Auto-mapear por **nombre** los slugs legacy conocidos (`investments`, `liquid_cash`, `pending_payments`, `debt`, `retirement`) a la categoría equivalente del usuario cuando exista, para reducir huérfanos sin adivinar.
- Para los huérfanos restantes, agruparlos en una categoría **virtual** "Sin categoría" generada en runtime (no persistida), que aparece solo cuando hay huérfanos.
- El bucket "Sin categoría" se trata con efecto `INFORMATIVE`: es visible en el dashboard pero **no** afecta el balance hasta reasignar.
- La lógica vive en la capa de cálculo (`utils/finance.worker.ts` / `domain` `FinanceCalculator`) para que el agrupado sea consistente con los totales.

**Out of scope (futuros specs):**

- Script/endpoint de migración masiva en DynamoDB para reescribir los `category` existentes (el remap puntual de hector ya se hizo a mano).
- Nuevo flujo de UI dedicado para reasignar en lote (se usa el editor de categoría/item existente).
- Cambiar el modelo de categorías o el seeding de `DEFAULT_CATEGORIES`.

---

## Data model

No introduce estructuras persistidas nuevas. Define una categoría **virtual** en runtime, p.ej.:

```ts
const UNCATEGORIZED: Category = {
  id: '__uncategorized__',
  name: 'Sin categoría',
  effect: BalanceEffect.INFORMATIVE,
  color: 'gray',
  order: Number.MAX_SAFE_INTEGER,
};
```

Se inyecta solo si, tras el auto-map, queda ≥1 item huérfano.

---

## Implementation plan

1. **Detección + auto-map.** En la capa de cálculo, antes de agrupar, resolver cada `item.category`: si no existe entre las categorías del usuario pero su valor coincide (por nombre o slug) con una categoría real existente, reasignar virtualmente a esa categoría. Verificación: items con slug legacy caen en su categoría por nombre.
2. **Bucket sintético.** Los huérfanos restantes se agrupan bajo `UNCATEGORIZED` con efecto `INFORMATIVE`; se inyecta la categoría virtual solo si hay huérfanos. Verificación: dashboard muestra "Sin categoría" con el conteo/suma correctos y el balance no cambia.
3. **Tests.** Unit tests del calculador/worker: (a) item con id desconocido → bucket; (b) slug legacy con categoría homónima → auto-map; (c) sin huérfanos → no aparece el bucket. Verificación: `npm run test:run` pasa.

---

## Acceptance criteria

- [ ] Un item con `category` inexistente aparece en el dashboard bajo "Sin categoría" y no se omite de la vista.
- [ ] El monto de items huérfanos NO altera el balance total (efecto `INFORMATIVE`).
- [ ] Un slug legacy que coincide por nombre con una categoría existente se agrupa en esa categoría, no en "Sin categoría".
- [ ] La categoría "Sin categoría" no aparece cuando no hay items huérfanos.
- [ ] No se persiste ninguna categoría ni item nuevo por esta lógica.
- [ ] `npm run typecheck`, `npm run test:run` y `npm run build` pasan.

---

## Decisions

- **Sí:** bucket virtual en runtime (no persistido) → cero migración de datos, desaparece solo al reasignar.
- **Sí:** efecto `INFORMATIVE` para huérfanos → se visibiliza el dinero sin inflar el balance con un efecto desconocido.
- **Sí:** auto-map por nombre de slugs legacy conocidos → reduce ruido para datos viejos.
- **No (este spec):** migración masiva en DynamoDB → se difiere; el fallback resuelve la visibilidad sin tocar datos.
- **Pendiente de confirmar:** color/orden del bucket y si la reasignación necesita UI propia (definición rápida).

---

## What is **not** in this spec

- Migración de datos en DynamoDB.
- UI dedicada de reasignación en lote.
- Cambios al seeding de `DEFAULT_CATEGORIES`.
