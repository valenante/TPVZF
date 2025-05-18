import { Schema, model } from 'mongoose';

const SesionMesaSchema = new Schema({
  mesa: { type: Schema.Types.ObjectId, ref: 'Mesa', required: true },
  estado: { type: String, enum: ['activa', 'cerrada'], default: 'activa' },
  inicio: { type: Date, default: Date.now },
  cierre: { type: Date },
  tokenLider: { type: String }, // Opcional, si usas lider de mesa
});

export default model('SesionMesa', SesionMesaSchema);
