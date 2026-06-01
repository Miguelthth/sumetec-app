# MANUAL DE CONFIGURACIÓN — COTIZADOR SUMETEC
> Para alguien que nunca ha tocado código. Sigue los pasos en orden.

---

## ¿QUÉ NECESITAS?
- Una cuenta de Google (Gmail)
- El archivo `cotizador.html`
- El archivo `apps_script.js`
- Acceso a [script.google.com](https://script.google.com)

---

## PARTE 1 — CREAR EL APPS SCRIPT (el cerebro en la nube)

### Paso 1 — Abrir Apps Script
1. Ve a [script.google.com](https://script.google.com)
2. Inicia sesión con tu cuenta de Google
3. Clic en **"+ Nuevo proyecto"**

### Paso 2 — Pegar el código
1. Verás un editor con texto vacío
2. Selecciona TODO lo que hay (Ctrl+A) y bórralo
3. Abre el archivo `apps_script.js` con el Bloc de notas
4. Copia todo su contenido (Ctrl+A, Ctrl+C)
5. Pégalo en el editor de Apps Script (Ctrl+V)
6. Guarda con **Ctrl+S**
7. Ponle nombre al proyecto (arriba izquierda donde dice "Proyecto sin título"): escribe **Cotizador**

### Paso 3 — Dar permisos al script
1. En el menú desplegable de funciones (junto al botón ▶), selecciona **`obtenerSiguienteFolio`**
2. Clic en **▶ Ejecutar**
3. Aparece una ventana: clic en **"Revisar permisos"**
4. Selecciona tu cuenta de Google
5. Aparece pantalla de advertencia — clic en **"Opciones avanzadas"**
6. Clic en **"Ir a Cotizador (no seguro)"**
7. Clic en **"Permitir"**
8. El registro de ejecución debe decir **"Se completó la ejecución"** ✓

### Paso 4 — Desplegar como Web App
1. Clic en el botón azul **"Implementar"** (arriba a la derecha)
2. Selecciona **"Nueva implementación"**
3. Clic en el ⚙️ junto a "Tipo" → selecciona **"Aplicación web"**
4. Configura así:
   - **Descripción:** `Cotizador API`
   - **Ejecutar como:** `Yo`
   - **Quién tiene acceso:** `Cualquier persona`
5. Clic en **"Implementar"**
6. Aparece una URL larga — **cópiala y guárdala**, la necesitas después
   - Se ve así: `https://script.google.com/macros/s/ABC.../exec`

---

## PARTE 2 — CONFIGURAR EL COTIZADOR

### Paso 5 — Pegar las URLs en el código (una sola vez)
1. Abre `cotizador.html` con el Bloc de notas (clic derecho → Abrir con → Bloc de notas)
2. Presiona **Ctrl+F** y busca: `URL_CATALOGOS`
3. Verás estas dos líneas:
   ```
   const URL_CATALOGOS='https://script.google.com/.../exec';
   const URL_DRIVE='https://script.google.com/.../exec';
   ```
4. Si tienes **un solo script**: reemplaza ambas URLs con la URL que copiaste en el Paso 4
5. Si tienes **dos scripts separados** (uno para catálogos, otro para Drive): reemplaza cada una con su URL correspondiente
6. Guarda el archivo (Ctrl+S)

### Paso 6 — Abrir el cotizador
1. Abre `cotizador.html` en tu navegador (doble clic)
2. Debe cargar el número de cotización automáticamente desde la nube
3. La primera vez mostrará **SUM-0101**

---

## PARTE 3 — LLENAR TUS DATOS DE EMPRESA

### Paso 7 — Editar datos en el código (para todos los navegadores)
1. Abre `cotizador.html` con el Bloc de notas
2. Busca (Ctrl+F): `EMPRESA_DEFAULT`
3. Verás este bloque:
   ```javascript
   const EMPRESA_DEFAULT={
     nombre:'SUMETEC',
     rfc:'',
     dir:'',
     tel:'',
     tel2:'',
     email:'ventas@sumetec.com',
     web:'www.sumetec.com',
     slogan:'Suministramos soluciones, construimos confianza.',
     logoH:80,
     vigencia:10
   };
   ```
4. Cambia cada campo con tus datos reales (respeta las comillas y comas)
5. Guarda (Ctrl+S)

> Estos datos aparecerán en cualquier navegador o dispositivo donde abras el cotizador.

### Paso 8 — Cambiar datos sin tocar código (solo en ese navegador)
1. Abre el cotizador
2. Clic en **🏢 Mi Empresa** (menú superior)
3. Edita los campos y clic en **💾 Guardar**
4. Esos cambios quedan guardados en ese navegador

---

## PARTE 4 — CONECTAR CATÁLOGOS (productos y clientes)

### Paso 9 — Subir tus archivos CSV a Drive
1. Ve a [drive.google.com](https://drive.google.com)
2. Busca la carpeta **COTIZADOR** (se creó automáticamente en el Paso 3)
3. Sube tus archivos:
   - `catalogo.csv` — tu lista de productos
   - `clientes.csv` — tu lista de clientes
4. Los archivos CSV deben tener estas columnas:
   - **catalogo.csv:** `CODIGO, DESCRIPCION, COSTO_CLIENTE`
   - **clientes.csv:** `NOMBRE, RFC, DIRECCION, CP, TEL, CORREO`

### Paso 10 — Conectar desde el cotizador
1. Abre el cotizador
2. Clic en **⚙️ Catálogos Google Sheets**
3. En el campo **URL del Apps Script — Catálogos** pega tu URL del script
4. En el campo **URL del Apps Script — Drive & Folios** pega tu URL del script
5. Clic en **🔄 Conectar y cargar**
6. Debe aparecer: **"✓ X productos y X clientes cargados"**

---

## PARTE 5 — ACTUALIZAR EL CÓDIGO DEL SCRIPT (cuando hay cambios)

> Cada vez que se actualiza el archivo `apps_script.js` debes hacer esto:

1. Ve a [script.google.com](https://script.google.com) → abre tu proyecto **Cotizador**
2. Borra todo (Ctrl+A, Supr)
3. Pega el nuevo código del archivo `apps_script.js`
4. Guarda (Ctrl+S)
5. Clic en **"Implementar"** → **"Administrar implementaciones"**
6. Clic en el **✏️** de tu implementación
7. En **"Versión"** selecciona **"Nueva versión"**
8. Clic en **"Implementar"**

> ⚠️ Sin este paso el script sigue corriendo el código viejo aunque lo hayas editado.

---

## ¿QUÉ SE GUARDA EN DRIVE AUTOMÁTICAMENTE?

Dentro de tu carpeta **COTIZADOR** en Google Drive encontrarás:

```
📁 COTIZADOR
    ├── 📄 catalogo.csv          ← tu catálogo de productos
    ├── 📄 clientes.csv          ← tu catálogo de clientes
    ├── 📁 PDFs                  ← cotizaciones generadas
    │     ├── COTIZACION_SUM-0101_CLIENTE.pdf
    │     └── COTIZACION_SUM-0102_CLIENTE.pdf
    └── 📊 Cotizador (Sheets)
          ├── Cotizaciones        ← registro de todas las cotizaciones
          ├── Clientes Nuevos     ← clientes agregados desde el cotizador
          ├── Productos Nuevos    ← productos agregados desde el cotizador
          └── Config              ← contador de folios (no editar)
```

---

## PROBLEMAS FRECUENTES

| Problema | Solución |
|---|---|
| El folio no se actualiza al abrir | Verifica que la URL de Drive & Folios esté bien pegada en Catálogos |
| "No tienes permiso para llamar Spreadsheet" | Ve al script → ejecuta `obtenerSiguienteFolio` → acepta los permisos |
| El PDF no se guarda en Drive | Actualiza el código del script y vuelve a desplegar (nueva versión) |
| No carga catálogo ni clientes | Verifica que los archivos CSV estén en la carpeta COTIZADOR en Drive |
| Los datos de empresa se borraron | Edita el bloque `EMPRESA_DEFAULT` en el código del cotizador |
| El script sigue con el código viejo | Siempre crear "Nueva versión" al redesplegar |

---

## DATOS IMPORTANTES PARA GUARDAR

| Qué | Dónde encontrarlo |
|---|---|
| URL del script (catálogos) | script.google.com → Implementar → Administrar implementaciones |
| URL del script (Drive & Folios) | Igual que arriba si es el mismo script |
| Carpeta en Drive | drive.google.com → buscar "COTIZADOR" |
| Sheets de registro | Dentro de la carpeta COTIZADOR → archivo "Cotizador" |
