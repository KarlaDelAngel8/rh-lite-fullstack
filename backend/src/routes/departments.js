// Este módulo sirve para: Gestionar los endpoints CRUD del catálogo de Departamentos.
// Elaborado por: Karla Vanessa Del Angel Santiago

import { Router } from 'express';
import { Department } from '../models/index.js';

const router = Router();

// GET all departments
router.get('/', async (_req, res) => {
  try {
    const departments = await Department.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ data: departments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET active departments
router.get('/active', async (_req, res) => {
  try {
    const departments = await Department.findAll({
      where: { status: true },
      order: [['name', 'ASC']],
    });
    res.json({ data: departments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET department by ID
router.get('/:id', async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department) return res.status(404).json({ message: 'Department not found' });
    res.json({ data: department });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE department
router.post('/create', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const department = await Department.create({ name, description, status: true });
    res.status(201).json({ data: department });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE department
router.put('/update/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    const department = await Department.findByPk(req.params.id);
    if (!department) return res.status(404).json({ message: 'Department not found' });

    if (name) department.name = name;
    if (description !== undefined) department.description = description;
    await department.save();

    res.json({ data: department });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE/Change status department
router.put('/delete/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const department = await Department.findByPk(req.params.id);
    if (!department) return res.status(404).json({ message: 'Department not found' });

    department.status = status !== undefined ? status : false;
    await department.save();

    res.json({ data: department });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Template download (placeholder)
router.get('/template', async (_req, res) => {
  res.json({ message: 'Template download not implemented' });
});

// Import (placeholder)
router.post('/import', async (_req, res) => {
  res.json({ message: 'Import not implemented' });
});

export default router;
