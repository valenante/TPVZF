import { Router } from 'express';
const router = Router();
import { getPassword, createOrUpdatePassword, updatePassword } from '../controllers/passwordController.js';

//Obtener la password
router.get('/', getPassword)

//Crear contraseña
router.post('/', createOrUpdatePassword)

//Actualizar contraseña
router.put('/', updatePassword)

export default router;
