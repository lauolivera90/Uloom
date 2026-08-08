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

[ ] Botón para reiniciar el icono de la pestaña (pendiente, junto a la asignación de iconos): cuando se implemente subir favicon / elegir del catálogo, mostrar una acción de reinicio SOLO si el icono fue seteado manualmente; si proviene de la URL de la página (favicon por defecto), NO mostrarla. En `useAddTabForm`: visible cuando icono ≠ default, al presionar → restaurar default (mapamundi) y colapsar el picker.

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
[ ] Deuda de accesibilidad WorkspaceCard (trade-off aceptado): role="button" en la card conteniendo el <button> play anida controles interactivos (ARIA). Revisar cuando se implemente el launch real (v0.3.0) si se reestructura (p. ej. botón explícito "Abrir").
[x] WorkspaceGrid: el botón nativo "Crear nueva sesión" (grid) reimplementa estilos de Card/Button a mano; migrarlo a widgets (Card clickeable o Button) para cumplir "siempre usar widgets". → Widget CreateTile en widgets/ui/CreateTile. 
[x] Contraste AA en dark: resuelto en v0.1.5 con la regla "fill vs foreground" — `--primary` (valor base) queda reservado a fills (`bg-primary`) y el foreground de primary (texto/íconos/bordes/rings) pasa a `--primary-hover`, que supera AA en ambos temas. No se tocaron los valores RGB.

🟢 v0.3.0 — Motor de Lanzamiento (Disparador IPC)
Objetivo: Conectar el botón principal con el sistema operativo para ejecutar la apertura masiva de enlaces.

v0.3.1 Disparador Principal
[ ] Botón "Launch Workspace": Botón prominente en la interfaz de detalle.

[ ] Lógica de Apertura IPC: Evento en Node.js/Electron que recorre las URLs de la sesión y las abre mediante shell.openExternal().

🔵 v0.4.0 — Portabilidad de Datos (Import / Export)
Objetivo: Permitir al usuario respaldar o compartir sus configuraciones de sesiones mediante archivos JSON.

v0.4.1 Exportación
[ ] Exportar Sesión Individual: Botón en la página de Detalle para descargar la sesión actual como archivo .json.

[ ] Exportar Todo: Botón en la página de Opciones para descargar un respaldo completo de todas las sesiones.

v0.4.2 Importación
[ ] Importar Sesión/Sistema: Selector de archivos en Opciones para cargar un .json y reconstruir las sesiones en el config.json local.

[ ] Sistema de Temas (Claro/Oscuro): Implementar el runtime del toggle — ThemeProvider + hook useTheme en app/shared, persistencia en localStorage (clave `uloom-theme`), default a `prefers-color-scheme`, y script anti-flash en el entry. Los tokens CSS (`--primary`, etc.) y su mapeo en Tailwind ya están definidos; queda pendiente solo el runtime, que depende del boot de React.