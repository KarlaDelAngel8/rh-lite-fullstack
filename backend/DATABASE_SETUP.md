# Setup Base de Datos - SQL Server

## Requisitos
- SQL Server 2019 o superior
- SQL Server Management Studio (SSMS) o herramienta similar
- Usuario `sa` con contraseña `12345` (configurado en `.env`)

## Pasos para crear la base de datos

### Opción 1: Ejecución manual en SQL Server Management Studio

1. Abre **SQL Server Management Studio**
2. Conecta con:
   - Servidor: `127.0.0.1`
   - Usuario: `sa`
   - Contraseña: `12345`
3. Abre la carpeta `backend/db/` y ejecuta el archivo `init.sql`:
   - Abre New Query
   - Copia el contenido de `init.sql`
   - Ejecuta (F5)

### Opción 2: Línea de comandos (sqlcmd)

```bash
sqlcmd -S 127.0.0.1 -U sa -P 12345 -i backend/db/init.sql
```

## Verificar que todo funcionó

1. En SSMS, expande **Databases** y deberías ver `rh_system`
2. Expande `rh_system` → **Tables** y deberías ver:
   - areas
   - branches
   - departments
   - candidate_states

## Conectar desde el backend

El backend Node.js ya está configurado con:
- Host: `127.0.0.1`
- Port: `1433`
- Database: `rh_system`
- Username: `sa`
- Password: `12345`

Cuando inices el backend con `npm run dev`, debería conectar automáticamente.

## Endpoints disponibles

### Areas
- `GET /areas` - Listar todas
- `GET /areas/active` - Listar activas
- `GET /areas/:id` - Obtener por ID
- `POST /areas/create` - Crear
- `PUT /areas/update/:id` - Actualizar
- `PUT /areas/delete/:id` - Cambiar estado

### Branches
- `GET /branches` - Listar todas
- `GET /branches?area_id=1` - Listar por área
- `GET /branches/active` - Listar activas
- `GET /branches/:id` - Obtener por ID
- `POST /branches/create` - Crear
- `PUT /branches/update/:id` - Actualizar
- `PUT /branches/delete/:id` - Cambiar estado

### Candidate States
- Mismo patrón que Areas

## Datos de prueba

Se insertan automáticamente al ejecutar `init.sql`:
- **4 áreas** (Ventas, RRHH, Tecnología, Operaciones)
- **3 sucursales** (asociadas a áreas)
- **3 departamentos**
- **5 estados de candidatos**
