// Este módulo sirve para: Definir las constantes de rutas del endpoint del catálogo de Estados de Candidatos.
// Elaborado por: Karla Vanessa Del Angel Santiago

export const CANDIDATE_STATES_ROUTES = {
  INDEX: '/candidate-states',
  TEMPLATE: '/candidate-states/template',
  CREATE: '/candidate-states/create',
  ACTIVE: '/candidate-states/active',
  BY_ID: (candidateStateId) => `/candidate-states/${candidateStateId}`,
  UPDATE: (candidateStateId) => `/candidate-states/update/${candidateStateId}`,
  DELETE: (candidateStateId) => `/candidate-states/delete/${candidateStateId}`,
  IMPORT: '/candidate-states/import',
};
