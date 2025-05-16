import { Router } from 'express';
const router = Router();
import {
  obtenerVentasPorId,
  obtenerVentas,
  crearVenta,
  actualizarVenta,
  eliminarVenta,
} from '../controllers/ventasController.js';

// Obtener todas las ventas
router.get('/', obtenerVentas);

// Obtener una venta por ID
router.get('/:id', obtenerVentasPorId);

// Crear una nueva venta
router.post('/', crearVenta);

// Actualizar una venta por ID
router.put('/:id', actualizarVenta);

// Eliminar una venta por ID
router.delete('/:id', eliminarVenta);

export default router;
