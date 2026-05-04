// Este módulo sirve para: Servicio API del catálogo de Estados de Candidatos. Provee los métodos para listar, crear, actualizar y eliminar estados del proceso de reclutamiento.
// Elaborado por: Karla Vanessa Del Angel Santiago

import api from '@/lib/axios';
import { CANDIDATE_STATES_ROUTES } from '@/api/routes/catalogs/candidate-states.routes';

export default {
  all(params = {}) {
    return api.get(CANDIDATE_STATES_ROUTES.INDEX, { params });
  },

  downloadTemplate() {
    return api.get(CANDIDATE_STATES_ROUTES.TEMPLATE, { responseType: 'blob' });
  },

  create(payload) {
    return api.post(CANDIDATE_STATES_ROUTES.CREATE, payload);
  },

  active() {
    return api.get(CANDIDATE_STATES_ROUTES.ACTIVE);
  },

  show(candidateStateId) {
    return api.get(CANDIDATE_STATES_ROUTES.BY_ID(candidateStateId));
  },

  update(candidateStateId, payload) {
    return api.put(CANDIDATE_STATES_ROUTES.UPDATE(candidateStateId), payload);
  },

  changeStatus(candidateStateId, payload = {}) {
    return api.put(CANDIDATE_STATES_ROUTES.DELETE(candidateStateId), payload);
  },

  importExcel(formData) {
    return api.post(CANDIDATE_STATES_ROUTES.IMPORT, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
