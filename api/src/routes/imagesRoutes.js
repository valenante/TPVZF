import { Router } from 'express';
import upload from '../middlewares/upload.js';
import { uploadImage } from '../controllers/imagesController.js';

const router = Router();

// ✅ Aplicar `upload.single('file')` antes del controlador
router.post('/upload-image', upload.single('file'), uploadImage);

export default router;
