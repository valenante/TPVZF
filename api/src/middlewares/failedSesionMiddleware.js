import { info, warn, error } from "../../utils/logger.js";
import nodemailer from "nodemailer";

// Configuración del transporte de nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME_MINUTES = 15;

export const logAndNotifyLogin = async (req, res, next) => {
  const { name } = req.body;
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  info(`[LOGIN ATTEMPT] Usuario: ${name}, IP: ${ip}, Hora: ${new Date().toISOString()}`)

  // Desbloquear si ya pasó el tiempo de bloqueo
  if (req.session.lockedUntil && now >= req.session.lockedUntil) {
    info(`[LOGIN] Desbloqueando automáticamente al usuario ${name}.`);
    req.session.failedAttempts = 0;
    delete req.session.lockedUntil;
  }

  if (!req.session) {
    error("[LOGIN] No se encontró la sesión en la solicitud.");
    return next(); // Puedes opcionalmente bloquear aquí si es crítico
  }

  // Si está bloqueado y aún no ha expirado
  if (req.session.lockedUntil && now < req.session.lockedUntil) {
    const remainingMs = req.session.lockedUntil - now;
    const remainingMin = Math.ceil(remainingMs / 1000 / 60);
    warn(`[LOGIN BLOQUEADO] Usuario: ${name} intentó iniciar sesión antes del tiempo permitido.`);

    return res.status(403).json({
      error: `Cuenta bloqueada. Intenta nuevamente en ${remainingMin} minuto${remainingMin > 1 ? "s" : ""}.`,
    });
  }

  // Inicializar valores de sesión si no existen
  req.session.failedAttempts = req.session.failedAttempts || 0;
  req.session.failedAttempts += 1;

  // Si supera los intentos, bloquear y notificar
  if (req.session.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    req.session.lockedUntil = now + LOCK_TIME_MINUTES * 60 * 1000;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: "⚠️ Múltiples intentos fallidos de inicio de sesión",
      text: `⚠️ El usuario "${name}" ha realizado ${req.session.failedAttempts} intentos fallidos desde la IP ${ip}. La cuenta ha sido bloqueada por ${LOCK_TIME_MINUTES} minutos.`,
    };

    try {
      await transporter.sendMail(mailOptions);
      info(`[ALERTA ENVIADA] Notificación enviada al admin para el usuario ${name}.`);
    } catch (err) {
      error(`[ERROR] No se pudo enviar el correo de alerta: ${err.message}`);
    }

    return res.status(403).json({
      error: `Demasiados intentos fallidos. Cuenta bloqueada por ${LOCK_TIME_MINUTES} minutos.`,
    });
  }

  next();
};
