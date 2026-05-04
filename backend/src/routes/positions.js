// Este módulo sirve para: Gestionar los endpoints CRUD del catálogo de Puestos de trabajo.
// Elaborado por: Karla Vanessa Del Angel Santiago

import { Router } from 'express';
import { Position } from '../models/index.js';

const router = Router();

// GET all positions
router.get('/', async (_req, res) => {
  try {
    const positions = await Position.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ data: positions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET active positions
router.get('/active', async (_req, res) => {
  try {
    const positions = await Position.findAll({
      where: { status: true },
      order: [['name', 'ASC']],
    });
    res.json({ data: positions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET position by ID
router.get('/:id', async (req, res) => {
  try {
    const position = await Position.findByPk(req.params.id);
    if (!position) return res.status(404).json({ message: 'Position not found' });
    res.json({ data: position });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE position
router.post('/create', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const position = await Position.create({ name, description, status: true });
    res.status(201).json({ data: position });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE position
router.put('/update/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    const position = await Position.findByPk(req.params.id);
    if (!position) return res.status(404).json({ message: 'Position not found' });

    if (name) position.name = name;
    if (description !== undefined) position.description = description;
    await position.save();

    res.json({ data: position });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE/Change status position
router.put('/delete/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const position = await Position.findByPk(req.params.id);
    if (!position) return res.status(404).json({ message: 'Position not found' });

    position.status = status !== undefined ? status : false;
    await position.save();

    res.json({ data: position });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
