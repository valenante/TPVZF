import { Router } from 'express';
const router = Router();

// Importar los controladores de caja
import { cerrarCaja, retirarDinero, integrarDinero, obtenerCaja } from '../controllers/cajaController.js';

// Obtener el total de la caja
router.get('/total', obtenerCaja);

// Retirar dinero de la caja
router.post('/retirar', retirarDinero);

// Integrar dinero a la caja
router.post('/integrar', integrarDinero);

// Cerrar la caja
router.post('/cerrar', cerrarCaja);

export default router;
