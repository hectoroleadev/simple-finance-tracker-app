# Deuda Técnica Pendiente — Simple Finance Tracker

Este documento lista las mejoras técnicas y de arquitectura pendientes. Se ha marcado lo que ya está completado.

## ✅ Completado
- [x] **#1 Debounce en reordenamiento de categorías:** Reducidas las llamadas HTTP innecesarias al reordenar.
- [x] **#2 Eliminar `alert()` de React:** Reemplazados con banners de error integrados en la UI (`AlertCircle`).
- [x] **#3 Mock desactualizado en tests:** Actualizado `DashboardPage.integration.test.tsx`.
- [x] **#5 Código duplicado del Worker:** Los cálculos ahora se importan directamente desde `domain/finance.logic.ts`.
- [x] **#6 Tipos `context: any` en mutaciones:** Ahora usan tipos explícitos para el rollback optimista.
- [x] **#7 `chartData` tipado:** Implementada la interfaz `ChartDataPoint` en lugar de `any[]`.
- [x] **#8 `console.log` en producción:** Envueltos en guardias `import.meta.env.DEV`.
- [x] **#9 Consistencia de `onSnapshot`:** Movido dentro de `actions` como `actions.snapshot()`.
- [x] **#11 Tests de categorías:** Agregada cobertura en `useFinanceData.test.tsx` (add/update/delete/reorder).
- [x] **#13 Agregar `ErrorBoundary`:** React Error Boundary implementado en la raíz de la app.

---

## ⏳ Pendiente (Por hacer)

### Prioridad Media-Alta
- [ ] **#4 Activar `strict: true` en `tsconfig.json`**
  - *Impacto:* Evita errores silenciosos por tipos débiles o valores nulos no comprobados.
  - *Esfuerzo:* Alto. Requerirá arreglar errores en cascada por todo el proyecto.

### Prioridad Media-Baja
- [ ] **#10 Migrar Lambda a TypeScript**
  - *Impacto:* Tipado fuerte en el backend. Contract validation antes de compilación.
  - *Esfuerzo:* Alto. Implica migrar `src/lambda/index.js` a `.ts`, configurar `tsconfig.json` de Node y actualizar el empaquetado del archivo zip en Terraform para que recompile antes de desplegar.

- [ ] **#12 Estrategia de migración para `DEFAULT_CATEGORIES`**
  - *Problema actual:* Las categorías por defecto están en el código. Si se agregan nuevas en el futuro, los usuarios existentes no las verán en su lista.
  - *Solución sugerida:* Que el backend inyecte categorías nuevas ausentes al obtener los datos, o un botón en la UI de "Restaurar categorías por defecto".
