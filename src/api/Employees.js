// Este módulo sirve para: Servicio API de empleados. Extiende el CRUD base y agrega métodos específicos para crear empleados con documentos, ver y reemplazar documentos individuales.
// Elaborado por: Karla Vanessa Del Angel Santiago

import CrudApiService from './CrudApiService';
import api from '@/lib/axios';

class EmployeesApi extends CrudApiService {
  constructor() {
    super('employees');
  }

  create(payload) {
    if (payload instanceof FormData) {
      return api.post(this.uri, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.post(this.uri, payload);
  }

  byUser(userId) {
    return api.get(`/employees/by-user/${userId}`);
  }

  viewDocument(employeeId, docIndex) {
    return api.get(`${this.uri}/${employeeId}/documents/${docIndex}/view`, {
      responseType: 'blob',
    });
  }

  replaceDocument(employeeId, docIndex, documentData) {
    return api.patch(`${this.uri}/${employeeId}/documents/${docIndex}`, { document: documentData });
  }

  deleteDocument(employeeId, docIndex) {
    return api.delete(`${this.uri}/${employeeId}/documents/${docIndex}`);
  }
}

export default new EmployeesApi();
