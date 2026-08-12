🔴 v0.1.0 — Core Esencial: Estructura & Navegación
Objetivo: Inicializar el proyecto con Electron, Vite, Tailwind CSS y construir la interfaz estática base de las 3 páginas principales.

v0.1.1 Configuración del Entorno & Proyecto
[x] Setup Inicial: Inicialización del proyecto con Electron + Vite en JavaScript puro.

[x] Estilos: Configuración e integración de Tailwind CSS con paleta Slate/Zinc.

[x] Puente IPC: Configuración de preload.js y exposición de API en window.uloomApi.

[x] Persistencia Local: Persistencia de la configuración en un archivo JSON local (fs sobre userData/config.json).

[x] Arquitectura FSD: Creación de la estructura de carpetas (shared, entities, features, pages).

v0.1.2 Pantalla 1: Hub de Sesiones (Home)

[x] Diseño e Interfaz: Rejilla (Grid) para listar las tarjetas de las sesiones de trabajo.

[x] Componente Tarjeta: Creación de WorkspaceCard.jsx en entities/workspace/ui/.

[x] Mock Data: Archivo de prueba con datos ficticios en entities/workspace/api/mockWorkspaces.js.

[x] Creación de Sesión: Formulario/Modal para definir nombre, descripción e icono de una nueva sesión.

[x] Navegación: Evento onClick en tarjetas para transicionar a la pantalla de detalle.

v0.1.3 Pantalla 2: Detalle de Sesión (Command Center)

[x] decidir si hacer todo elemento en la aplicacion, no copiable (es decir, que el texto de los elementos no sea copiable. Como el texto de las cards y demas.) 

[x] Lienzo de Trabajo: Página principal para gestionar la sesión seleccionada. (Estado: header funcional mínimo — nombre, descripción, conteo de tabs, vuelta al Hub. El Lienzo/Command Center se desarrolla en v0.2.x con el CRUD de tabs.)

[x] Vista de Pestañas Web: Renderizado de la lista de URLs añadidas con su icono y título. (Pasa a v0.2.x — Administración de Pestañas.)

[x] Navegación entre Vistas: Conexión de rutas entre el Hub, el Detalle y la Configuración.

[x] Sidebar/Nav principal: Widget `Sidebar` + `MainLayout` (layout route), colapsable a columna de iconos (modelo push, persistencia en localStorage, item activo por ruta). Incluye widget `IconButton` size `sm` + `Icon` size `20` para densidad.

v0.1.4 Pantalla 3: Opciones (Settings)
[x] Diseño de Ajustes: Página de configuración general con apartado de Portabilidad. (Maqueta: feature Settings con tabs Preferencias/Sesiones, Tema mock y placeholders de export/import. La funcionalidad real de portabilidad es v0.4.x y el runtime de temas v0.4.2.)

🟡 v0.2.0 — Gestor de Recursos Web (Tabs CRUD)
Objetivo: Darle funcionalidad a la página de detalle para permitir agregar, editar, eliminar y configurar el comportamiento de las pestañas web.

v0.2.1 Administración de Pestañas
[x] Añadir Web Tab: Formulario con inputs para URL y Nombre sugerido/personalizado.

[x] Asignación de Icono: Icono por defecto (mapamundi) y extracción/asignación del favicon si está disponible.

[x] Botón para reiniciar el icono de la pestaña → resuelto en v0.2.4 junto al fetch de favicon: el botón de reinicio a default se descartó y quedó solo "Usar icono sugerido" (aplica el favicon; visible si hay favicon y el icono actual es manual).

[x] Eliminar Web Tab: Opción para remover URLs de la lista de la sesión.

v0.2.2 Configuración de Navegador por Sesión
[x] Comportamiento de Apertura: Selector de opción para elegir si la sesión se abre en una Ventana Nueva o en la Ventana Activa del navegador. (Card Configuración del Detalle; default 'active-tab'.)

