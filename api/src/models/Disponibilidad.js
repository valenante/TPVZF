// models/ReservasDisponibilidad.js
import mongoose from 'mongoose';

const disponibilidadSchema = new mongoose.Schema({
  domingo: { type: Boolean, default: true },
  lunes: { type: Boolean, default: true },
  martes: { type: Boolean, default: true },
  miércoles: { type: Boolean, default: true },
  jueves: { type: Boolean, default: true },
  viernes: { type: Boolean, default: true },
  sábado: { type: Boolean, default: true },
  actualizadoEn: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Disponibilidad', disponibilidadSchema);
