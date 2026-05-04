// Este módulo sirve para: Servicio API del catálogo de Sucursales. Provee los métodos para listar, crear, actualizar y eliminar sucursales.
// Elaborado por: Karla Vanessa Del Angel Santiago

import api from '@/lib/axios';
import { BRANCHES_ROUTES } from '@/api/routes/catalogs/branches.routes';

export default {
  all(params = {}) {
    return api.get(BRANCHES_ROUTES.INDEX, { params });
  },

  downloadTemplate() {
    return api.get(BRANCHES_ROUTES.TEMPLATE, { responseType: 'blob' });
  },

  create(payload) {
    return api.post(BRANCHES_ROUTES.CREATE, payload);
  },

  active() {
    return api.get(BRANCHES_ROUTES.ACTIVE);
  },

  show(branchId) {
    return api.get(BRANCHES_ROUTES.BY_ID(branchId));
  },

  update(branchId, payload) {
    return api.put(BRANCHES_ROUTES.UPDATE(branchId), payload);
  },

  changeStatus(branchId, payload = {}) {
    return api.put(BRANCHES_ROUTES.DELETE(branchId), payload);
  },

  importExcel(formData) {
    return api.post(BRANCHES_ROUTES.IMPORT, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