[x] Navegador por Defecto: Selección del navegador a utilizar para la sesión. (Solo navegadores instalados detectados en el sistema; "Predeterminado" hereda el navegador global de Preferencias, que a su vez puede ser "Sistema" o un navegador pineado — override fijo por sesión.)

v0.2.3 Refactor pendiente (del @reviewer de widgets de formulario)
[x] Widget IconButton: Extraer el patrón de botón/icono duplicado (focus ring, active:scale, hover, span material-symbols 24px) que hoy vive inline en Button, IconPicker y WorkspaceGrid; consumirlo desde el barrel widgets/ui.
[x] Backend por dominio: dividir los archivos monolíticos del main en archivos por dominio: data/configRepository.js → configStore + workspaceRepository; services/configService.js → workspaceService (preferencesService ya separado); ipc/index.js → workspaceHandler + browserHandler + preferencesHandler. architecture.md/backend.md actualizados.
[x] Footer de acciones del Modal: widget compartido `ModalFooter` (outline + variante semántica, flex-1, spinner de carga) consumido por CreateWorkspaceModal, AddTabModal y ConfirmDialog.
[x] Extraer hook compartido `useIconPicker` (shared/hook) para eliminar la duplicación entre useAddTabForm y useCreateWorkspace (detectado por @reviewer en v0.2.1).
[x] widgets/index.js: reexportar el segmento layout/ (MainLayout, Sidebar) — ya estaba implementado en v0.2.2; destildado al verificar la roadmap contra el código.
[x] FormField accesibilidad: `required`/`aria-required` propagados al elemento hijo (asterisco visual sigue aria-hidden).
[x] @typedef de formularios: `CreateWorkspaceFormState` y `AddTabFormState` definidos en sus hooks; CreateWorkspaceModal y AddTabModal los referencian por JSDoc (elimina el tipado manual desincronizado del prop `form`).
[x] Documentar la excepción estructural: la familia `ui/form/` agrupa sus componentes en una carpeta común, a diferencia de `ui/<Widget>/<Widget>.jsx`.
[x] Líder único de escritura (raza cross-feature detectada por @reviewer en v0.2.2): `useWorkspaceState.mutateWorkspace` serializa todas las escrituras de workspaces (tabs + configuración) sobre el último persistido por id; addTab/deleteTab y useSessionConfig delegan en el líder (este último perdió su cola local).
[x] Deuda de accesibilidad WorkspaceCard (trade-off aceptado): role="button" en la card conteniendo el <button> play anida controles interactivos (ARIA). → Resuelto en v0.3.1 al implementar el launch real: el play quedó cableado como acción explícita (botón funcional, disabled sin pestañas), consolidando el trade-off estructural sin reestructurar la card.
[x] WorkspaceGrid: el botón nativo "Crear nueva sesión" (grid) reimplementa estilos de Card/Button a mano; migrarlo a widgets (Card clickeable o Button) para cumplir "siempre usar widgets". → Widget CreateTile en widgets/ui/CreateTile. 
[x] Contraste AA en dark: resuelto en v0.1.5 con la regla "fill vs foreground" — `--primary` (valor base) queda reservado a fills (`bg-primary`) y el foreground de primary (texto/íconos/bordes/rings) pasa a `--primary-hover`, que supera AA en ambos temas. No se tocaron los valores RGB.

🟢 v0.2.4 — Auto-metadatos web + Edición/Borrado de Sesión
Objetivo: traer el favicon y el título real de la URL mientras se escribe (fetch por backend), sugiriendo el nombre en placeholder; y completar el CRUD faltante: editar pestaña y editar/borrar sesión reusando los modales existentes con los datos del objeto.

