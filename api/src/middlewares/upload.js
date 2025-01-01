const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images'); // Carpeta donde se guardarán las imágenes
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`; // Nombre único para cada archivo
    cb(null, uniqueName);
  },
});

// Filtro para tipos de archivo permitidos
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png/; // Tipos de archivo permitidos
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen (jpeg, jpg, png)'));
  }
};

// Configurar multer
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Tamaño máximo del archivo: 5 MB
  fileFilter,
});

module.exports = upload;
