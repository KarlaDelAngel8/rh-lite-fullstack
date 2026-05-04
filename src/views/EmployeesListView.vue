<!-- Este módulo sirve para: Vista de listado de empleados. Muestra todos los empleados en tarjetas tipo acordeón con datos personales, dirección y documentos; permite buscar, ver y reemplazar documentos. -->
<!-- Elaborado por: Karla Vanessa Del Angel Santiago -->

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import EmployeesApi from '@/api/Employees';
import AreasApi from '@/api/Areas';
import DepartmentsApi from '@/api/Departments';
import PositionsApi from '@/api/Positions';

const loading = ref(true);
const errorMessage = ref('');
const search = ref('');
const employees = ref([]);
const expandedEmployeeId = ref(null);
const areasMap = ref({});
const departmentsMap = ref({});
const positionsMap = ref({});
const replaceInputRef = ref(null);
let pendingReplace = null;

const filteredEmployees = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) return employees.value;

  return employees.value.filter((item) => {
    const fullName = `${item.firstName || ''} ${item.lastName || ''}`.toLowerCase();
    const code = String(item.employeeCode || '').toLowerCase();
    const email = String(item.email || '').toLowerCase();
    return fullName.includes(term) || code.includes(term) || email.includes(term);
  });
});

function normalizeRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('es-MX');
}

function toggleEmployeeCard(employeeId) {
  expandedEmployeeId.value = expandedEmployeeId.value === employeeId ? null : employeeId;
}

