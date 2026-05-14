# RH Lite — Sistema de Recursos Humanos

Sistema web fullstack para la gestión de recursos humanos. Permite administrar catálogos organizacionales, registrar empleados con documentos adjuntos y consultar métricas en un panel de control.

**Elaborado por:** Karla Vanessa Del Angel Santiago

---

## Tecnologías utilizadas

| Capa | Tecnología |
|------|-----------|
| Frontend | Vue 3 + Vue Router + Vite |
| HTTP Client | Axios |
| Backend | Node.js + Express |
| ORM | Sequelize |
| Base de datos | SQL Server (MSSQL) |
| Driver BD | Tedious |

---

## Estructura del proyecto

```
rh-lite-fullstack/
├── index.html
├── vite.config.js
├── package.json
│
├── src/                            # Frontend (Vue 3)
│   ├── main.js                     # Punto de entrada y configuración del router
│   ├── App.vue                     # Componente raíz
│   ├── components/
│   │   └── NavBar.vue              # Barra de navegación principal
│   ├── views/
│   │   ├── LoginView.vue           # Inicio de sesión
│   │   ├── DashboardView.vue       # Panel con KPIs y gráficas
│   │   ├── EmployeeCreateView.vue  # Alta de empleados
│   │   ├── EmployeesListView.vue   # Listado y gestión de empleados
│   │   ├── AreasCatalogView.vue
│   │   ├── BranchesCatalogView.vue
│   │   ├── DepartmentsCatalogView.vue
│   │   ├── PositionsCatalogView.vue
│   │   ├── CandidateStatesCatalogView.vue
│   │   └── ContractTypesCatalogView.vue
│   ├── api/                        # Servicios de comunicación con el backend
│   └── lib/
│       └── axios.js                # Instancia Axios con interceptor de token
│
└── backend/                        # Backend (Express)
    ├── package.json
    └── src/
        ├── server.js               # Inicio del servidor HTTP
        ├── app.js                  # Configuración de Express y middlewares
        ├── config/
        │   ├── database.js         # Conexión Sequelize a SQL Server
        │   └── env.js              # Variables de entorno
        ├── models/
        │   └── index.js            # Modelos Sequelize (Employee, Area, Branch, etc.)
        ├── routes/
        │   ├── auth.js             # Autenticación
        │   ├── employees.js        # Empleados y documentos
        │   ├── areas.js
        │   ├── branches.js
        │   ├── departments.js
        │   ├── positions.js
        │   ├── candidate-states.js
        │   ├── contract-types.js
        │   └── dashboard.js        # KPIs y métricas
        └── seeders/
            └── index.js            # Datos iniciales
```

---

## Requisitos previos

- **Node.js** v18 o superior
- **SQL Server** corriendo localmente (por defecto en `127.0.0.1:1433`)
- **npm** v9 o superior

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/rh-lite-fullstack.git
cd rh-lite-fullstack
```

### 2. Instalar dependencias del frontend

```bash
npm install
```

### 3. Instalar dependencias del backend

```bash
cd backend
npm install
cd ..
```

### 4. Configurar variables de entorno del backend

Crear el archivo `backend/.env` con el siguiente contenido:

```env
PORT=3000
ALLOWED_ORIGIN=http://localhost:5174

DB_CONNECTION=sqlsrv
DB_HOST=127.0.0.1
DB_PORT=1433
DB_DATABASE=rh_system_init
DB_USERNAME=sa
DB_PASSWORD=tu_contraseña
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true

AUTH_TOKEN_TTL_MINUTES=480
AUTH_DEMO_USERNAME=admin
AUTH_DEMO_PASSWORD=Admin123*
```

### 5. Crear la base de datos

Ejecutar el script SQL en tu instancia de SQL Server:

```
backend/db/init.sql
```

### 6. (Opcional) Ejecutar seeders para datos de prueba

```bash
cd backend
npm run seed
```

---

## Ejecución en desarrollo

### Opción A — Levantar todo junto

```bash
npm run dev:full
```

### Opción B — Por separado

**Backend** (puerto 3000):
```bash
cd backend
npm run dev
```

**Frontend** (puerto 5174):
```bash
npm run dev
```

Abrir el navegador en: `http://localhost:5174`

---

## Credenciales por defecto

| Campo | Valor |
|-------|-------|
| Usuario | `admin` |
| Contraseña | `Admin123*` |

---

## Módulos del sistema

### Dashboard
Panel principal con tarjetas KPI que muestran conteos de áreas, sucursales, departamentos, puestos, estados de candidatos y tipos de contrato. Incluye gráfica de barras combinada y mini-gráficas individuales.

### Empleados
- **Alta de empleado** — Formulario completo con datos personales, selección de área/departamento/puesto, dirección y carga de documentos (PDF, imágenes). Los documentos se almacenan en formato base64.
- **Todos los empleados** — Listado en tarjetas acordeón con búsqueda por nombre, código o correo. Permite visualizar y reemplazar documentos adjuntos.
- **Validación de duplicados** — No permite registrar dos empleados con el mismo nombre completo.

### Catálogos

| Catálogo | Ruta |
|----------|------|
| Áreas | `/catalogos/areas` |
| Sucursales | `/catalogos/sucursales` |
| Departamentos | `/catalogos/departamentos` |
| Puestos | `/catalogos/puestos` |
| Estados de Candidatos | `/catalogos/estados-candidatos` |
| Tipos de Contrato | `/catalogos/tipos-contrato` |

