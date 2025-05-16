import express from 'express';
import {
  listarFacturasEncadenadas,
  exportarFacturasCSV,
  rectificarFactura,
} from '../controllers/facturasController.js';

const router = express.Router();

router.get('/facturas-encadenadas', listarFacturasEncadenadas);
router.get('/exportar-csv', exportarFacturasCSV);
router.post('/rectificar/:id', rectificarFactura);

export default router;
