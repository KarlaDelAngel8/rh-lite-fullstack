<!-- Este módulo sirve para: Vista del catálogo de Áreas. Permite listar, crear, editar y desactivar áreas organizacionales con búsqueda y paginación. -->
<!-- Elaborado por: Karla Vanessa Del Angel Santiago -->

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import AreasApi from '@/api/Areas';

const router = useRouter();

const loading = ref(false);
const saving = ref(false);
const rows = ref([]);
const errorMessage = ref('');

const pageSize = ref(10);
const search = ref('');

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

const visibleRows = computed(() => filteredRows.value.slice(0, Number(pageSize.value)));

function normalizeRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.result)) return payload.result;
  return [];
}

function toRow(item) {
  return {
    id: item.id ?? item.area_id ?? item.uuid,
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
  const normalized = getStatusLabel(status).toLowerCase();
  return normalized === 'activo' || normalized === 'active';
}

async function fetchAreas() {
  loading.value = true;
  errorMessage.value = '';
  try {
    const { data } = await AreasApi.all();
    rows.value = normalizeRows(data).map(toRow);
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || error.message || 'No se pudo cargar el catalogo de areas.';
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
}

async function submitForm() {
  if (!form.name.trim()) {
    errorMessage.value = 'El nombre del area es obligatorio.';
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
      await AreasApi.update(selectedId.value, payload);
    } else {
      await AreasApi.create(payload);
    }

    closeModal();
    await fetchAreas();
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || error.message || 'No se pudo guardar el area.';
  } finally {
    saving.value = false;
  }
}

async function toggleStatus(item) {
  if (item.id == null) return;

  const payload = {
    status: isActiveStatus(item.status) ? 0 : 1,
  };

  try {
    await AreasApi.changeStatus(item.id, payload);
    await fetchAreas();
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || error.message || 'No se pudo actualizar el estado del area.';
  }
}

function goToBranches(item) {
  router.push({
    path: '/catalogos/sucursales',
    query: { areaId: item.id, areaName: item.name },
  });
}

onMounted(fetchAreas);
</script>

<template>
  <section class="catalog-page">
    <header class="catalog-header">
      <h1>Areas</h1>
      <p>Inicio / Areas</p>
    </header>

    <section class="table-card">
      <div class="table-toolbar">
        <button class="btn-primary" @click="openCreateModal">+ Agregar area</button>

        <div class="toolbar-controls">
          <label>
            Mostrando
            <select v-model="pageSize">
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
            </select>
            registros
          </label>

          <input v-model="search" type="text" placeholder="Buscar..." />
        </div>
      </div>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <div class="table-wrap" v-if="!loading">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in visibleRows" :key="item.id ?? item.name">
              <td>{{ item.name }}</td>
              <td>
                <span class="status-pill" :class="{ active: isActiveStatus(item.status), inactive: !isActiveStatus(item.status) }">
                  {{ getStatusLabel(item.status) }}
                </span>
              </td>
              <td class="actions-cell">
                <button class="icon-btn" @click="goToBranches(item)">Sucursales</button>
                <button class="icon-btn" @click="openEditModal(item)">Editar</button>
                <button class="icon-btn danger" @click="toggleStatus(item)">
                  {{ isActiveStatus(item.status) ? 'Desactivar' : 'Activar' }}
                </button>
              </td>
            </tr>
            <tr v-if="visibleRows.length === 0">
              <td colspan="3">No hay areas para mostrar.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-else>Cargando areas...</p>
    </section>

    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>{{ isEditing ? 'Editar Area' : 'Agregar Area' }}</h2>
          <button class="close-btn" @click="closeModal">X</button>
        </div>

        <form class="modal-body" @submit.prevent="submitForm">
          <label>
            Nombre
            <input v-model="form.name" type="text" placeholder="Ingresa el nombre del area" />
          </label>

          <label>
            Descripcion
            <textarea v-model="form.description" rows="3" placeholder="Ingresa una descripcion" />
          </label>

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

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.toolbar-controls {
  display: flex;
  align-items: center;
  gap: 14px;
}

.toolbar-controls label {
  color: #2a3652;
  font-weight: 600;
}

.toolbar-controls select,
.toolbar-controls input {
  border: 1px solid #c9d3eb;
  border-radius: 10px;
  padding: 8px 10px;
  margin: 0 6px;
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
  background: #f3f6fd;
}

.status-pill {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 700;
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
  gap: 8px;
}

.icon-btn {
  border: 1px solid #1b2f66;
  background: #ffffff;
  color: #1b2f66;
  border-radius: 8px;
  padding: 6px 10px;
  cursor: pointer;
}

.icon-btn.danger {
  border-color: #8f1f2d;
  color: #8f1f2d;
}

.btn-primary {
  border: 0;
  border-radius: 8px;
  background: #061f75;
  color: white;
  padding: 10px 16px;
  font-weight: 700;
  cursor: pointer;
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
  padding: 10px 16px;
  font-weight: 700;
  cursor: pointer;
}

.error-message {
  color: #962828;
  font-weight: 600;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: grid;
  place-items: center;
  z-index: 1200;
}

.modal {
  width: min(620px, 92vw);
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e0e6f4;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5ebf7;
}

.modal-header h2 {
  margin: 0;
  color: #2b3652;
}

.close-btn {
  border: 0;
  background: transparent;
  cursor: pointer;
  color: #7784a6;
  font-weight: 700;
}

.modal-body {
  padding: 20px;
  display: grid;
  gap: 16px;
}

.modal-body label {
  display: grid;
  gap: 6px;
  color: #2d3a5c;
  font-weight: 600;
}

.modal-body input,
.modal-body textarea {
  border: 1px solid #c9d3eb;
  border-radius: 10px;
  padding: 10px 12px;
  font: inherit;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 900px) {
  .catalog-header h1 {
    font-size: 28px;
  }

  .table-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .toolbar-controls {
    width: 100%;
    flex-wrap: wrap;
  }

  .toolbar-controls input {
    width: 100%;
    margin-left: 0;
    margin-right: 0;
  }
}
</style>
