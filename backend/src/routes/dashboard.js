// Este módulo sirve para: Proveer los endpoints del Dashboard con conteos de catálogos y métricas de empleados para las gráficas del panel principal.
// Elaborado por: Karla Vanessa Del Angel Santiago

import { Router } from 'express';
import { Op } from 'sequelize';
import {
  Area,
  Branch,
  Department,
  Position,
  ContractType,
  CandidateState,
} from '../models/index.js';

const router = Router();

/**
 * GET /dashboard/counts
 * Totals for every catalog entity.
 */
router.get('/counts', async (_req, res) => {
  try {
    const [areas, branches, departments, positions, contractTypes, candidateStates] =
      await Promise.all([
        Area.count({ where: { status: true } }),
        Branch.count({ where: { status: true } }),
        Department.count({ where: { status: true } }),
        Position.count({ where: { status: true } }),
        ContractType.count({ where: { status: true } }),
        CandidateState.count({ where: { status: true } }),
      ]);

    res.json({ data: { areas, branches, departments, positions, contractTypes, candidateStates } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /dashboard/metrics
 * Records created per month for the last 6 months, grouped by entity type.
 */
router.get('/metrics', async (_req, res) => {
  try {
    const since = new Date();
    since.setMonth(since.getMonth() - 5);
    since.setDate(1);
    since.setHours(0, 0, 0, 0);

    const whereClause = { createdAt: { [Op.gte]: since } };

    const [areas, branches, departments, positions] = await Promise.all([
      Area.findAll({ where: whereClause, attributes: ['createdAt'] }),
      Branch.findAll({ where: whereClause, attributes: ['createdAt'] }),
      Department.findAll({ where: whereClause, attributes: ['createdAt'] }),
      Position.findAll({ where: whereClause, attributes: ['createdAt'] }),
    ]);

    // Build 6-month label array
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({ key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: d.toLocaleString('es-MX', { month: 'short', year: '2-digit' }) });
    }

    function bucketing(rows) {
      const map = {};
      months.forEach(m => (map[m.key] = 0));
      rows.forEach(r => {
        const d = new Date(r.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (key in map) map[key]++;
      });
      return months.map(m => map[m.key]);
    }

    res.json({
      data: {
        labels: months.map(m => m.label),
        series: {
          areas: bucketing(areas),
          branches: bucketing(branches),
          departments: bucketing(departments),
          positions: bucketing(positions),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
