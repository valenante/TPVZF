import { Router } from 'express';
const router = Router();
import {
  pedirCuenta,
  imprimirCuenta,
} from '../controllers/cuentaController.js';

// Ruta para solicitar cuenta
router.post('/pedir-cuenta/:numeroMesa', pedirCuenta);
router.post('/:id/imprimir-cuenta', imprimirCuenta);

export default router;