function parseDocuments(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

function formatFileSize(size) {
  if (!size || Number.isNaN(Number(size))) return '';
  const kb = Math.max(1, Math.ceil(Number(size) / 1024));
  return `${kb} KB`;
}

function base64ToBlob(base64, mimeType = 'application/octet-stream') {
  const binary = atob(base64);
  const length = binary.length;
  const bytes = new Uint8Array(length);

  for (let i = 0; i < length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Blob([bytes], { type: mimeType });
}

function toNameMap(rows) {
  return rows.reduce((acc, row) => {
    if (row?.id != null) {
      acc[String(row.id)] = row.name || `ID ${row.id}`;
    }
    return acc;
  }, {});
}

function areaName(areaId) {
  if (areaId == null || areaId === '') return '-';
  return areasMap.value[String(areaId)] || `Area ID ${areaId}`;
}

function departmentName(departmentId) {
  if (departmentId == null || departmentId === '') return '-';
  return departmentsMap.value[String(departmentId)] || `Depto ID ${departmentId}`;
}

function positionName(positionId) {
  if (positionId == null || positionId === '') return '-';
  return positionsMap.value[String(positionId)] || `Puesto ID ${positionId}`;
}

function employeeAddress(item) {
  const parts = [
    item.addressStreet,
    item.addressExteriorNumber ? `#${item.addressExteriorNumber}` : '',
    item.addressInteriorNumber ? `Int. ${item.addressInteriorNumber}` : '',
    item.addressNeighborhood,
    item.addressCity,
    item.addressState,
    item.addressZipCode,
    item.addressCountry,
  ].filter(Boolean);

  return parts.length ? parts.join(', ') : '-';
}

async function viewDocument(employee, docIndex) {
  const docs = parseDocuments(employee.documents);
  const doc = docs[docIndex];

  try {
    // Prefer local preview from stored base64 content to avoid backend route mismatches.
    if (doc?.contentBase64) {
      const blob = base64ToBlob(doc.contentBase64, doc.type || 'application/octet-stream');
      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
      return;
    }

    const response = await EmployeesApi.viewDocument(employee.id, docIndex);
    const blob = response.data instanceof Blob
      ? response.data
      : new Blob([response.data], { type: response.headers?.['content-type'] || 'application/octet-stream' });

    const objectUrl = URL.createObjectURL(blob);
    window.open(objectUrl, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
  } catch (error) {
    if (error?.response?.status === 404) {
      errorMessage.value = 'Este documento no tiene contenido para visualizacion (registro anterior). Vuelve a subirlo para poder verlo.';
      return;
    }

    errorMessage.value =
      error?.response?.data?.message
      || error?.message
      || 'No se pudo visualizar el documento.';
  }
}

async function deleteDocument(employee, docIndex) {
  try {
    await EmployeesApi.deleteDocument(employee.id, docIndex);

    const currentDocuments = parseDocuments(employee.documents);
    currentDocuments.splice(docIndex, 1);
    employee.documents = currentDocuments.length ? JSON.stringify(currentDocuments) : null;
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.message
      || error?.message
      || 'No se pudo eliminar el documento.';
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.readAsDataURL(file);
  });
}

function triggerReplaceDocument(employee, docIndex) {
  pendingReplace = { employee, docIndex };
  replaceInputRef.value?.click();
}

async function onReplaceFileSelected(event) {
  const file = event.target.files?.[0];
  if (!file || !pendingReplace) return;

  const { employee, docIndex } = pendingReplace;
  pendingReplace = null;
  // Reset input so the same file can be re-selected if needed
  event.target.value = '';

  try {
    const contentBase64 = await fileToBase64(file);
    const docData = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      contentBase64,
    };

    await EmployeesApi.replaceDocument(employee.id, docIndex, docData);

    const docs = parseDocuments(employee.documents);
    docs[docIndex] = { ...docs[docIndex], ...docData };
    employee.documents = JSON.stringify(docs);
    errorMessage.value = '';
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.message
      || error?.message
      || 'No se pudo reemplazar el documento.';
  }
}

async function loadEmployees() {
  loading.value = true;
  errorMessage.value = '';

  try {
    const { data } = await EmployeesApi.all(1, 500, '');
    employees.value = normalizeRows(data);
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.message
      || error?.message
      || 'No se pudieron cargar los empleados.';
  } finally {
    loading.value = false;
  }
}

async function loadCatalogMaps() {
  const [areasRes, departmentsRes, positionsRes] = await Promise.allSettled([
    AreasApi.active(),
    DepartmentsApi.active(),
    PositionsApi.active(),
  ]);

  if (areasRes.status === 'fulfilled') {
    const rows = normalizeRows(areasRes.value.data);
    areasMap.value = toNameMap(rows);
  }

  if (departmentsRes.status === 'fulfilled') {
    const rows = normalizeRows(departmentsRes.value.data);
    departmentsMap.value = toNameMap(rows);
  }

  if (positionsRes.status === 'fulfilled') {
    const rows = normalizeRows(positionsRes.value.data);
    positionsMap.value = toNameMap(rows);
  }
}

onMounted(() => {
  loadEmployees();
  loadCatalogMaps();
  window.addEventListener('employees-updated', loadEmployees);
});

onUnmounted(() => {
  window.removeEventListener('employees-updated', loadEmployees);
});
</script>

<template>
  <section class="employees-list-page">
    <header class="head">
      <h1>Todos los empleados</h1>
      <p>Aquí se enlistan todos los empleados registrados en el sistema.</p>
    </header>

    <article class="panel">
      <div class="panel-toolbar">
        <input
          v-model="search"
          type="text"
          placeholder="Buscar por nombre, codigo o correo"
          class="search-input"
        />
        <button class="refresh-btn" @click="loadEmployees" :disabled="loading">
          {{ loading ? 'Actualizando...' : 'Actualizar' }}
        </button>
      </div>

      <p v-if="errorMessage" class="inline-error">{{ errorMessage }}</p>

      <div v-else-if="loading" class="loading-state">Cargando empleados...</div>

      <div v-else class="cards-wrap">
        <p v-if="!filteredEmployees.length" class="empty-row">No hay empleados registrados.</p>

        <article
          v-for="item in filteredEmployees"
          :key="item.id"
          class="employee-card"
        >
          <button
            class="employee-card-head"
            type="button"
            @click="toggleEmployeeCard(item.id)"
          >
            <div class="head-main">
              <h3>{{ item.firstName }} {{ item.lastName }}</h3>
              <p>ID: {{ item.id }} · Codigo: {{ item.employeeCode || '-' }}</p>
            </div>

            <div class="head-side">
              <span class="chip">{{ areaName(item.areaId) }}</span>
              <span class="chip">{{ departmentName(item.departmentId) }}</span>
              <span class="chip">{{ positionName(item.positionId) }}</span>
              <span class="chev" :class="{ open: expandedEmployeeId === item.id }">⌄</span>
            </div>
          </button>

          <div v-if="expandedEmployeeId === item.id" class="employee-card-body">
            <div class="detail-grid">
              <section class="detail-block">
                <h4>Datos generales</h4>
                <p><strong>Nombre:</strong> {{ item.firstName }} {{ item.lastName }}</p>
                <p><strong>Correo:</strong> {{ item.email || '-' }}</p>
                <p><strong>Telefono:</strong> {{ item.phone || '-' }}</p>
                <p><strong>Fecha ingreso:</strong> {{ formatDate(item.hireDate) }}</p>
                <p><strong>Status:</strong> {{ item.status ? 'Activo' : 'Inactivo' }}</p>
              </section>

              <section class="detail-block">
                <h4>Asignacion organizacional</h4>
                <p><strong>Area:</strong> {{ areaName(item.areaId) }}</p>
                <p><strong>Departamento:</strong> {{ departmentName(item.departmentId) }}</p>
                <p><strong>Puesto:</strong> {{ positionName(item.positionId) }}</p>
              </section>

              <section class="detail-block">
                <h4>Direccion</h4>
                <p><strong>Direccion completa:</strong> {{ employeeAddress(item) }}</p>
                <p><strong>Calle:</strong> {{ item.addressStreet || '-' }}</p>
                <p><strong>No. exterior:</strong> {{ item.addressExteriorNumber || '-' }}</p>
                <p><strong>No. interior:</strong> {{ item.addressInteriorNumber || '-' }}</p>
              </section>

              <section class="detail-block">
                <h4>Documentos</h4>
                <ul v-if="parseDocuments(item.documents).length" class="documents-list">
                  <li
                    v-for="(doc, idx) in parseDocuments(item.documents)"
                    :key="`${doc.name || doc.originalName || 'doc'}-${idx}`"
                    class="documents-item"
                  >
                    <div class="documents-meta">
                      <span class="doc-name">{{ doc.name || doc.originalName || `Documento ${idx + 1}` }}</span>
                      <span v-if="doc.type" class="doc-info">{{ doc.type }}</span>
                      <span v-if="doc.size" class="doc-info">{{ formatFileSize(doc.size) }}</span>
                    </div>

                    <div class="documents-actions">
                      <button type="button" class="doc-btn view" @click="viewDocument(item, idx)">Ver</button>
                      <button type="button" class="doc-btn replace" @click="triggerReplaceDocument(item, idx)" title="Reemplazar archivo">Reemplazar</button>
                      <button type="button" class="doc-btn delete" @click="deleteDocument(item, idx)">Eliminar</button>
                    </div>
                  </li>
                </ul>
                <p v-else>No hay documentos registrados.</p>
              </section>
            </div>
          </div>
        </article>
      </div>
    </article>
  </section>

  <!-- Hidden input for replacing a document file -->
  <input
    ref="replaceInputRef"
    type="file"
    style="display: none"
    @change="onReplaceFileSelected"
  />
</template>

<style scoped>
.employees-list-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 26px 22px 40px;
}

