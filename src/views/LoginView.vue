<!-- Este módulo sirve para: Vista de inicio de sesión. Presenta el formulario corporativo de autenticación, valida credenciales contra el backend y redirige al dashboard al ingresar. -->
<!-- Elaborado por: Karla Vanessa Del Angel Santiago -->

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AuthApi from '@/api/Auth';
import { hasAuthSession, setAuthSession } from '@/lib/auth';

const router = useRouter();
const route = useRoute();

const username = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);
const errorMessage = ref('');

if (hasAuthSession()) {
  router.replace('/');
}

function resolveRedirect() {
  const redirect = route.query.redirect;
  if (typeof redirect === 'string' && redirect.startsWith('/')) return redirect;
  return '/';
}

async function submitLogin() {
  const cleanUsername = username.value.trim();
  if (!cleanUsername || !password.value) {
    errorMessage.value = 'Usuario y contraseña son obligatorios.';
    return;
  }

  loading.value = true;
  errorMessage.value = '';

  try {
    const { data } = await AuthApi.login({
      username: cleanUsername,
      password: password.value,
    });

    const token = setAuthSession(data);
    if (!token) {
      throw new Error('La API no devolvió un token válido.');
    }

    router.replace(resolveRedirect());
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.message
      || error?.response?.data?.error
      || error.message
      || 'No se pudo iniciar sesión.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="login-layout">
    <!-- Left branding panel -->
    <aside class="brand-panel">
      <div class="brand-content">
        <div class="brand-logo">
          <span class="logo-icon">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="12" fill="#e8192c"/>
              <path d="M12 34V14h6l6 10 6-10h6v20h-5V22l-7 11-7-11v12H12Z" fill="#fff"/>
            </svg>
          </span>
          <span class="logo-text">RH<strong>Lite</strong></span>
        </div>

        <div class="brand-headline">
          <h2>Sistema de Gestión<br/>de Recursos Humanos</h2>
          <p>Administra tu capital humano de forma eficiente, segura y centralizada.</p>
        </div>

        <ul class="brand-features">
          <li>
            <span class="feat-icon">
              <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/></svg>
            </span>
            Gestión de empleados y puestos
          </li>
          <li>
            <span class="feat-icon">
              <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/></svg>
            </span>
            Control de reclutamiento y selección
          </li>
          <li>
            <span class="feat-icon">
              <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
            </span>
            Catálogos y estructura organizacional
          </li>
        </ul>
      </div>

      <div class="brand-footer">
        <span>© {{ new Date().getFullYear() }} RHLite · Todos los derechos reservados</span>
      </div>
    </aside>

    <!-- Right form panel -->
    <main class="form-panel">
      <div class="form-container">
        <div class="form-header">
          <div class="form-badge">ACCESO AL SISTEMA</div>
          <h1>Bienvenido</h1>
          <p>Ingresa tus credenciales para continuar</p>
        </div>

        <form @submit.prevent="submitLogin" class="login-form" novalidate>
          <div class="field-group">
            <label for="username" class="field-label">Usuario</label>
            <div class="field-wrap">
              <span class="field-prefix" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/></svg>
              </span>
              <input
                id="username"
                v-model="username"
                type="text"
                placeholder="Nombre de usuario"
                autocomplete="username"
                :disabled="loading"
              />
            </div>
          </div>

          <div class="field-group">
            <label for="password" class="field-label">Contraseña</label>
            <div class="field-wrap">
              <span class="field-prefix" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/></svg>
              </span>
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                autocomplete="current-password"
                :disabled="loading"
              />
              <button type="button" class="eye-btn" @click="showPassword = !showPassword" :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'">
                <svg v-if="!showPassword" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                  <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                </svg>
                <svg v-else viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd"/>
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
                </svg>
              </button>
            </div>
          </div>

          <transition name="slide-error">
            <div v-if="errorMessage" class="error-alert" role="alert">
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              {{ errorMessage }}
            </div>
          </transition>

          <button type="submit" class="submit-btn" :disabled="loading">
            <span v-if="!loading">Iniciar sesión</span>
            <span v-else class="loading-wrap">
              <svg class="spinner" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="31.4" stroke-dashoffset="10" stroke-linecap="round"/>
              </svg>
              Verificando...
            </span>
          </button>
        </form>

        <p class="form-footer-note">
          ¿Problemas para acceder? Contacta al administrador del sistema.
        </p>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* ── Layout ─────────────────────────────────────────────── */
.login-layout {
  display: flex;
  min-height: 100vh;
}

/* ── Brand panel (left) ─────────────────────────────────── */
.brand-panel {
  flex: 0 0 42%;
  background: linear-gradient(160deg, #0d1b4b 0%, #0a1436 100%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 48px 44px;
  position: relative;
  overflow: hidden;
}

.brand-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 60% 50% at 20% 80%, rgba(232, 25, 44, 0.15) 0%, transparent 70%),
    radial-gradient(ellipse 50% 60% at 80% 20%, rgba(255,255,255,0.04) 0%, transparent 70%);
  pointer-events: none;
}

.brand-content {
  display: flex;
  flex-direction: column;
  gap: 40px;
  position: relative;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon svg {
  width: 44px;
  height: 44px;
  display: block;
}

.logo-text {
  font-size: 26px;
  color: #ffffff;
  letter-spacing: -0.5px;
}

.logo-text strong {
  font-weight: 800;
}

.brand-headline h2 {
  margin: 0 0 14px;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.3;
  color: #ffffff;
}

.brand-headline p {
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
  color: rgba(255,255,255,0.6);
}

.brand-features {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.brand-features li {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13.5px;
  color: rgba(255,255,255,0.75);
}

.feat-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.8);
}

.feat-icon svg {
  width: 16px;
  height: 16px;
}

.brand-footer {
  font-size: 11.5px;
  color: rgba(255,255,255,0.3);
  position: relative;
}

/* ── Form panel (right) ─────────────────────────────────── */
.form-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fb;
  padding: 48px 32px;
}

