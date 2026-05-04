// Este módulo sirve para: Definir las constantes de rutas del endpoint de acceso y menú del sistema.
// Elaborado por: Karla Vanessa Del Angel Santiago

export const ACCESS_ROUTES = {
  MENU: '/access/menu',

  ROUTES: '/access/routes',
  ROUTES_TREE: '/access/routes/tree',
  ROUTES_BY_ID: (routeId) => `/access/routes/${routeId}`,
  ROUTES_UPDATE: (routeId) => `/access/routes/update/${routeId}`,
  ROUTES_DELETE: (routeId) => `/access/routes/delete/${routeId}`,
  ROUTES_PERMISSIONS: (routeId) => `/access/routes/${routeId}/permissions`,
  ROUTES_PERMISSIONS_SYNC: (routeId) => `/access/routes/${routeId}/permissions/sync`,

  ROUTE_PERMISSIONS: '/access/route-permissions',
  ROUTE_PERMISSIONS_CREATE: '/access/route-permissions/create',
  ROUTE_PERMISSIONS_BY_ID: (routePermissionId) => `/access/route-permissions/${routePermissionId}`,
  ROUTE_PERMISSIONS_UPDATE: (routePermissionId) => `/access/route-permissions/update/${routePermissionId}`,
  ROUTE_PERMISSIONS_DELETE: (routePermissionId) => `/access/route-permissions/delete/${routePermissionId}`,
};
