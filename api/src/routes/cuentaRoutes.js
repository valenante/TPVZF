import { Router } from 'express';
const router = Router();
import { pedirCuenta } from '../controllers/cuentaController.js';

// Ruta para solicitar cuenta
router.post('/pedir-cuenta/:numeroMesa', pedirCuenta);

export default router;