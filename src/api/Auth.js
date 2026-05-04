// Este módulo sirve para: Servicio de autenticación. Expone los métodos de login, logout, registro de sesión y cierre de sesión contra el backend.
// Elaborado por: Karla Vanessa Del Angel Santiago

import api from '@/lib/axios';

export default {
  login(payload) {
    return api.post('/login', payload);
  },

  logout() {
    return api.post('/logout');
  },

  refresh() {
    return api.post('/refresh');
  },

  sessionStatus() {
    return api.get('/session-status');
  },

  closeSession(reason = 'window_close') {
    return api.post('/close-session', { reason });
  },

  keepAlive() {
    return api.post('/keep-alive');
  },
};
