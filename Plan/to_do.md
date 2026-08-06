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

[ ] decidir si hacer todo elemento en la aplicacion, no copiable (es decir, que el texto de los elementos no sea copiable. Como el texto de las cards y demas.) 

[ ] Lienzo de Trabajo: Página principal para gestionar la sesión seleccionada.

[ ] Vista de Pestañas Web: Renderizado de la lista de URLs añadidas con su icono y título.

[ ] Navegación entre Vistas: Conexión de rutas entre el Hub, el Detalle y la Configuración.

v0.1.4 Pantalla 3: Opciones (Settings)
[ ] Diseño de Ajustes: Página de configuración general con apartado de Portabilidad.

🟡 v0.2.0 — Gestor de Recursos Web (Tabs CRUD)
Objetivo: Darle funcionalidad a la página de detalle para permitir agregar, editar, eliminar y configurar el comportamiento de las pestañas web.

v0.2.1 Administración de Pestañas
[ ] Añadir Web Tab: Formulario con inputs para URL y Nombre sugerido/personalizado.

[ ] Asignación de Icono: Icono por defecto (mapamundi) y extracción/asignación del favicon si está disponible.

[ ] Eliminar Web Tab: Opción para remover URLs de la lista de la sesión.

v0.2.2 Configuración de Navegador por Sesión
[ ] Comportamiento de Apertura: Selector de opción para elegir si la sesión se abre en una Ventana Nueva o en la Ventana Activa del navegador.

[ ] Navegador por Defecto: Selección del navegador a utilizar para la sesión.

v0.2.3 Refactor pendiente (del @reviewer de widgets de formulario)
[x] Widget IconButton: Extraer el patrón de botón/icono duplicado (focus ring, active:scale, hover, span material-symbols 24px) que hoy vive inline en Button, IconPicker y WorkspaceGrid; consumirlo desde el barrel widgets/ui.
[ ] Footer de acciones del Modal: Extraer widget compartido para el par de botones (secondary + primary, .flex-1) duplicado entre CreateWorkspaceModal y ConfirmDialog.
[ ] widgets/index.js: Reexportar también el segmento layout/ (hoy vacío) para cumplir el contrato de architecture.md y evitar roturas silenciosas.
[ ] FormField accesibilidad: Propagar el estado required/aria-required al elemento hijo (hoy solo el asterisco visual con aria-hidden).
[ ] @typedef de useCreateWorkspace: Nombrar la forma de retorno del hook y corregir el JSDoc del prop form en CreateWorkspaceModal (hoy tipa la función, no el objeto retornado).
[ ] Documentar la excepción estructural: la familia form/ agrupa sus componentes en una carpeta común, a diferencia de ui/<Widget>/<Widget>.jsx.
[ ] Deuda de accesibilidad WorkspaceCard (trade-off aceptado): role="button" en la card conteniendo el <button> play anida controles interactivos (ARIA). Revisar cuando se implemente el launch real (v0.3.0) si se reestructura (p. ej. botón explícito "Abrir").
[x] WorkspaceGrid: el botón nativo "Crear nueva sesión" (grid) reimplementa estilos de Card/Button a mano; migrarlo a widgets (Card clickeable o Button) para cumplir "siempre usar widgets". → Widget CreateTile en widgets/ui/CreateTile. 
[ ] Contraste AA en dark: --primary (#5048e5) usado como color de texto (hover:text-primary de ghost, text-primary de secondary) queda ~3.1:1 sobre --background dark — por debajo de AA para texto. Definir un tinte de texto más claro o ajustar el token en dark.

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