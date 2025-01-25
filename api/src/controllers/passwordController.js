import Password from "../models/Password.js";

// Obtener la contraseña
export const getPassword = async (req, res) => {
  try {
    // Busca la contraseña por clave
    const config = await Password.findOne({ clave: "contraseñaDelDía" });
    
    if (!config) {
      return res.status(404).json({ error: "Contraseña no encontrada" });
    }

    res.status(200).json({ password: config.valor });
  } catch (error) {
    console.error("Error al obtener la contraseña:", error);
    res.status(500).json({ error: "Error al obtener la contraseña" });
  }
};


// Crear o actualizar la contraseña
export const createOrUpdatePassword = async (req, res) => {
  const { valor } = req.body;

  if (!valor) {
    return res.status(400).json({ error: "El campo 'valor' es obligatorio" });
  }

  try {
    // Crear o actualizar la configuración de la contraseña
    const config = await Password.findOneAndUpdate(
      { clave: "contraseñaDelDía" }, // Busca por una clave específica
      { valor, fecha: new Date() }, // Actualiza el valor y la fecha
      { new: true, upsert: true }   // Crea un nuevo documento si no existe
    );

    res.status(200).json({ message: "Contraseña creada/actualizada exitosamente", password: config.valor });
  } catch (error) {
    console.error("Error al crear/actualizar la contraseña:", error);
    res.status(500).json({ error: "Error al crear/actualizar la contraseña" });
  }
};

// Actualizar contraseña
export const updatePassword = async (req, res) => {
  const { valor } = req.body;

  if (!valor) {
    return res.status(400).json({ error: "El campo 'valor' es obligatorio" });
  }

  try {
    // Actualizar la contraseña para la clave "contraseñaDelDía"
    const config = await Password.findOneAndUpdate(
      { clave: "contraseñaDelDía" }, // Condición para encontrar el registro
      { valor, fecha: new Date() },  // Actualización de valores
      { new: true, upsert: false }   // Devuelve el documento actualizado; no crea uno nuevo
    );

    if (!config) {
      return res.status(404).json({ error: "No se encontró la configuración para 'contraseñaDelDía'" });
    }

    res.status(200).json({ message: "Contraseña actualizada exitosamente", password: config.valor });
  } catch (error) {
    console.error("Error al actualizar la contraseña:", error);
    res.status(500).json({ error: "Error al actualizar la contraseña" });
  }
};

export const validatePassword = async (req, res) => {
  const { password } = req.body;
  try {
    const config = await Password.findOne({ clave: "contraseñaDelDía" });
    if (config && config.valor === password) {
      return res.status(200).json({ valid: true });
    }
    res.status(200).json({ valid: false });
  } catch (error) {
    res.status(500).json({ error: "Error al validar la contraseña" });
  }
};