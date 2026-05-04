// Este módulo sirve para: Servicio API de control de acceso y permisos. Gestiona las operaciones relacionadas con roles y accesos de usuarios al sistema.
// Elaborado por: Karla Vanessa Del Angel Santiago

import api from '@/lib/axios';
import { ACCESS_ROUTES } from '@/api/routes/access.routes';

export default {
  myMenu() {
    return api.get(ACCESS_ROUTES.MENU);
  },

  listRoutes() {
    return api.get(ACCESS_ROUTES.ROUTES);
  },

  routesTree() {
    return api.get(ACCESS_ROUTES.ROUTES_TREE);
  },

  createRoute(payload) {
    return api.post(ACCESS_ROUTES.ROUTES, payload);
  },

  showRoute(routeId) {
    return api.get(ACCESS_ROUTES.ROUTES_BY_ID(routeId));
  },

  updateRoute(routeId, payload) {
    return api.put(ACCESS_ROUTES.ROUTES_UPDATE(routeId), payload);
  },

  deleteRoute(routeId, payload = {}) {
    return api.put(ACCESS_ROUTES.ROUTES_DELETE(routeId), payload);
  },

  getRoutePermissions(routeId) {
    return api.get(ACCESS_ROUTES.ROUTES_PERMISSIONS(routeId));
  },

  syncRoutePermissions(routeId, payload) {
    return api.post(ACCESS_ROUTES.ROUTES_PERMISSIONS_SYNC(routeId), payload);
  },

  listRoutePermissions() {
    return api.get(ACCESS_ROUTES.ROUTE_PERMISSIONS);
  },

  createRoutePermission(payload) {
    return api.post(ACCESS_ROUTES.ROUTE_PERMISSIONS, payload);
  },

  createRoutePermissionAlias(payload) {
    return api.post(ACCESS_ROUTES.ROUTE_PERMISSIONS_CREATE, payload);
  },

  showRoutePermission(routePermissionId) {
    return api.get(ACCESS_ROUTES.ROUTE_PERMISSIONS_BY_ID(routePermissionId));
  },

  updateRoutePermission(routePermissionId, payload) {
    return api.put(ACCESS_ROUTES.ROUTE_PERMISSIONS_BY_ID(routePermissionId), payload);
  },

  updateRoutePermissionAlias(routePermissionId, payload) {
    return api.put(ACCESS_ROUTES.ROUTE_PERMISSIONS_UPDATE(routePermissionId), payload);
  },

  deleteRoutePermission(routePermissionId) {
    return api.delete(ACCESS_ROUTES.ROUTE_PERMISSIONS_BY_ID(routePermissionId));
  },

  deleteRoutePermissionAlias(routePermissionId) {
    return api.delete(ACCESS_ROUTES.ROUTE_PERMISSIONS_DELETE(routePermissionId));
  },
};
