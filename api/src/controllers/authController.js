const User = require('../models/Usuario'); // Modelo de usuario
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const TokenRevocado = require('../models/TokenRevocado');
const logger = require('../../utils/logger');

// Generar access token
const generarAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
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

exports.renovarToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

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

exports.logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ error: 'No se proporcionó refresh token para el cierre de sesión.' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Agregar el token a la lista negra
    const tokenRevocado = new TokenRevocado({
      token: refreshToken,
      expiracion: new Date(decoded.exp * 1000), // Convertir el tiempo de expiración de segundos a milisegundos
    });

    await tokenRevocado.save();

    // Limpiar la cookie
    res.clearCookie('refreshToken');

    res.status(200).json({ message: 'Cierre de sesión exitoso.' });
  } catch (error) {
    return res.status(400).json({ error: 'Error al cerrar sesión o token inválido.' });
  }
};

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Verificar que el correo no esté en uso
    const usuarioExistente = await User.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'El correo ya está en uso.' });
    }

    // Crear el usuario
    const nuevoUsuario = new User({ name, email, password, role });
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
        email: nuevoUsuario.email,
        role: nuevoUsuario.role,
      },
      accessToken, // Devuelve el access token en el cuerpo de la respuesta
    });
  } catch (error) {
    console.error('Error al registrar el usuario:', error);
    res.status(500).json({ error: 'Error al registrar el usuario.' });
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const usuario = await User.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ error: 'Correo o contraseña incorrectos.' });
    }

    const contrasenaValida = await usuario.comparePassword(password);
    if (!contrasenaValida) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }

    // Generar tokens
    const accessToken = generarAccessToken(usuario);
    const refreshToken = generarRefreshToken(usuario);

    // Enviar el refresh token en una cookie segura
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // Solo accesible desde el servidor
      secure: process.env.NODE_ENV === 'production', // Solo en HTTPS en producción
      sameSite: 'strict', // Protección CSRF
    });

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      accessToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar sesión.' });
  }
};


exports.protegerRuta = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Obtener el token del encabezado

  if (!token) {
    logger.warn('Intento de acceso no autorizado: Token no proporcionado');
    return res.status(401).json({ error: 'Acceso no autorizado. Se requiere un token válido.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verificar token
    req.user = decoded; // Guardar los datos del usuario en req.user

    logger.info(`Acceso autorizado para el usuario: ${decoded.email} con rol: ${decoded.role}`);
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
