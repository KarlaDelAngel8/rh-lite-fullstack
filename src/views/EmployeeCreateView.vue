<!-- Este módulo sirve para: Vista de alta de empleados. Formulario completo para registrar un nuevo empleado con datos personales, área/departamento/puesto, dirección y carga de documentos en base64. -->
<!-- Elaborado por: Karla Vanessa Del Angel Santiago -->

<script setup>
import { computed, onMounted, ref } from 'vue';
import AreasApi from '@/api/Areas';
import DepartmentsApi from '@/api/Departments';
import PositionsApi from '@/api/Positions';
import EmployeesApi from '@/api/Employees';

const saving = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const catalogsLoading = ref(true);
const catalogsError = ref('');
const areas = ref([]);
const departments = ref([]);
const positions = ref([]);

const form = ref({
  employeeCode: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  hireDate: '',
  areaId: '',
  departmentId: '',
  positionId: '',
  addressStreet: '',
  addressExteriorNumber: '',
  addressInteriorNumber: '',
  addressNeighborhood: '',
  addressCity: '',
  addressState: '',
  addressZipCode: '',
  addressCountry: 'Mexico',
});

const documentFiles = ref([]);

const selectedArea = computed(() =>
  areas.value.find((item) => String(item.id) === String(form.value.areaId)) || null
);
const selectedDepartment = computed(() =>
  departments.value.find((item) => String(item.id) === String(form.value.departmentId)) || null
);
const selectedPosition = computed(() =>
  positions.value.find((item) => String(item.id) === String(form.value.positionId)) || null
);

function normalizeArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.result)) return payload.result;
  return [];
}

async function loadCatalogs() {
  catalogsLoading.value = true;
  catalogsError.value = '';

  const [areasRes, departmentsRes, positionsRes] = await Promise.allSettled([
    AreasApi.active(),
    DepartmentsApi.active(),
    PositionsApi.active(),
  ]);

  if (areasRes.status === 'fulfilled') {
    areas.value = normalizeArray(areasRes.value.data);
  }
  if (departmentsRes.status === 'fulfilled') {
    departments.value = normalizeArray(departmentsRes.value.data);
  }
  if (positionsRes.status === 'fulfilled') {
    positions.value = normalizeArray(positionsRes.value.data);
  }

  if (
    areasRes.status === 'rejected'
    || departmentsRes.status === 'rejected'
    || positionsRes.status === 'rejected'
  ) {
    catalogsError.value = 'No se pudieron cargar uno o mas catalogos.';
  }

  catalogsLoading.value = false;
}

function onPickDocuments(event) {
  const picked = Array.from(event.target.files || []);
  if (!picked.length) return;

  const existingKeys = new Set(
    documentFiles.value.map((f) => `${f.name}-${f.size}-${f.lastModified}`)
  );

  const next = picked.filter((file) => {
    const key = `${file.name}-${file.size}-${file.lastModified}`;
    return !existingKeys.has(key);
  });

  documentFiles.value = [...documentFiles.value, ...next];
  event.target.value = '';
}

function removeDocument(index) {
  documentFiles.value.splice(index, 1);
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

function validateForm() {
  if (!form.value.firstName.trim() || !form.value.lastName.trim()) {
    return 'Nombre y apellido son obligatorios.';
  }
  if (!form.value.areaId || !form.value.departmentId || !form.value.positionId) {
    return 'Debes seleccionar area, departamento y puesto por ID.';
  }
  if (!form.value.addressStreet.trim() || !form.value.addressZipCode.trim()) {
    return 'La direccion debe incluir calle y codigo postal.';
  }
  return '';
}

function resetForm() {
  form.value = {
    employeeCode: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    hireDate: '',
    areaId: '',
    departmentId: '',
    positionId: '',
    addressStreet: '',
    addressExteriorNumber: '',
    addressInteriorNumber: '',
    addressNeighborhood: '',
    addressCity: '',
    addressState: '',
    addressZipCode: '',
    addressCountry: 'Mexico',
  };
  documentFiles.value = [];
}

async function submitForm() {
  successMessage.value = '';
  errorMessage.value = '';

  const validationError = validateForm();
  if (validationError) {
    errorMessage.value = validationError;
    return;
  }

  saving.value = true;

  try {
    const documents = await Promise.all(
      documentFiles.value.map(async (file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        contentBase64: await fileToBase64(file),
      }))
    );

    const payload = {
      ...form.value,
      documents,
    };

    await EmployeesApi.create(payload);

    successMessage.value = 'Empleado registrado correctamente.';
    window.dispatchEvent(new CustomEvent('employees-updated'));
    resetForm();
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.message
      || error?.response?.data?.error
      || 'No se pudo registrar el empleado.';
  } finally {
    saving.value = false;
  }
}

