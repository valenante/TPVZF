import asyncHandler from 'express-async-handler';

export const subirImagen = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ninguna imagen' });
  }

  // Validar tipo de archivo (solo imágenes permitidas)
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/avif',
  ];
  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      error: 'Tipo de archivo no permitido. Solo se permiten imágenes.',
    });
  }

  // Generar la URL accesible de la imagen
  const imageUrl = `/images/${req.file.filename}`;

  res.status(200).json({ filename: req.file.filename, imageUrl });
});
