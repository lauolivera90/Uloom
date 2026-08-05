🔴 v0.1.0 — Core Esencial: Estructura & Navegación
Objetivo: Inicializar el proyecto con Electron, Vite, Tailwind CSS y construir la interfaz estática base de las 3 páginas principales.

v0.1.1 Configuración del Entorno & Proyecto
[ ] Setup Inicial: Inicialización del proyecto con Electron + Vite en JavaScript puro.

[ ] Estilos: Configuración e integración de Tailwind CSS con paleta Slate/Zinc.

[ ] Puente IPC: Configuración de preload.js y exposición de API en window.uloomApi.

[ ] Persistencia Local: Configuración de electron-store para la base de datos en JSON local.

[ ] Arquitectura FSD: Creación de la estructura de carpetas (shared, entities, features, pages).

v0.1.2 Pantalla 1: Hub de Sesiones (Home)
[ ] Diseño e Interfaz: Rejilla (Grid) para listar las tarjetas de las sesiones de trabajo.

[ ] Componente Tarjeta: Creación de WorkspaceCard.jsx en entities/workspace/ui/.

[ ] Mock Data: Archivo de prueba con datos ficticios en entities/workspace/api/mockWorkspaces.js.

[ ] Creación de Sesión: Formulario/Modal para definir nombre, descripción e icono de una nueva sesión.

[ ] Navegación: Evento onClick en tarjetas para transicionar a la pantalla de detalle.

v0.1.3 Pantalla 2: Detalle de Sesión (Command Center)
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
[ ] Importar Sesión/Sistema: Selector de archivos en Opciones para cargar un .json y reconstruir las sesiones en electron-store.