.head h1 {
  margin: 0;
  color: #0d1b4b;
  font-size: 30px;
}

.head p {
  margin: 8px 0 18px;
  color: #6b7a99;
  font-size: 14px;
}

.panel {
  background: #fff;
  border: 1px solid #e5ebf5;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(13, 27, 75, 0.06);
  padding: 16px;
}

.panel-toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
}

.search-input {
  flex: 1;
  border: 1px solid #ccd7ec;
  border-radius: 8px;
  padding: 10px 12px;
  font: inherit;
}

.refresh-btn {
  border: 0;
  border-radius: 8px;
  background: #0d1b4b;
  color: #fff;
  padding: 10px 14px;
  font-weight: 600;
  cursor: pointer;
}

.refresh-btn:disabled {
  opacity: 0.7;
  cursor: wait;
}

.inline-error {
  margin: 0 0 12px;
  color: #be1e2d;
  background: rgba(232, 25, 44, 0.08);
  border: 1px solid rgba(232, 25, 44, 0.25);
  border-radius: 8px;
  padding: 10px 12px;
}

.loading-state {
  color: #6b7a99;
  padding: 8px 0;
}

.cards-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.employee-card {
  border: 1px solid #dfe6f2;
  border-radius: 10px;
  overflow: hidden;
}

