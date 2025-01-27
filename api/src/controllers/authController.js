import User from '../models/Usuario.js'; // Modelo de usuario
import jwt from 'jsonwebtoken';
import TokenRevocado from '../models/TokenRevocado.js';
import logger from '../../utils/logger.js';

// Generar access token
const generarAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' } // Token válido por 1 hora
  );
};

// Generar refresh token
const generarRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET, // Nueva clave secreta para refresh tokens
    { expiresIn: '7d' } // Token válido por 7 días
  );
};

export const renovarToken = async (req, res) => {
  const refreshToken = req.body.refreshToken || req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token no proporcionado.' });
  }

  try {
    // Verificar si el token está en la lista negra
    const tokenRevocado = await TokenRevocado.findOne({ token: refreshToken });
    if (tokenRevocado) {
      return res.status(403).json({ error: 'Este refresh token ha sido revocado.' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Generar un nuevo access token
    const user = { id: decoded.id };
    const newAccessToken = generarAccessToken(user);

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Refresh token expirado. Por favor, inicia sesión nuevamente.' });
    }
    return res.status(403).json({ error: 'Refresh token inválido.' });
  }
};

export const logout = async (req, res) => {
  // Obtener el token del cuerpo de la solicitud o de las cookies
  const refreshToken = req.body.refreshToken || req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ error: 'No se proporcionó refresh token para el cierre de sesión.' });
  }

  try {
    // Verificar si el token es válido
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Crear un registro en la base de datos para revocar el token
    const tokenRevocado = new TokenRevocado({
      token: refreshToken,
      expiracion: new Date(decoded.exp * 1000), // Convertir la expiración a milisegundos
    });

    await tokenRevocado.save(); // Guardar en la base de datos

    // Limpiar la cookie en el cliente
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
      sameSite: 'Strict', // Protección CSRF
    });

    res.status(200).json({ message: 'Cierre de sesión exitoso.' });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      console.error('Token inválido:', error.message);
      return res.status(401).json({ error: 'El token proporcionado es inválido.' });
    }

    if (error.name === 'TokenExpiredError') {
      console.warn('Intento de cerrar sesión con un token expirado:', error.message);
      return res.status(401).json({ error: 'El token ya ha expirado.' });
    }

    console.error('Error inesperado al cerrar sesión:', error);
    res.status(500).json({ error: 'Ocurrió un error inesperado al cerrar sesión.' });
  }
};

export const register = async (req, res) => {
  const { name, password, role } = req.body;

  try {
    // Crear el usuario
    const nuevoUsuario = new User({ name, password, role });
    await nuevoUsuario.save();

    // Generar tokens
    const accessToken = generarAccessToken(nuevoUsuario);
    const refreshToken = generarRefreshToken(nuevoUsuario);

    // Configurar cookie con el refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // Proteger la cookie contra acceso del cliente (JavaScript)
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
      sameSite: 'Strict', // Asegura que solo se envíe con solicitudes del mismo sitio
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en milisegundos
    });

    // Respuesta al cliente
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: nuevoUsuario._id,
        name: nuevoUsuario.name,
        role: nuevoUsuario.role,
      },
      accessToken, // Devuelve el access token en el cuerpo de la respuesta
    });
  } catch (error) {
    console.error('Error al registrar el usuario:', error);
    res.status(500).json({ error: 'Error al registrar el usuario.' });
  }
};


export const login = async (req, res) => {
  const { name, password } = req.body;

  try {
    const user = await User.findOne({ name });
    if (!user) {
      req.session.failedAttempts = (req.session.failedAttempts || 0) + 1;
      await req.session.save(); // Guardar la sesión después de modificarla
      return res.status(404).json({ error: 'Usuario o contraseña incorrectos.' });
    }

    // Verifica si la cuenta está bloqueada
    if (user.isBlocked) {
      const timeLeft = Math.ceil((user.blockedUntil - Date.now()) / 60000);
      return res.status(403).json({
        error: `Cuenta bloqueada. Intenta nuevamente en ${timeLeft} minutos.`,
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      req.session.failedAttempts = (req.session.failedAttempts || 0) + 1;

      if (req.session.failedAttempts >= 5) {
        user.isBlocked = true;
        user.blockedUntil = new Date(Date.now() + 15 * 60 * 1000); // Bloqueo de 15 minutos
        await user.save();
        await req.session.save(); // Guardar la sesión después de bloquear la cuenta
        return res.status(403).json({ error: 'Cuenta bloqueada por múltiples intentos fallidos.' });
      }

      await req.session.save(); // Guardar la sesión después de incrementar intentos fallidos
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }

    // Restablece el contador de intentos fallidos en sesión
    req.session.failedAttempts = 0;

    // Establecer información adicional en la sesión
    req.session.user = {
      id: user._id,
      name: user.name,
      role: user.role,
    };

    await req.session.save(); // Guardar la sesión después de configurarla

    // Generar tokens
    const accessToken = generarAccessToken(user);
    const refreshToken = generarRefreshToken(user);

    // Establecer el refresh token como cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en milisegundos
    });

    console.log('[DEPURACIÓN] Refresh token configurado en la cookie:', refreshToken);

    return res.status(200).json({
      message: 'Inicio de sesión exitoso',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[ERROR] Problema en el inicio de sesión:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

export const protegerRuta = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Obtener el token del encabezado

  if (!token) {
    logger.warn('Intento de acceso no autorizado: Token no proporcionado');
    return res.status(401).json({ error: 'Acceso no autorizado. Se requiere un token válido.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verificar token
    req.user = decoded; // Guardar los datos del usuario en req.user

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.warn('Intento de acceso con token expirado');
      return res.status(401).json({ error: 'El token ha expirado. Por favor, inicia sesión nuevamente.' });
    }
    if (error.name === 'JsonWebTokenError') {
      logger.warn('Intento de acceso con token inválido');
      return res.status(401).json({ error: 'Token inválido. Por favor, verifica tu autenticación.' });
    }
    logger.error(`Error desconocido al verificar el token: ${error.message}`);
    return res.status(500).json({ error: 'Ocurrió un error al procesar la autenticación.' });
  }
};
