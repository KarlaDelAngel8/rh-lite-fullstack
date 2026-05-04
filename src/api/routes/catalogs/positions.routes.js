// Este módulo sirve para: Definir las constantes de rutas del endpoint del catálogo de Puestos.
// Elaborado por: Karla Vanessa Del Angel Santiago

export const POSITIONS_ROUTES = {
  INDEX: '/positions',
  TEMPLATE: '/positions/template',
  CREATE: '/positions/create',
  ACTIVE: '/positions/active',
  BY_ID: (positionId) => `/positions/${positionId}`,
  UPDATE: (positionId) => `/positions/update/${positionId}`,
  DELETE: (positionId) => `/positions/delete/${positionId}`,
  IMPORT: '/positions/import',
};
