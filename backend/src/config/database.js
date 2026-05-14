// Este módulo sirve para: Crear y exportar la instancia de Sequelize con la configuración de conexión a la base de datos SQL Server.
// Elaborado por: Karla Vanessa Del Angel Santiago

import { Sequelize } from 'sequelize';
import { env } from './env.js';

const isPostgres = ['postgres', 'postgresql'].includes(env.db.connection);

const sequelize = env.db.url
  ? new Sequelize(env.db.url, {
      dialect: isPostgres ? 'postgres' : 'mssql',
      logging: false,
      dialectOptions: isPostgres
        ? {
            ssl: env.db.ssl
              ? {
                  require: true,
                  rejectUnauthorized: false,
                }
              : false,
          }
        : {
            requestTimeout: 30000,
            options: {
              encrypt: env.db.encrypt,
              trustServerCertificate: env.db.trustServerCertificate,
            },
          },
    })
  : new Sequelize({
      host: env.db.host,
      port: env.db.port,
      database: env.db.database,
      username: env.db.username,
      password: env.db.password,
      dialect: isPostgres ? 'postgres' : 'mssql',
      logging: false,
      dialectOptions: isPostgres
        ? {
            ssl: env.db.ssl
              ? {
                  require: true,
                  rejectUnauthorized: false,
                }
              : false,
          }
        : {
            requestTimeout: 30000,
            options: {
              encrypt: env.db.encrypt,
              trustServerCertificate: env.db.trustServerCertificate,
            },
          },
    });

export default sequelize;
