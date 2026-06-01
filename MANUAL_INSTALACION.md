# 📦 MANUAL DE INSTALACIÓN DESDE CERO — Cotizador + Remisiones SUMETEC

Guía completa para instalar el sistema en una **cuenta de Google nueva**, con **otros datos** y **otros links**. Sigue los pasos en orden. No necesitas saber programar.

---

## 0. Qué vas a instalar (las piezas)

| Archivo | Qué es |
|---|---|
| `cotizador.html` | App de **cotizaciones** (la que abres para cotizar). Funciona **sin internet** y sube a Drive al volver la señal. |
| `remision.html` | App de **remisiones + cobros** (la importante: pagos, cobros, offline). |
| `apps_script.js` | El **cerebro en la nube** (Google Apps Script). Guarda en Sheets y Drive, asigna folios. |
| `sw.js` | "Service Worker" de **remisiones**: hace que `remision.html` funcione **sin internet** y sea instalable. |
| `cotizador-sw.js` | "Service Worker" del **cotizador**: igual pero para `cotizador.html`. |
| `manifest.json` | Datos del ícono/nombre para instalar `remision.html` como app en el celular. |
| `catalogo.csv` | Tu lista de **productos** (la subes a Drive). |
| `clientes.csv` | Tu lista de **clientes** (la subes a Drive). |

**Cómo se conecta todo:**
```
  Celular (cotizador.html / remision.html)
        │  internet
        ▼
  Apps Script (apps_script.js)  ←─ el "cerebro", una sola URL .../exec
        │
        ├──► Google Sheets "Cotizador"  (hojas: Cotizaciones, Remisiones, Pagos, Config)
        └──► Google Drive  carpeta "COTIZADOR"  (PDFs + catalogo.csv + clientes.csv)
```
La **única fuente de verdad** son Sheets y Drive. El celular es caché + cola: si no hay señal, guarda todo y lo envía solo cuando vuelve la conexión.

---

## 1. Elegir la cuenta de Google

1. Decide con qué cuenta Google va a vivir el sistema (ej. `ventas@tuempresa.com`).
2. Todo (Apps Script, Sheets, Drive, PDFs) quedará dentro de **esa** cuenta.
3. Inicia sesión en esa cuenta en el navegador antes de empezar.

---

## 2. Crear el "cerebro" (Apps Script) — lo más importante

1. Abre **https://script.google.com** (con la cuenta elegida).
2. Clic en **Nuevo proyecto**.
3. Borra todo el código que aparece (`function myFunction(){}`).
4. Abre el archivo `apps_script.js` de esta carpeta, **copia TODO** y pégalo ahí.
5. (Opcional) Si quieres otros nombres, edita arriba del código:
   - `var CARPETA_DRIVE = "COTIZADOR";` → nombre de la carpeta en tu Drive.
   - `var NOMBRE_SHEETS = "Cotizador";` → nombre del archivo de base de datos.
   - *(Si no quieres cambiar nada, déjalo así.)*
6. Clic en **Guardar** (💾) y ponle un nombre al proyecto (ej. "SUMETEC Backend").
7. Clic en **Implementar → Nueva implementación**.
8. Engranaje ⚙️ → tipo **Aplicación web**.
9. Configura:
   - **Descripción:** "v1"
   - **Ejecutar como:** *Yo (tu cuenta)*
   - **Quién tiene acceso:** **Cualquier persona** ← MUY IMPORTANTE
10. Clic **Implementar**. Te pedirá **autorizar permisos** → Permitir (acepta aunque diga "no verificado": es tu propio script).
11. Copia la **URL de la aplicación web**. Termina en **`/exec`**. Algo como:
    `https://script.google.com/macros/s/AKfy.....largo...../exec`

👉 **Guarda esa URL.** Es la que vas a pegar en las apps. Una sola URL sirve para TODO (catálogos, folios, remisiones, cobros).

---

## 3. Preparar Drive (carpeta + catálogos)