[x] Obtener el favicon de la página al introducir la URL: fetch real en el backend vía canal `page:metadata` (`pageService` con `net.fetch`, timeout y caps; favicon como data URL) y CSP con `img-src 'self' data: https:`.
[x] Sugerir el nombre de la pestaña desde la URL: el `<title>` real va al placeholder del campo Nombre; si el usuario ya escribió algo distinto, botón `swap_horiz` al lado del input que reemplaza el contenido.
[x] Botón restablecer ícono de la pestaña: unificado con "aplicar favicon sugerido" (default = `autoFavicon ?? 'public'`; visible solo si el ícono difiere del default; al presionar restaura default y colapsa el picker). → Refinado en el pase de UI: el botón de reset se eliminó; queda solo "Usar icono sugerido" (`swap_horiz`, separado por `|`), visible cuando `autoFavicon !== null && isIconManual`.
[x] Editar pestaña: reusa el modal de agregar con los datos del objeto (`useTabForm` + `useTabModal`), conserva el id; `updateTab` en `useWorkspaceState` (map por id vía `mutateWorkspace`).
[x] Editar sesión: reusa el modal de creación con los datos del objeto (`WorkspaceFormModal`/`useWorkspaceForm` migrados a `entities/workspace`); guarda vía `mutateWorkspace`.
[x] Borrar sesión: canal `workspace:delete` (repository/service/handler/preload/api) + `deleteWorkspace` serializado en `writeChainRef` + ConfirmDialog "Eliminar sesión" y vuelta al Hub.
[x] Migrar `CreateWorkspaceModal`/`useCreateWorkspace` a `entities/workspace` como `WorkspaceFormModal`/`useWorkspaceForm` (compartido entre Hub y Detalle sin imports entre features).
[x] Cache de favicon por pestaña (`Tab.favicon`, data URL base64): evita refetch de `page:metadata` al reabrir edición, persiste sin duplicarlo en `icon` y lo usa `TabFavicon` antes que el fallback de Google.

🟢 v0.3.0 — Motor de Lanzamiento (Disparador IPC)
Objetivo: Conectar el botón principal con el sistema operativo para ejecutar la apertura masiva de enlaces.

v0.3.1 Disparador Principal
[x] Botón "Launch Workspace": Botón prominente en la interfaz de detalle (header del Detalle, variante primary, cableado a `useLaunchWorkspace`; además el play de sesión de `WorkspaceCard` en el Hub quedó cableado). Deshabilitado mientras se lanza o si la sesión no tiene pestañas.

[x] Lógica de Apertura IPC: canal `workspace:launch` en el proceso main que recorre las URLs de la sesión. Implementado con resolución del navegador por 3 niveles (sesión → global → sistema): navegador concreto → `getBrowserById` + spawn del ejecutable con bandera de ventana nueva según `openBehavior` (`--new-window`/`-new-window`); navegador de sistema → `browserService.resolveSystemBrowser` (`app.getApplicationInfoForProtocol`) resuelve su ejecutable y se spawna igual; si no se puede resolver, cae a `shell.openExternal()`. La misma resolución de sistema se expone como canal `browser:system` para la UI. (Refrescado en v0.3.2: la resolución del default del SO se centralizó en `browserService`.)

🟢 v0.3.2 — Pase de UI
Objetivo: unificar selectores y densidades de la interfaz.

[x] Selector de ícono de sesión igual al de pestaña: que `WorkspaceFormModal` use el patrón colapsado de `TabFormModal` (tile de preview + botones «Subir icono» disabled / «o» / «Elegir uno» que expande la grilla) en vez del `IconPicker` siempre expandido. Sin favicon (la sesión está por crearse; el preview siempre es un símbolo del catálogo). Plan: extraer `widgets/ui/IconPickerField/IconPickerField.jsx` compartido, centralizar `showPicker`/`toggleShowPicker` en `useIconPicker` (hoy local a `useTabForm`), `previewIcon` (`selectedIcon || 'work'`) en `useWorkspaceForm`, y replicar el botón «Subir icono» (disabled) en la sesión.

