import { Router } from 'express';
const router = Router();
import { getPassword, createOrUpdatePassword, updatePassword, validatePassword } from '../controllers/passwordController.js';

//Obtener la password
router.get('/', getPassword)

//Crear contraseña
router.post('/', createOrUpdatePassword)

//Actualizar contraseña
router.put('/', updatePassword)

//Validar contraseña
router.post('/validate-password', validatePassword)

export default router;
