<!-- Este módulo sirve para: Vista del catálogo de Tipos de Contrato. Permite listar, crear, editar y desactivar los tipos de contrato laboral con búsqueda y paginación. -->
<!-- Elaborado por: Karla Vanessa Del Angel Santiago -->

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import ContractTypesApi from '@/api/ContractTypes';

const loading = ref(false);
const saving = ref(false);
const rows = ref([]);
const errorMessage = ref('');

const pageSize = ref(10);
const search = ref('');
const currentPage = ref(1);

const showModal = ref(false);
const isEditing = ref(false);
const selectedId = ref(null);

const form = reactive({
  name: '',
  description: '',
});

const filteredRows = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) return rows.value;
  return rows.value.filter((item) => {
    const name = String(item.name || '').toLowerCase();
    const description = String(item.description || '').toLowerCase();
    return name.includes(term) || description.includes(term);
  });
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / Number(pageSize.value))));

const visibleRows = computed(() => {
  const size = Number(pageSize.value);
  const start = (currentPage.value - 1) * size;
  return filteredRows.value.slice(start, start + size);
});

function normalizeRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.result)) return payload.result;
  return [];
}

function toRow(item) {
  return {
    id: item.id ?? item.contract_type_id ?? item.uuid,
    name: item.name ?? item.nombre ?? '',
    description: item.description ?? item.descripcion ?? '',
    status: item.status ?? item.estado ?? item.is_active,
  };
}

function getStatusLabel(status) {
  if (status === true || status === 1 || status === '1' || status === 'active' || status === 'Activo') return 'Activo';
  if (status === false || status === 0 || status === '0' || status === 'inactive' || status === 'Inactivo') return 'Inactivo';
  return String(status ?? 'N/A');
}

function isActiveStatus(status) {
  return getStatusLabel(status).toLowerCase() === 'activo';
}

async function fetchContractTypes() {
  loading.value = true;
  errorMessage.value = '';
  try {
    const { data } = await ContractTypesApi.all();
    rows.value = normalizeRows(data).map(toRow);
    currentPage.value = 1;
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || error.message || 'No se pudo cargar el catalogo de tipos de contrato.';
  } finally {
    loading.value = false;
  }
}

function openCreateModal() {
  isEditing.value = false;
  selectedId.value = null;
  form.name = '';
  form.description = '';
  showModal.value = true;
}

function openEditModal(item) {
  isEditing.value = true;
  selectedId.value = item.id;
  form.name = item.name || '';
  form.description = item.description || '';
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  errorMessage.value = '';
}

async function submitForm() {
  if (!form.name.trim()) {
    errorMessage.value = 'El nombre del tipo de contrato es obligatorio.';
    return;
  }

  saving.value = true;
  errorMessage.value = '';

  const payload = {
    name: form.name.trim(),
    description: form.description.trim(),
  };

  try {
    if (isEditing.value && selectedId.value != null) {
      await ContractTypesApi.update(selectedId.value, payload);
    } else {
      await ContractTypesApi.create(payload);
    }

    closeModal();
    await fetchContractTypes();
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || error.message || 'No se pudo guardar el tipo de contrato.';
  } finally {
    saving.value = false;
  }
}

async function toggleStatus(item) {
  if (item.id == null) return;
  try {
    await ContractTypesApi.changeStatus(item.id, { status: isActiveStatus(item.status) ? 0 : 1 });
    await fetchContractTypes();
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || error.message || 'No se pudo actualizar el estado.';
  }
}

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page;
}

onMounted(fetchContractTypes);
</script>

