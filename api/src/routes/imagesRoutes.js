import { Router } from 'express';
import upload from '../middlewares/upload.js';
import { subirImagen } from '../controllers/imagesController.js';

const router = Router();

// ✅ Aplicar `upload.single('file')` antes del controlador
router.post('/upload-image', upload.single('file'), subirImagen);

export default router;
