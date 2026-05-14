// Este módulo sirve para: Cargar y exportar las variables de entorno del sistema (puerto, credenciales de BD, secretos) desde el archivo .env.
// Elaborado por: Karla Vanessa Del Angel Santiago

import dotenv from 'dotenv';

dotenv.config();

const removeTrailingSlash = (value = '') => value.replace(/\/+$/, '');
const parseOrigins = (value = '') => value
  .split(',')
  .map((entry) => entry.trim())
  .filter(Boolean);

export const env = {
  port: Number(process.env.PORT || 3000),
  upstreamApiUrl: removeTrailingSlash(process.env.UPSTREAM_API_URL || 'http://localhost:8000/api'),
  allowedOrigins: parseOrigins(process.env.ALLOWED_ORIGIN || 'http://localhost:5174,http://localhost:5173'),
  db: {
    connection: (process.env.DB_CONNECTION || 'sqlsrv').toLowerCase(),
    url: process.env.DATABASE_URL || process.env.DB_URL || '',
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 1433),
    database: process.env.DB_DATABASE || 'rh_system',
    username: process.env.DB_USERNAME || 'sa',
    password: process.env.DB_PASSWORD || '12345',
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
    ssl: process.env.DB_SSL !== 'false',
  },
  auth: {
    tokenTtlMinutes: Number(process.env.AUTH_TOKEN_TTL_MINUTES || 480),
    demoUsername: process.env.AUTH_DEMO_USERNAME || 'admin',
    demoPassword: process.env.AUTH_DEMO_PASSWORD || 'Admin123*',
  },
};
