// Este módulo sirve para: Registrar el middleware de proxy de API y agrupar todas las rutas bajo el prefijo /api.
// Elaborado por: Karla Vanessa Del Angel Santiago

import { Router } from 'express';
import { apiProxy } from '../middlewares/apiProxy.js';

const router = Router();

router.use('/', apiProxy);

export default router;
