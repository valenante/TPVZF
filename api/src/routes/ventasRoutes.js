import { Router } from 'express';
const router = Router();
import { getVentas, getVentaById, createVenta, updateVenta, deleteVenta } from '../controllers/ventasController.js';

// Obtener todas las ventas
router.get('/', getVentas);

// Obtener una venta por ID
router.get('/:id', getVentaById);

// Crear una nueva venta
router.post('/', createVenta);

// Actualizar una venta por ID
router.put('/:id', updateVenta);

// Eliminar una venta por ID
router.delete('/:id', deleteVenta);

export default router;
