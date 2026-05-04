// Este módulo sirve para: Servicio API del catálogo de Puestos. Provee los métodos para listar, crear, actualizar y eliminar puestos de trabajo.
// Elaborado por: Karla Vanessa Del Angel Santiago

import api from '@/lib/axios';
import { POSITIONS_ROUTES } from '@/api/routes/catalogs/positions.routes';

export default {
  all(params = {}) {
    return api.get(POSITIONS_ROUTES.INDEX, { params });
  },

  create(payload) {
    return api.post(POSITIONS_ROUTES.CREATE, payload);
  },

  active() {
    return api.get(POSITIONS_ROUTES.ACTIVE);
  },

  show(positionId) {
    return api.get(POSITIONS_ROUTES.BY_ID(positionId));
  },

  update(positionId, payload) {
    return api.put(POSITIONS_ROUTES.UPDATE(positionId), payload);
  },

  changeStatus(positionId, payload = {}) {
    return api.put(POSITIONS_ROUTES.DELETE(positionId), payload);
  },
};
