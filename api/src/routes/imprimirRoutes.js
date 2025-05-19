// routes/impresionRoutes.js
import express from 'express';
const router = express.Router();
import { imprimirPlatos, imprimirBebidas } from '../controllers/imprimirController.js';

router.post('/imprimir', imprimirPlatos);
router.post('/imprimir-bebidas', imprimirBebidas);

export default router;
