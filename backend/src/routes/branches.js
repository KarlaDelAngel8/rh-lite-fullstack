// Este módulo sirve para: Gestionar los endpoints CRUD del catálogo de Sucursales.
// Elaborado por: Karla Vanessa Del Angel Santiago

import { Router } from 'express';
import { Branch } from '../models/index.js';

const router = Router();

// GET all branches
router.get('/', async (req, res) => {
  try {
    const { area_id } = req.query;
    const where = area_id ? { areaId: area_id } : {};
    const branches = await Branch.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json({ data: branches });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET active branches
router.get('/active', async (req, res) => {
  try {
    const branches = await Branch.findAll({
      where: { status: true },
      order: [['name', 'ASC']],
    });
    res.json({ data: branches });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET branch by ID
router.get('/:id', async (req, res) => {
  try {
    const branch = await Branch.findByPk(req.params.id);
    if (!branch) return res.status(404).json({ message: 'Branch not found' });
    res.json({ data: branch });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE branch
router.post('/create', async (req, res) => {
  try {
    const { name, description, area_id } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const branch = await Branch.create({
      name,
      description,
      areaId: area_id,
      status: true,
    });
    res.status(201).json({ data: branch });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE branch
router.put('/update/:id', async (req, res) => {
  try {
    const { name, description, area_id } = req.body;
    const branch = await Branch.findByPk(req.params.id);
    if (!branch) return res.status(404).json({ message: 'Branch not found' });

    if (name) branch.name = name;
    if (description !== undefined) branch.description = description;
    if (area_id !== undefined) branch.areaId = area_id;
    await branch.save();

    res.json({ data: branch });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE/Change status branch
router.put('/delete/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const branch = await Branch.findByPk(req.params.id);
    if (!branch) return res.status(404).json({ message: 'Branch not found' });

    branch.status = status !== undefined ? status : false;
    await branch.save();

    res.json({ data: branch });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Template download (placeholder)
router.get('/template', async (req, res) => {
  res.json({ message: 'Template download not implemented' });
});

// Import (placeholder)
router.post('/import', async (req, res) => {
  res.json({ message: 'Import not implemented' });
});

export default router;
