<!-- Este módulo sirve para: Vista del panel principal. Muestra KPIs con conteos de catálogos, gráfica de barras combinada y mini-gráficas individuales de métricas del sistema. -->
<!-- Elaborado por: Karla Vanessa Del Angel Santiago -->

<script setup>
import { ref, computed, onMounted } from 'vue';
import DashboardApi from '@/api/Dashboard';

// ── Auth user ────────────────────────────────────────────
const authUser = (() => {
  try { return JSON.parse(localStorage.getItem('auth_user') || 'null'); } catch { return null; }
})();
const displayName = computed(() => authUser?.fullName || authUser?.username || 'Usuario');

// ── KPI counts ───────────────────────────────────────────
const counts = ref(null);
const countsLoading = ref(true);
const countsError = ref('');

const kpiCards = computed(() => {
  if (!counts.value) return [];
  return [
    { label: 'Áreas', value: counts.value.areas,          icon: 'grid',     color: '#3b5bdb' },
    { label: 'Sucursales', value: counts.value.branches,  icon: 'building', color: '#0ca678' },
    { label: 'Departamentos', value: counts.value.departments, icon: 'sitemap', color: '#7048e8' },
    { label: 'Puestos', value: counts.value.positions,    icon: 'briefcase',color: '#e67700' },
    { label: 'Tipos de contrato', value: counts.value.contractTypes, icon: 'doc', color: '#1098ad' },
    { label: 'Estados de candidato', value: counts.value.candidateStates, icon: 'tag', color: '#e8192c' },
  ];
});

// ── Monthly metrics ──────────────────────────────────────
const metrics = ref(null);
const metricsLoading = ref(true);
const metricsError = ref('');

const chartMax = computed(() => {
  if (!metrics.value) return 1;
  const allValues = Object.values(metrics.value.series).flat();
  return Math.max(...allValues, 1);
});

const seriesConfig = [
  { key: 'areas',       label: 'Áreas',       color: '#3b5bdb' },
  { key: 'branches',    label: 'Sucursales',   color: '#0ca678' },
  { key: 'departments', label: 'Departamentos',color: '#7048e8' },
  { key: 'positions',   label: 'Puestos',      color: '#e67700' },
];

function barHeight(val) {
  return `${Math.round((val / chartMax.value) * 100)}%`;
}

function miniBarHeight(series, val) {
  const max = Math.max(...series, 1);
  return `${Math.round((val / max) * 100)}%`;
}

function trend(series) {
  const last = series[series.length - 1];
  const prev = series[series.length - 2];
  if (prev === 0 && last === 0) return 0;
  return last - prev;
}

function trendClass(series) {
  const t = trend(series);
  if (t > 0) return 'trend-up';
  if (t < 0) return 'trend-down';
  return 'trend-flat';
}

function trendLabel(series) {
  const t = trend(series);
  if (t > 0) return `+${t}`;
  if (t < 0) return `${t}`;
  return '—';
}

// ── Load data ────────────────────────────────────────────
onMounted(async () => {
  const [countsRes, metricsRes] = await Promise.allSettled([
    DashboardApi.counts(),
    DashboardApi.metrics(),
  ]);

  if (countsRes.status === 'fulfilled') {
    counts.value = countsRes.value.data?.data ?? countsRes.value.data;
  } else {
    countsError.value = 'No se pudieron cargar los conteos.';
  }
  countsLoading.value = false;

  if (metricsRes.status === 'fulfilled') {
    metrics.value = metricsRes.value.data?.data ?? metricsRes.value.data;
  } else {
    metricsError.value = 'No se pudieron cargar las métricas.';
  }
  metricsLoading.value = false;
});
</script>

