import { Router } from 'express';
const router = Router();

// Importar los controladores de caja
import { getCaja, cerrarCaja } from '../controllers/cajaController.js';

// Obtener el total de la caja
router.get('/total', getCaja);

// Cerrar la caja
router.post('/cerrar', cerrarCaja);

export default router;