<template>
  <section class="catalog-page">
    <header class="catalog-header">
      <h1>Tipos de contrato</h1>
      <p>Inicio / Tipos de contrato</p>
    </header>

    <section class="table-card">
      <div class="toolbar-top">
        <button class="btn-primary" @click="openCreateModal">+ Agregar tipo de contrato</button>
      </div>

      <div class="toolbar-bottom">
        <label class="page-size-label">
          Mostrando
          <select v-model="pageSize" @change="currentPage = 1">
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
          </select>
          registros
        </label>

        <div class="search-box">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input v-model="search" type="text" placeholder="Buscar..." @input="currentPage = 1" />
        </div>
      </div>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <div class="table-wrap" v-if="!loading">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripcion</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in visibleRows" :key="item.id ?? item.name">
              <td>{{ item.name }}</td>
              <td>{{ item.description || '-' }}</td>
              <td>
                <span class="status-pill" :class="{ active: isActiveStatus(item.status), inactive: !isActiveStatus(item.status) }">
                  {{ getStatusLabel(item.status) }}
                </span>
              </td>
              <td class="actions-cell">
                <button class="icon-btn" title="Editar" @click="openEditModal(item)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="icon-btn danger" :title="isActiveStatus(item.status) ? 'Desactivar' : 'Activar'" @click="toggleStatus(item)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                </button>
              </td>
            </tr>
            <tr v-if="visibleRows.length === 0">
              <td colspan="4">No hay tipos de contrato para mostrar.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-else>Cargando tipos de contrato...</p>

      <div class="pagination" v-if="!loading && totalPages > 1">
        <button class="page-btn" :disabled="currentPage === 1" @click="goToPage(1)">«</button>
        <button class="page-btn" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">‹</button>
        <button
          v-for="page in totalPages"
          :key="page"
          class="page-btn"
          :class="{ active: page === currentPage }"
          @click="goToPage(page)"
        >{{ page }}</button>
        <button class="page-btn" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">›</button>
        <button class="page-btn" :disabled="currentPage === totalPages" @click="goToPage(totalPages)">»</button>
      </div>

      <div class="pagination" v-if="!loading && totalPages === 1 && rows.length > 0">
        <button class="page-btn" disabled>«</button>
        <button class="page-btn" disabled>‹</button>
        <button class="page-btn active">1</button>
        <button class="page-btn" disabled>›</button>
        <button class="page-btn" disabled>»</button>
      </div>
    </section>

    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>{{ isEditing ? 'Editar tipo de contrato' : 'Agregar tipo de contrato' }}</h2>
          <button class="close-btn" @click="closeModal">X</button>
        </div>

        <form class="modal-body" @submit.prevent="submitForm">
          <label>
            Nombre
            <input v-model="form.name" type="text" placeholder="Ingresa el nombre del tipo de contrato" />
          </label>

          <label>
            Descripcion
            <textarea v-model="form.description" rows="3" placeholder="Ingresa una descripcion" />
          </label>

          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="closeModal">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="saving">{{ saving ? 'Guardando...' : 'Guardar' }}</button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped>
.catalog-page {
  width: 100%;
}

.catalog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.catalog-header h1 {
  margin: 0;
  font-size: 36px;
  color: #1a2a52;
}

.catalog-header p {
  margin: 0;
  color: #5f6f93;
  font-size: 15px;
}

.table-card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #dbe2f2;
  padding: 24px;
}

.toolbar-top {
  margin-bottom: 16px;
}

.toolbar-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-size-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #2a3652;
  font-weight: 600;
}

.page-size-label select {
  border: 1px solid #c9d3eb;
  border-radius: 10px;
  padding: 6px 10px;
  font: inherit;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #c9d3eb;
  border-radius: 10px;
  padding: 6px 12px;
  color: #5f6f93;
}

.search-box input {
  border: none;
  outline: none;
  font: inherit;
  color: #2a3652;
  width: 200px;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 14px;
  border-bottom: 1px solid #e5ebf7;
  text-align: left;
}

th {
  color: #1b2950;
  font-weight: 700;
}

.status-pill {
  display: inline-block;
  padding: 4px 14px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 13px;
}

.status-pill.active {
  background: #c8f0e1;
  color: #0b8c61;
}

.status-pill.inactive {
  background: #fde2e2;
  color: #a02a2a;
}

.actions-cell {
  display: flex;
  gap: 10px;
}

.icon-btn {
  border: none;
  background: transparent;
  color: #1b2f66;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: background 0.15s;
}

.icon-btn:hover {
  background: #eef1fa;
}

.icon-btn.danger {
  color: #8f1f2d;
}

.icon-btn.danger:hover {
  background: #fdecea;
}

.btn-primary {
  border: 0;
  border-radius: 8px;
  background: #061f75;
  color: white;
  padding: 10px 18px;
  font-weight: 700;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: wait;
}

.btn-secondary {
  border: 0;
  border-radius: 8px;
  background: #8a92a8;
  color: white;
  padding: 10px 18px;
  font-weight: 700;
  cursor: pointer;
}

.error-message {
  margin: 0 0 10px;
  color: #b42318;
  font-weight: 600;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 4px;
  margin-top: 20px;
}

.page-btn {
  border: none;
  background: transparent;
  color: #5f6f93;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.page-btn:hover:not(:disabled) {
  background: #eef1fa;
}

.page-btn.active {
  background: #061f75;
  color: #ffffff;
  font-weight: 700;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(7, 13, 28, 0.45);
  display: grid;
  place-items: center;
  z-index: 1000;
}

.modal {
  width: min(520px, calc(100vw - 32px));
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #d3dcf0;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid #e5ebf7;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: #1a2a52;
}

.close-btn {
  border: 0;
  background: transparent;
  color: #5f6f93;
  font-weight: 700;
  cursor: pointer;
}

.modal-body {
  display: grid;
  gap: 14px;
  padding: 18px;
}

.modal-body label {
  display: grid;
  gap: 6px;
  color: #2a3652;
  font-weight: 600;
}

.modal-body input,
.modal-body textarea {
  border: 1px solid #c9d3eb;
  border-radius: 10px;
  padding: 9px 10px;
  font: inherit;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
