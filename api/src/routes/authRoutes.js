const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const rateLimit = require('express-rate-limit');

// Middleware para limitar intentos de inicio de sesión
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Límite de 5 intentos
  message: 'Demasiados intentos fallidos. Por favor, inténtalo de nuevo más tarde.',
});

// Ruta de inicio de sesión
router.post(
  '/login',
  loginLimiter,
  [
    check('email', 'El correo no es válido').isEmail().normalizeEmail(),
    check('password', 'La contraseña es obligatoria').notEmpty(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  authController.login
);

// Ruta de registro de usuario
router.post(
  '/register',
  [
    check('name', 'El nombre es obligatorio').notEmpty(),
    check('email', 'El correo no es válido').isEmail().normalizeEmail(),
    check('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
    check('role', 'El rol debe ser admin, usuario o manager')
      .optional()
      .isIn(['admin', 'usuario', 'manager']),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  authController.register
);

// Ruta protegida de ejemplo
router.get('/perfil', authController.protegerRuta, (req, res) => {
  res.status(200).json({ message: 'Acceso autorizado', user: req.user });
});


// Endpoint para renovar token
router.post('/refresh-token', authController.renovarToken);

// Endpoint para cerrar sesión
router.post('/logout', authController.logout);

module.exports = router;