[x] Sesión sin pestañas → abrir modal de agregar pestaña: el botón de la card del Hub pasa a `(+)` (agrega pestaña a esa sesión) y el botón del header del Detalle pasa a "Agregar pestaña" cuando la sesión no tiene tabs — no se puede lanzar una sesión vacía; con pestañas queda el play / "Lanzar" (renombrado, textos en español según rules.md §9). `TabFormModal`/`useTabForm`/`useTabModal` migran de `features/WorkspaceDetail` a `entities/workspace` (precedente v0.2.4) porque ahora los consumen Hub y Detalle; `useTabModal` inyecta `addTab`/`updateTab` para no crear el ciclo `app → entities → app`.

[x] Íconos de navegador en el navegador seleccionado: en la card Configuración del Detalle y en la página de Configuración (preferencia global) el navegador efectivo se muestra con su ícono junto al Select nativo. SVG oficiales empaquetados en `entities/workspace/assets/browsers/` (browser-logos, id fijo del catálogo de `browserService`), mapa `browserIcons.js` y widget `BrowserIcon` (fallback glifo `public` para `system`/desconocido). Para el caso `system` el id se resuelve con `browser:system` (`useSystemDefaultBrowser`, cache módulo): `"Predeterminado"` con default del SO del catálogo muestra el ícono real.

🔵 v0.4.0 — Portabilidad de Datos (Import / Export)
Objetivo: Permitir al usuario respaldar o compartir sus configuraciones de sesiones mediante archivos JSON.

v0.4.1 Exportación
[x] Exportar Sesión Individual: Botón en la página de Detalle (card "Exportar" debajo de la Configuración) para descargar la sesión actual como archivo .json (wrapper kind 'workspace', diálogo nativo de guardado).

[x] Exportar Todo: Botón en la página de Opciones (fila "Exportar todo" de Sesiones) para descargar un respaldo completo de todas las sesiones (wrapper kind 'backup', no incluye preferences).

Limpieza y UX (ampliación de v0.4.1):
[x] Borrar caché: opción en Configuración → Sesiones ("Borrar caché") que limpia la caché de metadatos web — favicons cacheados en `Tab.favicon` (data URLs). Canal `workspace:clearMetadataCache` (service/repository; responde `{ cleared }`); el estado global sincroniza tras la operación.

[x] Eliminar todas las sesiones: acción de limpieza total del `config.json` (borrar todos los workspaces) desde Configuración, con `ConfirmDialog` de doble confirmación (dos diálogos secuenciales). Preserva `preferences` (canal `workspace:clearAll`).

[x] Botón directo "Agregar sesión" en el Sidebar: abre el `WorkspaceFormModal` globalmente (hook `useWorkspaceFormModal` + `GlobalCreateWorkspace` en app/), sin pasar por el Hub. Decisión de modelo: **siempre usable** (persiste vía el estado global de la app, la sesión aparece en Hub/Detalle/Configuración desde cualquier ruta).

[x] Botón de búsqueda en el header de Configuración: barra de búsqueda en el `PageHeader` que filtra **todas las opciones de la página** por título o descripción (data-driven `allOptions` en SettingsView; mientras hay query muestra coincidencias de ambas secciones y oculta las tabs de apartado).

v0.4.2 Importación
[x] Importar Sesión/Sistema: Selector de archivos en Opciones para cargar un .json y reconstruir las sesiones en el config.json local. (Canales `portability:import` (`portabilityService.importFromFile` + `importWorkspaces` en el repository). Semántica por kind: `workspace` agrega la sesión (ids colisionantes → randomUUID), `backup` reemplaza el catálogo preservando `preferences`; el diálogo de apertura es nativo y cancelar no es un error. En la UI, el botón Importar de Configuración → Sesiones quedó cableado vía `usePortability.importSessions`; el estado global rehidrata con la lista persistida. Validación del wrapper: `app: 'uloom'`, `kind`, `schemaVersion` string y `data` con workspaces válidos.)