.form-container {
  width: min(420px, 100%);
}

.form-header {
  margin-bottom: 32px;
}

.form-badge {
  display: inline-block;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 1.4px;
  color: #e8192c;
  background: rgba(232, 25, 44, 0.08);
  border: 1px solid rgba(232, 25, 44, 0.2);
  border-radius: 4px;
  padding: 4px 10px;
  margin-bottom: 14px;
}

.form-header h1 {
  margin: 0 0 6px;
  font-size: 30px;
  font-weight: 700;
  color: #0d1b4b;
  letter-spacing: -0.5px;
}

.form-header p {
  margin: 0;
  font-size: 14px;
  color: #6b7a99;
}

/* ── Form fields ────────────────────────────────────────── */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 13px;
  font-weight: 600;
  color: #374162;
  letter-spacing: 0.2px;
}

.field-wrap {
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1.5px solid #d6dce8;
  border-radius: 8px;
  transition: border-color 0.18s, box-shadow 0.18s;
}

.field-wrap:focus-within {
  border-color: #0d1b4b;
  box-shadow: 0 0 0 3px rgba(13, 27, 75, 0.08);
}

.field-prefix {
  flex-shrink: 0;
  width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ba8c4;
}

.field-prefix svg {
  width: 17px;
  height: 17px;
}

.field-wrap input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font: inherit;
  font-size: 14px;
  color: #0d1b4b;
  padding: 13px 12px 13px 0;
}

.field-wrap input::placeholder {
  color: #b0baca;
}

.field-wrap input:disabled {
  opacity: 0.6;
}

.eye-btn {
  flex-shrink: 0;
  width: 44px;
  height: 100%;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ba8c4;
  transition: color 0.15s;
  padding: 0;
}

.eye-btn:hover {
  color: #0d1b4b;
}

.eye-btn svg {
  width: 17px;
  height: 17px;
}

/* ── Error alert ────────────────────────────────────────── */
.error-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(232, 25, 44, 0.06);
  border: 1px solid rgba(232, 25, 44, 0.25);
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 500;
  color: #c0142a;
}

.error-alert svg {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
}

.slide-error-enter-active,
.slide-error-leave-active {
  transition: all 0.2s ease;
}
.slide-error-enter-from,
.slide-error-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ── Submit button ──────────────────────────────────────── */
.submit-btn {
  width: 100%;
  border: none;
  border-radius: 8px;
  background: #0d1b4b;
  color: #ffffff;
  font: inherit;
  font-size: 14.5px;
  font-weight: 700;
  letter-spacing: 0.3px;
  padding: 14px 24px;
  cursor: pointer;
  transition: background 0.18s, transform 0.1s, box-shadow 0.18s;
  box-shadow: 0 4px 14px rgba(13, 27, 75, 0.3);
  margin-top: 4px;
  position: relative;
  overflow: hidden;
}

.submit-btn::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
  opacity: 0;
  transition: opacity 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #162660;
  box-shadow: 0 6px 20px rgba(13, 27, 75, 0.38);
  transform: translateY(-1px);
}

.submit-btn:hover:not(:disabled)::after {
  opacity: 1;
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(13, 27, 75, 0.25);
}

.submit-btn:disabled {
  opacity: 0.65;
  cursor: wait;
}

.loading-wrap {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.spinner {
  width: 16px;
  height: 16px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Footer note ────────────────────────────────────────── */
.form-footer-note {
  margin: 22px 0 0;
  font-size: 12px;
  color: #9ba8c4;
  text-align: center;
  line-height: 1.5;
}

/* ── Responsive ─────────────────────────────────────────── */
@media (max-width: 768px) {
  .login-layout {
    flex-direction: column;
  }

  .brand-panel {
    flex: none;
    padding: 32px 28px;
    min-height: auto;
  }

  .brand-headline h2 {
    font-size: 22px;
  }

  .brand-features {
    display: none;
  }

  .form-panel {
    padding: 36px 24px;
    align-items: flex-start;
  }
}
</style>