Todos los catálogos cuentan con: listado paginado, búsqueda, alta, edición y desactivación de registros.

---

## API — Endpoints principales

```
POST   /api/login
POST   /api/logout
GET    /api/session-status

GET    /api/dashboard/counts
GET    /api/dashboard/metrics

GET    /api/employees
POST   /api/employees
GET    /api/employees/:id/documents/:docIndex/view
PATCH  /api/employees/:id/documents/:docIndex
DELETE /api/employees/:id/documents/:docIndex

GET    /api/areas
POST   /api/areas
PUT    /api/areas/:id
DELETE /api/areas/:id

# (mismo patrón para branches, departments, positions, candidate-states, contract-types)
```

---

## Variables de entorno — referencia completa

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `PORT` | Puerto del servidor backend | `3000` |
| `ALLOWED_ORIGIN` | Origen permitido por CORS | `http://localhost:5173` |
| `DB_HOST` | Host de SQL Server | `127.0.0.1` |
| `DB_PORT` | Puerto de SQL Server | `1433` |
| `DB_DATABASE` | Nombre de la base de datos | `rh_system` |
| `DB_USERNAME` | Usuario de la base de datos | `sa` |
| `DB_PASSWORD` | Contraseña de la base de datos | — |
| `DB_ENCRYPT` | Activa cifrado TLS para SQL Server remoto | `false` |
| `DB_TRUST_SERVER_CERTIFICATE` | Acepta certificado autofirmado del servidor SQL | `true` |
| `AUTH_TOKEN_TTL_MINUTES` | Duración del token en minutos | `480` |
| `AUTH_DEMO_USERNAME` | Usuario de acceso demo | `admin` |
| `AUTH_DEMO_PASSWORD` | Contraseña de acceso demo | `Admin123*` |

---

## Despliegue en producción

Para que el login funcione en `https://rh-lite-fullstack.vercel.app`, el frontend y el backend deben estar publicados por separado:

- **Frontend** en Vercel
- **Backend** en Render
- **Base de datos SQL Server** accesible desde Internet para Render

### 1. Subir el backend a Render

Este repositorio ya incluye `render.yaml`, así que puedes crear el servicio desde GitHub usando **Blueprint** o un servicio web normal apuntando a `backend/`.

Variables mínimas del backend en Render:

```env
ALLOWED_ORIGIN=https://rh-lite-fullstack.vercel.app
DB_CONNECTION=sqlsrv
DB_HOST=TU_HOST_SQL
DB_PORT=1433
DB_DATABASE=TU_BASE
DB_USERNAME=TU_USUARIO
DB_PASSWORD=TU_PASSWORD
DB_ENCRYPT=true|false
DB_TRUST_SERVER_CERTIFICATE=true|false
AUTH_TOKEN_TTL_MINUTES=480
AUTH_DEMO_USERNAME=admin
AUTH_DEMO_PASSWORD=Admin123*
```

Notas importantes:

- Si tu SQL Server sigue en tu computadora local (`127.0.0.1` o Laragon), **Render no podrá conectarse**.
- Necesitas un SQL Server público o una instancia remota accesible desde Internet.
- Si usas Azure SQL, normalmente `DB_ENCRYPT=true` y `DB_TRUST_SERVER_CERTIFICATE=false`.
- Si usas Supabase, cambia a `DB_CONNECTION=postgres` y usa `DATABASE_URL`.

Cuando Render termine, valida estas rutas:

```text
GET  https://TU-BACKEND.onrender.com/health
POST https://TU-BACKEND.onrender.com/api/login
```

### 2. Configurar el frontend en Vercel

En Vercel agrega esta variable de entorno del proyecto:

```env
VITE_API_URL=https://TU-BACKEND.onrender.com/api
```

Luego haz un nuevo deploy del frontend.

### 3. Verificación final

Después del redeploy:

- Abre `https://rh-lite-fullstack.vercel.app/login`
- Inicia sesión con el usuario configurado en el backend
- Si ves error CORS, revisa `ALLOWED_ORIGIN`
- Si ves error `500`, revisa la conexión de Render a SQL Server

---

## Conectar Supabase

Supabase **no usa SQL Server**, usa PostgreSQL. Este proyecto ya puede conectarse a ambos motores por Sequelize, pero para Supabase debes cambiar las variables del backend.

### Variables para backend con Supabase

En Render configura:

```env
ALLOWED_ORIGIN=https://rh-lite-fullstack.vercel.app
DB_CONNECTION=postgres
DATABASE_URL=postgresql://postgres:TU_PASSWORD@db.TU-PROYECTO.supabase.co:5432/postgres
DB_SSL=true
AUTH_TOKEN_TTL_MINUTES=480
AUTH_DEMO_USERNAME=admin
AUTH_DEMO_PASSWORD=Admin123*
```

### Dónde sacar `DATABASE_URL` en Supabase

En tu proyecto de Supabase entra a:

- `Project Settings`
- `Database`
- `Connection string`

Usa la cadena tipo `URI` o `SQLAlchemy` y toma el formato PostgreSQL.

### Consideración importante

Si vienes de SQL Server, Supabase estará vacío. Al arrancar, Sequelize creará las tablas por `sequelize.sync()`, pero tus datos anteriores no se migran solos.

Para validar la conexión:

```text
GET https://TU-BACKEND.onrender.com/health
POST https://TU-BACKEND.onrender.com/api/login
```

