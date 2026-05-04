<!-- Este módulo sirve para: Barra de navegación principal del sistema. Contiene el menú con dropdowns para Catálogos, Empleados y Acceso, con búsqueda y navegación por rutas. -->
<!-- Elaborado por: Karla Vanessa Del Angel Santiago -->

<template>
  <nav class="navbar" @click.self="closeAll">
    <div class="navbar-inner">
      <router-link to="/" class="navbar-brand" @click="closeAll">
        <span class="brand-icon">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <polygon points="18,2 34,18 18,34 2,18" fill="#e8192c"/>
            <polygon points="18,8 28,18 18,28 8,18" fill="white"/>
            <polygon points="18,13 23,18 18,23 13,18" fill="#e8192c"/>
          </svg>
        </span>
      </router-link>

      <ul class="navbar-menu">
        <li v-for="item in menuItems" :key="item.key" class="menu-item">
          <button
            class="menu-btn"
            :class="{ active: item.active, open: openMenu === item.key }"
            @click.stop="toggleMenu(item.key)"
          >
            <component :is="item.icon" class="menu-icon" />
            {{ item.label }}
            <svg class="chevron" :class="{ rotated: openMenu === item.key }" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>

          <div v-if="item.children?.length && openMenu === item.key" class="dropdown" @click.stop>
            <div class="dropdown-search">
              <input
                type="text"
                class="dropdown-input"
                :placeholder="`Buscar ${item.label}`"
                v-model="searchTerms[item.key]"
              />
            </div>

            <ul class="dropdown-list">
              <li v-for="child in filteredChildren(item)" :key="child.key" class="dropdown-item-wrap">
                <button
                  class="dropdown-item"
                  :class="{ expanded: openedChild[item.key] === child.key }"
                  @click="toggleChild(item.key, child)"
                >
                  <span class="dropdown-item-left">
                    <component :is="child.icon" class="dropdown-icon" />
                    <span>{{ child.label }}</span>
                  </span>
                  <svg
                    v-if="child.children?.length"
                    class="submenu-chevron"
                    :class="{ rotated: openedChild[item.key] === child.key }"
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                </button>

                <ul
                  v-if="child.children?.length && openedChild[item.key] === child.key"
                  class="nested-list"
                >
                  <li
                    v-for="subChild in child.children"
                    :key="subChild"
                    class="nested-item"
                    @click="selectSubChild(child, subChild)"
                  >
                    {{ subChild }}
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </li>
      </ul>

      <div class="navbar-right">
        <button class="logout-btn" @click="logout">Cerrar sesion</button>
        <div class="avatar">
          <img src="https://i.pravatar.cc/40?img=47" alt="Usuario" />
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { h, ref, reactive, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import AuthApi from '@/api/Auth';
import { clearAuthSession } from '@/lib/auth';

const router = useRouter();

const svg = (opts, children) => h('svg', {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': 1.8,
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
  ...opts,
}, children);

const IconDashboard = () => svg({}, [
  h('rect', { x: 3, y: 3, width: 7, height: 7 }),
  h('rect', { x: 14, y: 3, width: 7, height: 7 }),
  h('rect', { x: 14, y: 14, width: 7, height: 7 }),
  h('rect', { x: 3, y: 14, width: 7, height: 7 }),
]);
const IconAcceso = () => svg({}, [
  h('rect', { x: 3, y: 11, width: 18, height: 11, rx: 2 }),
  h('path', { d: 'M7 11V7a5 5 0 0 1 10 0v4' }),
]);
const IconCatalogos = () => svg({}, [
  h('line', { x1: 8, y1: 6, x2: 21, y2: 6 }),
  h('line', { x1: 8, y1: 12, x2: 21, y2: 12 }),
  h('line', { x1: 8, y1: 18, x2: 21, y2: 18 }),
  h('line', { x1: 3, y1: 6, x2: 3.01, y2: 6 }),
  h('line', { x1: 3, y1: 12, x2: 3.01, y2: 12 }),
  h('line', { x1: 3, y1: 18, x2: 3.01, y2: 18 }),
]);
const IconEmpleados = () => svg({}, [
  h('path', { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }),
  h('circle', { cx: 9, cy: 7, r: 4 }),
  h('path', { d: 'M23 21v-2a4 4 0 0 0-3-3.87' }),
  h('path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' }),
]);

