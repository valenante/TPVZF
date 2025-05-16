import Reserva from '../models/Reserva.js';
import Mesa from '../models/Mesa.js';
import ConfiguracionReserva from '../models/ConfiguracionReserva.js';
import { enviarEmail } from '../../utils/enviarEmail.js';

const enviarConfirmacionEmail = async (reserva) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="cid:logoZf.jpg" alt="Zabor Féten" style="max-width: 150px;" />
      </div>
      <h2 style="color: #6A0DAD;">¡Reserva confirmada!</h2>
      <p>Hola <strong>${reserva.nombre || 'cliente'}</strong>,</p>
      <p>Tu reserva para el <strong>${new Date(reserva.hora).toLocaleString(
        'es-ES',
        {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour12: false,
        }
      )}</strong> ha sido <strong>confirmada</strong> exitosamente.</p>
      <p style="margin-top: 20px;">Te esperamos en <strong>Zabor Féten</strong> 🥂</p>
      <p style="font-size: 0.9em; color: #555; margin-top: 40px;">
        Si necesitas modificar o cancelar tu reserva, contáctanos directamente.
      </p>
      <p style="margin-top: 10px;"><em>El equipo de <strong>Zabor Féten</strong></em></p>
    </div>
  `;

  await enviarEmail({
    to: reserva.email,
    subject: '¡Tu reserva ha sido confirmada!',
    html,
    attachments: ['public/images/logoZf.jpg'],
  });
};

export const crearReserva = async (req, res) => {
  const { nombre, email, telefono, personas, hora, mensaje } = req.body;

  if (!nombre || !email || !telefono || !personas || !hora) {
    return res.status(400).json({ mensaje: 'Faltan datos obligatorios.' });
  }

  try {
    const fecha = hora.slice(0, 10); // "YYYY-MM-DD"
    let config = await ConfiguracionReserva.findOne({ fecha });

    if (!config) {
      const ultimaConfig = await ConfiguracionReserva.findOne().sort({
        fecha: -1,
      });

      config = ultimaConfig || {
        franjas: [
          { horaInicio: '13:00', horaFin: '15:00', maxReservas: 10 },
          { horaInicio: '20:00', horaFin: '21:30', maxReservas: 10 },
        ],
      };
    }

    const horaStr = hora.slice(11, 16);

    const inicioDia = new Date(`${fecha}T00:00:00`);
    const finDia = new Date(`${fecha}T23:59:59`);

    const yaReservo = await Reserva.findOne({
      hora: { $gte: inicioDia, $lte: finDia },
      $or: [{ email: email.toLowerCase() }, { telefono: telefono.trim() }],
      estado: { $ne: 'rechazada' },
    });

    if (yaReservo) {
      return res
        .status(400)
        .json({ mensaje: 'Ya tienes una reserva para este día.' });
    }

    const franja = config.franjas.find(
      (f) => horaStr >= f.horaInicio && horaStr <= f.horaFin
    );

    if (!franja) {
      return res.status(400).json({
        mensaje: 'La hora seleccionada no está en una franja válida.',
      });
    }

    const desde = new Date(`${fecha}T${franja.horaInicio}:00`);
    const hasta = new Date(`${fecha}T${franja.horaFin}:00`);

    const reservasExistentes = await Reserva.countDocuments({
      hora: { $gte: desde, $lte: hasta },
      estado: { $in: ['confirmada', 'auto-confirmada'] },
    });

    const hayDisponibilidad = reservasExistentes < franja.maxReservas;
    let nuevaReserva;

    if (personas <= 4 && hayDisponibilidad) {
      const mesas = await Mesa.find();
      const reservasMismoHorario = await Reserva.find({
        hora: new Date(hora),
        estado: { $in: ['confirmada', 'auto-confirmada'] },
      });

      const mesasOcupadas = reservasMismoHorario.map((r) => r.mesaAsignada);
      const mesaLibre = mesas.find((m) => !mesasOcupadas.includes(m.numero));

      if (!mesaLibre) {
        nuevaReserva = await Reserva.create({
          nombre,
          email,
          telefono,
          personas,
          hora,
          mensaje,
          estado: 'pendiente',
          mesaAsignada: null,
        });

        return res.status(200).json({
          mensaje: 'No hay mesas libres. Solicitud enviada para confirmar.',
        });
      }

      nuevaReserva = await Reserva.create({
        nombre,
        email,
        telefono,
        personas,
        hora,
        mensaje,
        estado: 'auto-confirmada',
        mesaAsignada: mesaLibre.numero,
      });

      await enviarConfirmacionEmail(nuevaReserva);

      return res.status(200).json({
        mensaje: 'Reserva confirmada automáticamente. ¡Te esperamos!',
      });
    }

    nuevaReserva = await Reserva.create({
      nombre,
      email,
      telefono,
      personas,
      hora,
      mensaje,
      estado: 'pendiente',
      mesaAsignada: null,
    });

    res.status(200).json({
      mensaje: 'Tu solicitud ha sido enviada. Te confirmaremos pronto.',
    });
  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({ mensaje: 'Error al crear la reserva.' });
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
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ mensaje: 'Error al obtener reservas.' });
  }
};

export const confirmarReserva = async (req, res) => {
  const { id } = req.params;

  try {
    const reserva = await Reserva.findById(id);
    if (!reserva) {
      return res.status(404).json({ mensaje: 'Reserva no encontrada.' });
    }

    reserva.estado = 'confirmada';
    await reserva.save();

    await enviarEmail({
      to: reserva.email,
      subject: '¡Tu reserva ha sido confirmada!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="cid:logoZf.jpg" alt="Zabor Féten" style="max-width: 150px;" />
          </div>
          <h2 style="color: #6A0DAD;">¡Reserva confirmada!</h2>
          <p>Hola <strong>${reserva.nombre || 'cliente'}</strong>,</p>
          <p>Tu reserva para el <strong>${new Date(reserva.hora).toLocaleString(
            'es-ES',
            {
              hour: '2-digit',
              minute: '2-digit',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour12: false,
            }
          )}</strong> ha sido <strong>confirmada</strong> exitosamente.</p>
          <p style="margin-top: 20px;">Te esperamos en <strong>Zabor Féten</strong> 🥂</p>
          <p style="font-size: 0.9em; color: #555; margin-top: 40px;">
            Si necesitas modificar o cancelar tu reserva, contáctanos directamente.
          </p>
          <p style="margin-top: 10px;"><em>El equipo de <strong>Zabor Féten</strong></em></p>
        </div>
      `,
    });

    res.json({ mensaje: 'Reserva confirmada y correo enviado.' });
  } catch (error) {
    console.error('Error al confirmar reserva:', error);
    res.status(500).json({ mensaje: 'Error al confirmar la reserva.' });
  }
};

