import logger from '../../utils/logger.js';
import nodemailer from 'nodemailer';

// Configurar nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const logAndNotifyLogin = async (req, res, next) => {
  const { name } = req.body;
  const ip = req.ip;

  logger.info(`[LOGIN ATTEMPT] Usuario: ${name}, IP: ${ip}, Hora: ${new Date().toISOString()}`);

  if (!req.session) {
    logger.error('La sesión no está disponible.');
    return next();
  }

  // Inicializar failedAttempts si no existe
  if (typeof req.session.failedAttempts === 'undefined') {
    req.session.failedAttempts = 0;
  }

  // Incrementar el contador de intentos fallidos
  req.session.failedAttempts += 1;

  console.log(`Intentos fallidos actuales: ${req.session.failedAttempts}`);

  req.session.save((err) => {
    if (err) {
      console.error('[DEPURACIÓN] Error al guardar la sesión:', err);
    } else {
      console.log('[DEPURACIÓN] Sesión guardada correctamente:', req.session);
    }
  });


  // Notificar si se superan los intentos máximos permitidos
  const maxFailedAttempts = 5;
  if (req.session.failedAttempts >= maxFailedAttempts) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: 'Intentos sospechosos de inicio de sesión',
      text: `El usuario ${name} ha tenido ${req.session.failedAttempts} intentos fallidos desde IP: ${ip}`,
    };

    try {
      await transporter.sendMail(mailOptions);
      logger.info(`[NOTIFICACIÓN] Correo enviado por intentos sospechosos para el usuario: ${name}`);
    } catch (error) {
      logger.error(`[ERROR] Fallo al enviar correo: ${error.message}`);
    }
  }

  next();
};
