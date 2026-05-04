// Este módulo sirve para: Servicio API del catálogo de Áreas. Provee los métodos para listar, crear, actualizar y eliminar áreas organizacionales.
// Elaborado por: Karla Vanessa Del Angel Santiago

import api from '@/lib/axios';
import { AREAS_ROUTES } from '@/api/routes/catalogs/areas.routes';

export default {
  all(params = {}) {
    return api.get(AREAS_ROUTES.INDEX, { params });
  },

  downloadTemplate() {
    return api.get(AREAS_ROUTES.TEMPLATE, { responseType: 'blob' });
  },

  create(payload) {
    return api.post(AREAS_ROUTES.CREATE, payload);
  },

  active() {
    return api.get(AREAS_ROUTES.ACTIVE);
  },

  show(areaId) {
    return api.get(AREAS_ROUTES.BY_ID(areaId));
  },

  update(areaId, payload) {
    return api.put(AREAS_ROUTES.UPDATE(areaId), payload);
  },

  changeStatus(areaId, payload = {}) {
    return api.put(AREAS_ROUTES.DELETE(areaId), payload);
  },

  importExcel(formData) {
    return api.post(AREAS_ROUTES.IMPORT, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