[x] Sistema de Temas (Claro/Oscuro): Implementar el runtime del toggle — ThemeProvider + hook useTheme en app/shared, persistencia en localStorage (clave `uloom-theme`), default a `prefers-color-scheme`, y script anti-flash en el entry. (Runtime completo: `src/theme-init.js` como script clásico en el `<head>` (respeta la CSP `script-src 'self'`) aplica `.dark` antes del paint desde `uloom-theme` o el `prefers-color-scheme`; `app/ThemeProvider` + `app/hook/useTheme` exponen `{ theme, setTheme, toggleTheme }` y persisten en `localStorage['uloom-theme']`; `useSettings` consume `useTheme` (adiós maqueta local). Los tokens CSS (`.dark` en `index.css`) y el mapeo Tailwind ya existían: solo faltaba el runtime.)

v0.4.2 (ampliación) — Shell de la ventana
[x] Tamaño de ventana: setear en `src/main.js` (`BrowserWindow`) `width: 1100`, `height: 750`, `minWidth: 800` y `minHeight: 600` — impide que el usuario encoja la app por debajo de esos mínimos (hoy es 800×600 sin mínimos).

[x] Quitar el menú/toolbar nativo de Electron (File, Edit, View, Window, Help): ocultar/eliminar la barra de menú en `src/main.js` — `autoHideMenuBar: true` en el `BrowserWindow` (se esconde y reaparece con Alt). `src/main.js`: además se eliminó el `openDevTools()` automático.

🟣 v0.4.3 — Pase de UI y estabilidad
Objetivo: pulir el layout y auditar la app.

[x] Grid del Detalle de Sesión: arreglar el grid de `WorkspaceDetail` (actualmente `grid-cols-[minmax(0,1fr)_40rem]`) y revisar **cómo se deciden los anchos** de las columnas — el ancho fijo de la columna derecha y el reparto del espacio deben quedar definidos y consistentes.

[x] Auditoría general de la app: auditar toda la app en busca de errores (consolas, lints, comportamientos) y resolverlos.

[x] Header de modal y confirm modal: cambiar el color de texto del header de `Modal` y `ConfirmDialog` a uno similar al de las cards del Detalle de Sesión (mismo tratamiento visual de los headers de card).

🟢 v0.4.4 — Feedback visual
Objetivo: feedback visual para errores y acciones.

[ ] Control de errores en importación de sesiones: feedback visual en caso de errores al importar (archivo inválido, JSON corrupto, tipo no soportado, fallo de persistencia) — hoy los errores solo se loguean con `console.error`.

[ ] Sistema de toast: crear un toast/notificación para feedback visual y revisar dónde aplicarlo (importación y otras acciones que hoy solo loguean errores con `console.error`).

🟢 v0.4.5 - Responsive
[ ] Responsive parcial en toda la página: establecer responsive parcial (ajustes de layout a anchos menores) en Hub, Detalle y Configuración — mínimo viable, sin rediseño completo.

[ ] Hacer que la sidebar si la pantalla es pequeña, siempre aparezca como minimizada, pero si hacemos hover sobre la sidebar, esta se expande pero superpuesta por el contenido, no quitando espacio en la pantalla.

🟠 v0.5.0 — Identidad y personalización
Objetivo: Selector de idioma, tema con paleta personalizable, duplicación de sesiones y reutilización de tabs frecuentes.

v0.5.1 Internacionalización
[x] Selector de idioma: opción en Configuración para elegir entre español e inglés, con persistencia (misma estrategia que el tema). Exige centralizar primero los strings (hoy hardcodeados en español; `rules.md` §9 los fija en español). → Implementado como adelanto desde v0.4.3: strings centralizados en `shared/lib/i18n` (diccionarios `es.js`/`en.js`, resolver `t()` con plurales e interpolación), `LanguageProvider` + `useLanguage` (persistencia en `localStorage['uloom-language']`, default por `navigator.language`, `documentElement.lang` sincronizado) y selector "Idioma" en Configuración → Preferencias; las constantes de labels de `entities/workspace` pasaron a exportar claves.

