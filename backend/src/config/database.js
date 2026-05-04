// Este módulo sirve para: Crear y exportar la instancia de Sequelize con la configuración de conexión a la base de datos SQL Server.
// Elaborado por: Karla Vanessa Del Angel Santiago

import { Sequelize } from 'sequelize';
import { env } from './env.js';

const sequelize = new Sequelize({
  host: env.db.host,
  port: env.db.port,
  database: env.db.database,
  username: env.db.username,
  password: env.db.password,
  dialect: 'mssql',
  logging: false,
  dialectOptions: {
    requestTimeout: 30000,
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  },
});

export default sequelize;
