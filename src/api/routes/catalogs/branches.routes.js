// Este módulo sirve para: Definir las constantes de rutas del endpoint del catálogo de Sucursales.
// Elaborado por: Karla Vanessa Del Angel Santiago

export const BRANCHES_ROUTES = {
  INDEX: '/branches',
  TEMPLATE: '/branches/template',
  CREATE: '/branches/create',
  ACTIVE: '/branches/active',
  BY_ID: (branchId) => `/branches/${branchId}`,
  UPDATE: (branchId) => `/branches/update/${branchId}`,
  DELETE: (branchId) => `/branches/delete/${branchId}`,
  IMPORT: '/branches/import',
};
