// Este módulo sirve para: Definir las constantes de rutas del endpoint del catálogo de Tipos de Contrato.
// Elaborado por: Karla Vanessa Del Angel Santiago

export const CONTRACT_TYPES_ROUTES = {
  INDEX: '/contract-types',
  TEMPLATE: '/contract-types/template',
  CREATE: '/contract-types/create',
  ACTIVE: '/contract-types/active',
  BY_ID: (contractTypeId) => `/contract-types/${contractTypeId}`,
  UPDATE: (contractTypeId) => `/contract-types/update/${contractTypeId}`,
  DELETE: (contractTypeId) => `/contract-types/delete/${contractTypeId}`,
  IMPORT: '/contract-types/import',
};