.employee-card-head {
  width: 100%;
  border: 0;
  background: #f8fbff;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  cursor: pointer;
}

.head-main {
  text-align: left;
}

.head-main h3 {
  margin: 0;
  color: #0d1b4b;
  font-size: 15px;
}

.head-main p {
  margin: 4px 0 0;
  color: #6e7da0;
  font-size: 12px;
}

.head-side {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.chip {
  border: 1px solid #cfd9ed;
  background: #fff;
  color: #3e4f77;
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 600;
}

.chev {
  color: #233a72;
  font-size: 18px;
  line-height: 1;
  transition: transform 0.2s ease;
}

.chev.open {
  transform: rotate(180deg);
}

.employee-card-body {
  border-top: 1px solid #e9eff8;
  padding: 12px;
  background: #ffffff;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.detail-block {
  border: 1px solid #e9eff8;
  border-radius: 8px;
  padding: 10px;
  background: #fbfdff;
}

.detail-block h4 {
  margin: 0 0 8px;
  color: #0d1b4b;
  font-size: 13px;
}

.detail-block p {
  margin: 0 0 6px;
  color: #2f4168;
  font-size: 12px;
}

.detail-block p:last-child {
  margin-bottom: 0;
}

.documents-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.documents-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: #2f4168;
  font-size: 12px;
  margin-bottom: 8px;
  border: 1px solid #e4ebf6;
  border-radius: 8px;
  padding: 8px;
  background: #ffffff;
}

.documents-item:last-child {
  margin-bottom: 0;
}

.documents-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.doc-name {
  font-weight: 600;
}

.doc-info {
  color: #6d7da0;
}

.documents-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.doc-btn {
  border: 1px solid #cfdbef;
  background: #f8fbff;
  border-radius: 6px;
  color: #1f335f;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  cursor: pointer;
}

.doc-btn.view:hover {
  border-color: #0d1b4b;
  color: #0d1b4b;
}

.doc-btn.delete {
  border-color: #ebc1c7;
  color: #b11d2f;
  background: #fff9fa;
}

.doc-btn.delete:hover {
  border-color: #cf5062;
  color: #8b1222;
}

.doc-btn.replace {
  border-color: #b8d4f0;
  color: #1a5fa8;
  background: #f0f7ff;
}

.doc-btn.replace:hover {
  border-color: #4a90d9;
  color: #0d3d74;
}

.empty-row {
  text-align: left;
  color: #7b8aac;
  margin: 0;
  padding: 10px 0;
}

@media (max-width: 720px) {
  .employees-list-page {
    padding: 16px 12px 28px;
  }

  .panel-toolbar {
    flex-direction: column;
  }

  .employee-card-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .head-side {
    width: 100%;
    justify-content: flex-start;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .documents-item {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
