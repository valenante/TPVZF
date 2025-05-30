import { Router } from 'express';
const router = Router();
import {
  cerrarMesa,
  obtenerMesasAbiertas,
  obtenerMesasCerradas,
  getHistorialMesas,
  recuperarMesa,
  crearMesa,
  eliminarMesa,
  obtenerMesas,
  obtenerMesaPorId,
  obtenerMesaPorNumero,
  verificarTokenLider,
  verificarTokenLiderPorNumero,
  crearTokenLider,
  registrarComensal,
  abrirMesaCamarero,
  transferirProducto,
} from '../controllers/mesaController.js';

// Rutas
router.get('/', obtenerMesas); // Obtener todas las mesas activas
router.get('/:id', obtenerMesaPorId); // Obtener una mesa activa por ID
router.post('/crear-mesa/crear-mesa', crearMesa);
router.post('/recuperar-mesa/:mesaId', recuperarMesa);
router.post('/comensal', registrarComensal);
router.put('/:id/cerrar', cerrarMesa); // Cerrar una mesa
router.get('/historial', getHistorialMesas); // Obtener el historial de mesas cerradas
router.get('/:numeroMesa', obtenerMesaPorNumero); // Obtener una mesa activa por número
router.get('/token-lider/token-lider/check/:mesaId', verificarTokenLider);
router.get('/token-lider/token-lider/check', verificarTokenLiderPorNumero);
router.post('/token-lider/token-lider', crearTokenLider);
router.get('/mesas-cerradas/mesas-cerradas', obtenerMesasCerradas);
router.get('/mesas-abiertas/mesas-abiertas', obtenerMesasAbiertas);
router.put('/mesas/:id/abrir', abrirMesaCamarero);
router.delete('/eliminar-mesa', eliminarMesa);
router.post('/mesas/transferir-producto', transferirProducto);

export default router;