<template>
  <div class="dashboard">

    <!-- Header -->
    <header class="dash-header">
      <div class="dash-header-left">
        <p class="dash-greeting">Bienvenido, <strong>{{ displayName }}</strong></p>
        <h1>Panel de Control</h1>
        <p class="dash-subtitle">Resumen general del sistema de recursos humanos</p>
      </div>
      <div class="dash-date">
        <span>{{ new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</span>
      </div>
    </header>

    <!-- KPI cards -->
    <section class="kpi-section">
      <h2 class="section-title">Catálogos activos</h2>

      <div v-if="countsLoading" class="kpi-grid">
        <div v-for="n in 6" :key="n" class="kpi-card skeleton"></div>
      </div>

      <p v-else-if="countsError" class="inline-error">{{ countsError }}</p>

      <div v-else class="kpi-grid">
        <div
          v-for="card in kpiCards"
          :key="card.label"
          class="kpi-card"
          :style="{ '--accent': card.color }"
        >
          <div class="kpi-icon-wrap">
            <!-- grid -->
            <svg v-if="card.icon === 'grid'" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
            <!-- building -->
            <svg v-else-if="card.icon === 'building'" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clip-rule="evenodd"/></svg>
            <!-- sitemap (collection) -->
            <svg v-else-if="card.icon === 'sitemap'" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/></svg>
            <!-- briefcase -->
            <svg v-else-if="card.icon === 'briefcase'" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clip-rule="evenodd"/><path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z"/></svg>
            <!-- doc -->
            <svg v-else-if="card.icon === 'doc'" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/></svg>
            <!-- tag -->
            <svg v-else viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg>
          </div>
          <div class="kpi-body">
            <span class="kpi-value">{{ card.value.toLocaleString('es-MX') }}</span>
            <span class="kpi-label">{{ card.label }}</span>
          </div>
          <div class="kpi-bar" :style="{ background: card.color }"></div>
        </div>
      </div>
    </section>

    <!-- Monthly chart (combined) -->
    <section class="chart-section">
      <div class="chart-card">
        <div class="chart-header">
          <div>
            <h2 class="section-title" style="margin:0">Registros por mes</h2>
            <p class="chart-subtitle">Últimos 6 meses · todos los catálogos</p>
          </div>
          <ul class="chart-legend">
            <li v-for="s in seriesConfig" :key="s.key" :style="{ '--c': s.color }">
              <span class="legend-dot"></span>{{ s.label }}
            </li>
          </ul>
        </div>

        <div v-if="metricsLoading" class="chart-placeholder skeleton"></div>
        <p v-else-if="metricsError" class="inline-error">{{ metricsError }}</p>
        <div v-else class="chart-body">
          <div
            v-for="(label, idx) in metrics.labels"
            :key="label"
            class="chart-col"
          >
            <div class="bars-wrap">
              <div
                v-for="s in seriesConfig"
                :key="s.key"
                class="bar"
                :style="{ height: barHeight(metrics.series[s.key][idx]), background: s.color }"
                :title="`${s.label}: ${metrics.series[s.key][idx]}`"
              ></div>
            </div>
            <span class="chart-label">{{ label }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Individual mini-charts per series -->
    <section class="mini-charts-section">
      <h2 class="section-title">Tendencia por catálogo</h2>

      <div v-if="metricsLoading" class="mini-charts-grid">
        <div v-for="n in 4" :key="n" class="mini-chart-card skeleton" style="min-height:180px"></div>
      </div>

      <div v-else-if="!metricsError" class="mini-charts-grid">
        <div
          v-for="s in seriesConfig"
          :key="s.key"
          class="mini-chart-card"
          :style="{ '--accent': s.color }"
        >
          <div class="mini-chart-head">
            <div>
              <p class="mini-chart-title">{{ s.label }}</p>
              <p class="mini-chart-total">
                {{ metrics.series[s.key].reduce((a, b) => a + b, 0) }}
                <span>registros en 6 meses</span>
              </p>
            </div>
            <div class="mini-trend-badge" :class="trendClass(metrics.series[s.key])">
              <svg v-if="trend(metrics.series[s.key]) > 0" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 12 L6 7 L9 10 L14 4"/></svg>
              <svg v-else-if="trend(metrics.series[s.key]) < 0" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 4 L6 9 L9 6 L14 12"/></svg>
              <svg v-else viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 8 L14 8"/></svg>
              {{ trendLabel(metrics.series[s.key]) }}
            </div>
          </div>

          <div class="mini-chart-body">
            <div class="mini-bars">
              <div
                v-for="(val, idx) in metrics.series[s.key]"
                :key="idx"
                class="mini-bar-col"
              >
                <span class="mini-bar-val">{{ val }}</span>
                <div
                  class="mini-bar"
                  :style="{
                    height: miniBarHeight(metrics.series[s.key], val),
                    background: s.color,
                  }"
                  :title="`${metrics.labels[idx]}: ${val}`"
                ></div>
              </div>
            </div>
            <div class="mini-labels">
              <span v-for="lbl in metrics.labels" :key="lbl" class="mini-label">{{ lbl }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
/* ── Layout ─────────────────────────────────────────────── */
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 28px 48px;
  display: flex;
  flex-direction: column;
  gap: 36px;
}

/* ── Header ─────────────────────────────────────────────── */
.dash-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.dash-greeting {
  margin: 0 0 4px;
  font-size: 13px;
  color: #6b7a99;
}

.dash-header h1 {
  margin: 0 0 4px;
  font-size: 26px;
  font-weight: 700;
  color: #0d1b4b;
  letter-spacing: -0.4px;
}

.dash-subtitle {
  margin: 0;
  font-size: 13px;
  color: #9ba8c4;
}

.dash-date {
  font-size: 12.5px;
  color: #9ba8c4;
  text-align: right;
  padding-top: 2px;
  text-transform: capitalize;
}

/* ── Section titles ──────────────────────────────────────── */
.section-title {
  margin: 0 0 16px;
  font-size: 15px;
  font-weight: 700;
  color: #0d1b4b;
  letter-spacing: 0.1px;
}

/* ── KPI grid ───────────────────────────────────────────── */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.kpi-card {
  position: relative;
  background: #ffffff;
  border: 1px solid #e8edf5;
  border-radius: 12px;
  padding: 20px 18px 18px;
  display: flex;
  align-items: center;
  gap: 16px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(13, 27, 75, 0.06);
  transition: box-shadow 0.2s, transform 0.2s;
}

.kpi-card:hover {
  box-shadow: 0 6px 20px rgba(13, 27, 75, 0.1);
  transform: translateY(-2px);
}

.kpi-icon-wrap {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  color: var(--accent);
}

.kpi-icon-wrap svg {
  width: 20px;
  height: 20px;
}

.kpi-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.kpi-value {
  font-size: 28px;
  font-weight: 800;
  color: #0d1b4b;
  line-height: 1;
  letter-spacing: -0.5px;
}

.kpi-label {
  font-size: 12px;
  color: #6b7a99;
  font-weight: 500;
}

.kpi-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  opacity: 0.7;
}

/* ── Skeleton ───────────────────────────────────────────── */
.skeleton {
  background: linear-gradient(90deg, #f0f3f8 25%, #e4e9f2 50%, #f0f3f8 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 12px;
  min-height: 88px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── Chart section ──────────────────────────────────────── */
.chart-card {
  background: #ffffff;
  border: 1px solid #e8edf5;
  border-radius: 12px;
  padding: 24px 24px 20px;
  box-shadow: 0 1px 4px rgba(13, 27, 75, 0.06);
}

.chart-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
}

.chart-subtitle {
  margin: 4px 0 0;
  font-size: 12.5px;
  color: #9ba8c4;
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 12px;
  color: #6b7a99;
}

.chart-legend li {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--c);
  flex-shrink: 0;
}

/* Bar chart */
.chart-placeholder {
  height: 200px;
}

.chart-body {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
  height: 200px;
}

.chart-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  height: 100%;
}

