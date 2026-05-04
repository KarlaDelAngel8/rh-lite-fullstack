// Este módulo sirve para: Definir las constantes de rutas del endpoint del catálogo de Departamentos.
// Elaborado por: Karla Vanessa Del Angel Santiago

export const DEPARTMENTS_ROUTES = {
  INDEX: '/departments',
  TEMPLATE: '/departments/template',
  CREATE: '/departments/create',
  ACTIVE: '/departments/active',
  BY_ID: (departmentId) => `/departments/${departmentId}`,
  UPDATE: (departmentId) => `/departments/update/${departmentId}`,
  DELETE: (departmentId) => `/departments/delete/${departmentId}`,
  IMPORT: '/departments/import',
};
