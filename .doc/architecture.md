# Arquitectura del Proyecto: Uloom Workspace Launcher (v0.1.3)

Este documento describe las decisiones arquitectónicas y la estructura de carpetas adoptadas para el desarrollo de Uloom. Dado que es una aplicación de escritorio basada en Electron con React, el sistema se divide fundamentalmente en dos grandes áreas: el **Frontend (Renderer Process)** y el **Backend (Main Process)**.

> **Alcance:** Este documento describe únicamente lo necesario para el MVP (Hub de Sesiones, Detalle de Sesión con Web Tabs, Configuración con import/export). No incluye apps nativas, catálogo de apps, ni ejecución de `.exe` — ver nota al final sobre features fuera de alcance.

---

## 1. Frontend (Renderer Process): React + Vite

Para el desarrollo de la interfaz de usuario con React, adoptamos una **variante simplificada de FSD (Feature-Sliced Design)**. Se diferencia del estándar canónico en que `pages` vive como subcarpeta de `app/` en vez de ser una capa de primer nivel — decisión tomada para mantener el árbol de carpetas más chico, dado que el MVP tiene solo 3 páginas.

### Capas (de mayor a menor abstracción):

1. **`app/`**: Configuración global de la aplicación. Aquí residen los Providers (Context API), la inicialización de estilos globales y la estructura raíz de React. Dentro de esta capa se ubica la subcarpeta `pages/`.
   - **`pages/`**: Las vistas completas de la aplicación. No debe haber una subcarpeta por cada página; los archivos `.jsx` se colocan directamente en la raíz de esta carpeta y se exportan mediante un archivo `index.js`.
2. **`widgets/`**: Bloques de interfaz de usuario independientes y complejos (ej. `Sidebar`). Se subdivide en `hooks/` (lógica propia de widgets), `layout/` (widgets de layout) y `ui/` (widgets de UI atómicos), donde cada widget vive en su propia carpeta (ej. `ui/Button/Button.jsx`). `ui/` y `layout/` cuentan con su propio `index.js` que agrega los widgets de su segmento, y un `index.js` en la raíz reexporta ambos segmentos.
3. **`features/`**: Cada feature coincide con una page (ej. la página de detalle de workspace tiene su `features/workspace`). Cada carpeta debe contener dos subcarpetas: `hook/` y `ui/`, y contar con un `index.js` general que exporte ambos contenidos.
4. **`entities/`**: Entidades de negocio centrales. Se dividen en dos subcarpetas: `ui/` y `api/`. Los archivos dentro de `api/` toman el formato `[nombre]IpcApi.js` (comunicación con el proceso main vía `window.uloomApi`), pudiendo existir además una capa `local[Nombre]Api.js` si hay lógica derivada que no necesita cruzar el puente IPC. Ambas se exponen a través de un barrel `index.js` (ver `rules.md` regla 5).
5. **`shared/`**: Código reutilizable en todo el proyecto. Contiene dos subcarpetas (`hook/` y `ui/`) y un archivo `index.js` general en su raíz que exporta ambas partes.

### Convenciones de Archivos y Nomenclatura:

- **Archivos `.js`**: Comienzan en minúscula y utilizan notación *camelCase* (ej. `workspaceIpcApi.js`, `useWorkspace.js`). Contienen principalmente lógica, hooks o utilidades.
- **Archivos `.jsx`**: Comienzan en mayúscula y utilizan notación *PascalCase* (ej. `WorkspaceCard.jsx`, `Sidebar.jsx`). Contienen exclusivamente componentes visuales de React.
- **Archivos `index.js`**: Utilizados en `shared/`, `widgets/`, `entities/[nombre]/` y cada directorio dentro de `features/` como puntos centrales de exportación (Barrel exports). Ver reglas de barrels en `rules.md`.

---

## 2. Backend (Main Process): Node.js + Electron

Para el proceso principal de Electron, se adopta una **Arquitectura por Capas (Layered Architecture)** mediante el patrón Controlador-Servicio-Repositorio. Esto evita el "código espagueti" en los eventos IPC y separa la lógica de negocio del acceso al disco.

### Capas del Backend:

1. **`preload/` (El Puente)**: Actúa como la barrera de seguridad de Electron (`contextBridge`). Expone una API estrictamente controlada hacia el Frontend (ej. `window.uloomApi.launchWorkspace()`). No transforma datos — reexpone `ipcRenderer.invoke` tal cual.
2. **`ipc/` (Controladores)**: Son el equivalente a los *endpoints* de una API REST. Escuchan los eventos de `ipcMain` provenientes del frontend, extraen los parámetros, llaman a la capa de Servicios, atrapan cualquier error (ver `rules.md` regla 7) y devuelven la respuesta al frontend con la forma `{ success, data, error }`.
3. **`services/` (Lógica de Negocio)**: El corazón del backend. Para el MVP, la responsabilidad principal es el `LauncherService`, encargado de recorrer los Web Tabs de un workspace y abrir cada URL con `shell.openExternal()` en el navegador predeterminado del sistema (respetando la configuración de "Ventana Nueva vs Ventana Activa" que soporte el navegador).
4. **`data/` (Repositorio de Datos)**: Se encarga exclusivamente de la persistencia local. Lee, parsea, valida y escribe el archivo `config.json` del usuario en disco. El resto de la aplicación ignora cómo se guardan los datos, simplemente le pide información al repositorio.

