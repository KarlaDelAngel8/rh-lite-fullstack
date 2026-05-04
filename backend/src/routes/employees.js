// Este módulo sirve para: Gestionar los endpoints de empleados: listado, creación con documentos en base64, visualización y reemplazo de documentos, y eliminación de documentos individuales.
// Elaborado por: Karla Vanessa Del Angel Santiago

import { Router } from 'express';
import { Op } from 'sequelize';
import { Employee } from '../models/index.js';

const router = Router();

function parseDocuments(documentsValue) {
  if (!documentsValue) return [];
  if (Array.isArray(documentsValue)) return documentsValue;

  if (typeof documentsValue === 'string') {
    try {
      const parsed = JSON.parse(documentsValue);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_error) {
      return [];
    }
  }

  return [];
}

router.get('/', async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const perPage = Math.min(Math.max(Number(req.query.per_page) || 50, 1), 200);
    const search = String(req.query.search || '').trim().toLowerCase();

    const employees = await Employee.findAll({
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * perPage,
      limit: perPage,
    });

    const filtered = search
      ? employees.filter((item) => {
        const fullName = `${item.firstName || ''} ${item.lastName || ''}`.toLowerCase();
        const code = String(item.employeeCode || '').toLowerCase();
        const email = String(item.email || '').toLowerCase();
        return fullName.includes(search) || code.includes(search) || email.includes(search);
      })
      : employees;

    res.json({ data: filtered, meta: { page, per_page: perPage, count: filtered.length } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/documents/:docIndex/view', async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Empleado no encontrado.' });
    }

    const docIndex = Number(req.params.docIndex);
    if (Number.isNaN(docIndex) || docIndex < 0) {
      return res.status(400).json({ message: 'Indice de documento invalido.' });
    }

    const documents = parseDocuments(employee.documents);
    const doc = documents[docIndex];

    if (!doc) {
      return res.status(404).json({ message: 'Documento no encontrado.' });
    }

    if (!doc.contentBase64) {
      return res.status(404).json({ message: 'El documento no contiene contenido para visualizacion.' });
    }

    const mimeType = doc.type || 'application/octet-stream';
    const safeName = (doc.name || `documento-${docIndex + 1}`).replace(/"/g, '');
    const binary = Buffer.from(doc.contentBase64, 'base64');

    return res
      .set('Content-Type', mimeType)
      .set('Content-Disposition', `inline; filename="${safeName}"`)
      .send(binary);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.patch('/:id/documents/:docIndex', async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Empleado no encontrado.' });
    }

    const docIndex = Number(req.params.docIndex);
    if (Number.isNaN(docIndex) || docIndex < 0) {
      return res.status(400).json({ message: 'Indice de documento invalido.' });
    }

    const documents = parseDocuments(employee.documents);
    if (!documents[docIndex]) {
      return res.status(404).json({ message: 'Documento no encontrado.' });
    }

    const { document: incoming } = req.body || {};
    if (!incoming || !incoming.contentBase64) {
      return res.status(422).json({ message: 'Se requiere el contenido base64 del documento.' });
    }

    documents[docIndex] = {
      ...documents[docIndex],
      name: incoming.name || documents[docIndex].name,
      size: incoming.size ?? documents[docIndex].size,
      type: incoming.type || documents[docIndex].type,
      lastModified: incoming.lastModified ?? documents[docIndex].lastModified,
      contentBase64: incoming.contentBase64,
    };

    employee.documents = JSON.stringify(documents);
    await employee.save();

    const saved = { ...documents[docIndex] };
    delete saved.contentBase64;

    return res.json({ message: 'Documento actualizado correctamente.', data: { document: saved } });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.delete('/:id/documents/:docIndex', async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Empleado no encontrado.' });
    }

    const docIndex = Number(req.params.docIndex);
    if (Number.isNaN(docIndex) || docIndex < 0) {
      return res.status(400).json({ message: 'Indice de documento invalido.' });
    }

    const documents = parseDocuments(employee.documents);
    if (!documents[docIndex]) {
      return res.status(404).json({ message: 'Documento no encontrado.' });
    }

    documents.splice(docIndex, 1);

    employee.documents = documents.length ? JSON.stringify(documents) : null;
    await employee.save();

    return res.json({
      message: 'Documento eliminado correctamente.',
      data: { documents },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const payload = req.body || {};

    if (!payload.firstName || !payload.lastName) {
      return res.status(422).json({ message: 'firstName y lastName son obligatorios.' });
    }

    const normalizedFirst = payload.firstName.trim().toLowerCase();
    const normalizedLast = payload.lastName.trim().toLowerCase();

    const existing = await Employee.findAll();
    const duplicate = existing.find(
      (e) =>
        (e.firstName || '').trim().toLowerCase() === normalizedFirst &&
        (e.lastName || '').trim().toLowerCase() === normalizedLast
    );

    if (duplicate) {
      return res.status(409).json({
        message: `Ya existe un empleado registrado con el nombre "${payload.firstName.trim()} ${payload.lastName.trim()}".`,
      });
    }

    const documents = Array.isArray(payload.documents)
      ? payload.documents
      : [];

    const employee = await Employee.create({
      employeeCode: payload.employeeCode || null,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email || null,
      phone: payload.phone || null,
      hireDate: payload.hireDate || null,
      areaId: payload.areaId ? Number(payload.areaId) : null,
      departmentId: payload.departmentId ? Number(payload.departmentId) : null,
      positionId: payload.positionId ? Number(payload.positionId) : null,
      addressStreet: payload.addressStreet || null,
      addressExteriorNumber: payload.addressExteriorNumber || null,
      addressInteriorNumber: payload.addressInteriorNumber || null,
      addressNeighborhood: payload.addressNeighborhood || null,
      addressCity: payload.addressCity || null,
      addressState: payload.addressState || null,
      addressZipCode: payload.addressZipCode || null,
      addressCountry: payload.addressCountry || null,
      documents: documents.length ? JSON.stringify(documents) : null,
      status: true,
    });

    return res.status(201).json({ data: employee, message: 'Empleado registrado correctamente.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;
