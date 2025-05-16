import { Router } from 'express';
const router = Router();
import {
  obtenerPassword,
  crearActualizarPassword,
  actualizarPassword,
  validarPassword,
} from '../controllers/passwordController.js';

//Obtener la password
router.get('/', obtenerPassword);

//Crear contraseña
router.post('/', crearActualizarPassword);

//Actualizar contraseña
router.put('/', actualizarPassword);

//Validar contraseña
router.post('/validate-password', validarPassword);

export default router;