> **Decisión de persistencia:** el MVP usa un repositorio manual (`src/main/data/configRepository.js`) que lee/escribe `config.json` directamente en `app.getPath('userData')`. Esto reemplaza la mención de `electron-store` del brief original (que fue removida de las dependencias). Se eligió así para soportar el import/export de sesiones que pide el MVP con control total del formato del archivo.

---

## 3. Documentación y Diseño (Fuera de `src/`)

Fuera del código fuente principal (`src/`), existen directorios en la raíz del proyecto que son cruciales para la planificación y el diseño.

### `MDs/` (Documentación)
- `context.md`: Define el propósito, la lógica de negocio, la arquitectura y el modelo de datos JSON de la aplicación.
- `what_to_do.md`: Actúa como la hoja de ruta del desarrollo, detallando las fases, objetivos y funcionalidades a implementar.
- `architecture.md`: Este mismo archivo.

### `doc/` (Documentación técnica)
- `backend.md`: Explica la arquitectura del backend (4 capas: repository, service, ipc, preload), flujos CRUD y cómo funciona la persistencia local.
- `config-file.md`: Define la estructura completa del `config.json` — campos, tipos, reglas de persistencia y ejemplos de workspace/tab.
- `rules.md`: Reglas estrictas para la creación de componentes, hooks, separación lógica/UI, prevención de memory leaks, manejo de errores IPC y sincronización de documentación con el backend.

> **⚠️ Regla estricta:** Toda modificación en cualquiera de las capas del backend (data, services, ipc, preload, workspaceIpcApi) **debe** reflejarse simultáneamente en `doc/backend.md` (flujos, métodos, canales IPC) y `doc/config-file.md` (estructura del JSON). Ver `doc/rules.md` regla 6.

### `changelog/` (Historial de versiones)
Registro de cambios por versión (`changelog/changes_<version>.md`). El primer archivo (`changes_0.1.3.md`) se crea al cerrar la versión 0.1.3.

### `stich/` (Diseño y Temas)
- `themes/`:
  - `slate_precision_design.md`: **Tema principal** y guía de estilo visual obligatoria para todos los componentes de la UI. Define colores, tipografía, espaciado y comportamiento.
- `views/`: Contiene bocetos o descripciones de las pantallas a construir.

> **Regla de Oro:** Todo componente o diseño visual implementado en `renderer/` **debe** adherirse estrictamente a las directrices definidas en `slate_precision_design.md`.

---

## 4. Estructura de Carpetas de Referencia (MVP)

```text
uloom/
├── architecture.md
├── MDs/
│   ├── context.md
│   └── what_to_do.md
│
├── doc/
│   ├── backend.md
│   ├── config-file.md
│   └── rules.md
│
├── changelog/
│
├── stich/
│   ├── themes/
│   │   └── slate_precision_design.md
│   └── views/
│
├── src/
│   ├── main/                      # BACKEND (Electron Main Process)
│   │   ├── index.js               # Punto de entrada de Electron (creación de ventana)
│   │   ├── ipc/                   # Controladores (Listeners de ipcMain)
│   │   ├── services/              # LauncherService (shell.openExternal)
│   │   └── data/                  # Repositorio (lectura/escritura de config.json)
│   │
│   ├── preload.js                 # BRIDGE (contextBridge → window.uloomApi)
│   │
│   └── renderer/                  # FRONTEND (React - FSD simplificado)
│       ├── index.jsx
│       ├── app/
│       │   └── pages/
│       │       ├── WorkspaceHub.jsx
│       │       ├── WorkspaceDetail.jsx
│       │       ├── Settings.jsx
│       │       └── index.js
│       ├── widgets/
│       │   ├── hooks/
│       │   │   ├── useScrollLock.js
│       │   │   └── index.js
│       │   ├── layout/
│       │   │   └── index.js
│       │   ├── ui/
│       │   │   ├── Button/
│       │   │   │   └── Button.jsx
│       │   │   ├── Card/
│       │   │   │   └── Card.jsx
│       │   │   ├── Modal/
│       │   │   │   └── Modal.jsx
│       │   │   └── index.js
│       │   └── index.js
│       ├── features/
│       │   └── workspace/
│       │       ├── hook/
│       │       ├── ui/
│       │       └── index.js
│       ├── entities/
│       │   └── workspace/
│       │       ├── api/
│       │       │   ├── workspaceIpcApi.js
│       │       │   └── index.js
│       │       └── ui/
│       │           └── WorkspaceCard.jsx
│       └── shared/
│           ├── hook/
│           ├── ui/
│           └── index.js
│
└── ... (forge.config.js, package.json, etc.)
```

---

## Fuera de alcance del MVP

Las siguientes ideas aparecían en versiones anteriores de este documento y quedan **fuera del MVP v0.1.0**. Se documentan acá únicamente como referencia histórica, no como especificación activa:

- Catálogo de Apps (`catalogoApps`), escaneo del Start Menu, apps nativas agregadas manualmente.
- Campo `catalogoApps` y `appList` en `config.json`.
- `LauncherService` haciendo *spawn* de ejecutables (`.exe`).
- Modal "Add Native Apps".

Si en una fase futura se retoma alguna de estas features, se debe crear una nueva sección versionada en este documento (no mezclarla con la descripción del MVP actual).
