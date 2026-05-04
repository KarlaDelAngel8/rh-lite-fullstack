// Este módulo sirve para: Configurar la aplicación Express. Registra middlewares globales (CORS, JSON, Morgan) y monta todos los routers de la API.
// Elaborado por: Karla Vanessa Del Angel Santiago

import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import apiRoutes from './routes/api.routes.js';
import authRoutes from './routes/auth.js';
import areasRoutes from './routes/areas.js';
import branchesRoutes from './routes/branches.js';
import candidateStatesRoutes from './routes/candidate-states.js';
import contractTypesRoutes from './routes/contract-types.js';
import departmentsRoutes from './routes/departments.js';
import employeesRoutes from './routes/employees.js';
import positionsRoutes from './routes/positions.js';
import dashboardRoutes from './routes/dashboard.js';
import { User } from './models/index.js';
import { createPasswordHash } from './lib/auth-security.js';
import sequelize from './config/database.js';
import { env } from './config/env.js';

const app = express();

const ensureDemoUser = async () => {
  const existingUser = await User.findOne({ where: { username: env.auth.demoUsername } });
  if (existingUser) return;

  const { salt, hash } = createPasswordHash(env.auth.demoPassword);
  await User.create({
    username: env.auth.demoUsername,
    fullName: 'Usuario Demo',
    passwordHash: hash,
    passwordSalt: salt,
    status: true,
  });
  console.log(`Demo user created: ${env.auth.demoUsername}`);
};

app.use(cors({ origin: env.allowedOrigin, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '25mb' }));

// Test database connection
sequelize.authenticate()
  .then(() => console.log('Database connected successfully'))
  .catch((err) => console.error('Database connection failed:', err.message));

// Sync database models (creates tables if they don't exist)
sequelize.sync({ alter: false })
  .then(() => ensureDemoUser())
  .catch((err) => {
    console.error('Database sync/bootstrap failed:', err.message);
  });

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'rh-lite-backend' });
});

// Local auth routes
app.use('/', authRoutes);
app.use('/api', authRoutes);

// Local CRUD routes (direct database) - available at both paths
app.use('/areas', areasRoutes);
app.use('/branches', branchesRoutes);
app.use('/candidate-states', candidateStatesRoutes);
app.use('/contract-types', contractTypesRoutes);
app.use('/departments', departmentsRoutes);
app.use('/employees', employeesRoutes);
app.use('/positions', positionsRoutes);
app.use('/api/areas', areasRoutes);
app.use('/api/branches', branchesRoutes);
app.use('/api/candidate-states', candidateStatesRoutes);
app.use('/api/contract-types', contractTypesRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/positions', positionsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Proxy routes (upstream API) - catch all remaining /api/* requests
app.use('/api', apiRoutes);

export default app;
