import User from '../models/Usuario.js'; // Modelo de usuario
import jwt from 'jsonwebtoken';
import TokenRevocado from '../models/TokenRevocado.js';
import { warn } from '../../utils/logger.js';

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
    { id: user._id, name: user.name, role: user.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

export const renovarToken = async (req, res) => {
  const refreshToken = req.body.refreshToken || req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token no proporcionado.' });
  }

  try {
    const tokenRevocado = await TokenRevocado.findOne({ token: refreshToken });
    if (tokenRevocado) {
      return res.status(403).json({ error: 'Este refresh token ha sido revocado.' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = { id: decoded.id, role: decoded.role, name: decoded.name };
    const newAccessToken = generarAccessToken(user);

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Refresh token expirado. Por favor, inicia sesión nuevamente.',
      });
    }
    return res.status(403).json({ error: 'Refresh token inválido.' });
  }
};

export const logout = async (req, res) => {
  const refreshToken = req.body.refreshToken || req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({
      error: 'No se proporcionó refresh token para el cierre de sesión.',
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const tokenRevocado = new TokenRevocado({
      token: refreshToken,
      expiracion: new Date(decoded.exp * 1000),
    });

    await tokenRevocado.save();

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
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

export const registro = async (req, res) => {
  const { name, password, role } = req.body;

  try {
    const nuevoUsuario = new User({ name, password, role });
    await nuevoUsuario.save();

    const accessToken = generarAccessToken(nuevoUsuario);
    const refreshToken = generarRefreshToken(nuevoUsuario);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: nuevoUsuario._id,
        name: nuevoUsuario.name,
        role: nuevoUsuario.role,
      },
      accessToken,
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
      await req.session.save();
      return res.status(404).json({ error: 'Usuario o contraseña incorrectos.' });
    }

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
        user.blockedUntil = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();
        await req.session.save();
        return res.status(403).json({ error: 'Cuenta bloqueada por múltiples intentos fallidos.' });
      }

      await req.session.save();
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }

    req.session.failedAttempts = 0;
    req.session.user = {
      id: user._id,
      name: user.name,
      role: user.role,
    };

    await req.session.save();

    const accessToken = generarAccessToken(user);
    const refreshToken = generarRefreshToken(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

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
    console.error('[ERROR] Fallo en el inicio de sesión:', error.message || error);
    return res.status(500).json({
      error: 'No se pudo completar el inicio de sesión. Intenta más tarde.',
    });
  }
};

export const obtenerUsuario = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'No autorizado. Inicia sesión.' });
    }

    return res.status(200).json({ user: req.session.user });
  } catch (error) {
    console.error('❌ Error al obtener usuario:', error);
    return res.status(500).json({ error: 'Error del servidor.' });
  }
};

export const protegerRuta = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    warn('Intento de acceso no autorizado: Token no proporcionado');
    return res.status(401).json({ error: 'Acceso no autorizado. Se requiere un token válido.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      warn('Intento de acceso con token expirado');
      return res.status(401).json({ error: 'El token ha expirado. Por favor, inicia sesión nuevamente.' });
    }
    if (error.name === 'JsonWebTokenError') {
      warn('Intento de acceso con token inválido');
      return res.status(401).json({ error: 'Token inválido. Por favor, verifica tu autenticación.' });
    }
    console.error(`Error desconocido al verificar el token: ${error.message}`);
    return res.status(500).json({ error: 'Ocurrió un error al procesar la autenticación.' });
  }
};
