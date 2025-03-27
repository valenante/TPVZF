import Reserva from "../models/Reserva.js";
import Mesa from "../models/Mesa.js";
import ConfiguracionReserva from "../models/ConfiguracionReserva.js";
import nodemailer from "nodemailer";

// configurar el transporter (puedes usar Gmail, Mailtrap, etc.)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const crearReserva = async (req, res) => {
  const { nombre, email, telefono, personas, hora } = req.body;

  if (!nombre || !email || !telefono || !personas || !hora) {
    return res.status(400).json({ mensaje: "Faltan datos obligatorios." });
  }

  try {
    const fecha = hora.slice(0, 10); // "YYYY-MM-DD"
    const config = await ConfiguracionReserva.findOne({ fecha });

    if (!config) {
      return res.status(400).json({ mensaje: "No hay configuración para ese día." });
    }

    const horaStr = hora.slice(11, 16); // "HH:MM"

    // Verificar si ya tiene reserva ese día (por email o teléfono)
    const inicioDia = new Date(`${fecha}T00:00:00`);
    const finDia = new Date(`${fecha}T23:59:59`);

    const yaReservo = await Reserva.findOne({
      hora: { $gte: inicioDia, $lte: finDia },
      $or: [
        { email: email.toLowerCase() },
        { telefono: telefono.trim() },
      ],
      estado: { $ne: "rechazada" },
    });

    if (yaReservo) {
      return res.status(400).json({
        mensaje: "Ya tienes una reserva para este día.",
      });
    }

    // Buscar en qué franja entra
    const franja = config.franjas.find(f =>
      horaStr >= f.horaInicio && horaStr <= f.horaFin
    );

    if (!franja) {
      return res.status(400).json({ mensaje: "La hora seleccionada no está en una franja válida." });
    }

    // Buscar cuántas reservas hay ya en esa franja
    const desde = new Date(`${fecha}T${franja.horaInicio}:00`);
    const hasta = new Date(`${fecha}T${franja.horaFin}:00`);

    const reservasExistentes = await Reserva.countDocuments({
      hora: { $gte: desde, $lte: hasta },
      estado: { $in: ["confirmada", "auto-confirmada"] },
    });

    const hayDisponibilidad = reservasExistentes < franja.maxReservas;

    let nuevaReserva;

    if (personas <= 4 && hayDisponibilidad) {
      const mesas = await Mesa.find();

      const reservasMismoHorario = await Reserva.find({
        hora: new Date(hora),
        estado: { $in: ["confirmada", "auto-confirmada"] },
      });

      const mesasOcupadas = reservasMismoHorario.map(r => r.mesaAsignada);
      const mesaLibre = mesas.find(m => !mesasOcupadas.includes(m.numero));

      if (!mesaLibre) {
        nuevaReserva = await Reserva.create({
          nombre,
          email,
          telefono,
          personas,
          hora,
          estado: "pendiente",
          mesaAsignada: null,
        });

        return res.status(200).json({ mensaje: "No hay mesas libres. Solicitud enviada para confirmar." });
      }

      // Auto-confirmar
      nuevaReserva = await Reserva.create({
        nombre,
        email,
        telefono,
        personas,
        hora,
        estado: "auto-confirmada",
        mesaAsignada: mesaLibre.numero,
      });

      return res.status(200).json({ mensaje: "Reserva confirmada automáticamente. ¡Te esperamos!" });
    }

    // Más de 4 personas o sin disponibilidad → pendiente
    nuevaReserva = await Reserva.create({
      nombre,
      email,
      telefono,
      personas,
      hora,
      estado: "pendiente",
      mesaAsignada: null,
    });

    res.status(200).json({ mensaje: "Tu solicitud ha sido enviada. Te confirmaremos pronto." });

  } catch (error) {
    console.error("Error al crear reserva:", error);
    res.status(500).json({ mensaje: "Error al crear la reserva." });
  }
};

export const obtenerReservas = async (req, res) => {
  try {
    const hoy = new Date();
    const inicioDia = new Date(hoy.setHours(0, 0, 0, 0));
    const finDia = new Date(hoy.setHours(23, 59, 59, 999));

    const reservas = await Reserva.find({
      hora: { $gte: inicioDia, $lte: finDia },
    }).sort({ hora: 1 });

    res.json(reservas);
  } catch (error) {
    console.error("Error al obtener reservas:", error);
    res.status(500).json({ mensaje: "Error al obtener reservas." });
  }
};

export const confirmarReserva = async (req, res) => {
  const { id } = req.params;

  try {
    const reserva = await Reserva.findById(id);
    if (!reserva) {
      return res.status(404).json({ mensaje: "Reserva no encontrada." });
    }

    reserva.estado = "confirmada";
    await reserva.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: reserva.email,
      subject: "¡Tu reserva ha sido confirmada!",
      html: `
        <p>Hola ${reserva.nombre || "cliente"},</p>
        <p>Nos complace informarte que tu reserva para el día <strong>${new Date(reserva.hora).toLocaleString()}</strong> ha sido confirmada exitosamente.</p>
        <p>Te esperamos en Zabor Féten. ¡Gracias por elegirnos!</p>
        <p><em>El equipo de Zabor Féten</em></p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ mensaje: "Reserva confirmada y correo enviado." });
  } catch (error) {
    console.error("Error al confirmar reserva:", error);
    res.status(500).json({ mensaje: "Error al confirmar la reserva." });
  }
};

export const cancelarReserva = async (req, res) => {
  const { id } = req.params;
  const { razon } = req.body;

  if (!razon || razon.trim() === "") {
    return res.status(400).json({ mensaje: "Debes incluir una razón de cancelación." });
  }

  try {
    const reserva = await Reserva.findById(id);
    if (!reserva) {
      return res.status(404).json({ mensaje: "Reserva no encontrada." });
    }

    reserva.estado = "rechazada";
    await reserva.save();

    // Enviar correo
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: reserva.email,
      subject: "Tu reserva ha sido cancelada",
      html: `
        <p>Hola ${reserva.nombre || "cliente"},</p>
        <p>Lamentamos informarte que tu reserva para el día <strong>${new Date(reserva.hora).toLocaleString()}</strong> ha sido cancelada.</p>
        <p><strong>Motivo:</strong> ${razon}</p>
        <p>Para más información puedes contactarnos directamente. Disculpa las molestias.</p>
        <p><em>El equipo de Zabor Féten</em></p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ mensaje: "Reserva cancelada y correo enviado al cliente." });

  } catch (error) {
    console.error("Error al cancelar reserva:", error);
    res.status(500).json({ mensaje: "Error al cancelar la reserva." });
  }
};