.bars-wrap {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 3px;
}

.bar {
  flex: 1;
  min-height: 2px;
  border-radius: 4px 4px 0 0;
  transition: height 0.5s ease;
  opacity: 0.85;
}

.bar:hover {
  opacity: 1;
}

.chart-label {
  font-size: 11px;
  color: #9ba8c4;
  text-transform: capitalize;
  white-space: nowrap;
}

/* ── Misc ───────────────────────────────────────────────── */
.inline-error {
  font-size: 13px;
  color: #c0142a;
  background: rgba(232, 25, 44, 0.06);
  border: 1px solid rgba(232, 25, 44, 0.2);
  border-radius: 8px;
  padding: 10px 14px;
  margin: 0;
}

@media (max-width: 640px) {
  .dashboard {
    padding: 20px 16px 40px;
  }

  .kpi-grid {
    grid-template-columns: 1fr 1fr;
  }

  .chart-body {
    height: 150px;
  }

  .chart-label {
    font-size: 10px;
  }
}

/* ── Mini individual charts ─────────────────────────────── */
.mini-charts-section {
  /* already inside .dashboard gap */
}

.mini-charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.mini-chart-card {
  background: #ffffff;
  border: 1px solid #e8edf5;
  border-radius: 12px;
  padding: 20px 20px 16px;
  box-shadow: 0 1px 4px rgba(13, 27, 75, 0.06);
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-top: 3px solid var(--accent);
  transition: box-shadow 0.2s, transform 0.2s;
}

.mini-chart-card:hover {
  box-shadow: 0 6px 20px rgba(13, 27, 75, 0.1);
  transform: translateY(-2px);
}

.mini-chart-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.mini-chart-title {
  margin: 0 0 4px;
  font-size: 13px;
  font-weight: 700;
  color: #0d1b4b;
}

.mini-chart-total {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: var(--accent);
  line-height: 1;
}

.mini-chart-total span {
  display: block;
  font-size: 11px;
  font-weight: 500;
  color: #9ba8c4;
  margin-top: 2px;
}

.mini-trend-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 700;
  border-radius: 6px;
  padding: 4px 8px;
  white-space: nowrap;
  flex-shrink: 0;
}

.mini-trend-badge svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.trend-up {
  background: rgba(12, 166, 120, 0.1);
  color: #0ca678;
}

.trend-down {
  background: rgba(232, 25, 44, 0.1);
  color: #e8192c;
}

.trend-flat {
  background: rgba(107, 122, 153, 0.1);
  color: #6b7a99;
}

.mini-chart-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mini-bars {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 90px;
}

.mini-bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  height: 100%;
}

.mini-bar-val {
  font-size: 10px;
  font-weight: 700;
  color: #6b7a99;
  line-height: 1;
}

.mini-bar {
  width: 100%;
  min-height: 2px;
  border-radius: 3px 3px 0 0;
  opacity: 0.85;
  transition: height 0.5s ease, opacity 0.15s;
}

.mini-bar:hover {
  opacity: 1;
}

.mini-labels {
  display: flex;
  justify-content: space-between;
  gap: 4px;
  border-top: 1px solid #f0f3f8;
  padding-top: 6px;
}

.mini-label {
  flex: 1;
  text-align: center;
  font-size: 9.5px;
  color: #b0baca;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 640px) {
  .mini-charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
