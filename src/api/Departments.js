// Este módulo sirve para: Servicio API del catálogo de Departamentos. Provee los métodos para listar, crear, actualizar y eliminar departamentos.
// Elaborado por: Karla Vanessa Del Angel Santiago

import api from '@/lib/axios';
import { DEPARTMENTS_ROUTES } from '@/api/routes/catalogs/departments.routes';

export default {
  all(params = {}) {
    return api.get(DEPARTMENTS_ROUTES.INDEX, { params });
  },

  downloadTemplate() {
    return api.get(DEPARTMENTS_ROUTES.TEMPLATE, { responseType: 'blob' });
  },

  create(payload) {
    return api.post(DEPARTMENTS_ROUTES.CREATE, payload);
  },

  active() {
    return api.get(DEPARTMENTS_ROUTES.ACTIVE);
  },

  show(departmentId) {
    return api.get(DEPARTMENTS_ROUTES.BY_ID(departmentId));
  },

  update(departmentId, payload) {
    return api.put(DEPARTMENTS_ROUTES.UPDATE(departmentId), payload);
  },

  changeStatus(departmentId, payload = {}) {
    return api.put(DEPARTMENTS_ROUTES.DELETE(departmentId), payload);
  },

  importExcel(formData) {
    return api.post(DEPARTMENTS_ROUTES.IMPORT, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
