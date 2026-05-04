// Este módulo sirve para: Gestionar los endpoints CRUD del catálogo de Áreas organizacionales.
// Elaborado por: Karla Vanessa Del Angel Santiago

import { Router } from 'express';
import { Area } from '../models/index.js';

const router = Router();

// GET all areas
router.get('/', async (req, res) => {
  try {
    const areas = await Area.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ data: areas });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET active areas
router.get('/active', async (req, res) => {
  try {
    const areas = await Area.findAll({
      where: { status: true },
      order: [['name', 'ASC']],
    });
    res.json({ data: areas });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET area by ID
router.get('/:id', async (req, res) => {
  try {
    const area = await Area.findByPk(req.params.id);
    if (!area) return res.status(404).json({ message: 'Area not found' });
    res.json({ data: area });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE area
router.post('/create', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const area = await Area.create({ name, description, status: true });
    res.status(201).json({ data: area });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE area
router.put('/update/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    const area = await Area.findByPk(req.params.id);
    if (!area) return res.status(404).json({ message: 'Area not found' });

    if (name) area.name = name;
    if (description !== undefined) area.description = description;
    await area.save();

    res.json({ data: area });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE/Change status area
router.put('/delete/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const area = await Area.findByPk(req.params.id);
    if (!area) return res.status(404).json({ message: 'Area not found' });

    area.status = status !== undefined ? status : false;
    await area.save();

    res.json({ data: area });
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
