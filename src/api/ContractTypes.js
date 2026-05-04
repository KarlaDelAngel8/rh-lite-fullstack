// Este módulo sirve para: Servicio API del catálogo de Tipos de Contrato. Provee los métodos para listar, crear, actualizar y eliminar tipos de contrato laboral.
// Elaborado por: Karla Vanessa Del Angel Santiago

import api from '@/lib/axios';
import { CONTRACT_TYPES_ROUTES } from '@/api/routes/catalogs/contract-types.routes';

export default {
  all(params = {}) {
    return api.get(CONTRACT_TYPES_ROUTES.INDEX, { params });
  },

  create(payload) {
    return api.post(CONTRACT_TYPES_ROUTES.CREATE, payload);
  },

  active() {
    return api.get(CONTRACT_TYPES_ROUTES.ACTIVE);
  },

  show(contractTypeId) {
    return api.get(CONTRACT_TYPES_ROUTES.BY_ID(contractTypeId));
  },

  update(contractTypeId, payload) {
    return api.put(CONTRACT_TYPES_ROUTES.UPDATE(contractTypeId), payload);
  },

  changeStatus(contractTypeId, payload = {}) {
    return api.put(CONTRACT_TYPES_ROUTES.DELETE(contractTypeId), payload);
  },
};
