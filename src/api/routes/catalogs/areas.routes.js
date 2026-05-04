// Este módulo sirve para: Definir las constantes de rutas del endpoint del catálogo de Áreas.
// Elaborado por: Karla Vanessa Del Angel Santiago

export const AREAS_ROUTES = {
  INDEX: '/areas',
  TEMPLATE: '/areas/template',
  CREATE: '/areas/create',
  ACTIVE: '/areas/active',
  BY_ID: (areaId) => `/areas/${areaId}`,
  UPDATE: (areaId) => `/areas/update/${areaId}`,
  DELETE: (areaId) => `/areas/delete/${areaId}`,
  IMPORT: '/areas/import',
};
