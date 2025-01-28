import { Router } from 'express';
const router = Router();

// Importar los controladores de caja
import { getCaja, cerrarCaja, retirarDinero, integrarDinero } from '../controllers/cajaController.js';

// Obtener el total de la caja
router.get('/total', getCaja);

// Retirar dinero de la caja
router.post('/retirar', retirarDinero);

// Integrar dinero a la caja
router.post('/integrar', integrarDinero);

// Cerrar la caja
router.post('/cerrar', cerrarCaja);

export default router;