1. La carpeta `COTIZADOR` y el archivo Sheets `Cotizador` **se crean solos** la primera vez que la app envía algo. No tienes que crearlos a mano.
2. Sí debes subir tus catálogos. En tu Google Drive, dentro de la carpeta **COTIZADOR** (créala tú si aún no existe), sube dos archivos:

   **`catalogo.csv`** — productos. Primera fila EXACTA con estos títulos:
   ```
   CODIGO,DESCRIPCION,COSTO_CLIENTE
   FH-001,Tornillo hexagonal 1/2,12.50
   PH-020,Placa acero 8x1,340.00
   ```

   **`clientes.csv`** — clientes. Primera fila EXACTA:
   ```
   NOMBRE,RFC,DIRECCION,CP,TEL,CORREO
   Constructora ABC,ABC010101AAA,Av. Siempre Viva 123,64000,8112345678,compras@abc.com
   ```
   - Guárdalos como **CSV** (Excel: "Guardar como → CSV UTF-8").
   - Los nombres de archivo deben ser exactamente `catalogo.csv` y `clientes.csv`.

> Si no subes los CSV, las apps igual funcionan, pero sin autocompletado de productos/clientes.

---

## 4. Poner TUS links en las apps

Hay dos formas. La **A es la recomendada** (queda fijo para todos).

### Opción A — Editar el código (recomendado)
Abre `remision.html` Y `cotizador.html` con el Bloc de notas (o VS Code) y busca estas dos líneas (están casi iguales en ambos archivos):

```js
const URL_CATALOGOS='https://script.google.com/macros/s/..../exec';
const URL_DRIVE='https://script.google.com/macros/s/..../exec';
```

Reemplaza **ambas** por **tu** URL del paso 2 (la misma URL en las dos líneas, en los dos archivos). Guarda.

> Puedes usar la MISMA URL en `URL_CATALOGOS` y `URL_DRIVE`: el mismo Apps Script atiende todo.

### Opción B — Desde la app (rápido, por dispositivo)
1. Abre la app → botón **⚙️ Catálogos** → pega tu URL en "Apps Script — Catálogos" → **Conectar**.
2. Botón de configuración → pega tu URL en "Apps Script — Drive & Folios".
3. Esto se guarda **solo en ese celular** (en `localStorage`). En la opción A queda para todos.

---

## 5. Poner los datos de tu empresa

En `remision.html` y `cotizador.html`, busca el bloque:
```js
const EMPRESA_DEFAULT={
  nombre:'SUMETEC',
  rfc:'',
  dir:'',
  tel:'',
  tel2:'',
  email:'ventas@sumetec.com',
  web:'www.sumetec.com',
  slogan:'Suministramos soluciones, construimos confianza.',
  logoH:80
};
```
Cambia los valores por los tuyos y guarda. (También se puede desde el botón **🏢 Mi empresa** dentro de la app, pero eso queda solo en ese dispositivo.)

**Logo:** dentro de la app, botón **🏢 Mi empresa** → subir logo (se guarda en el dispositivo).

---

## 6. Publicar las apps (para abrirlas desde el celular)

Elige UNA opción:

- **Opción fácil — GitHub Pages (gratis, URL pública):**
  1. Crea cuenta en github.com → nuevo repositorio público.
  2. Sube `remision.html`, `cotizador.html`, `sw.js`, `cotizador-sw.js`, `manifest.json`.
  3. Settings → Pages → Branch `main` /root → Save.
  4. Te da una URL tipo `https://tuusuario.github.io/repo/remision.html`.

- **Opción local (sin internet para abrir, pero el SW y la cámara/share pueden fallar):**
  Copia la carpeta al celular y abre el `remision.html`. *No recomendado para uso diario* — el modo PWA/offline funciona mejor servido por una URL `https://`.

> ⚠️ El **Service Worker (`sw.js`) y la instalación como app SOLO funcionan en `https://`** (o `localhost`). Por eso GitHub Pages es lo ideal.

---

## 7. Instalar en el celular como app (PWA)

1. Abre la URL de `remision.html` en **Chrome (Android)** o **Safari (iPhone)**.
2. Android: menú ⋮ → **Instalar app / Agregar a pantalla de inicio**.
3. iPhone: botón Compartir → **Agregar a inicio**.
4. Quedará un ícono "Remisiones". Ábrela desde ahí: funciona a pantalla completa y **sin internet**.

---

## 8. Probar que todo quedó bien

En el navegador, pega TU URL del paso 2 con estos finales y revisa:

| Prueba (pega en el navegador) | Debe devolver |
|---|---|
| `TU_URL?tipo=ping` | `{"ok":true}` |
| `TU_URL?tipo=catalogo` | lista de productos (o aviso si no subiste el CSV) |
| `TU_URL?tipo=cobros_pendientes` | `{"ok":true,"serverTime":...,"cobros":[...]}` |

Luego en la app:
1. Crea una remisión de prueba con internet → debe darte un folio **REM-0001**.
2. Revisa que aparezca una fila en la hoja **Remisiones** del Sheets.
3. Marca un pago → debe aparecer en la hoja **Pagos**.

---

## 9. CÓMO CAMBIAR LINKS / CUENTA MÁS ADELANTE

### Si cambias de cuenta de Google (o el Apps Script):
1. Repite el **paso 2** (crear y desplegar el Apps Script en la cuenta nueva) → obtienes una **URL nueva `/exec`**.
2. Pon esa URL nueva en las apps (**paso 4**, opción A: editar `URL_CATALOGOS` y `URL_DRIVE` en los dos HTML).
3. Si ya tenías la app instalada con la URL vieja guardada en el celular, entra a **⚙️ Catálogos** y a Configuración de Drive y pega la URL nueva (la opción B pisa lo guardado).
4. Sube de nuevo `catalogo.csv` y `clientes.csv` a la carpeta Drive de la cuenta nueva.

### Si solo cambias el código del backend (mejoras):
1. Pega el `apps_script.js` actualizado en script.google.com.
2. **Implementar → Administrar implementaciones → ✏️ Editar → Versión: Nueva versión → Implementar.**
3. **La URL NO cambia** (no tienes que tocar las apps).

> ⚠️ Si en vez de "Nueva versión" creas una "Nueva implementación", te dará una URL distinta y tendrás que actualizar las apps. Usa **Editar → Nueva versión** para conservar la URL.

---

## 10. Estructura que el sistema crea solo (referencia)

**Google Sheets "Cotizador"** (se crea solo):
- **Cotizaciones:** Folio · Cliente · Fecha · Total · PDF
- **Remisiones:** ID · Folio · Cliente · Fecha · Total · Saldo pendiente · Estado · PDF
- **Pagos:** Folio · UUID · Tipo · Monto · Saldo Después · Fecha · Razón · Dispositivo
- **Config:** clave/valor (contadores de folio `folio_n`, `folio_rem_n`)

**Drive carpeta "COTIZADOR":**
- `catalogo.csv`, `clientes.csv` (los subes tú)
- `PDFs/COTIZACIONES/` y `PDFs/REMISIONES/` (PDFs generados, automático)

---

## 11. Problemas comunes

| Síntoma | Causa / Solución |
|---|---|
| "No se pudo obtener folio" siempre | URL mal puesta, o el Apps Script no está como **"Cualquier persona"**. Revisa pasos 2 y 4. |
| Catálogos no cargan | Falta `catalogo.csv`/`clientes.csv` en Drive, o títulos de columna mal escritos (paso 3). |
| No instala como app / no funciona offline | Estás abriéndolo como archivo local. Debe ser `https://` (GitHub Pages, paso 6). |
| Cambié el backend y no se reflejó | Olvidaste **Nueva versión** al redesplegar (paso 9). |
| Barra roja "sin conexión" siempre | El celular no llega al Apps Script: revisa señal o la URL. Lo guardado NO se pierde, se envía al volver. |
| Folios salen TMP-XXXX | Se crearon sin internet. Se renumeran a REM- solos al recuperar señal. |

---

## 12. Checklist final ✅
- [ ] Apps Script desplegado como **Cualquier persona**, URL `/exec` copiada.
- [ ] `URL_CATALOGOS` y `URL_DRIVE` actualizadas en `remision.html` **y** `cotizador.html`.
- [ ] `catalogo.csv` y `clientes.csv` subidos a la carpeta Drive `COTIZADOR`.
- [ ] Datos de empresa y logo puestos.
- [ ] Apps publicadas en `https://` (GitHub Pages u otro).
- [ ] `TU_URL?tipo=ping` devuelve `{"ok":true}`.
- [ ] Remisión de prueba creada → folio REM-0001 y fila en Sheets.

---
*Generado el 2026-05-28. Respaldo de versiones funcionales: `remision.BACKUP_*.html`, `apps_script.BACKUP_*.js`.*
