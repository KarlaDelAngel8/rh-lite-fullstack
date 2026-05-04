// Este módulo sirve para: Gestionar los endpoints CRUD del catálogo de Estados de Candidatos para el proceso de reclutamiento.
// Elaborado por: Karla Vanessa Del Angel Santiago

import { Router } from 'express';
import { CandidateState } from '../models/index.js';

const router = Router();

// GET all candidate states
router.get('/', async (req, res) => {
  try {
    const states = await CandidateState.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ data: states });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET active candidate states
router.get('/active', async (req, res) => {
  try {
    const states = await CandidateState.findAll({
      where: { status: true },
      order: [['name', 'ASC']],
    });
    res.json({ data: states });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET candidate state by ID
router.get('/:id', async (req, res) => {
  try {
    const state = await CandidateState.findByPk(req.params.id);
    if (!state) return res.status(404).json({ message: 'Candidate state not found' });
    res.json({ data: state });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE candidate state
router.post('/create', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const state = await CandidateState.create({ name, description, status: true });
    res.status(201).json({ data: state });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE candidate state
router.put('/update/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    const state = await CandidateState.findByPk(req.params.id);
    if (!state) return res.status(404).json({ message: 'Candidate state not found' });

    if (name) state.name = name;
    if (description !== undefined) state.description = description;
    await state.save();

    res.json({ data: state });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE/Change status candidate state
router.put('/delete/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const state = await CandidateState.findByPk(req.params.id);
    if (!state) return res.status(404).json({ message: 'Candidate state not found' });

    state.status = status !== undefined ? status : false;
    await state.save();

    res.json({ data: state });
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
