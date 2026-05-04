<!-- Este módulo sirve para: Componente raíz de la aplicación. Controla el layout general, mostrando u ocultando el NavBar según la ruta activa (ej. login). -->
<!-- Elaborado por: Karla Vanessa Del Angel Santiago -->

<template>
  <div class="app-shell" :class="{ 'auth-layout': route.meta?.hideNavbar }">
    <NavBar v-if="!route.meta?.hideNavbar" />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import NavBar from '@/components/NavBar.vue';

const route = useRoute();
</script>

<style scoped>
:global(*, *::before, *::after) {
  box-sizing: border-box;
}

:global(body) {
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #f0f2f8;
  color: #1a1a2e;
}

.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 32px 40px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.app-shell.auth-layout .main-content {
  max-width: none;
  padding: 0;
}
</style>
