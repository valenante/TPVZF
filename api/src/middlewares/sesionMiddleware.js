import jwt from "jsonwebtoken";

const SECRET_KEY = env.JWT_SECRET;

// Middleware para validar el token
export const authenticate = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ error: "Acceso denegado. Token no proporcionado." });

  console.log('Laburando sesionMiddleware.js');

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
};

// Middleware para autorizar según el rol
export const authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ error: "Acceso denegado. Permisos insuficientes." });
    }
    next();
  };
};
