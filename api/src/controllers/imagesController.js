import path from 'path';
import asyncHandler from 'express-async-handler';

export const uploadImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No se subió ninguna imagen' });
    }

    console.log("Archivo recibido en el backend:", req.file); // Debug para verificar si `req.file` existe

    // Validar tipo de archivo (solo imágenes permitidas)
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: 'Tipo de archivo no permitido. Solo se permiten imágenes.' });
    }

    // Generar la URL accesible de la imagen
    const imageUrl = `http://172.20.10.7:3000/images/${req.file.filename}`;

    console.log("URL de la imagen:", imageUrl); // Debug para verificar la URL generada

    res.status(200).json({ filename: req.file.filename, imageUrl });
});
