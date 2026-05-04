// Este módulo sirve para: Gestionar los endpoints CRUD del catálogo de Tipos de Contrato laboral.
// Elaborado por: Karla Vanessa Del Angel Santiago

import { Router } from 'express';
import { ContractType } from '../models/index.js';

const router = Router();

// GET all contract types
router.get('/', async (_req, res) => {
  try {
    const contractTypes = await ContractType.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ data: contractTypes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET active contract types
router.get('/active', async (_req, res) => {
  try {
    const contractTypes = await ContractType.findAll({
      where: { status: true },
      order: [['name', 'ASC']],
    });
    res.json({ data: contractTypes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET contract type by ID
router.get('/:id', async (req, res) => {
  try {
    const contractType = await ContractType.findByPk(req.params.id);
    if (!contractType) return res.status(404).json({ message: 'Contract type not found' });
    res.json({ data: contractType });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE contract type
router.post('/create', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const contractType = await ContractType.create({ name, description, status: true });
    res.status(201).json({ data: contractType });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE contract type
router.put('/update/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    const contractType = await ContractType.findByPk(req.params.id);
    if (!contractType) return res.status(404).json({ message: 'Contract type not found' });

    if (name) contractType.name = name;
    if (description !== undefined) contractType.description = description;
    await contractType.save();

    res.json({ data: contractType });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE/Change status contract type
router.put('/delete/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const contractType = await ContractType.findByPk(req.params.id);
    if (!contractType) return res.status(404).json({ message: 'Contract type not found' });

    contractType.status = status !== undefined ? status : false;
    await contractType.save();

    res.json({ data: contractType });
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
