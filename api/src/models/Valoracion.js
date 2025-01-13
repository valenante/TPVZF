import { Schema, model } from 'mongoose';

const ValoracionSchema = new Schema({
  producto: { type: Schema.Types.ObjectId, ref: 'Producto', required: true },
  usuario: { type: Schema.Types.ObjectId, ref: 'User' },
  comentario: { type: String },
  puntuacion: { type: Number, min: 1, max: 5, required: true },
  fecha: { type: Date, default: Date.now },
});

export default model('Valoracion', ValoracionSchema);
