# Auditoría desde cero — Sistema de Remisiones

**Fecha:** 2026-05-29
**Archivos:** `remision.html` (cliente) + `apps_script.js` (servidor Google Apps Script)
**Contexto:** 2 personas en campo, celulares distintos, datos intermitentes. Google Sheets = fuente de verdad.

---

## 🔍 Diagnóstico

| # | Problema / Oportunidad | Capa | Prioridad |
|---|------------------------|------|-----------|
| 1 | **Backend desplegado está viejo** — faltan `cobros_pendientes`, `remision_detalle`, renumeración TMP→REM y guardado de PDF post-folio | Servidor | 🔴 CRÍTICO |
| 2 | **Contador no avanza** — el folio mostrado se decide en 3 lugares distintos (`genFolio`, `cargarFolioRemoto`, `reservar_folio`) y se pisan entre sí | Cliente | 🔴 CRÍTICO |
| 3 | **Dos archivos en Drive** — doble subida (TMP- y REM-) + `createFile` sin sobrescribir | Ambas | 🔴 CRÍTICO |
| 4 | **Pago se referencia por `folio`, no por UUID** — si se cobra en TMP- y luego renumera, el pago queda huérfano | Ambas | 🔴 CRÍTICO |
| 5 | **Saldo "última escritura gana"** entre 2 dispositivos — el servidor confía en el saldo que manda el celular, no lo recalcula | Servidor | 🟡 IMPORTANTE |
| 6 | **Cobros no funciona** (consecuencia directa del #1) | Ambas | 🟡 (lo arregla #1) |
| 7 | Total se calcula en 3 funciones distintas (riesgo de divergencia por redondeo) | Cliente | 🟢 MEJORA |
| 8 | `guardarNuevoCliente` no manda `rfc`/`email`/`contacto` que el servidor espera | Cliente | 🟢 MEJORA |

---

## Cómo DEBE funcionar (diseño correcto)

**Folios:**
- Servidor guarda `folio_rem_n` en hoja `Config`.
- Crear con señal → `?tipo=reservar_folio` (atómico, LockService) → incrementa y devuelve `REM-{n}`.
- Abrir página → `?tipo=folio_rem` (solo lectura) → muestra el próximo sin reservar.
- Offline → `TMP-XXXX`; al sincronizar el servidor renumera a `REM-` con `asignarFolioDefinitivo()`.

**Cobros:** `?tipo=cobros_pendientes` → todas las remisiones con `saldo>0` y `estado≠pagado`. Lista única para ambos celulares.

**PDF:** 1 clic = 1 descarga local + 1 archivo en `COTIZADOR/PDFs/REMISIONES/`.

**Pagos:** una fila por pago en hoja `Pagos`, idempotente por UUID. El saldo de la remisión debería ser `total − Σ(pagos válidos)`.

---

## 🛠 Hallazgos detallados

### 🔴 1. Backend desplegado obsoleto — RAÍZ de casi todo
**Tipo:** Despliegue
Comparado `apps_script.js` actual vs `apps_script.BACKUP_20260528_151053.js` (≈ lo desplegado): a la versión en producción le faltan `cobros_pendientes`, `remision_detalle`, la renumeración TMP→REM en `registrarRemision`, y guardar el PDF **después** de obtener el folio definitivo.
**Efecto encadenado:** cobros vacío + contador atascado (si `reservar_folio` fallara cae a TMP-) + PDFs con nombre TMP- y REM- (dos archivos).
**Acción (tuya):** redesplegar `apps_script.js` → script.google.com → Implementar → Administrar implementaciones → Editar → Nueva versión. La URL no cambia.

---

### 🔴 2. Contador no avanza
**Tipo:** Bug / Lógica
El folio visible se fija en tres puntos que se sobrescriben:
- `genFolio()` usa `r_fn` local.
- `cargarFolioRemoto()` (al cargar y tras cada `guardarEnDrive` exitoso) pisa el badge con el folio del servidor.
- `reservar_folio` da el definitivo al crear.

El síntoma "no cambia" viene de que tras guardar, `guardarEnDrive` llama `cargarFolioRemoto()` y reescribe el badge de la remisión que estás viendo. Y al dar "Nueva", `nuevaRem()` NO llama `cargarFolioRemoto`, así que depende solo de `r_fn`.

**Ya aplicado (cliente):** en `registrarRemision`, tras reservar folio:
`localStorage.setItem('r_fn',String(parseInt(m[1])))` (antes `-1`, que repetía el folio).

**Pendiente recomendado:** que `nuevaRem()` llame `cargarFolioRemoto()` cuando haya señal, para que el próximo folio venga siempre del servidor (fuente de verdad) y no de `r_fn`.

---

### 🔴 3. Dos archivos en Drive
**Tipo:** Bug
Dos causas:
1. **Cliente:** al renumerar TMP→REM, tanto `_aplicarFolioDefinitivo` (vía `descargarPDF`) como `procesarColaPDF` subían el PDF. **Ya corregido:** quité la subida de `_aplicarFolioDefinitivo`; ahora solo actualiza la cola con `_encolarPDFsiHace` y deja que `procesarColaPDF` suba una sola vez.
2. **Servidor:** `guardarPDFRemision`/`guardarPDF` hacían `createFile` siempre. **Ya corregido:** nueva `_crearOSobrescribirPDF` manda a papelera el archivo con el mismo nombre antes de crear. Requiere redeploy (#1).

> ⚠️ **A confirmar contigo:** ¿son dos **descargas en el celular** o dos **archivos en Drive**? No encontré causa de doble descarga local; si te pasa en el teléfono, dime el modelo/navegador para rastrearlo.

---

### 🔴 4. Pago referenciado por folio, no por UUID
**Tipo:** Bug de integridad
`_enviarPago` y `procesarCola` mandan `actualizar_remision` con clave `r.folio`. Si registras un abono mientras la remisión todavía es `TMP-XXXX` (creada offline, cobrada antes de sincronizar), el item en `cola_offline` guarda `folio: 'TMP-...'`. Al sincronizar, la fila pasa a `REM-`, pero el pago en cola sigue apuntando a `TMP-` → `actualizarEstadoRemision` no encuentra la fila y `registrarPago` lo guarda bajo el folio temporal (huérfano, no aparece en `remision_detalle`).
**Fix propuesto:** incluir `id` (UUID de la remisión) en el payload del pago y re-sellar el `folio` de los pagos en cola cuando corre `_aplicarFolioDefinitivo`; en el servidor, resolver por `id` si el folio guardado es TMP-.

---

### 🟡 5. Saldo "última escritura gana" entre 2 dispositivos
**Tipo:** Lógica / diseño (importante con 2 personas)
`actualizarEstadoRemision(folio, saldo, estado)` **SETea** el saldo con el número que manda el celular. Si A y B cobran casi a la vez, el último POST sobrescribe con su saldo local (que no vio el abono del otro). Los pagos sí quedan ambos (idempotentes por UUID) pero la **columna Saldo** queda mal, y esa columna es la que alimenta `cobros_pendientes`.
**Fix propuesto:** que el servidor recalcule `saldo = total − Σ(pagos válidos)` desde la hoja `Pagos` tras cada `registrarPago`, en vez de confiar en el saldo del cliente.

---

### 🟢 7. Total calculado en 3 lugares
`calcTotals`, `registrarRemision` y `descargarPDF` repiten el cálculo `sub + iva − desc`. Riesgo de centavos divergentes por redondeo de IVA por línea. Centralizar en una sola función `calcularTotales(items, descPct)`.

### 🟢 8. Nuevo cliente incompleto
`guardarNuevoCliente` arma `{id,nombre,dir,cp,tel}` pero `registrarNuevoCliente` (servidor) también escribe `rfc`, `contacto`, `email` → quedan en blanco. Alinear los campos.

---

## ⚡ Orden de implementación

1. 🔴 **Redesplegar `apps_script.js`** (#1) — desbloquea cobros, renumeración y PDF correcto. **Sin esto, nada más se nota.**
2. 🔴 Recargar el HTML con caché limpio en ambos celulares (los fixes de cliente #2 y #3 ya están en el archivo).
3. 🔴 Pago por UUID (#4) — evita pagos huérfanos.
4. 🟡 Saldo recalculado en servidor (#5) — correcto para 2 personas.
5. 🟢 Centralizar total (#7) y campos de cliente (#8).

---

## Estado de los fixes

| Fix | Estado |
|-----|--------|
| #2 contador (`r_fn` sin `-1`) | ✅ aplicado en `remision.html` |
| #3 cliente (no doble subida) | ✅ aplicado en `remision.html` |
| #3 servidor (`_crearOSobrescribirPDF`) | ✅ aplicado en `apps_script.js` (**falta redeploy**) |
| #4 pago por UUID | ✅ `remision.html` + `apps_script.js` (31/05) |
| #5 saldo recalculado en servidor | ✅ `recalcularSaldo()` en `apps_script.js` (**falta redeploy**) |
| #7 total centralizado | ✅ `_calcTot()` única fuente — 4 call sites refactorizados (31/05) |
| #8 nuevo cliente completo | ✅ RFC/email/contacto en modal, payload, selCliente y mapping CSV (31/05) |
| Seguridad: token fuera del código | ✅ `remision.html` + `cotizador.html` leen de localStorage (31/05) |

## Acción pendiente CRÍTICA

1. **Cambiar `API_TOKEN`** en `apps_script.js` a un valor secreto fuerte (≥16 chars aleatorios)
2. **Redesplegar** `apps_script.js`: script.google.com → Implementar → Administrar → Editar → Nueva versión
3. En **cada celular**: abrir ⚙️ Catálogos → Token de seguridad → ingresar el nuevo token → guardar
4. Recargar las apps con caché limpio (modo incógnito o limpiar caché del navegador)

> Nota honesta: no puedo ver desde aquí qué versión tienes desplegada ni el comportamiento en vivo en tu celular. El diagnóstico del #1 es deducción a partir del backup y de los síntomas (cobros caído + contador atascado + doble archivo), que apuntan consistentemente a un backend desactualizado.
