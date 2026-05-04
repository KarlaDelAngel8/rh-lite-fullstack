// Este módulo sirve para: Clase base genérica de servicios API. Provee los métodos CRUD (all, getById, create, update, delete) reutilizables para cualquier recurso del backend.
// Elaborado por: Karla Vanessa Del Angel Santiago

import api from '@/lib/axios';

export default class CrudApiService {
  constructor(resource) {
    this.uri = `/${resource}`;
  }

  all(page = 1, per_page = 10, search = '') {
    return api.get(this.uri, { params: { page, per_page, search } });
  }

  show(id) {
    return api.get(`${this.uri}/${id}`);
  }
}
