import express from 'express';
import {
  crearReserva,
  obtenerReservas,
  cancelarReserva,
  confirmarReserva,
  obtenerFechasConReservas,
  obtenerReservasPorFecha,
} from '../controllers/reservasController.js';

const router = express.Router();

// No requiere auth, viene desde el cliente público
router.post('/', crearReserva);

// Nuevos (para TPV)
router.get('/', obtenerReservas);
router.put('/:id/cancelar', cancelarReserva);
router.put('/:id/confirmar', confirmarReserva);
router.get('/fecha', obtenerReservasPorFecha); // soporta ?fecha y ?estado
router.get('/fechasReserva', obtenerFechasConReservas);

export default router;
