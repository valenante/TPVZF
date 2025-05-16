import multer from 'multer';
import path from 'path';

// Configurar almacenamiento con `multer`
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images'); // Carpeta donde se guardan las imágenes
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Nombre único
  },
});

// Crear middleware de `multer`
const upload = multer({ storage });

export default upload;
