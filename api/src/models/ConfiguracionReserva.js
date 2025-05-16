import mongoose from 'mongoose';

const configuracionReservaSchema = new mongoose.Schema({
  fecha: {
    type: String, // "2025-03-27"
    required: true,
  },
  franjas: [
    {
      horaInicio: { type: String, required: true }, // "13:00"
      horaFin: { type: String, required: true }, // "17:00"
      maxReservas: { type: Number, required: true }, // por franja
    },
  ],
  creadaEn: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model(
  'ConfiguracionReserva',
  configuracionReservaSchema
);