export const cancelarReserva = async (req, res) => {
  const { id } = req.params;
  const { razon } = req.body;

  if (!razon || razon.trim() === '') {
    return res
      .status(400)
      .json({ mensaje: 'Debes incluir una razón de cancelación.' });
  }

  const htmlCancelacion = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="cid:logoZf.jpg" alt="Zabor Féten" style="max-width: 150px;" />
    </div>
    <h2 style="color: #B22222;">Hola ${Reserva.nombre || 'cliente'},</h2>
    <p>Lamentamos informarte que tu reserva para el día <strong>${new Date(Reserva.hora).toLocaleString('es-ES')}</strong> ha sido <strong style="color: #B22222;">cancelada</strong>.</p>
    <p><strong>Motivo:</strong> ${razon}</p>
    <p style="margin-top: 20px;">Para más información puedes contactarnos directamente.</p>
    <p>Disculpa las molestias.</p>
    <p style="margin-top: 30px;"><em>El equipo de <strong>Zabor Féten</strong></em></p>
  </div>
`;

  try {
    const reserva = await Reserva.findById(id);
    if (!reserva) {
      return res.status(404).json({ mensaje: 'Reserva no encontrada.' });
    }

    reserva.estado = 'rechazada';
    await reserva.save();

    await enviarEmail({
      to: reserva.email,
      subject: 'Tu reserva ha sido cancelada',
      html: htmlCancelacion, // usa el bloque completo como arriba
      attachments: ['public/images/logoZf.jpg'],
    });

    res.json({ mensaje: 'Reserva cancelada y correo enviado al cliente.' });
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    res.status(500).json({ mensaje: 'Error al cancelar la reserva.' });
  }
};

// Ejemplo backend (controller)
export const obtenerReservasPorFecha = async (req, res) => {
  const { fecha, estado } = req.query;

  'Obteniendo reservas por fecha...', fecha, estado;

  try {
    const filtros = {};

    if (estado) {
      filtros.estado = estado;
    }

    if (fecha) {
      const inicio = new Date(`${fecha}T00:00:00`);
      const fin = new Date(`${fecha}T23:59:59`);
      filtros.hora = { $gte: inicio, $lte: fin };
    }

    const reservas = await Reserva.find(filtros).sort({ hora: 1 });
    'Reservas encontradas:', reservas.length;
    res.json(reservas);
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ mensaje: 'Error al obtener reservas.' });
  }
};

// Ejemplo backend
export const obtenerFechasConReservas = async (req, res) => {
  ('Obteniendo fechas con reservas...');
  try {
    const reservas = await Reserva.aggregate([
      {
        $match: {
          estado: { $ne: 'rechazada' },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$hora' },
          },
        },
      },
      {
        $project: {
          fecha: '$_id',
          _id: 0,
        },
      },
    ]);

    const fechas = reservas.map((r) => r.fecha);
    'Fechas con reservas:', fechas;
    res.json(fechas);
  } catch (error) {
    console.error('Error al obtener fechas con reservas:', error);
    res.status(500).json({ mensaje: 'Error al obtener las fechas.' });
  }
};