onMounted(loadCatalogs);
</script>

<template>
  <section class="employee-create">
    <div class="page-head">
      <h1>Alta de empleados</h1>
      <p>Registra un empleado nuevo con asignacion de area, departamento, puesto, direccion y documentos.</p>
    </div>

    <p v-if="catalogsError" class="inline-error">{{ catalogsError }}</p>

    <form class="create-form" @submit.prevent="submitForm">
      <article class="card">
        <h2>Datos generales</h2>
        <div class="grid cols-3">
          <label>
            Codigo empleado
            <input v-model="form.employeeCode" type="text" placeholder="EMP-001" />
          </label>
          <label>
            Nombre *
            <input v-model="form.firstName" type="text" placeholder="Nombre" required />
          </label>
          <label>
            Apellido *
            <input v-model="form.lastName" type="text" placeholder="Apellido" required />
          </label>
          <label>
            Correo
            <input v-model="form.email" type="email" placeholder="correo@empresa.com" />
          </label>
          <label>
            Telefono
            <input v-model="form.phone" type="text" placeholder="5512345678" />
          </label>
          <label>
            Fecha ingreso
            <input v-model="form.hireDate" type="date" />
          </label>
        </div>
      </article>

      <article class="card">
        <h2>Asignacion organizacional</h2>
        <div class="grid cols-3">
          <label>
            Area (ID) *
            <select v-model="form.areaId" :disabled="catalogsLoading" required>
              <option value="">Seleccionar area</option>
              <option v-for="item in areas" :key="item.id" :value="item.id">
                {{ item.id }} - {{ item.name }}
              </option>
            </select>
            <small v-if="selectedArea">Area seleccionada: {{ selectedArea.name }}</small>
          </label>

          <label>
            Departamento (ID) *
            <select v-model="form.departmentId" :disabled="catalogsLoading" required>
              <option value="">Seleccionar departamento</option>
              <option v-for="item in departments" :key="item.id" :value="item.id">
                {{ item.id }} - {{ item.name }}
              </option>
            </select>
            <small v-if="selectedDepartment">Departamento seleccionado: {{ selectedDepartment.name }}</small>
          </label>

          <label>
            Puesto (ID) *
            <select v-model="form.positionId" :disabled="catalogsLoading" required>
              <option value="">Seleccionar puesto</option>
              <option v-for="item in positions" :key="item.id" :value="item.id">
                {{ item.id }} - {{ item.name }}
              </option>
            </select>
            <small v-if="selectedPosition">Puesto seleccionado: {{ selectedPosition.name }}</small>
          </label>
        </div>
      </article>

      <article class="card">
        <h2>Direccion del empleado</h2>
        <div class="grid cols-4">
          <label class="span-2">
            Calle *
            <input v-model="form.addressStreet" type="text" placeholder="Calle y numero" required />
          </label>
          <label>
            No. exterior
            <input v-model="form.addressExteriorNumber" type="text" placeholder="123" />
          </label>
          <label>
            No. interior
            <input v-model="form.addressInteriorNumber" type="text" placeholder="4B" />
          </label>
          <label>
            Colonia
            <input v-model="form.addressNeighborhood" type="text" placeholder="Centro" />
          </label>
          <label>
            Ciudad
            <input v-model="form.addressCity" type="text" placeholder="CDMX" />
          </label>
          <label>
            Estado
            <input v-model="form.addressState" type="text" placeholder="Ciudad de Mexico" />
          </label>
          <label>
            Codigo postal *
            <input v-model="form.addressZipCode" type="text" placeholder="00000" required />
          </label>
          <label>
            Pais
            <input v-model="form.addressCountry" type="text" placeholder="Mexico" />
          </label>
        </div>
      </article>

      <article class="card">
        <h2>Documentos del empleado</h2>
        <div class="documents-box">
          <label class="upload-btn">
            Cargar documentos
            <input type="file" multiple @change="onPickDocuments" />
          </label>
          <p class="upload-note">Puedes adjuntar INE, contrato, comprobante y mas archivos en PDF o imagen.</p>

          <ul v-if="documentFiles.length" class="doc-list">
            <li v-for="(file, idx) in documentFiles" :key="`${file.name}-${idx}`" class="doc-item">
              <span>{{ file.name }} ({{ Math.ceil(file.size / 1024) }} KB)</span>
              <button type="button" class="remove-doc" @click="removeDocument(idx)">Quitar</button>
            </li>
          </ul>
          <p v-else class="upload-note">No hay documentos seleccionados.</p>
        </div>
      </article>

      <div class="footer-actions">
        <p v-if="errorMessage" class="inline-error">{{ errorMessage }}</p>
        <p v-if="successMessage" class="inline-success">{{ successMessage }}</p>

        <button class="submit-btn" type="submit" :disabled="saving || catalogsLoading">
          {{ saving ? 'Guardando...' : 'Registrar empleado' }}
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.employee-create {
  max-width: 1180px;
  margin: 0 auto;
  padding: 28px 22px 42px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-head h1 {
  margin: 0;
  color: #0d1b4b;
  font-size: 29px;
  letter-spacing: -0.4px;
}

.page-head p {
  margin: 8px 0 0;
  color: #627395;
  font-size: 14px;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card {
  background: #fff;
  border: 1px solid #e5ebf5;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(13, 27, 75, 0.06);
  padding: 18px;
}

.card h2 {
  margin: 0 0 14px;
  color: #0d1b4b;
  font-size: 17px;
}

.grid {
  display: grid;
  gap: 12px;
}

.cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.cols-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.span-2 {
  grid-column: span 2;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  color: #4a5878;
  font-weight: 600;
}

input,
select {
  border: 1px solid #ccd7ec;
  border-radius: 8px;
  padding: 10px 11px;
  font: inherit;
  color: #132248;
  background: #fff;
}

input:focus,
select:focus {
  outline: none;
  border-color: #0d1b4b;
  box-shadow: 0 0 0 3px rgba(13, 27, 75, 0.08);
}

small {
  color: #7b8aab;
  font-size: 11px;
}

.documents-box {
  border: 1px dashed #b8c8e6;
  border-radius: 10px;
  padding: 14px;
}

.upload-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #0d1b4b;
  color: #fff;
  border-radius: 8px;
  padding: 9px 14px;
  cursor: pointer;
  width: fit-content;
}

.upload-btn input {
  display: none;
}

.upload-note {
  margin: 10px 0 0;
  color: #7787a8;
  font-size: 12px;
}

.doc-list {
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.doc-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border: 1px solid #e5ebf5;
  border-radius: 8px;
  padding: 9px 10px;
  background: #f9fbff;
  font-size: 12px;
  color: #364666;
}

.remove-doc {
  border: 1px solid #e4b1b9;
  background: #fff;
  color: #be1e2d;
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
}

.footer-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.submit-btn {
  align-self: flex-start;
  border: 0;
  background: #e8192c;
  color: #fff;
  border-radius: 8px;
  font-weight: 700;
  padding: 11px 20px;
  cursor: pointer;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: wait;
}

.inline-error {
  margin: 0;
  color: #c31631;
  background: rgba(232, 25, 44, 0.08);
  border: 1px solid rgba(232, 25, 44, 0.24);
  border-radius: 8px;
  padding: 9px 12px;
  font-size: 13px;
}

.inline-success {
  margin: 0;
  color: #0e7a48;
  background: rgba(14, 122, 72, 0.08);
  border: 1px solid rgba(14, 122, 72, 0.24);
  border-radius: 8px;
  padding: 9px 12px;
  font-size: 13px;
}

@media (max-width: 1050px) {
  .cols-3,
  .cols-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .span-2 {
    grid-column: span 2;
  }
}

@media (max-width: 700px) {
  .employee-create {
    padding: 18px 12px 30px;
  }

  .cols-3,
  .cols-4,
  .span-2 {
    grid-template-columns: 1fr;
    grid-column: span 1;
  }

  .submit-btn {
    width: 100%;
  }
}
</style>
