// Este módulo sirve para: Punto de entrada principal de la aplicación. Inicializa Vue, configura el router con todas las rutas del sistema y monta la aplicación en el DOM.
// Elaborado por: Karla Vanessa Del Angel Santiago

import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import DashboardView from './views/DashboardView.vue';
import LoginView from './views/LoginView.vue';
import AreasCatalogView from './views/AreasCatalogView.vue';
import BranchesCatalogView from './views/BranchesCatalogView.vue';
import DepartmentsCatalogView from './views/DepartmentsCatalogView.vue';
import PositionsCatalogView from './views/PositionsCatalogView.vue';
import CandidateStatesCatalogView from './views/CandidateStatesCatalogView.vue';
import ContractTypesCatalogView from './views/ContractTypesCatalogView.vue';
import EmployeeCreateView from './views/EmployeeCreateView.vue';
import EmployeesListView from './views/EmployeesListView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: LoginView, meta: { public: true, hideNavbar: true } },
    { path: '/', name: 'home', component: DashboardView },
    { path: '/catalogos/areas', name: 'catalog-areas', component: AreasCatalogView },
    { path: '/catalogos/sucursales', name: 'catalog-branches', component: BranchesCatalogView },
    { path: '/catalogos/departamentos', name: 'catalog-departments', component: DepartmentsCatalogView },
    { path: '/catalogos/puestos', name: 'catalog-positions', component: PositionsCatalogView },
    { path: '/catalogos/estados-candidatos', name: 'catalog-candidate-states', component: CandidateStatesCatalogView },
    { path: '/catalogos/tipos-contrato', name: 'catalog-contract-types', component: ContractTypesCatalogView },
    { path: '/empleados/alta', name: 'employees-create', component: EmployeeCreateView },
    { path: '/empleados/todos', name: 'employees-list', component: EmployeesListView },
  ],
});

router.beforeEach((to) => {
  const token = localStorage.getItem('token');
  const isPublic = Boolean(to.meta?.public);

  if (!token && !isPublic) {
    return {
      path: '/login',
      query: { redirect: to.fullPath },
    };
  }

  if (token && to.path === '/login') {
    return '/';
  }

  return true;
});

createApp(App).use(router).mount('#app');
