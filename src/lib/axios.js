// Este módulo sirve para: Configurar la instancia de Axios con la URL base de la API y el interceptor que adjunta automáticamente el token de autenticación en cada petición.
// Elaborado por: Karla Vanessa Del Angel Santiago

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
