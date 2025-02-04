import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  console.log("🔍 Middleware de autenticación ejecutado"); // Verifica que el middleware se está ejecutando

  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  console.log("📌 Token recibido:", token ? "Token presente" : "No hay token"); // Verifica si se recibió un token

  const authHeader = req.header('Authorization');
  if (!authHeader) {
    console.log("❌ No autorizado: No se proporcionó el header Authorization");
    return res.status(401).json({ error: 'No autorizado. Token no proporcionado.' });
  }

  if (!token) {
    console.log("❌ No autorizado: No se encontró el token en cookies ni headers");
    return res.status(401).json({ error: 'No autorizado. Token no encontrado.' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Guardar los datos del usuario en la solicitud
    console.log("✅ Autenticación exitosa. Usuario verificado:", verified); // Muestra los datos decodificados del token
    next();
  } catch (error) {
    console.error("❌ Error al verificar el token:", error.message);
    res.status(401).json({ error: 'Token inválido o expirado.' });
  }
};