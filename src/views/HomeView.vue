<!-- Este módulo sirve para: Vista de redirección inicial. Verifica si el usuario tiene sesión activa y redirige al dashboard o al login según corresponda. -->
<!-- Elaborado por: Karla Vanessa Del Angel Santiago -->

<script setup>
import { ref } from 'vue';
import AuthApi from '@/api/Auth';
import EmployeesApi from '@/api/Employees';

const health = ref('');
const loginMessage = ref('');
const employeesMessage = ref('');

const checkSession = async () => {
  try {
    const { data } = await AuthApi.sessionStatus();
    loginMessage.value = JSON.stringify(data);
  } catch (error) {
    loginMessage.value = error?.response?.data?.message || error.message;
  }
};

const listEmployees = async () => {
  try {
    const { data } = await EmployeesApi.all(1, 5, '');
    employeesMessage.value = JSON.stringify(data);
  } catch (error) {
    employeesMessage.value = error?.response?.data?.message || error.message;
  }
};

const pingHealth = async () => {
  try {
    const response = await fetch('http://localhost:3000/health');
    const data = await response.json();
    health.value = JSON.stringify(data);
  } catch (error) {
    health.value = error.message;
  }
};
</script>

<template>
  <section class="panel">
    <h2>Consulta APIs</h2>
    <p>Este proyecto nuevo consulta APIs pasando por el backend local.</p>

    <div class="actions">
      <button @click="pingHealth">Probar health backend</button>
      <button @click="checkSession">Consultar session-status</button>
      <button @click="listEmployees">Consultar employees</button>
    </div>

    <pre>Health: {{ health }}</pre>
    <pre>Session: {{ loginMessage }}</pre>
    <pre>Employees: {{ employeesMessage }}</pre>
  </section>
</template>

<style scoped>
.panel {
  margin-top: 20px;
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 14px 0;
}

button {
  background: #0e7490;
  color: white;
  border: 0;
  border-radius: 8px;
  padding: 10px 14px;
  cursor: pointer;
}

pre {
  white-space: pre-wrap;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 10px;
  font-size: 13px;
}
</style>