const IconEstructura = () => svg({}, [h('rect', { x: 3, y: 3, width: 7, height: 7 }), h('rect', { x: 14, y: 3, width: 7, height: 7 }), h('rect', { x: 8.5, y: 14, width: 7, height: 7 })]);
const IconReclutamiento = () => svg({}, [h('path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }), h('circle', { cx: 12, cy: 7, r: 4 }), h('line', { x1: 16, y1: 11, x2: 22, y2: 11 })]);
const IconCondiciones = () => svg({}, [h('rect', { x: 2, y: 7, width: 20, height: 14, rx: 2 }), h('path', { d: 'M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z' })]);
const IconPerfil = () => svg({}, [h('rect', { x: 5, y: 2, width: 14, height: 20, rx: 2 }), h('line', { x1: 9, y1: 7, x2: 15, y2: 7 }), h('line', { x1: 9, y1: 11, x2: 15, y2: 11 })]);

const menuItems = [
  { key: 'dashboard', label: 'Dashboard', icon: IconDashboard, active: false, children: [] },
  { key: 'acceso', label: 'Acceso', icon: IconAcceso, active: false, children: [] },
  {
    key: 'catalogos',
    label: 'Catálogos',
    icon: IconCatalogos,
    active: false,
    children: [
      {
        key: 'estructura-organizacional',
        label: 'Estructura organizacional',
        icon: IconEstructura,
        children: [
          'Áreas',
          'Sucursales',
          'Departamentos',
          'Puestos',
        ],
      },
      {
        key: 'condiciones-laborales',
        label: 'Condiciones laborales',
        icon: IconCondiciones,
        children: [
          'Tipos de Contrato',
          'Home Office',
          'Días feriados',
        ],
      },
      {
        key: 'perfil-capacidades',
        label: 'Perfil y capacidades',
        icon: IconPerfil,
        children: [
          'Documentos Requeridos',
        ],
      },
      {
        key: 'reclutamiento',
        label: 'Reclutamiento',
        icon: IconReclutamiento,
        children: [
          'Estado de Candidatos',
        ],
      },
    ],
  },
  {
    key: 'empleados',
    label: 'Empleados',
    icon: IconEmpleados,
    active: true,
    children: [
      { key: 'empleados-alta', label: 'Alta de empleados', icon: IconEmpleados },
      { key: 'empleados-lista', label: 'Todos los empleados', icon: IconEmpleados },
    ],
  },
];

const openMenu = ref(null);
const openedChild = reactive({ catalogos: null, empleados: null, acceso: null, dashboard: null });
const searchTerms = reactive({ catalogos: '', empleados: '', acceso: '', dashboard: '' });

const topLevelRoutes = {
  dashboard: '/',
};

function toggleMenu(key) {
  const item = menuItems.find((m) => m.key === key);
  if (!item?.children?.length) {
    const route = topLevelRoutes[key];
    if (route) {
      router.push(route);
      closeAll();
    }
    return;
  }
  openMenu.value = openMenu.value === key ? null : key;
  if (openMenu.value === key) {
    openedChild[key] = null;
    searchTerms[key] = '';
  }
}

function toggleChild(menuKey, child) {
  if (!child.children?.length) {
    selectChild(child);
    return;
  }
  openedChild[menuKey] = openedChild[menuKey] === child.key ? null : child.key;
}

function closeAll() {
  openMenu.value = null;
  Object.keys(openedChild).forEach((k) => {
    openedChild[k] = null;
  });
}

function filteredChildren(item) {
  const term = (searchTerms[item.key] || '').trim().toLowerCase();
  if (!term) return item.children;
  return item.children.filter((child) => {
    const directMatch = child.label.toLowerCase().includes(term);
    const nestedMatch = child.children?.some((entry) => entry.toLowerCase().includes(term));
    return directMatch || nestedMatch;
  });
}

function selectChild(child) {
  const childRouteMap = {
    'empleados-alta': '/empleados/alta',
    'empleados-lista': '/empleados/todos',
  };

  const targetRoute = childRouteMap[child.key];
  if (targetRoute) {
    router.push(targetRoute);
  }
  closeAll();
}

function selectSubChild(parent, label) {
  const routeMap = {
    'Estructura organizacional>Áreas': '/catalogos/areas',
    'Estructura organizacional>Sucursales': '/catalogos/sucursales',
    'Estructura organizacional>Departamentos': '/catalogos/departamentos',
    'Estructura organizacional>Puestos': '/catalogos/puestos',
    'Condiciones laborales>Tipos de Contrato': '/catalogos/tipos-contrato',
    'Reclutamiento>Estado de Candidatos': '/catalogos/estados-candidatos',
  };
  const key = `${parent.label}>${label}`;
  const targetRoute = routeMap[key];
  if (targetRoute) {
    router.push(targetRoute);
  }
  console.log('Navegar a:', parent.label, '>', label);
  closeAll();
}

async function logout() {
  try {
    await AuthApi.closeSession('manual_logout');
  } catch (_error) {
    // Intentionally ignore upstream errors so local logout still happens.
  }

  try {
    await AuthApi.logout();
  } catch (_error) {
    // Intentionally ignore upstream errors so local logout still happens.
  }

  clearAuthSession();
  closeAll();
  router.push('/login');
}

function onOutsideClick(e) {
  const nav = document.querySelector('.navbar');
  if (nav && !nav.contains(e.target)) closeAll();
}

onMounted(() => {
  document.addEventListener('click', onOutsideClick);
});

onUnmounted(() => {
  document.removeEventListener('click', onOutsideClick);
});
</script>

<style scoped>
.navbar {
  background: #0d1b4b;
  width: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

.navbar-inner {
  display: flex;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  gap: 32px;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1;
}

.brand-name {
  color: white;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.brand-sub {
  color: #8fa4d8;
  font-size: 9px;
  letter-spacing: 1.5px;
  font-weight: 600;
}

.navbar-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 4px;
  flex: 1;
  justify-content: center;
}

.menu-item {
  position: relative;
}

.menu-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #b8c8e8;
  font-size: 14px;
  font-weight: 400;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}

.menu-btn:hover,
.menu-btn.open {
  background: rgba(255, 255, 255, 0.08);
  color: white;
}

.menu-btn.active {
  color: white;
  font-weight: 700;
}

.menu-icon {
  opacity: 0.75;
}

.menu-btn.active .menu-icon {
  opacity: 1;
}

.chevron {
  opacity: 0.6;
  margin-left: 2px;
  transition: transform 0.2s ease;
}

.chevron.rotated {
  transform: rotate(180deg);
}

.dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  width: 300px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  z-index: 999;
  overflow: hidden;
  border: 1px solid #e5e9f0;
}

.dropdown-search {
  padding: 12px;
  border-bottom: 1px solid #e8edf6;
}

.dropdown-input {
  width: 100%;
  padding: 9px 12px;
  border: 1.5px solid #d0d8ea;
  border-radius: 20px;
  font-size: 13px;
  color: #1a1a2e;
  outline: none;
  background: #f5f7fb;
  box-sizing: border-box;
}

.dropdown-input:focus {
  border-color: #0d1b4b;
  background: white;
}

.dropdown-list {
  list-style: none;
  margin: 0;
  padding: 4px 0 8px;
  max-height: 420px;
  overflow-y: auto;
}

.dropdown-item-wrap {
  margin: 0;
}

.dropdown-item {
  width: 100%;
  border: 0;
  background: transparent;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  cursor: pointer;
  color: #1a1a2e;
  font-size: 14px;
  font-weight: 600;
}

.dropdown-item:hover,
.dropdown-item.expanded {
  background: #f0f3fa;
}

.dropdown-item-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dropdown-icon {
  color: #4a5a80;
  flex-shrink: 0;
}

.submenu-chevron {
  color: #6d7a9d;
  transition: transform 0.2s ease;
}

.submenu-chevron.rotated {
  transform: rotate(180deg);
}

.nested-list {
  list-style: none;
  margin: 0;
  padding: 2px 0 8px 40px;
}

.nested-item {
  padding: 7px 10px;
  border-radius: 8px;
  margin-right: 10px;
  color: #2f3f63;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.nested-item:hover {
  background: #edf2fc;
  color: #11245e;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
  flex-shrink: 0;
}

.logout-btn {
  border: 1px solid rgba(255, 255, 255, 0.4);
  background: transparent;
  color: #ffffff;
  border-radius: 8px;
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.14);
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.25);
  cursor: pointer;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
