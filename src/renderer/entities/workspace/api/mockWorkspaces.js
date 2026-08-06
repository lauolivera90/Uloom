/**
 * Sesiones de prueba para el Hub durante la fase de mock (v0.1.2).
 * @type {import('../../../shared/types.js').Workspace[]}
 */
export const mockWorkspaces = [
  {
    id: 'ws-desarrollo-web',
    name: 'Desarrollo Web',
    description: 'Sesión de Desarrollo Web',
    icon: 'code',
    tabs: [
      { id: 'tab-1', url: 'https://developer.mozilla.org', name: 'MDN Web Docs' },
      { id: 'tab-2', url: 'https://react.dev', name: 'React' },
    ],
  },
  {
    id: 'ws-investigacion',
    name: 'Investigación',
    description: 'Sesión de Investigación',
    icon: 'science',
    tabs: [
      { id: 'tab-3', url: 'https://scholar.google.com', name: 'Google Scholar' },
      { id: 'tab-4', url: 'https://arxiv.org', name: 'arXiv' },
    ],
  },
  {
    id: 'ws-diseno',
    name: 'Diseño',
    description: 'Sesión de Diseño',
    icon: 'palette',
    tabs: [],
  },
];
