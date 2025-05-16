import mongoose from 'mongoose';

const reservaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  telefono: {
    type: String,
    required: true,
    trim: true,
  },
  personas: {
    type: Number,
    required: true,
    min: 1,
  },
  hora: {
    type: Date,
    required: true,
  },
  estado: {
    type: String,
    enum: ['pendiente', 'confirmada', 'rechazada', 'auto-confirmada'],
    default: 'pendiente',
  },
  mesaAsignada: {
    type: Number,
    default: null,
  },
  mensaje: {
    type: String,
    trim: true,
    default: '',
  },
  creadaEn: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Reserva', reservaSchema);
