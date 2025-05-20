// routes/impresionRoutes.js
import express from 'express';
const router = express.Router();
import { imprimirPlatos, imprimirBebidas, imprimirCuenta, imprimirFactura } from '../controllers/imprimirController.js';

router.post('/imprimir', imprimirPlatos);
router.post('/imprimir-bebidas', imprimirBebidas);
router.post('/:mesaId/imprimir-factura', imprimirFactura);
router.post('/:mesaId/imprimir-cuenta', imprimirCuenta);
router.get('/', (req, res) => {
    res.status(200).json({ message: 'Ruta de impresión de platos' });
    }
);

export default router;
