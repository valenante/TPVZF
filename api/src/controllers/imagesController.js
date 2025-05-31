import asyncHandler from 'express-async-handler';

const mimePermitidos = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];

export const subirImagen = asyncHandler((req, res) => {
  const { file } = req;

  if (!file) {
    return res.status(400).json({ error: 'No se subió ninguna imagen.' });
  }

  if (!mimePermitidos.includes(file.mimetype)) {
    return res.status(400).json({ error: 'Tipo de archivo no permitido. Solo imágenes.' });
  }

  res.status(200).json({
    filename: file.filename,
    imageUrl: `/images/${file.filename}`,
  });
});
