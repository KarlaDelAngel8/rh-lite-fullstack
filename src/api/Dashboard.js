// Este módulo sirve para: Servicio API del Dashboard. Obtiene los conteos de catálogos y métricas de empleados para las tarjetas KPI y gráficas del panel principal.
// Elaborado por: Karla Vanessa Del Angel Santiago

import http from '@/lib/axios';

const DashboardApi = {
  counts: () => http.get('/dashboard/counts'),
  metrics: () => http.get('/dashboard/metrics'),
};

export default DashboardApi;