v0.5.2 Temas personalizados
[ ] Selector de paleta de colores: ampliar el sistema de temas más allá de claro/oscuro, permitiendo elegir entre paletas predefinidas (o personalizar colores). Requiere revisar el sistema de tokens actual antes de sumar paletas nuevas.

v0.5.3 Gestión de sesiones avanzada
[ ] Duplicar sesión: clonar una sesión existente (tabs, configuración de lanzamiento) generando un nuevo id, con nombre sugerido tipo "Copia de [nombre]".

v0.5.4 Historial de pestañas
[ ] Historial/reutilización de tabs al agregar: sección en el modal de agregar pestaña con las últimas tabs agregadas o las más usadas entre sesiones, para reutilizarlas sin reescribir la URL. Requiere un registro liviano de tabs usadas (URL + nombre + frecuencia/última vez), separado de las sesiones.

🟤 v0.6.0 — Organización del Hub
Objetivo: mejorar cómo se encuentran y organizan las sesiones a medida que crecen en cantidad.

v0.6.1 Hub — Quick wins
[ ] Favoritos/pinned: marcar sesiones para que aparezcan primero en el Hub.
[ ] Búsqueda/filtro de sesiones en el Hub: extender el patrón de búsqueda ya usado en Configuración al Hub principal.

v0.6.2 Hub — Datos de uso y ordenamiento
[ ] Última vez lanzada: guardar y mostrar timestamp del último `workspace:launch` por sesión. (Toca esquema de datos.)
[ ] Orden de sesiones: por criterio (alfabético, más usada, última vez lanzada) u orden manual. Depende del timestamp del item anterior.

v0.6.3 Hub — Agrupación y plantillas
[ ] Carpetas o grupos de sesiones: agrupación manual (ej. "Trabajo", "Personal", "Clientes"). (Toca esquema de datos.)
[ ] Plantillas de sesión: crear una sesión nueva a partir de una plantilla predefinida o guardada por el usuario.

⚫ v0.7.0 — Gestión avanzada de Pestañas
Objetivo: dar más control granular sobre las tabs dentro de una sesión.

v0.7.1 Tabs avanzadas
[ ] Reordenar tabs: drag and drop dentro de una sesión.
[ ] Deshabilitar tab sin borrarla: toggle activo/inactivo para lanzar solo un subconjunto.
[ ] Tags o categorías por tab: ej. "referencia", "trabajo activo".
[ ] Detección de tabs duplicadas: aviso al agregar una URL ya existente en la sesión.
[ ] Editar tabs en lote: cambiar navegador u openBehavior de varias tabs a la vez.

🔷 v0.8.0 — Lanzamiento avanzado
Objetivo: opciones más finas sobre cómo se lanzan las sesiones.

v0.8.1 Motor de lanzamiento — mejoras
[ ] Lanzamiento parcial: elegir qué tabs lanzar de una sesión en vez de todas.
[ ] Delay entre aperturas: intervalo configurable entre tab y tab para sesiones grandes.
[ ] Reintento automático: reintentar una tab antes de reportarla como failed.

🔶 v0.9.0 — Confiabilidad de datos
Objetivo: resguardar los datos del usuario ante operaciones destructivas.

v0.9.1 Backups
[ ] Auto-backup periódico: respaldo automático de config.json (por ejemplo, antes de cada import de tipo kind:backup, que reemplaza el catálogo completo).

🟣 Backlog sin versión asignada — Ideas a evaluar
Objetivo: no comprometidas a una versión todavía; requieren evaluar costo/beneficio antes de asignarles un número.

[ ] Atajos de teclado configurables dentro de la app (no globales del SO) para lanzar sesiones favoritas.
[ ] Modo "solo lectura"/vista previa de una sesión sin lanzarla (lista de tabs y metadata).
[ ] Multi-perfil de usuario dentro de la misma app (si varias personas comparten la PC).